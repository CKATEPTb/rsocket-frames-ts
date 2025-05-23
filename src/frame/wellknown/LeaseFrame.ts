import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FrameFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                       Stream ID = 0                         |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|M|     Flags     |
//     +-----------+-+-+---------------+-------------------------------+
//     |0|                       Time-To-Live                          |
//     +---------------------------------------------------------------+
//     |0|                     Number of Requests                      |
//     +---------------------------------------------------------------+
//                                 Metadata
export class LeaseFrame extends Frame {
    public constructor(
        public readonly ttl: number,
        public readonly requestLimit: number,
        metadata?: Metadata
    ) {
        super(FrameType.LEASE, 0, FrameFlag.NONE, metadata, undefined);
    }

    public static from(header: Header, reader: ByteReader): LeaseFrame {
        return new LeaseFrame(
            reader.i32(),
            reader.i32(),
            header.isFlagSet(FrameFlag.METADATA) ? Metadata.from(reader) : undefined
        )
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.ttl)
        writer.i31(this.requestLimit)
    }

    public canBeIgnored(): boolean {
        return false
    }
}