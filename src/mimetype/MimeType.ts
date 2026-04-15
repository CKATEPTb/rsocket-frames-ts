import bebyte, {ByteReader} from "bebyte";
import {Metadata} from "@/frame/context/Metadata";
import {Payload} from "@/frame/context/Payload";

/**
 * Represents a MIME type and provides serialization/deserialization
 * logic for metadata and payloads associated with that type.
 *
 * @template T The payload type, defaults to `Uint8Array`.
 */
export class MimeType<T = Uint8Array> {
    /**
     * Internal registry of all known MIME types.
     * Maps MIME type strings to their corresponding `MimeType` instances.
     * @private
     */
    private static _values: Map<string, MimeType<any>> = new Map();

    /**
     * Creates a new `MimeType` instance and registers it in the internal map.
     *
     * @param {string} mimeType - The MIME type string (e.g. "application/json").
     * @param {number} [identifier] - Optional numeric identifier for well-known types.
     */
    public constructor(public readonly mimeType: string, public readonly identifier?: number) {
        MimeType._values.set(mimeType, this)
    }

    /**
     * Indicates whether the MIME type is well-known (has an associated identifier).
     *
     * @returns {boolean} `true` if the type has an identifier, otherwise `false`.
     */
    public get isWellKnown() {
        return this.identifier != null
    }

    /**
     * Serializes the given payload into a `Metadata` object.
     *
     * @param {T} payload - The payload to wrap.
     * @returns {Metadata<T>} The resulting `Metadata` instance.
     * @protected
     */
    protected serializeMetadata(payload: T): Metadata<T> {
        return new Metadata(this, payload)
    }

    /**
     * Deserializes a `Metadata` object from a `ByteReader` stream.
     *
     * @param {ByteReader} payload - The byte stream to read from.
     * @param {boolean} [hasPayload=true] - Whether a length-prefixed payload is expected.
     * @returns {Metadata<T>} The deserialized metadata.
     * @protected
     */
    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<T> {
        return new Metadata(this, (hasPayload ? payload.read(payload.i24()) : payload.readRemaining()) as T)
    }

    /**
     * Converts a payload or byte stream into a `Metadata` object.
     * Automatically chooses between serialization and deserialization based on input type.
     *
     * @param {ByteReader | T} payload - Either raw data or a reader to deserialize from.
     * @param {boolean} [hasPayload=true] - Indicates if the reader contains a length-prefixed payload.
     * @returns {Metadata<T>} A `Metadata` instance.
     */
    public toMetadata(payload: ByteReader | T, hasPayload: boolean = true): Metadata<T> {
        if(payload instanceof Uint8Array) return this.deserializeMetadata(bebyte.reader(payload), hasPayload)
        if (typeof (payload as ByteReader)['i8'] == 'function') return this.deserializeMetadata(payload as ByteReader, hasPayload)
        return this.serializeMetadata(payload as T)
    }

    /**
     * Serializes the given payload into a `Payload` object.
     *
     * @param {T} payload - The payload to wrap.
     * @returns {Payload<T>} The resulting `Payload` instance.
     * @protected
     */
    protected serializePayload(payload: T): Payload<T> {
        return new Payload(this, payload)
    }

    /**
     * Deserializes a `Payload` object from a `ByteReader` stream.
     *
     * @param {ByteReader} payload - The byte stream to read from.
     * @returns {Payload<T>} The deserialized payload.
     * @protected
     */
    protected deserializePayload(payload: ByteReader): Payload<T> {
        return new Payload(this, payload.readRemaining() as T)
    }

    /**
     * Converts a payload or byte stream into a `Payload` object.
     * Automatically chooses between serialization and deserialization based on input type.
     *
     * @param {ByteReader | T} payload - Either raw data or a reader to deserialize from.
     * @returns {Payload<T>} A `Payload` instance.
     */
    public toPayload(payload: ByteReader | T): Payload<T> {
        if(payload instanceof Uint8Array) return this.deserializePayload(bebyte.reader(payload))
        if (typeof (payload as ByteReader)['i8'] == 'function') return this.deserializePayload(payload as ByteReader)
        return this.serializePayload(payload as T)
    }

    /**
     * Retrieves a registered `MimeType` by string or identifier.
     * If no match is found, returns a generic `UnknownMimeType` instance and logs a warning.
     *
     * @param {string | number} mimeType - MIME type string or numeric identifier.
     * @returns {MimeType} A matching or unknown `MimeType` instance.
     */
    public static valueOf<T>(mimeType: string | number): MimeType<T> {
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