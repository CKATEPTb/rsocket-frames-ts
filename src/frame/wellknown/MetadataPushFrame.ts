import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Metadata from "@/frame/context/Metadata";
import {FrameFlag} from "@/frame";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                       Stream ID = 0                         |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|1|     Flags     |
//     +-------------------------------+-------------------------------+
//                                 Metadata
export class MetadataPushFrame extends Frame {
    public constructor(metadata: Metadata) {
        super(FrameType.METADATA_PUSH, 0, FrameFlag.METADATA, metadata, undefined);
    }

    public static from(_: Header, reader: ByteReader): MetadataPushFrame {
        return new MetadataPushFrame(Metadata.from(reader))
    }

    protected write(_: ByteWriter) {
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return true
    }
}