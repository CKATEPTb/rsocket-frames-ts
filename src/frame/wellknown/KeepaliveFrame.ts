import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import Payload from "@/frame/context/Payload";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {KeepaliveFlag} from "@/frame";

/**
 * ### KEEPALIVE Frame (0x03)
 *
 * KEEPALIVE frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * KEEPALIVE frames MUST be initiated by the client and sent periodically with the (__R__)espond flag set.
 *
 * KEEPALIVE frames MAY be initiated by the server and sent upon application request with the (__R__)espond flag set.
 *
 * Reception of a KEEPALIVE frame with the (__R__)espond flag set MUST cause a client or server to send
 * back a KEEPALIVE with the (__R__)espond flag __NOT__ set. The data in the received KEEPALIVE MUST be
 * echoed back in the generated KEEPALIVE.
 *
 * Reception of a KEEPALIVE by a server indicates to the server that the client is alive.
 *
 * Reception of a KEEPALIVE by a client indicates to the client that the server is alive.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|0|R|    Flags    |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |0|                  Last Received Position                     |
 *     +                                                               +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *                                   Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x03]{@link FrameType#KEEPALIVE}
 * * [__Flags__: (10 bits)]{@link KeepaliveFlag}
 *      * (__R__)espond with KEEPALIVE or not
 * * __Last Received Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of Resume Last Received Position. Value MUST be > 0. (optional. Set to all 0s when not supported.)
 * * __Data__: Data attached to a KEEPALIVE.
 *
 * @description Keepalive: Connection keepalive.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-keepalive}
 */
export class KeepaliveFrame extends Frame {
    constructor(
        flags: KeepaliveFlag = KeepaliveFlag.NONE,
        private readonly lastReceivedPosition: bigint = 0n,
        payload?: Payload
    ) {
        super(FrameType.KEEPALIVE, 0, flags, undefined, payload);
    }

    public static from(header: Header, reader: ByteReader): KeepaliveFrame {
        return new KeepaliveFrame(
            header.flags,
            reader.i64(),
            Payload.from(reader)
        )
    }

    public isFlagSet(flag: KeepaliveFlag): boolean {
        return super.isFlagSet(flag)
    }

    protected write(writer: ByteWriter): void {
        writer.i63(this.lastReceivedPosition)
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasMetadata(): boolean {
        return false
    }

    public isRequireRespond() {
        return this.isFlagSet(KeepaliveFlag.RESPOND)
    }
}