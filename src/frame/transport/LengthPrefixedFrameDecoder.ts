import type {Frame} from "@/frame/Frame";
import {FrameDeserializer} from "@/frame/FrameDeserializer";
import {
    FRAME_HEADER_SIZE,
    FRAME_LENGTH_PREFIX_SIZE,
    MAX_FRAME_SIZE
} from "@/frame/transport/constants";
import {assertFrameSize, readFrameSize} from "@/frame/transport/framing";
import type {MimeType} from "@/mimetype/MimeType";
import {assertInteger} from "@/utils";

const EMPTY = new Uint8Array(0);
const MAX_RETAINED_BUFFER_SIZE = 64 * 1024;

/** Configuration for a stateful length-prefixed frame decoder. */
export interface LengthPrefixedFrameDecoderOptions {
    /**
     * Largest accepted frame, excluding the three-byte prefix.
     * Defaults to the protocol maximum of `16_777_215` bytes.
     */
    readonly maxFrameSize?: number;
}

/**
 * Reassembles RSocket frames from arbitrary byte-stream chunks.
 *
 * TCP may split a prefix or frame across multiple reads and may return several
 * frames in one read. `push` handles both cases and emits only complete frames.
 */
export class LengthPrefixedFrameDecoder {
    private storage = EMPTY;
    private buffered = 0;
    private readonly maxFrameSize: number;

    /**
     * Creates a TCP stream decoder.
     *
     * @param metadataType MIME codec negotiated for metadata.
     * @param payloadType MIME codec negotiated for data.
     * @param options Optional defensive frame-size limit.
     */
    public constructor(
        private readonly metadataType: MimeType<any>,
        private readonly payloadType: MimeType<any>,
        options: LengthPrefixedFrameDecoderOptions = {}
    ) {
        this.maxFrameSize = options.maxFrameSize ?? MAX_FRAME_SIZE;
        assertInteger("maxFrameSize", this.maxFrameSize, FRAME_HEADER_SIZE, MAX_FRAME_SIZE);
    }

    /** Number of unconsumed bytes waiting for the rest of a frame. */
    public get bufferedBytes(): number {
        return this.buffered;
    }

    /**
     * Consumes one chunk from a TCP socket and returns all complete frames.
     *
     * @param chunk Bytes from a TCP `data`/read callback.
     * @returns Zero or more decoded frames in wire order.
     */
    public push(chunk: Uint8Array): Frame[] {
        if (!(chunk instanceof Uint8Array)) {
            throw new TypeError("Frame decoder input must be a Uint8Array");
        }
        if (chunk.length === 0) return [];

        const frames: Frame[] = [];
        try {
            let consumed = this.buffered === 0 ? 0 : this.completePendingFrame(chunk, frames);
            if (this.buffered !== 0) return frames;

            consumed = this.decodeCompleteFrames(chunk, consumed, frames);
            if (consumed < chunk.length) this.append(chunk.subarray(consumed));
            return frames;
        } catch (error) {
            this.reset();
            throw error;
        }
    }

    /**
     * Verifies that the TCP stream ended on a frame boundary.
     *
     * @throws {RangeError} When a prefix or frame is incomplete.
     */
    public finish(): void {
        if (this.buffered === 0) {
            this.reset();
            return;
        }
        const buffered = this.buffered;
        this.reset();
        throw new RangeError(`Length-prefixed stream ended with ${buffered} incomplete byte(s)`);
    }

    /** Discards buffered bytes and releases the current backing allocation. */
    public reset(): void {
        this.storage = EMPTY;
        this.buffered = 0;
    }

    /** Completes the single partial packet retained from an earlier chunk. */
    private completePendingFrame(chunk: Uint8Array, frames: Frame[]): number {
        let consumed = 0;
        if (this.buffered < FRAME_LENGTH_PREFIX_SIZE) {
            const prefixBytes = Math.min(FRAME_LENGTH_PREFIX_SIZE - this.buffered, chunk.length);
            this.append(chunk.subarray(0, prefixBytes));
            consumed = prefixBytes;
            if (this.buffered < FRAME_LENGTH_PREFIX_SIZE) return consumed;
        }

        const frameSize = readFrameSize(this.storage);
        assertFrameSize(frameSize, this.maxFrameSize);
        const packetSize = FRAME_LENGTH_PREFIX_SIZE + frameSize;
        const frameBytes = Math.min(packetSize - this.buffered, chunk.length - consumed);
        if (frameBytes > 0) {
            this.append(chunk.subarray(consumed, consumed + frameBytes));
            consumed += frameBytes;
        }
        if (this.buffered < packetSize) return consumed;

        const frame = this.storage.slice(FRAME_LENGTH_PREFIX_SIZE, packetSize);
        this.clearPending();
        frames.push(FrameDeserializer.deserialize(frame, this.metadataType, this.payloadType));
        return consumed;
    }

    /** Decodes complete frames directly from a fresh network chunk. */
    private decodeCompleteFrames(chunk: Uint8Array, initial: number, frames: Frame[]): number {
        let offset = initial;
        while (chunk.length - offset >= FRAME_LENGTH_PREFIX_SIZE) {
            const frameSize = readFrameSize(chunk, offset);
            assertFrameSize(frameSize, this.maxFrameSize);
            const packetSize = FRAME_LENGTH_PREFIX_SIZE + frameSize;
            if (chunk.length - offset < packetSize) break;

            const frame = offset === 0 && packetSize === chunk.length
                ? chunk.subarray(FRAME_LENGTH_PREFIX_SIZE)
                : chunk.slice(offset + FRAME_LENGTH_PREFIX_SIZE, offset + packetSize);
            frames.push(FrameDeserializer.deserialize(frame, this.metadataType, this.payloadType));
            offset += packetSize;
        }
        return offset;
    }

    /** Adds bytes to the reusable pending buffer with geometric growth. */
    private append(chunk: Uint8Array): void {
        const required = this.buffered + chunk.length;
        const maximum = FRAME_LENGTH_PREFIX_SIZE + this.maxFrameSize;
        if (required > maximum) {
            throw new RangeError(`Length-prefixed packet exceeds the configured ${this.maxFrameSize}-byte frame limit`);
        }
        if (required > this.storage.length) {
            let capacity = Math.max(this.storage.length, Math.min(128, maximum));
            while (capacity < required) capacity = Math.min(capacity * 2, maximum);
            const next = new Uint8Array(capacity);
            next.set(this.storage.subarray(0, this.buffered));
            this.storage = next;
        }
        this.storage.set(chunk, this.buffered);
        this.buffered = required;
    }

    /** Clears one completed packet while retaining only a bounded small buffer. */
    private clearPending(): void {
        this.buffered = 0;
        if (this.storage.length > MAX_RETAINED_BUFFER_SIZE) this.storage = EMPTY;
    }
}
