import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {decode, encode} from "@/utils";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                       Stream ID = 0                         |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|0|    Flags      |
//     +-------------------------------+-------------------------------+
//     |        Major Version          |         Minor Version         |
//     +-------------------------------+-------------------------------+
//     |         Token Length          | Resume Identification Token  ...
//     +---------------------------------------------------------------+
//     |0|                                                             |
//     +                 Last Received Server Position                 +
//     |                                                               |
//     +---------------------------------------------------------------+
//     |0|                                                             |
//     +                First Available Client Position                +
//     |                                                               |
//     +---------------------------------------------------------------+
export class ResumeFrame extends Frame {
    public constructor(
        public readonly resumeToken: string,
        public readonly lastReceivedServerPosition: bigint,
        public readonly firstAvailableClientPosition: bigint,
        public readonly majorVersion: number = 1,
        public readonly minorVersion: number = 0
    ) {
        super(FrameType.RESUME, 0)
    }

    public static from(_: Header, reader: ByteReader): ResumeFrame {
        const major = reader.i16()
        const minor = reader.i16()
        const resumeToken = decode(reader.read(reader.i16()))
        const lastReceivedServerPosition = reader.i64()
        const firstAvailableClientPosition = reader.i64()
        return new ResumeFrame(resumeToken, lastReceivedServerPosition, firstAvailableClientPosition, major, minor)
    }

    protected write(writer: ByteWriter) {
        writer.i16(this.majorVersion)
        writer.i16(this.minorVersion)
        const resumeToken = encode(this.resumeToken)
        writer.i16(resumeToken.length)
        writer.write(resumeToken)
        writer.i63(this.lastReceivedServerPosition)
        writer.i63(this.firstAvailableClientPosition)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasMetadata(): boolean {
        return false;
    }
}