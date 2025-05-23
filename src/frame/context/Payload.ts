import {ByteReader, ByteWriter} from "bebyte";
import {FrameWriter} from "@/frame/FrameWriter";

export default class Payload extends FrameWriter {
    public write(writer: ByteWriter): Uint8Array {
        // TODO
        return undefined as unknown as Uint8Array
    }

    public static from(reader: ByteReader): Payload {
        // TODO
        return null as unknown as Payload;
    }
}