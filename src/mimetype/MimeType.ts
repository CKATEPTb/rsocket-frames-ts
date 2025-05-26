import {ByteReader} from "bebyte";
import {Metadata} from "@/frame/context/Metadata";
import {Payload} from "@/frame/context/Payload";

export class MimeType<T = Uint8Array> {
    private static _values: Map<string, MimeType<any>> = new Map();

    public constructor(public readonly mimeType: string, public readonly identifier?: number) {
        MimeType._values.set(mimeType, this)
    }

    public get isWellKnown() {
        return this.identifier != null
    }

    protected serializeMetadata(payload: T): Metadata<T> {
        return new Metadata(this, payload)
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<T> {
        return new Metadata(this, (hasPayload ? payload.read(payload.i24()) : payload.readRemaining()) as T)
    }

    public toMetadata(payload: ByteReader | T, hasPayload: boolean = true): Metadata<T> {
        if (typeof (payload as ByteReader)['i8'] == 'function') return this.deserializeMetadata(payload as ByteReader, hasPayload)
        return this.serializeMetadata(payload as T)
    }

    protected serializePayload(payload: T): Payload<T> {
        return new Payload(this, payload)
    }

    protected deserializePayload(payload: ByteReader): Payload<T> {
        return new Payload(this, payload.readRemaining() as T)
    }

    public toPayload(payload: ByteReader | T): Payload<T> {
        if (typeof (payload as ByteReader)['i8'] == 'function') return this.deserializePayload(payload as ByteReader)
        return this.serializePayload(payload as T)
    }

    public static valueOf(mimeType: string | number): MimeType {
        return Array.from(MimeType._values.values())
                .find(v => mimeType == (typeof mimeType == "string" ? v.mimeType : v.identifier)) ||
            new class UnknownMimeType extends MimeType {
                public constructor(mimeType: string) {
                    super(mimeType);
                    console.warn(`An unknown MimeType#${mimeType} has been detected. Please register it before using it`)
                }
            }(String(mimeType));
    }
}