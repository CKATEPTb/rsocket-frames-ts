import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ErrorCode} from "@/frame/enums/ErrorCode";
import Payload from "@/frame/context/Payload";
import {Buffer, ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |0|0|      Flags    |
//     +-----------+-+-+---------------+-------------------------------+
//     |                          Error Code                           |
//     +---------------------------------------------------------------+
//                                Error Data
export class ErrorFrame extends Frame {
    constructor(
        streamId: number,
        protected readonly code: ErrorCode,
        payload?: Payload
    ) {
        super(FrameType.ERROR, streamId, undefined, payload);
    }

    public static from(header: Header, reader: ByteReader): ErrorFrame {
        return new ErrorFrame(
            header.streamId,
            ErrorCode.fromByte(reader.i32()),
            Payload.from(Buffer.reader(reader.readRemaining()))
        )
    }

    protected write(writer: ByteWriter): void {
        writer.i32(this.code)
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return false
    }
}