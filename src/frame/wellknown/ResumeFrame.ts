import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {decode, encode} from "@/utils";
import {MimeType} from "@/mimetype";

/**
 * #### RESUME Frame (0x0D)
 *
 * The general format for a Resume frame is given below.
 *
 * RESUME frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|    Flags      |
 *     +-------------------------------+-------------------------------+
 *     |        Major Version          |         Minor Version         |
 *     +-------------------------------+-------------------------------+
 *     |         Token Length          | Resume Identification Token  ...
 *     +---------------------------------------------------------------+
 *     |0|                                                             |
 *     +                 Last Received Server Position                 +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *     |0|                                                             |
 *     +                First Available Client Position                +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0D]{@link FrameType#RESUME}
 * * __Major Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Major version number of the protocol.
 * * __Minor Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Minor version number of the protocol.
 * * __Resume Identification Token Length__: (16 bits = max value 65,535) Unsigned 16-bit integer of Resume Identification Token Length in bytes.
 * * __Resume Identification Token__: Token used for client resume identification. Same Resume Identification used in the initial SETUP by the client.
 * * __Last Received Server Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the last implied position the client received from the server.
 * * __First Available Client Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the earliest position that the client can rewind back to prior to resending frames.
 *
 * @description Resume: Replaces [SETUP]{@link SetupFrame} for Resuming Operation (optional)
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-resume}
 */
export class ResumeFrame extends Frame {
    public constructor(
        public readonly resumeToken: string,
        public readonly lastReceivedServerPosition: bigint,
        public readonly firstAvailableClientPosition: bigint,
        public readonly majorVersion: number = 1,
        public readonly minorVersion: number = 0
    ) {
        super(FrameType.RESUME, 0)
    }

    public static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeFrame {
        const major = reader.i16()
        const minor = reader.i16()
        const resumeToken = decode(reader.read(reader.i16()))
        const lastReceivedServerPosition = reader.i64()
        const firstAvailableClientPosition = reader.i64()
        return new ResumeFrame(resumeToken, lastReceivedServerPosition, firstAvailableClientPosition, major, minor)
    }

    protected write(writer: ByteWriter) {
        writer.i16(this.majorVersion)
        writer.i16(this.minorVersion)
        const resumeToken = encode(this.resumeToken)
        writer.i16(resumeToken.length)
        writer.write(resumeToken)
        writer.i63(this.lastReceivedServerPosition)
        writer.i63(this.firstAvailableClientPosition)
    }

    public canBeIgnored(): boolean {
        return false;
    }

    public hasMetadata(): boolean {
        return false;
    }
}