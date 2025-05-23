import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import Payload from "@/frame/context/Payload";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {KeepaliveFlag} from "@/frame";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                       Stream ID = 0                         |
//     +-----------+-+-+-+-------------+-------------------------------+
//     |Frame Type |0|0|R|    Flags    |
//     +-----------+-+-+-+-------------+-------------------------------+
//     |0|                  Last Received Position                     |
//     +                                                               +
//     |                                                               |
//     +---------------------------------------------------------------+
//                                   Data
export class KeepaliveFrame extends Frame {
    constructor(
        flags: KeepaliveFlag = KeepaliveFlag.NONE,
        private readonly lastReceivedPosition: bigint = 0n,
        payload?: Payload
    ) {
        super(FrameType.KEEPALIVE, 0, flags, undefined, payload);
    }

    public static from(header: Header, reader: ByteReader): KeepaliveFrame {
        return new KeepaliveFrame(
            header.flags,
            reader.i64(),
            Payload.from(reader)
        )
    }

    public isFlagSet(flag: KeepaliveFlag): boolean {
        return super.isFlagSet(flag)
    }

    protected write(writer: ByteWriter): void {
        writer.i63(this.lastReceivedPosition)
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return false
    }

    public isRequireRespond() {
        return this.isFlagSet(KeepaliveFlag.RESPOND)
    }
}