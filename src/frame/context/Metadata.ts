import {ByteWriter} from "bebyte";
import {MimeType} from "@/mimetype";
import {FrameWriter} from "@/frame/FrameWriter";

export class Metadata<T = Uint8Array> extends FrameWriter {
    public constructor(public readonly mimeType: MimeType<T>, public readonly payload: T) {
        super()
    }

    public toUint8Array(): Uint8Array {
        return this.payload as Uint8Array
    }

    public write(writer: ByteWriter, hasPayload: boolean = true) {
        const array = this.toUint8Array()
        if (hasPayload) writer.i24(array.length)
        writer.write(array)
    }
}