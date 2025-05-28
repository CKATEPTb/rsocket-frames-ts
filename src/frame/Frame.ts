import bebyte from "bebyte";
import {Header} from "@/frame/context/Header";
import {Payload} from "@/frame/context/Payload";
import {FrameType} from "@/frame/FrameType";
import {FrameFlag} from "@/frame/FrameFlag";
import {FrameWriter} from "@/frame/FrameWriter";
import {Metadata} from "@/frame/context/Metadata";

/**
 * Abstract base class representing an RSocket frame.
 *
 * All specific frame types (e.g., `SetupFrame`, `RequestFrame`, etc.)
 * must extend this class to implement their frame-specific logic.
 *
 * Each frame has:
 * - A header that includes frame type, stream ID, and flags.
 * - Optional metadata and payload sections.
 *
 * This class also implements encoding logic to convert a frame into a binary buffer.
 */
export abstract class Frame extends FrameWriter {
    /**
     * The internal frame header (type, flags, stream ID).
     * @protected
     */
    public readonly header: Header

    /**
     * Constructs a new frame instance.
     *
     * @param {FrameType} type - The RSocket frame type (e.g. SETUP, REQUEST_RESPONSE).
     * @param {number} streamId - The stream identifier associated with the frame.
     * @param {FrameFlag} [flags=FrameFlag.NONE] - Initial frame flags.
     * @param {Metadata<any>} [metadata] - Optional metadata section.
     * @param {Payload<any>} [payload] - Optional payload section.
     */
    protected constructor(
        type: FrameType,
        streamId: number,
        flags: FrameFlag = FrameFlag.NONE,
        public readonly metadata?: Metadata<any>,
        public readonly payload?: Payload<any>
    ) {
        super()
        this.header = new Header(
            type,
            streamId,
            FrameFlag.combine(flags, this.metadata != null ? FrameFlag.METADATA : FrameFlag.NONE)
        )
    }

    /**
     * Gets the frame type.
     *
     * @returns {FrameType} The frame type value.
     */
    public get type() {
        return this.header.frameType
    }

    /**
     * Checks if a specific flag is set on the frame.
     *
     * @param {FrameFlag} flag - The flag to check.
     * @returns {boolean} `true` if the flag is set, otherwise `false`.
     */
    public isFlagSet(flag: FrameFlag): boolean {
        return this.header.isFlagSet(flag)
    }

    /**
     * Indicates whether the frame can be safely ignored by the peer.
     * Relies on the `IGNORE` flag being set.
     *
     * @returns {boolean} `true` if frame has IGNORE flag, otherwise `false`.
     */
    public canBeIgnored(): boolean {
        return this.isFlagSet(FrameFlag.IGNORE)
    }

    /**
     * Indicates whether the frame contains metadata.
     * Relies on the `METADATA` flag being set.
     *
     * @returns {boolean} `true` if the METADATA flag is set, otherwise `false`.
     */
    public hasMetadata(): boolean {
        return this.isFlagSet(FrameFlag.METADATA)
    }
    /**
     * Serializes the frame into a `Uint8Array` for transmission.
     *
     * Frame is written as:
     *  - Header
     *  - Frame-specific body (`write()` method implemented in subclass)
     *  - Metadata (if present)
     *  - Payload (if present)
     *
     * @returns {Uint8Array} Serialized binary representation of the frame.
     *
     * @remarks
     * Implementations may impose frame size limits (e.g. 65535 bytes in Java).
     * This method does **not** enforce length limits; check before sending.
     */
    public toUint8Array(): Uint8Array {
        const writer = bebyte.writer()
        this.header.write(writer)
        this.write(writer)
        this.metadata?.write?.(writer)
        this.payload?.write?.(writer)
        // TODO в каждой реализации может быть разный frame length limit, в java например это 65535, нужно проверить длину перед отправкой
        return writer.toUint8Array()
    }
}