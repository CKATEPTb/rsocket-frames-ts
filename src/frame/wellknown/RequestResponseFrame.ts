import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {RequestResponseFlag} from "@/frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";

/**
 * ### REQUEST_RESPONSE Frame (0x04)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|M|F|     Flags   |
 *     +-------------------------------+
 *                          Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x04]{@link FrameType#REQUEST_RESPONSE}
 * * [__Flags__: (10 bits)]{@link RequestResponseFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description Request single response.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-response}
 */
export class RequestResponseFrame extends Frame {
    public constructor(
        streamId: number,
        flags: RequestResponseFlag,
        metadata?: Metadata,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_RESPONSE, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader): RequestResponseFrame {
        return new RequestResponseFrame(
            header.streamId,
            header.flags,
            header.isFlagSet(RequestResponseFlag.METADATA) ? Metadata.from(reader) : undefined,
            Payload.from(reader)
        )
    }

    protected write(_: ByteWriter) {
    }

    public isFlagSet(flag: RequestResponseFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(RequestResponseFlag.FOLLOWS)
    }
}