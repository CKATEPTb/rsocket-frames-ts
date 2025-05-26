import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {RequestChannelFlag, RequestStreamFlag} from "@/frame";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";
import {Metadata, MimeType} from "@/mimetype";

/**
 *
 * ### REQUEST_STREAM Frame (0x06)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|M|F|    Flags    |
 *     +-------------------------------+-------------------------------+
 *     |0|                    Initial Request N                        |
 *     +---------------------------------------------------------------+
 *                           Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x06]{@link FrameType#REQUEST_STREAM}
 * * [__Flags__: (10 bits)]{@link RequestStreamFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Initial Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the initial number of items to request. Value MUST be > 0.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * See [Flow Control: Reactive Streams Semantics](#flow-control-reactive-streams) for more information on RequestN behavior.
 *
 * @description Request a completable stream.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-stream}
 */
export class RequestStreamFrame extends Frame {
    public constructor(
        streamId: number,
        flags: RequestStreamFlag,
        public readonly request: number,
        metadata?: Metadata<any>,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_STREAM, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader, metadataMimeType: MimeType): RequestStreamFrame {
        return new RequestStreamFrame(
            header.streamId,
            header.flags,
            reader.i32(),
            header.isFlagSet(RequestChannelFlag.METADATA) ? metadataMimeType.readMetadata(reader) : undefined,
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