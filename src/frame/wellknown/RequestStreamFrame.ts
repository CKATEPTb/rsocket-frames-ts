import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {RequestChannelFlag, RequestStreamFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+-+-------------+-------------------------------+
//     |Frame Type |0|M|F|    Flags    |
//     +-------------------------------+-------------------------------+
//     |0|                    Initial Request N                        |
//     +---------------------------------------------------------------+
//                         Metadata & Request Data
export class RequestStreamFrame extends Frame {
    public constructor(
        streamId: number,
        flags: RequestStreamFlag,
        public readonly request: number,
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_STREAM, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): RequestStreamFrame {
        return new RequestStreamFrame(
            header.streamId,
            header.flags,
            reader.i32(),
            header.isFlagSet(RequestChannelFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.request)
    }

    public isFlagSet(flag: RequestStreamFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(RequestStreamFlag.FOLLOWS)
    }
}