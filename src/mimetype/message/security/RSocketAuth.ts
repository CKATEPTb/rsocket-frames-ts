import bebyte, {ByteReader} from "bebyte";
import {decode, encode} from "@/utils";
import {MimeType} from "@/mimetype/MimeType";
import {WellKnownAuthType} from "@/mimetype/message/security";
import {AuthType} from "@/mimetype/message/security/AuthType";
import {Metadata} from "@/frame/context/Metadata";

type AuthData<D> = { authType: AuthType<D>, data: D }

/**
 * # Authentication Extension
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * Authentication is a necessary component to any real world application. This extension specification provides a standardized mechanism for including both the type of credentials and the credentials in metadata payloads.
 *
 * ## Metadata Payload
 * This metadata type can be used in a per connection or per stream, and not individual payloads and as such it **MUST** only be used in frame types used to initiate interactions and payloads.
 * This includes [`SETUP`]{@link SetupFrame}, [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, and [`REQUEST_CHANNEL`]{@link RequestChannelFrame}.
 * The Metadata MIME Type is `message/x.rsocket.authentication.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |A| Auth ID/Len |   Authentication Type                        ...
 *     +---------------+---------------+---------------+---------------+
 *     |                     Authentication Payload                   ...
 *     +---------------+-----------------------------------------------+
 * ```
 *
 * * (**A**)uthentication Type: Authentication type is a well known value represented by a unique integer.  If A flag is set (a value of `1`), indicates a [Well-known Auth Type ID]{@link WellKnownAuthType}.  If A flag is not set (a value of `0`), indicates the Authentication Type Length in bytes.
 * * **Auth ID/Length**: (7 bits = max value 2^7 = 128) Unsigned 7-bit integer.  If A flag is set (a value of `1`), indicates a [Well-known Auth Type ID]{@link WellKnownAuthType}.  If A flag is not set (a value of `0`), indicates the Authentication Type Length in bytes.
 * * **Authentication Type**: the type of authentication encoding. This SHOULD be a US-ASCII string.  The string MUST NOT be null terminated.  (Not present if A flag is set)
 * * **Authentication Payload**: The authentication payload encoded as defined by the Authentication Encoding Type.
 */
export class RSocketAuth<D> extends MimeType<AuthData<D>> {
    /**
     * Serializes authentication metadata including auth type and credentials.
     *
     * If the `authType` is well-known, it writes the ID.
     * Otherwise, it writes the UTF-8 string name and the payload.
     *
     * @param {AuthData<D>} payload - Authentication data to serialize.
     * @returns {Metadata<AuthData<D>>} Metadata wrapper containing the auth data.
     */
    protected serializeMetadata(payload: AuthData<D>): Metadata<AuthData<D>> {
        return new class RSocketAuthMetadata extends Metadata<AuthData<D>> {
            /**
             * Converts the authentication metadata into a binary format.
             *
             * @returns {Uint8Array} Serialized authentication metadata.
             */
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

    /**
     * Deserializes binary metadata into authentication data.
     *
     * Resolves the `AuthType` based on the ID or name, then uses it to decode
     * the corresponding credentials from the stream.
     *
     * @param {ByteReader} payload - The input binary reader.
     * @param {boolean} [hasPayload=true] - Whether to expect a length-prefixed payload.
     * @returns {Metadata<AuthData<D>>} Parsed authentication metadata.
     */
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