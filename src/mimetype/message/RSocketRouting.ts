import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {MimeType} from "@/mimetype/MimeType";
import {Metadata} from "@/frame/context/Metadata";

export class RSocketRouting extends MimeType<Array<string>> {
    protected serializeMetadata(payloads: Array<string>): Metadata<Array<string>> {
        return new class RSocketRoutingMetadata extends Metadata<Array<string>> {
            public toUint8Array(): Uint8Array {
                return payloads.reduce((acc, payload) => {
                    const tag = encode(payload)
                    acc.i8(tag.length)
                    acc.write(tag)
                    return acc
                }, bebyte.writer()).toUint8Array()
            }
        }(this, payloads)
    }

    protected deserializeMetadata(payloads: ByteReader, hasPayload: boolean = true): Metadata<Array<string>> {
        const array = hasPayload ? payloads.read(payloads.i24()) : payloads.readRemaining();
        const buffer = bebyte.reader(array)
        const deserialized: Array<string> = []
        while (buffer.offset < array.length) {
            deserialized.push(decode(buffer.read(buffer.i8())))
        }
        return new Metadata(this, deserialized)
    }
}