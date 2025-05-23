import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FireAndForgetFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+-+-------------+-------------------------------+
//     |Frame Type |0|M|F|    Flags    |
//     +-------------------------------+
//                           Metadata & Request Data
export class RequestFireAndForgetFrame extends Frame {
    public constructor(
        streamId: number,
        flags: FireAndForgetFlag,
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_FNF, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): RequestFireAndForgetFrame {
        return new RequestFireAndForgetFrame(
            header.streamId,
            header.flags,
            header.isFlagSet(FireAndForgetFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    protected write(_: ByteWriter) {
    }

    public isFlagSet(flag: FireAndForgetFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(FireAndForgetFlag.FOLLOWS)
    }
}