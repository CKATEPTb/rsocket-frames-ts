import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {RequestResponseFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+-+-------------+-------------------------------+
//     |Frame Type |0|M|F|     Flags   |
//     +-------------------------------+
//                          Metadata & Request Data
export class RequestResponseFrame extends Frame {
    public constructor(
        streamId: number,
        flags: RequestResponseFlag,
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_RESPONSE, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): RequestResponseFrame {
        return new RequestResponseFrame(
            header.streamId,
            header.flags,
            header.isFlagSet(RequestResponseFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    protected write(_: ByteWriter) {
    }

    public isFlagSet(flag: RequestResponseFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(RequestResponseFlag.FOLLOWS)
    }
}