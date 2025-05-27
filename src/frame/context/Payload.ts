import {ByteWriter} from "bebyte";
import {MimeType} from "@/mimetype";
import {FrameWriter} from "@/frame/FrameWriter";

/**
 * Represents a payload frame in the RSocket protocol.
 *
 * @template T - The type of the payload, defaults to `Uint8Array`.
 */
export class Payload<T = Uint8Array> extends FrameWriter {
    /**
     * Creates a new [Payload]{@link Payload} instance.
     *
     * @param mimeType - The MIME type indicating the format of the payload data.
     * @param payload - The binary payload content.
     */
    public constructor(public readonly mimeType: MimeType<T>, public readonly payload: T) {
        super()
    }

    /**
     * Converts the payload to a [Uint8Array]{@link Uint8Array}.
     *
     * @returns The payload data as a [Uint8Array]{@link Uint8Array}.
     */
    public toUint8Array(): Uint8Array {
        return this.payload as Uint8Array
    }

    /**
     * Serializes the payload and writes it to the given [ByteWriter]{@link ByteWriter}.
     *
     * @param writer - The byte writer to which the payload will be written.
     */
    public write(writer: ByteWriter) {
        writer.write(this.toUint8Array())
    }
}