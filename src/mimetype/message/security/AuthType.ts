import {ByteReader, ByteWriter} from "bebyte";
import {decode, encode} from "@/utils";

export abstract class AuthType<T> {
    private static _values: Map<string, AuthType<any>> = new Map();

    public constructor(public readonly authType: string, public readonly identifier?: number) {
        AuthType._values.set(authType, this)
    }

    public get isWellKnown() {
        return this.identifier != null
    }

    public abstract write(writer: ByteWriter, data: T): void

    public abstract read(reader: ByteReader): T

    public data(data: T): { authType: AuthType<T>, data: T } {
        return {
            authType: this,
            data: data
        }
    }

    public static valueOf(authType: string | number): AuthType<any> {
        return Array.from(AuthType._values.values())
                .find(v => authType == (typeof authType == "string" ? v.authType : v.identifier)) ||
            new class UnknownAuthType extends AuthType<Uint8Array> {
                public read(reader: ByteReader): Uint8Array {
                    return reader.readRemaining();
                }

                public write(writer: ByteWriter, data: Uint8Array): void {
                    writer.write(data)
                }
            }(String(authType));
    }
}

export class SimpleAuthType extends AuthType<{
    username: string,
    password: string
}> {
    public read(reader: ByteReader): { username: string; password: string } {
        return {
            username: decode(reader.read(reader.i16())),
            password: decode(reader.readRemaining())
        }
    }

    public write(writer: ByteWriter, data: { username: string; password: string }): void {
        const username = encode(data.username)
        writer.i16(username.length)
        writer.write(username)
        writer.write(encode(data.password))
    }

}

export class BearerAuthType extends AuthType<string> {
    public read(reader: ByteReader): string {
        return decode(reader.readRemaining());
    }

    public write(writer: ByteWriter, data: string): void {
        writer.write(encode(data))
    }
}