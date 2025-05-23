import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {ErrorCode} from "@/frame/enums/ErrorCode";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";
import Metadata from "@/frame/context/Metadata";
import {ExtensionFlag} from "@/frame";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |                           Stream ID                           |
//     +-----------+-+-+-+-+-+-+-+-+-+-+-------------------------------+
//     |Frame Type |I|M|1|2|3|4|5|6|7|8|
//     +-------------------------------+-------------------------------+
//     |0|                      Extended Type                          |
//     +---------------------------------------------------------------+
//                        Depends on Extended Type...
export class ExtensionFrame extends Frame {
    public constructor(
        streamId: number,
        flags: ExtensionFlag,
        public readonly extendedType: number, // todo придумать как типизировать, возможно стоит делать через factory
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.EXT, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): ExtensionFrame {
        return new ExtensionFrame(
            header.streamId,
            header.flags,
            ErrorCode.fromByte(reader.i32()),
            header.isFlagSet(ExtensionFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    public isFlagSet(flag: ExtensionFlag): boolean {
        return super.isFlagSet(flag)
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.extendedType)
    }
}