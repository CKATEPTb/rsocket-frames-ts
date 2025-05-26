import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FrameFlag} from "@/frame";
import Header from "@/frame/context/Header";
import {MimeType} from "@/mimetype";
import {Metadata} from "@/frame/context/Metadata";

/**
 * ### METADATA_PUSH Frame (0x0C)
 *
 * A Metadata Push frame can be used to send asynchronous metadata notifications from a Requester or
 * Responder to its peer.
 *
 * METADATA_PUSH frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * Metadata tied to a particular stream uses the individual Payload frame Metadata flag.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|1|     Flags     |
 *     +-------------------------------+-------------------------------+
 *                                 Metadata
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0C]{@link FrameType#METADATA_PUSH}
 *
 * This frame only supports Metadata, so the Metadata Length header MUST NOT be included.
 *
 * @description  Metadata: Asynchronous Metadata frame
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-metadata-push}
 */
export class MetadataPushFrame extends Frame {
    public constructor(metadata: Metadata<any>) {
        super(FrameType.METADATA_PUSH, 0, FrameFlag.METADATA, metadata, undefined);
    }

    public static from(_: Header, reader: ByteReader, metadataType: MimeType, __: MimeType): MetadataPushFrame {
        return new MetadataPushFrame(metadataType.toMetadata(reader, false))
    }

    protected write(_: ByteWriter) {
        const writeMetadata = this.metadata?.write
        if(writeMetadata != null) this.metadata!.write = (writer: ByteWriter) => writeMetadata(writer, false)
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return true
    }
}