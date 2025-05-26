import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {MimeType} from "@/mimetype/MimeType";
import {Metadata} from "@/frame/context/Metadata";

export class RSocketMimeType extends MimeType<MimeType> {

    protected serializeMetadata(payload: MimeType): Metadata<MimeType> {
        return new class RSocketMimeTypeMetadata extends Metadata<MimeType> {
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
        }(this, payload)
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<MimeType> {
        const array = hasPayload ? payload.read(payload.i24()) : payload.readRemaining();
        const buffer = bebyte.reader(array);
        const i8 = buffer.i8()
        const i7 = i8 & 0x7F
        return new Metadata(this, (i8 >> 7 ? MimeType.valueOf(i7) : new MimeType(decode(buffer.read(i7)))))
    }

}

export class RSocketMimeTypes extends MimeType<Array<MimeType>> {
    protected serializeMetadata(payloads: Array<MimeType>): Metadata<Array<MimeType>> {
        return new class RSocketMimeTypesMetadata extends Metadata<Array<MimeType>> {
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
        }(this, payloads)
    }

    protected deserializeMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<Array<MimeType>> {
        const array = hasPayload ? reader.read(reader.i24()) : reader.readRemaining();
        const buffer = bebyte.reader(array);
        const payloads: Array<MimeType> = []
        while (buffer.offset < array.length) {
            const i8 = buffer.i8()
            const i7 = i8 & 0x7F
            payloads.push(i8 >> 7 ? MimeType.valueOf(i7) : new MimeType(decode(buffer.read(i7))))
        }
        return new Metadata(this, payloads)
    }
}
