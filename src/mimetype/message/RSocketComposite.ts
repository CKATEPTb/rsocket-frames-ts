import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {MimeType} from "@/mimetype/MimeType";
import {Metadata} from "@/frame/context/Metadata";

export class RSocketComposite extends MimeType<Array<Metadata<any>>> {
    protected serializeMetadata(payloads: Array<Metadata<any>>): Metadata<Array<Metadata<any>>> {
        return new class RSocketCompositeMetadata extends Metadata<Array<Metadata<any>>> {
            public toUint8Array(): Uint8Array {
                return payloads.reduce((acc, payload) => {
                    if (payload.mimeType.isWellKnown) acc.i8(128 | payload.mimeType.identifier!)
                    else {
                        const type = encode(payload.mimeType.mimeType)
                        acc.i7(type.length)
                        acc.write(type)
                    }
                    payload.write(acc, true)
                    return acc
                }, bebyte.writer()).toUint8Array()
            }
        }(this, payloads)
    }

    protected deserializeMetadata(payloads: ByteReader, hasPayload: boolean = true): Metadata<Array<Metadata<any>>> {
        const array = hasPayload ? payloads.read(payloads.i24()) : payloads.readRemaining();
        const buffer = bebyte.reader(array);
        const deserialized: Array<Metadata<any>> = []
        while (buffer.offset < array.length) {
            const i8 = buffer.i8()
            const i7 = i8 & 0x7F
            const mimeType = i8 >> 7 ? MimeType.valueOf(i7) : MimeType.valueOf(decode(buffer.read(i7)))
            deserialized.push(mimeType.toMetadata(buffer, true))
        }
        return new Metadata(this, deserialized)
    }
}