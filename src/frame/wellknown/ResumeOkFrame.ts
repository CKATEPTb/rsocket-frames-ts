import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                       Stream ID = 0                         |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|0|    Flags      |
//     +-------------------------------+-------------------------------+
//     |0|                                                             |
//     +               Last Received Client Position                   +
//     |                                                               |
//     +---------------------------------------------------------------+
export class ResumeOkFrame extends Frame {
    public constructor(
        public readonly lastReceivedClientPosition: bigint
    ) {
        super(FrameType.RESUME_OK, 0);
    }
    public static from(header: Header, reader: ByteReader): ResumeOkFrame {
        return new ResumeOkFrame(reader.i64())
    }

    protected write(writer: ByteWriter) {
        writer.i63(this.lastReceivedClientPosition)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasMetadata(): boolean {
        return false;
    }
}