import bebyte, {ByteReader, ByteWriter} from "bebyte";
import {FrameWriter} from "@/frame/FrameWriter";
import {WellKnownMimeType} from "@/mimetype/WellKnownMimeType";
import {decode, encode} from "@/utils";

export default class Metadata extends FrameWriter {
    public readonly payload: MetadataPayload[]

    public constructor(...payload: MetadataPayload[]) {
        super();
        this.payload = payload
    }

    public write(writer: ByteWriter, hasPayload: boolean = true): void {
        const payload = this.payload.reduce((acc, payload) => {
            payload.write(acc)
            return acc
        }, bebyte.writer()).toUint8Array()
        if (hasPayload) writer.i24(payload.length)
        writer.write(payload)
    }

    public static from(reader: ByteReader, hasPayload: boolean = true): Metadata {
        const length = hasPayload ? reader.i24() : 0
        const buffer = hasPayload ? reader.read(length) : reader.readRemaining()
        const bufferReader = bebyte.reader(buffer)
        const payloads: MetadataPayload[] = []
        while (bufferReader.offset < (length || buffer.length)) {
            payloads.push(MetadataPayload.from(bufferReader))
        }
        return new Metadata(...payloads)
    }
}

/**
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |M| MIME ID/Len |   Metadata Encoding MIME Type                ...
 *     +---------------+---------------+---------------+---------------+
 *     |              Metadata Length                  |
 *     +-----------------------------------------------+---------------+
 *     |                     Metadata Payload                         ...
 *     +---------------+-----------------------------------------------+
 * ```
 */
export class MetadataPayload extends FrameWriter {
    public constructor(
        public readonly mimeType: WellKnownMimeType,
        public readonly data: Uint8Array
    ) {
        super()
    }

    public static from(reader: ByteReader): MetadataPayload {
        const i8 = reader.i8()
        const i7 = i8 & 0x7F
        return new MetadataPayload(
            i8 >> 7 ? WellKnownMimeType.valueOf(i7) : new WellKnownMimeType(decode(reader.read(i7))),
            reader.read(reader.i24())
        )
    }

    public write(writer: ByteWriter) {
        if (this.mimeType.isWellKnown) writer.i8(128 | this.mimeType.identifier!)
        else {
            const type = encode(this.mimeType.mimeType)
            writer.i7(type.length)
            writer.write(type)
        }
        writer.i24(this.data.length)
        writer.write(this.data)
    }
}