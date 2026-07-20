import type {Frame} from "@/frame/Frame";
import {serializeFrame} from "@/frame/Frame";
import {FrameDeserializer} from "@/frame/FrameDeserializer";
import {LengthPrefixedFrameDecoder} from "@/frame/transport/LengthPrefixedFrameDecoder";
import {FRAME_HEADER_SIZE, MAX_FRAME_SIZE} from "@/frame/transport/constants";
import {assertFrameSize} from "@/frame/transport/framing";
import type {MimeType} from "@/mimetype/MimeType";
import {assertInteger} from "@/utils";

/** Transport framing supported by the codec. */
export type FrameTransport = "websocket" | "tcp";

/** Configuration shared by frame serialization and deserialization. */
export interface FrameCodecOptions<M = unknown, D = unknown> {
    /** Transport whose framing rules should be applied. */
    readonly transport: FrameTransport;
    /** MIME codecs negotiated by the RSocket SETUP frame. */
    readonly mimetype: {
        readonly metadata: MimeType<M>;
        readonly data: MimeType<D>;
    };
    /** Defensive frame-size limit, up to the protocol maximum. */
    readonly maxFrameSize?: number;
}

/**
 * Encodes and decodes RSocket frames for either WebSocket messages or a TCP byte stream.
 *
 * WebSocket preserves message boundaries and therefore carries raw RSocket frames. TCP is
 * a byte stream, so the codec transparently adds and consumes the required 24-bit length.
 */
export class FrameCodec<M = unknown, D = unknown> {
    private readonly prefixLength: 0 | 3;
    private readonly metadataType: MimeType<M>;
    private readonly dataType: MimeType<D>;
    private readonly maxFrameSize: number;
    private readonly streamDecoder?: LengthPrefixedFrameDecoder;

    /** Creates a codec for one negotiated connection. */
    public constructor(options: FrameCodecOptions<M, D>) {
        if (options.transport !== "websocket" && options.transport !== "tcp") {
            throw new TypeError(`Unsupported frame transport: ${String(options.transport)}`);
        }
        this.prefixLength = options.transport === "tcp" ? 3 : 0;
        this.metadataType = options.mimetype.metadata;
        this.dataType = options.mimetype.data;
        this.maxFrameSize = options.maxFrameSize ?? MAX_FRAME_SIZE;
        assertInteger("maxFrameSize", this.maxFrameSize, FRAME_HEADER_SIZE, MAX_FRAME_SIZE);
        if (options.transport === "tcp") {
            this.streamDecoder = new LengthPrefixedFrameDecoder(this.metadataType, this.dataType, {
                maxFrameSize: this.maxFrameSize
            });
        }
    }

    /** Serializes one frame using the configured transport framing. */
    public serialize(frame: Frame): Uint8Array {
        return serializeFrame(frame, this.prefixLength, this.maxFrameSize);
    }

    /**
     * Consumes one WebSocket message or an arbitrary TCP chunk.
     *
     * A WebSocket call returns exactly one frame. A TCP call may return no frames while
     * buffering a partial packet, one frame, or several coalesced frames.
     */
    public deserialize(bytes: Uint8Array): Frame[] {
        if (!(bytes instanceof Uint8Array)) {
            throw new TypeError("Frame codec input must be a Uint8Array");
        }
        if (this.streamDecoder !== undefined) return this.streamDecoder.push(bytes);
        assertFrameSize(bytes.length, this.maxFrameSize);
        return [FrameDeserializer.deserialize(bytes, this.metadataType, this.dataType)];
    }

    /** Verifies a TCP stream ended on a frame boundary and releases retained storage. */
    public finish(): void {
        this.streamDecoder?.finish();
    }

    /** Discards an incomplete TCP frame after a transport failure. */
    public reset(): void {
        this.streamDecoder?.reset();
    }
}
