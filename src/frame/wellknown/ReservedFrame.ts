import {ByteReader, ByteWriter} from "bebyte";
import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {Header} from "@/frame/context/Header";
import {FrameFlag} from "@/frame/FrameFlag";
import {MimeType} from "@/mimetype/MimeType";

/**
 * Represents a `RESERVED` frame (`FrameType.RESERVED`, 0x00).
 *
 * This frame type is **not valid for use** and is reserved for future extension
 * or protocol evolution. Any attempt to construct or transmit such a frame
 * should be treated as a protocol violation.
 *
 * The class exists solely to support deserialization in edge cases
 * (e.g., for debugging, protocol fuzzing, or error reporting).
 *
 * ### Important:
 * - **Must not be constructed** at runtime intentionally.
 * - Always uses `FrameFlag.IGNORE`.
 *
 * @throws {Error} Always throws on construction to prevent misuse.
 *
 * @see [RSocket Protocol - Frame Types](https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-types)
 */
export class ReservedFrame extends Frame {
    /**
     * Constructs a `ReservedFrame`. Throws immediately.
     *
     * @param {number} streamId - The stream ID associated with the frame.
     * @throws {Error} Always throws to prevent use of reserved frames.
     */
    public constructor(streamId: number) {
        super(FrameType.RESERVED, streamId, FrameFlag.IGNORE)
        throw new Error("Reserved frame could not be created!")
    }

    /**
     * Deserializes a `ReservedFrame` from a stream.
     *
     * This method exists only to allow the parser to safely return
     * a `ReservedFrame` when the frame type byte equals `0x00`.
     *
     * @param {Header} header - Frame header.
     * @param {ByteReader} _ - Unused.
     * @param {MimeType} __ - Unused.
     * @param {MimeType} ___ - Unused.
     * @returns {ReservedFrame} A reserved frame instance (throws).
     * @throws {Error} Always throws on instantiation.
     */
    public static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): ReservedFrame {
        return new ReservedFrame(header.streamId)
    }

    /**
     * Reserved frame has no body and should never be written.
     *
     * @param {ByteWriter} _ - Unused.
     */
    protected write(_: ByteWriter) {
        // No-op: reserved frames should never be serialized.
    }
}