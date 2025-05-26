import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {MimeType} from "@/mimetype";

/**
 * #### RESUME_OK Frame (0x0E)
 *
 * The general format for a Resume OK frame is given below.
 *
 * RESUME OK frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|    Flags      |
 *     +-------------------------------+-------------------------------+
 *     |0|                                                             |
 *     +               Last Received Client Position                   +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0E]{@link FrameType#RESUME_OK}
 * * __Last Received Client Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the last implied position the server received from the client.
 *
 * @description Sent in response to a RESUME if resuming operation possible (optional)
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-resume-ok}
 */
export class ResumeOkFrame extends Frame {
    public constructor(
        public readonly lastReceivedClientPosition: bigint
    ) {
        super(FrameType.RESUME_OK, 0);
    }
    public static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeOkFrame {
        return new ResumeOkFrame(reader.i64())
    }

    protected write(writer: ByteWriter) {
        writer.i63(this.lastReceivedClientPosition)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasMetadata(): boolean {
        return false;
    }
}