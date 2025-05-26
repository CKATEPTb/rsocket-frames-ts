import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {RequestChannelFlag} from "@/frame";
import {Payload} from "@/frame/context/Payload";
import Header from "@/frame/context/Header";
import {MimeType} from "@/mimetype";
import {Metadata} from "@/frame/context/Metadata";

/**
 * ### REQUEST_CHANNEL Frame (0x07)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |Frame Type |0|M|F|C|  Flags    |
 *     +-------------------------------+-------------------------------+
 *     |0|                    Initial Request N                        |
 *     +---------------------------------------------------------------+
 *                            Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x07]{@link FrameType#REQUEST_CHANNEL}
 * * [__Flags__: (10 bits)]{@link RequestChannelFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 *     * (__C__)omplete: bit to indicate stream completion.
 *       * If set, `onComplete()` or equivalent will be invoked on Subscriber/Observer.
 * * __Initial Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the initial request N value for channel. Value MUST be > 0.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description Request Channel: Request a completable stream in both directions.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-channel}
 */
export class RequestChannelFrame extends Frame {
    public constructor(
        streamId: number,
        flags: RequestChannelFlag,
        public readonly request: number,
        metadata?: Metadata<any>,
        payload?: Payload<any>
    ) {
        super(FrameType.REQUEST_CHANNEL, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestChannelFrame {
        return new RequestChannelFrame(
            header.streamId,
            header.flags,
            reader.i32(),
            header.isFlagSet(RequestChannelFlag.METADATA) ? metadataType.toMetadata(reader) : undefined,
            payloadType.toPayload(reader)
        )
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.request)
    }

    public isFlagSet(flag: RequestChannelFlag): boolean {
        return super.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasFollows() {
        return this.isFlagSet(RequestChannelFlag.FOLLOWS)
    }

    public isComplete() {
        return this.isFlagSet(RequestChannelFlag.COMPLETE)
    }
}