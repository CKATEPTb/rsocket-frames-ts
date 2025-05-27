import {ByteReader, ByteWriter} from "bebyte";

/**
 * Abstract base class representing an RSocket authentication type.
 *
 * Subclasses define how specific authentication payloads are serialized and deserialized.
 * Provides facilities for working with both well-known and custom authentication types.
 *
 * @template T The type of the authentication data.
 */
export abstract class AuthType<T> {
    private static _values: Map<string, AuthType<any>> = new Map();

    /**
     * Creates a new authentication type.
     *
     * @param authType A unique string identifier for the authentication type.
     * @param identifier An optional numeric identifier for well-known authentication types.
     */
    public constructor(public readonly authType: string, public readonly identifier?: number) {
        AuthType._values.set(authType, this)
    }

    /**
     * @return `true` if this authentication type is a [well-known type]{@link WellKnownAuthType} (i.e., has a numeric identifier).
     */
    public get isWellKnown() {
        return this.identifier != null
    }

    /**
     * Serializes the given authentication data into the provided writer.
     *
     * @param writer A [ByteWriter]{@link ByteWriter} used to serialize the data.
     * @param data The authentication data to serialize.
     */
    public abstract write(writer: ByteWriter, data: T): void

    /**
     * Deserializes authentication data from the given reader.
     *
     * @param reader A [ByteReader]{@link ByteReader} used to read the serialized data.
     * @returns The deserialized authentication data.
     */
    public abstract read(reader: ByteReader): T

    /**
     * Wraps the authentication data with this authentication type.
     *
     * @param data The authentication data.
     * @returns An object pairing the authentication type with the provided data.
     */
    public auth(data: T): { authType: AuthType<T>, data: T } {
        return {
            authType: this,
            data: data
        }
    }

    /**
     * Retrieves a registered [AuthType]{@link AuthType} by string name or numeric identifier.
     *
     * If the type is not recognized, returns a generic unknown type
     * that reads and writes raw [Uint8Array]{@link Uint8Array} data.
     *
     * @param authType A string or number representing the authentication type.
     * @returns The corresponding `AuthType` instance.
     */
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