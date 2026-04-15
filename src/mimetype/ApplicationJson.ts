import {MimeType} from "@/mimetype/MimeType";
import {ByteReader} from "bebyte";
import {Metadata} from "@/frame/context/Metadata";
import {Payload} from "@/frame/context/Payload";

export class ApplicationJson<T = any> extends MimeType<T> {
    protected serializePayload(payload: T): Payload<T> {
        return super.serializePayload(new TextEncoder().encode(JSON.stringify(payload)) as unknown as T);
    }

    protected deserializePayload(payload: ByteReader): Payload<T> {
        const raw = payload.readRemaining();
        if (raw.length === 0) return undefined as unknown as Payload<T>;
        const str = new TextDecoder().decode(raw);
        try {
            return JSON.parse(str);
        } catch {
            return str as unknown as Payload<T>;
        }
    }

    protected serializeMetadata(payload: T): Metadata<T> {
        return super.serializeMetadata(new TextEncoder().encode(JSON.stringify(payload)) as unknown as T);
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<T> {
        const raw = hasPayload ? payload.read(payload.i24()) : payload.readRemaining();
        if (raw.length === 0) return undefined as unknown as Metadata<T>;
        const str = new TextDecoder().decode(raw);
        try {
            return JSON.parse(str);
        } catch {
            return str as unknown as Metadata<T>;
        }
    }
}