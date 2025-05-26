import {MimeType, WellKnownAuthType} from "@/mimetype";
import bebyte, {ByteReader} from "bebyte";
import {AuthType} from "@/mimetype/message/security/AuthType";
import {decode, encode} from "@/utils";
import {Metadata} from "@/frame/context/Metadata";

type AuthData<D> = { authType: AuthType<D>, data: D }

export class RSocketAuth<D> extends MimeType<AuthData<D>> {
    protected serializeMetadata(payload: AuthData<D>): Metadata<AuthData<D>> {
        return new class RSocketAuthMetadata extends Metadata<AuthData<D>> {
            public toUint8Array(): Uint8Array {
                const writer = bebyte.writer()
                if (payload.authType.isWellKnown) writer.i8(128 | payload.authType.identifier!)
                else {
                    const type = encode(payload.authType.authType)
                    writer.i7(type.length)
                    writer.write(type)
                }
                payload.authType.write(writer, payload.data)
                return writer.toUint8Array()
            }
        }(this, payload)
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<AuthData<D>> {
        const array = hasPayload ? payload.read(payload.i24()) : payload.readRemaining();
        const buffer = bebyte.reader(array);
        const i8 = buffer.i8()
        const i7 = i8 & 0x7F
        const authType = i8 >> 7 ? WellKnownAuthType.valueOf(i7) : WellKnownAuthType.valueOf(decode(buffer.read(i7)))
        const data = authType.read(buffer)
        return new Metadata(this, {authType: authType, data: data})
    }
}