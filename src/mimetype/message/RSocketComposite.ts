import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {Metadata, MimeType} from "@/mimetype/MimeType";
import {WellKnownMimeType} from "@/mimetype";

export class RSocketComposite extends MimeType<Array<Metadata<any>>> {
    public toMetadata(payloads: Array<Metadata<any>>): Metadata<Array<Metadata<any>>> {
        return new class _ extends Metadata<Array<Metadata<any>>> {
            public toUint8Array(): Uint8Array {
                return payloads.reduce((acc, payload) => {
                    if (payload.isWellKnown) acc.i8(128 | payload.identifier!)
                    else {
                        const type = encode(payload.mimeType)
                        acc.i7(type.length)
                        acc.write(type)
                    }
                    payload.write(acc, true)
                    return acc
                }, bebyte.writer()).toUint8Array()
            }
        }(this.mimeType, this.identifier, payloads)
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<Array<Metadata<any>>> {
        const array = super.readMetadata(reader, hasPayload).toUint8Array()
        const buffer = bebyte.reader(array);
        const payloads: Array<Metadata<any>> = []
        while (buffer.offset < array.length) {
            const i8 = buffer.i8()
            const i7 = i8 & 0x7F
            const mimeType = i8 >> 7 ? MimeType.valueOf(i7) : WellKnownMimeType.valueOf(decode(buffer.read(i7)))
            const data = bebyte.reader(buffer.read(buffer.i24()))
            payloads.push(new Metadata<any>(mimeType.mimeType, mimeType.identifier, mimeType.readMetadata(data, true)))
        }
        return new Metadata(this.mimeType, this.identifier, payloads)
    }
}