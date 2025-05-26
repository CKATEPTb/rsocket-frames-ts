import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {Metadata, MimeType} from "@/mimetype/MimeType";

export class RSocketRouting extends MimeType<Array<string>> {
    public toMetadata(payloads: Array<string>): Metadata<Array<string>> {
        return new class _ extends Metadata<Array<string>> {
            public toUint8Array(): Uint8Array {
                return payloads.reduce((acc, payload) => {
                    const tag = encode(payload)
                    acc.i8(tag.length)
                    acc.write(tag)
                    return acc
                }, bebyte.writer()).toUint8Array()
            }
        }(this.mimeType, this.identifier, payloads)
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<Array<string>> {
        const array = super.readMetadata(reader, hasPayload).toUint8Array();
        const buffer = bebyte.reader(array)
        const payloads: Array<string> = []
        while (buffer.offset < array.length) {
            payloads.push(decode(buffer.read(buffer.i8())))
        }
        return new Metadata(this.mimeType, this.identifier, payloads)
    }
}