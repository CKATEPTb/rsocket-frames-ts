import {Frame} from "@/frame/Frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import {FrameType} from "@/frame/FrameType";
import {decode, encode} from "@/utils";
import {WellKnownMimeType} from "@/mimetype/WellKnownMimeType";
import {ByteReader, ByteWriter} from "bebyte";
import {ExtensionFlag, SetupFlag} from "@/frame";
import Header from "@/frame/context/Header";

/**
 * ### SETUP Frame (0x01)
 *
 * Setup frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * The SETUP frame is sent by the client to inform the server of the parameters under which it desires
 * to operate. The usage and message sequence used is shown in [Connection Establishment]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#connection-establishment}.
 *
 * One of the important parameters for a connection is the format, layout, and any schema of the data and metadata for
 * frames. This is, for lack of a better term, referred to here as "MIME Type". An implementation MAY use typical MIME type
 * values or MAY decide to use specific non-MIME type values to indicate format, layout, and any schema
 * for data and metadata. The protocol implementation MUST NOT interpret the MIME type itself. This is an application
 * concern only.
 *
 * The encoding format for Data and Metadata are included separately in the SETUP.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |Frame Type |0|M|R|L|  Flags    |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |         Major Version         |        Minor Version          |
 *     +-------------------------------+-------------------------------+
 *     |0|                 Time Between KEEPALIVE Frames               |
 *     +---------------------------------------------------------------+
 *     |0|                       Max Lifetime                          |
 *     +---------------------------------------------------------------+
 *     |         Token Length          | Resume Identification Token  ...
 *     +---------------+-----------------------------------------------+
 *     |  MIME Length  |   Metadata Encoding MIME Type                ...
 *     +---------------+-----------------------------------------------+
 *     |  MIME Length  |     Data Encoding MIME Type                  ...
 *     +---------------+-----------------------------------------------+
 *                        Metadata & Setup Payload
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x01]{@link FrameType#SETUP}
 * * [__Flags__: (10 bits)]{@link SetupFlag}
 *      * (__M__)etadata: Metadata present
 *      * (__R__)esume Enable: Client requests resume capability if possible. Resume Identification Token present.
 *      * (__L__)ease: Will honor LEASE (or not).
 * * __Major Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Major version number of the protocol.
 * * __Minor Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Minor version number of the protocol.
 * * __Time Between KEEPALIVE Frames__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) between KEEPALIVE frames that the client will send. Value MUST be > 0.
 *    * For server-to-server connections, a reasonable time interval between client KEEPALIVE frames is 500ms.
 *    * For mobile-to-server connections, the time interval between client KEEPALIVE frames is often > 30,000ms.
 * * __Max Lifetime__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) that a client will allow a server to not respond to a KEEPALIVE before it is assumed to be dead. Value MUST be > 0.
 * * __Resume Identification Token Length__: (16 bits = max value 65,535) Unsigned 16-bit integer of Resume Identification Token Length in bytes. (Not present if R flag is not set)
 * * __Resume Identification Token__: Token used for client resume identification (Not present if R flag is not set)
 * * __MIME Length__: Encoding MIME Type Length in bytes.
 * * __Encoding MIME Type__: MIME Type for encoding of Data and Metadata. This SHOULD be a US-ASCII string
 * that includes the [Internet media type](https://en.wikipedia.org/wiki/Internet_media_type) specified
 * in [RFC 2045](https://tools.ietf.org/html/rfc2045). Many are registered with
 * [IANA](https://www.iana.org/assignments/media-types/media-types.xhtml) such as
 * [CBOR](https://www.iana.org/assignments/media-types/application/cbor).
 * [Suffix](http://www.iana.org/assignments/media-type-structured-suffix/media-type-structured-suffix.xml)
 * rules MAY be used for handling layout. For example, `application/x.netflix+cbor` or
 * `application/x.reactivesocket+cbor` or `application/x.netflix+json`. The string MUST NOT be null terminated.
 * * __Setup Data__: includes payload describing connection capabilities of the endpoint sending the
 * Setup header.
 *
 * __NOTE__: A server that receives a SETUP frame that has (__R__)esume Enabled set, but does not support resuming operation, MUST reject the SETUP with an ERROR[REJECTED_SETUP].
 *
 * @description Sent by client to initiate protocol processing.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-setup}
 */
export class SetupFrame extends Frame {
    public constructor(
        public readonly keepalive: number,
        public readonly lifetime: number,
        public readonly metadataType: WellKnownMimeType,
        public readonly dataType: WellKnownMimeType,
        public readonly resumeToken?: string,
        public readonly majorVersion: number = 1,
        public readonly minorVersion: number = 0,
        flags: SetupFlag = SetupFlag.NONE,
        metadata?: Metadata,
        payload?: Payload
    ) {
        flags = SetupFlag.combine(flags, resumeToken != undefined ? SetupFlag.RESUME : SetupFlag.NONE)
        super(FrameType.SETUP, 0, flags, metadata, payload)
    }

    public static from(header: Header, reader: ByteReader): SetupFrame {
        const major = reader.i16()
        const minor = reader.i16()
        const keepalive = reader.i32()
        const lifetime = reader.i32()
        const resumeToken = header.isFlagSet(SetupFlag.RESUME) ? decode(reader.read(reader.i16())) : undefined
        const metadataType = WellKnownMimeType.valueOf(decode(reader.read(reader.i8())))
        const dataType = WellKnownMimeType.valueOf(decode(reader.read(reader.i8())))
        const metadata = header.isFlagSet(ExtensionFlag.METADATA) ? Metadata.from(reader) : undefined
        const payload = Payload.from(reader)
        return new SetupFrame(keepalive, lifetime, metadataType, dataType, resumeToken, major, minor, header.flags, metadata, payload)
    }

    protected write(writer: ByteWriter) {
        writer.i16(this.majorVersion)
        writer.i16(this.minorVersion)
        writer.i31(this.keepalive)
        writer.i31(this.lifetime)
        if (this.hasResume()) {
            const resumeToken = encode(this.resumeToken)
            writer.i16(resumeToken.length)
            writer.write(resumeToken)
        }
        const metadataType = encode(this.metadataType)
        writer.i8(metadataType.length)
        writer.write(metadataType)
        const dataType = encode(this.dataType)
        writer.i8(dataType.length)
        writer.write(dataType)
    }

    public canBeIgnored(): boolean {
        return false
    }

    public hasResume(): boolean {
        return this.isFlagSet(SetupFlag.RESUME)
    }

    public isRespectLease(): boolean {
        return this.isFlagSet(SetupFlag.LEASE)
    }
}