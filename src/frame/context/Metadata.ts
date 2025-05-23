import {ByteReader, ByteWriter} from "bebyte";
import {FrameWriter} from "@/frame/FrameWriter";

export default class Metadata extends FrameWriter {
    public write(writer: ByteWriter, hasPayload?: boolean): void {
        // FrameValidation.isUint24(this.metadata!.length, () => new Error("metadata is out of 24-bit"))
        // if (hasPayload) writer.i24(this.metadata!.length)
        // writer.write(this.metadata!.serialize())
    }

    public static from(reader: ByteReader): Metadata {
        // TODO
        return null as unknown as Metadata;
    }
}