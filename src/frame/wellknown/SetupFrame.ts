import {Frame} from "@/frame/Frame";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import {FrameType} from "@/frame/enums/FrameType";
import {decode, encode} from "@/utils";
import {WellKnownMimeType} from "@/mimetype/WellKnownMimeType";
import {ByteReader, ByteWriter} from "bebyte";
import {ExtensionFlag, SetupFlag} from "@/frame";
import Header from "@/frame/context/Header";

//  0                   1                   2                   3
//  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |0|                       Stream ID = 0                         |
// +-----------+-+-+-+-+-----------+-------------------------------+
// |Frame Type |0|M|R|L|  Flags    |
// +-----------+-+-+-+-+-----------+-------------------------------+
// |         Major Version         |        Minor Version          |
// +-------------------------------+-------------------------------+
// |0|                 Time Between KEEPALIVE Frames               |
// +---------------------------------------------------------------+
// |0|                       Max Lifetime                          |
// +---------------------------------------------------------------+
// |         Token Length          | Resume Identification Token  ...
// +---------------+-----------------------------------------------+
// |  MIME Length  |   Metadata Encoding MIME Type                ...
// +---------------+-----------------------------------------------+
// |  MIME Length  |     Data Encoding MIME Type                  ...
// +---------------+-----------------------------------------------+
//                     Metadata & Setup Payload
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