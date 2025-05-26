import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FrameFlag} from "@/frame";
import Header from "@/frame/context/Header";
import {MimeType} from "@/mimetype";
import {Metadata} from "@/frame/context/Metadata";

/**
 * ### LEASE Frame (0x02)
 *
 * Lease frames MAY be sent by the client-side or server-side Responders and inform the
 * Requester that it may send Requests for a period of time and how many it may send during that duration.
 * See [Lease Semantics](#lease-semantics) for more information.
 *
 * The last received LEASE frame overrides all previous LEASE frame values.
 *
 * Lease frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|M|     Flags     |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |0|                       Time-To-Live                          |
 *     +---------------------------------------------------------------+
 *     |0|                     Number of Requests                      |
 *     +---------------------------------------------------------------+
 *                                 Metadata
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x02]{@link FrameType#LEASE}
 * * [__Flags__: (10 bits)]{@link FrameFlag}
 *      * (__M__)etadata: Metadata present
 * * __Time-To-Live (TTL)__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) for validity of LEASE from time of reception. Value MUST be > 0.
 * * __Number of Requests__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Number of Requests that may be sent until next LEASE. Value MUST be > 0.
 *
 * A Responder implementation MAY stop all further requests by sending a LEASE with a value of 0 for __Number of Requests__ or __Time-To-Live__.
 *
 * When a LEASE expires due to time, the value of the __Number of Requests__ that a Requester may make is implicitly 0.
 *
 * This frame only supports Metadata, so the Metadata Length header MUST NOT be included, even if the (M)etadata flag is set true.
 *
 * @description Sent by Responder to grant the ability to send requests.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-lease}
 */
export class LeaseFrame extends Frame {
    public constructor(
        public readonly ttl: number,
        public readonly requestLimit: number,
        metadata?: Metadata<any>
    ) {
        super(FrameType.LEASE, 0, FrameFlag.NONE, metadata, undefined);
    }

    public static from(header: Header, reader: ByteReader, metadataType: MimeType, _: MimeType): LeaseFrame {
        return new LeaseFrame(
            reader.i32(),
            reader.i32(),
            header.isFlagSet(FrameFlag.METADATA) ? metadataType.toMetadata(reader, false) : undefined
        )
    }

    protected write(writer: ByteWriter) {
        writer.i31(this.ttl)
        writer.i31(this.requestLimit)
        const writeMetadata = this.metadata?.write
        if(writeMetadata != null) this.metadata!.write = (writer: ByteWriter) => writeMetadata(writer, false)
    }

    public canBeIgnored(): boolean {
        return false
    }
}