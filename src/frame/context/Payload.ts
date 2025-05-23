import {ByteReader, ByteWriter} from "bebyte";
import {FrameWriter} from "@/frame/FrameWriter";

export default class Payload extends FrameWriter {
    public constructor(public readonly data: Uint8Array) {
        super();
    }

    public write(writer: ByteWriter): void {
        writer.write(this.data)
    }

    public static from(reader: ByteReader): Payload {
        return new Payload(reader.readRemaining());
    }
}