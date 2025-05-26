import {ByteReader, ByteWriter} from "bebyte";

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

    public auth(data: T): { authType: AuthType<T>, data: T } {
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