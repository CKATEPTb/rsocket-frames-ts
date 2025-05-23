import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|0|    Flags      |
//     +-------------------------------+-------------------------------+
export class CancelFrame extends Frame {
    public constructor(streamId: number) {
        super(FrameType.CANCEL, streamId);
    }

    public static from(header: Header, _: ByteReader): CancelFrame {
        return new CancelFrame(header.streamId)
    }

    protected write(_: ByteWriter) {
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return false
    }
}