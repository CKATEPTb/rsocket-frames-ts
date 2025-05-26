import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {Metadata, MimeType} from "@/mimetype/MimeType";

export class RSocketMimeType extends MimeType<MimeType> {
    public toMetadata(payload: MimeType): Metadata<MimeType> {
        return new class _ extends Metadata<MimeType> {
            public toUint8Array(): Uint8Array {
                const writer = bebyte.writer()
                if (payload.isWellKnown) writer.i8(128 | payload.identifier!)
                else {
                    const type = encode(payload.mimeType)
                    writer.i7(type.length)
                    writer.write(type)
                }
                return writer.toUint8Array()
            }
        }(this.mimeType, this.identifier, payload)
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<MimeType> {
        const array = super.readMetadata(reader, hasPayload).toUint8Array()
        const buffer = bebyte.reader(array);
        const i8 = buffer.i8()
        const i7 = i8 & 0x7F
        return new Metadata(this.mimeType, this.identifier, (i8 >> 7 ? MimeType.valueOf(i7) : new MimeType(decode(buffer.read(i7)))))
    }
}

export class RSocketMimeTypes extends MimeType<Array<MimeType>> {
    public toMetadata(payloads: Array<MimeType>): Metadata<Array<MimeType>> {
        return new class _ extends Metadata<Array<MimeType>> {
            public toUint8Array(): Uint8Array {
                return payloads.reduce((acc, payload) => {
                    if (payload.isWellKnown) acc.i8(128 | payload.identifier!)
                    else {
                        const type = encode(payload.mimeType)
                        acc.i7(type.length)
                        acc.write(type)
                    }
                    return acc
                }, bebyte.writer()).toUint8Array()
            }
        }(this.mimeType, this.identifier, payloads)
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<Array<MimeType>> {
        const array = super.readMetadata(reader, hasPayload).toUint8Array()
        const buffer = bebyte.reader(array);
        const payloads: Array<MimeType> = []
        while (buffer.offset < array.length) {
            const i8 = buffer.i8()
            const i7 = i8 & 0x7F
            payloads.push(i8 >> 7 ? MimeType.valueOf(i7) : new MimeType(decode(buffer.read(i7))))
        }
        return new Metadata(this.mimeType, this.identifier, payloads)
    }
}
