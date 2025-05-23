import {Frame} from "@/frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";

/**
 * ### REQUEST_N Frame (0x08)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|     Flags     |
 *     +-------------------------------+-------------------------------+
 *     |0|                         Request N                           |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x08]{@link FrameType#REQUEST_N}
 * * __Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the number of items to request. Value MUST be > 0.
 *
 * See Flow Control: Reactive Streams Semantics for more information on RequestN behavior.
 *
 * @description Request N: Request N more items with Reactive Streams semantics.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-n}
 */
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