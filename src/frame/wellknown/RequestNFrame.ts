import {Frame} from "@/frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|0|     Flags     |
//     +-------------------------------+-------------------------------+
//     |0|                         Request N                           |
//     +---------------------------------------------------------------+
export class RequestNFrame extends Frame {
    public constructor(
        streamId: number,
        public readonly request: number,
    ) {
        super(FrameType.REQUEST_N, streamId);
    }

    public static from(header: Header, reader: ByteReader): RequestNFrame {
        return new RequestNFrame(
            header.streamId,
            reader.i32()
        )
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.request)
    }

    public canBeIgnored(): boolean {
        return false;
    }


    public hasMetadata(): boolean {
        return false;
    }
}