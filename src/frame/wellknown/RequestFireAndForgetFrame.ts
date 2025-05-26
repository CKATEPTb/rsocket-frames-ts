import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FireAndForgetFlag} from "@/frame";
import Payload from "@/frame/context/Payload";
import Header from "@/frame/context/Header";
import {Metadata, MimeType} from "@/mimetype";

/**
 * ### REQUEST_FNF (Fire-n-Forget) Frame (0x05)
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
 *     +-------------------------------+
 *                           Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x05]{@link FrameType#REQUEST_FNF}
 * * [__Flags__: (10 bits)]{@link FireAndForgetFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description A single one-way message.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-fnf}
 */
export class RequestFireAndForgetFrame extends Frame {
    public constructor(
        streamId: number,
        flags: FireAndForgetFlag,
        metadata?: Metadata<any>,
        payload?: Payload
    ) {
        super(FrameType.REQUEST_FNF, streamId, flags, metadata, payload);
    }

    public static from(header: Header, reader: ByteReader, metadataMimeType: MimeType): RequestFireAndForgetFrame {
        return new RequestFireAndForgetFrame(
            header.streamId,
            header.flags,
            header.isFlagSet(FireAndForgetFlag.METADATA) ? metadataMimeType.readMetadata(reader) : undefined,
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