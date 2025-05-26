import {MimeType} from "@/mimetype";
import {Payload} from "@/frame/context/Payload";
import {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";

export class ApplicationJson<T = any> extends MimeType<T> {
    protected serializePayload(payload: any): Payload<T> {
        return super.serializePayload(encode(JSON.stringify(payload, (_key, value) => {
            if (value == null) return value
            switch (Object.getPrototypeOf(value)?.constructor) {
                case Map:
                    return {
                        "__type__": "Map", // todo в java не так, по этому есть вопросики
                        "value": Array.from(value.entries())
                    }
                case Set:
                    return {
                        "__type__": "Set", // todo в java не так, по этому есть вопросики
                        "value": Array.from(value)
                    }
                default:
                    return value
            }
        })) as T);
    }

    protected deserializePayload(payload: ByteReader): Payload<T> {
        return new Payload(this, JSON.parse(decode(payload.readRemaining()), (_key, value) => {
            switch (value?.__type__) {
                case "Map":
                    return new Map(value.value)
                case "Set":
                    return new Set(value.value)
                default:
                    return value
            }
        }));
    }
}