import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {PayloadFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+-+-+-+---------+-------------------------------+
//     |Frame Type |0|M|F|C|N|  Flags  |
//     +-------------------------------+-------------------------------+
//                              Metadata & Data
export class PayloadFrame extends Frame {
    public constructor(
        streamId: number,
        flags: PayloadFlag,
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.PAYLOAD, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): PayloadFrame {
        return new PayloadFrame(
            header.streamId,
            header.flags,
            header.isFlagSet(PayloadFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    protected write(_: ByteWriter) {
    }

    public isFlagSet(flag: PayloadFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(PayloadFlag.FOLLOWS)
    }

    public isComplete() {
        return this.isFlagSet(PayloadFlag.COMPLETE)
    }

    public isNext() {
        return this.isFlagSet(PayloadFlag.NEXT)
    }
}