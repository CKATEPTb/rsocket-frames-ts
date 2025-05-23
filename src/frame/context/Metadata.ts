import {ByteReader, ByteWriter} from "bebyte";
import {FrameWriter} from "@/frame/FrameWriter";

export default class Metadata extends FrameWriter {
    public constructor(public readonly data: Uint8Array) {
        super();
    }
    public write(writer: ByteWriter, hasPayload: boolean = true): void {
        if (hasPayload) writer.i16(this.data.length)
        writer.write(this.data)
    }

    public static from(reader: ByteReader, hasPayload: boolean = true): Metadata {
        return new Metadata(hasPayload ? reader.read(reader.i16()) : reader.readRemaining())
    }
}