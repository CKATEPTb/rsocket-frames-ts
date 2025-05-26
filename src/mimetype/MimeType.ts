import {ByteReader, ByteWriter} from "bebyte";

export class MimeType<T = Uint8Array> {
    private static _values: Map<string, MimeType<any>> = new Map();

    public constructor(public readonly mimeType: string, public readonly identifier?: number) {
        MimeType._values.set(mimeType, this)
    }

    public get isWellKnown() {
        return this.identifier != null
    }

    public toMetadata(payload: T): Metadata<T> {
        return new Metadata(this.mimeType, this.identifier, payload);
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata<T> {
        const buffer = hasPayload ? reader.read(reader.i24()) : reader.readRemaining()
        return new Metadata(this.mimeType, this.identifier, buffer as T)
    }

    public static valueOf(mimeType: string | number): MimeType {
        return Array.from(MimeType._values.values())
                .find(v => mimeType == (typeof mimeType == "string" ? v.mimeType : v.identifier)) ||
            new class UnknownMimeType extends MimeType {
            }(String(mimeType));
    }
}

export class Metadata<T = Uint8Array> extends MimeType {
    constructor(mimeType: string, identifier: number | undefined, public readonly payload: T) {
        super(mimeType, identifier);
    }

    public toUint8Array(): Uint8Array {
        return this.payload as Uint8Array
    }

    public write(writer: ByteWriter, hasPayload: boolean = true) {
        const array = this.toUint8Array()
        if (hasPayload) writer.i24(array.length)
        writer.write(array)
    }
}