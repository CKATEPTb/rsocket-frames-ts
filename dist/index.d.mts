import { ByteWriter, ByteReader } from 'bebyte';

/**
 * Enumeration of all standard RSocket frame types.
 *
 * These frame types define the kind of protocol message being sent
 * over the RSocket connection. Each frame has a unique identifier byte
 * used for decoding and routing.
 */
declare enum FrameType {
    /** `0x00` - Reserved for future use. */
    RESERVED = 0,
    /** `0x01` - Sent by the client to initiate the connection and negotiate setup parameters. */
    SETUP = 1,
    /** `0x02` - Sent by the responder to grant the requester permission to send requests. */
    LEASE = 2,
    /** `0x03` - Used to maintain liveness of the connection. */
    KEEPALIVE = 3,
    /** `0x04` - Request-Response interaction model (1 request, 1 response). */
    REQUEST_RESPONSE = 4,
    /** `0x05` - Fire-and-Forget: A one-way message with no response. */
    REQUEST_FNF = 5,
    /** `0x06` - Request a stream of responses (possibly infinite). */
    REQUEST_STREAM = 6,
    /** `0x07` - Bi-directional stream of messages between requester and responder. */
    REQUEST_CHANNEL = 7,
    /** `0x08` - Request N more items in a stream (backpressure mechanism). */
    REQUEST_N = 8,
    /** `0x09` - Cancel an ongoing request. */
    CANCEL = 9,
    /** `0x0A` - Used to transmit a payload on a stream. */
    PAYLOAD = 10,
    /** `0x0B` - Represents an application or connection-level error. */
    ERROR = 11,
    /** `0x0C` - Pushes metadata out-of-band to the peer. */
    METADATA_PUSH = 12,
    /** `0x0D` - Sent to resume a connection (if supported). */
    RESUME = 13,
    /** `0x0E` - Acknowledges a successful resume. */
    RESUME_OK = 14,
    /** `0x3F` - Reserved for protocol extensions. */
    EXT = 63
}
declare namespace FrameType {
    /**
     * Attempts to determine the `FrameType` based on the given byte value.
     *
     * This performs a best-match lookup by applying bitmask matching
     * in reverse order of definition, favoring the most specific match.
     *
     * @param {number} byte - The raw frame type byte value.
     * @returns {FrameType} The corresponding `FrameType` enum value.
     */
    function fromByte(byte: number): FrameType;
}

/**
 * Internal enum defining individual frame-level flags used in RSocket.
 * These flags modify frame behavior.
 */
declare enum _FrameFlag {
    /**
     * No flags are set.
     */
    NONE = 0,
    /**
     * Indicates that the frame can be safely ignored if not understood.
     */
    IGNORE = 512,
    /**
     * Indicates that the frame contains metadata.
     */
    METADATA = 256
}
/**
 * RSocket frame flags, including utility to combine multiple flags.
 */
declare const FrameFlag: {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type FrameFlag = number | _FrameFlag;
/**
 * Internal enum for keepalive-specific flags.
 */
declare enum _KeepaliveFlag {
    /**
     * If set, the receiver must respond with a KEEPALIVE frame.
     */
    RESPOND = 128
}
/**
 * Flags applicable to KEEPALIVE frames.
 */
declare const KeepaliveFlag: typeof _KeepaliveFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type KeepaliveFlag = FrameFlag | _KeepaliveFlag;
/**
 * Enum for custom [extension frame]{@link ExtensionFrame} flags.
 */
declare enum _ExtensionFlag {
    EXT_1 = 128,
    EXT_2 = 64,
    EXT_3 = 32,
    EXT_4 = 16,
    EXT_5 = 8,
    EXT_6 = 4,
    EXT_7 = 2,
    EXT_8 = 1
}
/**
 * Flags applicable to EXT (extension) frames.
 */
declare const ExtensionFlag: typeof _ExtensionFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type ExtensionFlag = FrameFlag | _ExtensionFlag;
/**
 * Internal enum for setup frame flags.
 */
declare enum _SetupFlag {
    /**
     * Enables session resumption support.
     */
    RESUME = 128,
    /**
     * Enables lease-based flow control.
     */
    LEASE = 64
}
/**
 * Flags applicable to SETUP frames.
 */
declare const SetupFlag: typeof _SetupFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type SetupFlag = FrameFlag | _SetupFlag;
/**
 * Enum for the `FOLLOWS` flag, indicating that more fragments follow.
 */
declare enum FollowsFlag {
    /**
     * Indicates that this frame is followed by more fragments.
     */
    FOLLOWS = 128
}
/**
 * Flags applicable to [FIRE_AND_FORGET]{@link RequestFireAndForgetFrame} frames.
 */
declare const FireAndForgetFlag: typeof FollowsFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type FireAndForgetFlag = FrameFlag | FollowsFlag;
/**
 * Flags applicable to [REQUEST_RESPONSE]{@link RequestResponseFrame} frames (same as [FIRE_AND_FORGET]{@link RequestFireAndForgetFrame}.
 */
declare const RequestResponseFlag: typeof FollowsFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestResponseFlag = FireAndForgetFlag;
/**
 * Flags applicable to [REQUEST_STREAM]{@link RequestStreamFrame} frames (same as  [REQUEST_RESPONSE]{@link RequestResponseFrame}).
 */
declare const RequestStreamFlag: typeof FollowsFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestStreamFlag = RequestResponseFlag;
/**
 * Enum representing the `COMPLETE` flag, indicating stream completion.
 */
declare enum CompleteFlag {
    COMPLETE = 64
}
/**
 * Enum for payload-specific flags.
 */
declare enum _PayloadFlag {
    /**
     * Indicates the presence of the next payload fragment.
     */
    NEXT = 32
}
/**
 * Flags applicable to [REQUEST_CHANNEL]{@link RequestChannelFrame} frames.
 */
declare const RequestChannelFlag: typeof FollowsFlag & typeof CompleteFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestChannelFlag = FrameFlag | FollowsFlag | CompleteFlag;
/**
 * Flags applicable to [PAYLOAD]{@link PayloadFrame} frames.
 */
declare const PayloadFlag: typeof _PayloadFlag & typeof FollowsFlag & typeof CompleteFlag & {
    /**
     * Combines multiple frame flags into a single numeric bitmask.
     *
     * @param flags List of frame flags to combine.
     * @returns Combined numeric flag.
     * @example
     * ```ts
     * const flags = FrameFlag.combine(FrameFlag.METADATA, FrameFlag.IGNORE);
     * ```
     */
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type PayloadFlag = _PayloadFlag | RequestChannelFlag;

/**
 * Abstract base class for writing frame content to a binary stream.
 *
 * Subclasses must implement the `write` method to serialize frame-specific
 * data using the provided `ByteWriter`.
 *
 * ### Example Usage:
 * ```ts
 * class SetupFrameWriter extends FrameWriter {
 *   protected write(writer: ByteWriter): void {
 *     writer.i32(this.version);
 *     writer.write(this.payload);
 *   }
 * }
 * ```
 */
declare abstract class FrameWriter {
    /**
     * Writes the frame content to the provided `ByteWriter`.
     * This method must be implemented by subclasses to define
     * the serialization logic for the frame.
     *
     * @param {ByteWriter} writer - The writer used to output binary data.
     */
    protected abstract write(writer: ByteWriter): void;
}

/**
 * ### Frame Header Format
 *
 * RSocket frames begin with a RSocket Frame Header. The general layout is given below.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |I|M|     Flags     |     Depends on Frame Type    ...
 *     +-------------------------------+
 * ```
 *
 * * __Stream ID__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the stream Identifier for this frame or 0 to indicate the entire connection.
 *   * Transport protocols that include demultiplexing, such as HTTP/2, MAY omit the Stream ID field if all parties agree. The means of negotiation and agreement is left to the transport protocol.
 * * __Frame Type__: (6 bits = max value 63) Type of Frame.
 * * [__Flags__: (10 bits)]{@link FrameFlag} Any Flag bit not specifically indicated in the frame type should be set to 0 when sent and not interpreted on
 * reception. Flags generally depend on Frame Type, but all frame types MUST provide space for the following flags:
 *      * (__I__)gnore: Ignore frame if not understood
 *      * (__M__)etadata: Metadata present
 *
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-header-format}
 */
declare class Header extends FrameWriter {
    readonly frameType: FrameType;
    readonly streamId: number;
    readonly flags: FrameFlag;
    /**
     * Creates a new RSocket `Header` instance.
     *
     * @param {FrameType} frameType - Type of the frame (6 bits).
     * @param {number} streamId - Stream ID this frame is associated with (must be a 31-bit unsigned int).
     * @param {FrameFlag} flags - Bitmask of frame flags (10 bits max).
     */
    constructor(frameType: FrameType, // (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the stream Identifier for this frame or 0 to indicate the entire connection.
    streamId: number, // 6 bits = max value 63) Type of Frame.
    flags: FrameFlag);
    /**
     * Deserializes a `Header` from the binary reader.
     *
     * @param {ByteReader} reader - Byte stream reader positioned at the start of the frame.
     * @returns {Header} Parsed frame header.
     */
    static from(reader: ByteReader): Header;
    /**
     * Checks if a specific flag is set.
     *
     * @param {FrameFlag} flag - Flag to check.
     * @returns {boolean} True if the flag is set.
     */
    isFlagSet(flag: FrameFlag): boolean;
    /**
     * Serializes this header to the binary writer.
     *
     * @param {ByteWriter} writer - Writer to serialize to.
     */
    write(writer: ByteWriter): void;
}

/**
 * Represents a payload frame in the RSocket protocol.
 *
 * @template T - The type of the payload, defaults to `Uint8Array`.
 */
declare class Payload<T = Uint8Array> extends FrameWriter {
    readonly mimeType: MimeType<T>;
    readonly payload: T;
    /**
     * Creates a new [Payload]{@link Payload} instance.
     *
     * @param mimeType - The MIME type indicating the format of the payload data.
     * @param payload - The binary payload content.
     */
    constructor(mimeType: MimeType<T>, payload: T);
    /**
     * Converts the payload to a [Uint8Array]{@link Uint8Array}.
     *
     * @returns The payload data as a [Uint8Array]{@link Uint8Array}.
     */
    toUint8Array(): Uint8Array;
    /**
     * Serializes the payload and writes it to the given [ByteWriter]{@link ByteWriter}.
     *
     * @param writer - The byte writer to which the payload will be written.
     */
    write(writer: ByteWriter): void;
}

/**
 * Represents a MIME type and provides serialization/deserialization
 * logic for metadata and payloads associated with that type.
 *
 * @template T The payload type, defaults to `Uint8Array`.
 */
declare class MimeType<T = Uint8Array> {
    readonly mimeType: string;
    readonly identifier?: number | undefined;
    /**
     * Internal registry of all known MIME types.
     * Maps MIME type strings to their corresponding `MimeType` instances.
     * @private
     */
    private static _values;
    /**
     * Creates a new `MimeType` instance and registers it in the internal map.
     *
     * @param {string} mimeType - The MIME type string (e.g. "application/json").
     * @param {number} [identifier] - Optional numeric identifier for well-known types.
     */
    constructor(mimeType: string, identifier?: number | undefined);
    /**
     * Indicates whether the MIME type is well-known (has an associated identifier).
     *
     * @returns {boolean} `true` if the type has an identifier, otherwise `false`.
     */
    get isWellKnown(): boolean;
    /**
     * Serializes the given payload into a `Metadata` object.
     *
     * @param {T} payload - The payload to wrap.
     * @returns {Metadata<T>} The resulting `Metadata` instance.
     * @protected
     */
    protected serializeMetadata(payload: T): Metadata<T>;
    /**
     * Deserializes a `Metadata` object from a `ByteReader` stream.
     *
     * @param {ByteReader} payload - The byte stream to read from.
     * @param {boolean} [hasPayload=true] - Whether a length-prefixed payload is expected.
     * @returns {Metadata<T>} The deserialized metadata.
     * @protected
     */
    protected deserializeMetadata(payload: ByteReader, hasPayload?: boolean): Metadata<T>;
    /**
     * Converts a payload or byte stream into a `Metadata` object.
     * Automatically chooses between serialization and deserialization based on input type.
     *
     * @param {ByteReader | T} payload - Either raw data or a reader to deserialize from.
     * @param {boolean} [hasPayload=true] - Indicates if the reader contains a length-prefixed payload.
     * @returns {Metadata<T>} A `Metadata` instance.
     */
    toMetadata(payload: ByteReader | T, hasPayload?: boolean): Metadata<T>;
    /**
     * Serializes the given payload into a `Payload` object.
     *
     * @param {T} payload - The payload to wrap.
     * @returns {Payload<T>} The resulting `Payload` instance.
     * @protected
     */
    protected serializePayload(payload: T): Payload<T>;
    /**
     * Deserializes a `Payload` object from a `ByteReader` stream.
     *
     * @param {ByteReader} payload - The byte stream to read from.
     * @returns {Payload<T>} The deserialized payload.
     * @protected
     */
    protected deserializePayload(payload: ByteReader): Payload<T>;
    /**
     * Converts a payload or byte stream into a `Payload` object.
     * Automatically chooses between serialization and deserialization based on input type.
     *
     * @param {ByteReader | T} payload - Either raw data or a reader to deserialize from.
     * @returns {Payload<T>} A `Payload` instance.
     */
    toPayload(payload: ByteReader | T): Payload<T>;
    /**
     * Retrieves a registered `MimeType` by string or identifier.
     * If no match is found, returns a generic `UnknownMimeType` instance and logs a warning.
     *
     * @param {string | number} mimeType - MIME type string or numeric identifier.
     * @returns {MimeType} A matching or unknown `MimeType` instance.
     */
    static valueOf(mimeType: string | number): MimeType;
}

/**
 * ## Metadata Payload for data MIME Type
 * This metadata type is intended to be used per stream, and not per connection nor individual payloads and as such it **MUST** only be used in frame types used to initiate interactions.
 * This includes [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, and [`REQUEST_CHANNEL`]{@link RequestChannelFrame}.
 * Multiple metadata payloads with the same MIME type are allowed.
 * The order of metadata payloads MUST be preserved when presented to responders.  The Metadata MIME Type is `message/x.rsocket.mime-type.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |M| MIME ID/Len |   Data Encoding MIME Type                    ...
 *     +---------------+-----------------------------------------------+
 * ```
 * * (**M**)etadata Type: Metadata type is a well known value represented by a unique integer.
 * * **MIME ID/Length**: (7 bits = max value 2^7 = 128) Unsigned 7-bit integer.  If M flag is set, indicates a [Well-known MIME Type ID]{@link WellKnownMimeType}.  If M flag is not set, indicates the encoding MIME Type Length in bytes.
 * * **Metadata Encoding MIME Type**: MIME Type for encoding of Metadata. This SHOULD be a US-ASCII string that includes the [Internet media type]{@link https://en.wikipedia.org/wiki/Internet_media_type} specified in [RFC 2045]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-fnf}.
 * Many are registered with [IANA]{@link https://www.iana.org/assignments/media-types/media-types.xhtml} and others such as [Routing]{@link RSocketRouting} and [Tracing (Zipkin)]{@link} are not.
 * [Suffix]{@link http://www.iana.org/assignments/media-type-structured-suffix/media-type-structured-suffix.xml} rules MAY be used for handling layout.  The string MUST NOT be null terminated.  (Not present if M flag is set)
 */
declare class RSocketMimeType extends MimeType<MimeType> {
    /**
     * Serializes a single `MimeType` to binary metadata format.
     *
     * @param {MimeType} payload - The MIME type to serialize.
     * @returns {Metadata<MimeType>} The metadata object wrapping the MIME type.
     */
    protected serializeMetadata(payload: MimeType): Metadata<MimeType>;
    /**
     * Deserializes metadata into a `MimeType` object.
     *
     * @param {ByteReader} payload - The binary reader.
     * @param {boolean} [hasPayload=true] - Whether the payload has a length prefix.
     * @returns {Metadata<MimeType>} The resulting metadata.
     */
    protected deserializeMetadata(payload: ByteReader, hasPayload?: boolean): Metadata<MimeType>;
}
/**
 * ## Metadata Payload for acceptable data MIME Types
 * This metadata type is intended to be used per stream, and not per connection nor individual payloads and as such it **MUST** only be used in frame types used to initiate interactions.
 * This includes [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, and [`REQUEST_CHANNEL`]{@link RequestChannelFrame}.
 * Multiple metadata payloads with the same MIME type are allowed.  The order of metadata payloads MUST be preserved when presented to responders.  The Metadata MIME Type is `message/x.rsocket.accept-mime-types.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |M| MIME ID/Len |   Data Encoding MIME Type                    ...
 *     +---------------+-----------------------------------------------+
 *     |M| MIME ID/Len |   Data Encoding MIME Type                    ...
 *     +---------------+-----------------------------------------------+
 *                                    ...
 * ```
 * * (**M**)etadata Type: Metadata type is a well known value represented by a unique integer.
 * * **MIME ID/Length**: (7 bits = max value 2^7 = 128) Unsigned 7-bit integer.  If M flag is set, indicates a [Well-known MIME Type ID]{@link WellKnownMimeType}.  If M flag is not set, indicates the encoding MIME Type Length in bytes.
 * * **Metadata Encoding MIME Type**: MIME Type for encoding of Metadata. This SHOULD be a US-ASCII string that includes the [Internet media type]{@link https://en.wikipedia.org/wiki/Internet_media_type} specified in [RFC 2045]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-fnf}.
 * Many are registered with [IANA]{@link https://www.iana.org/assignments/media-types/media-types.xhtml} and others such as [Routing]{@link RSocketRouting} and [Tracing (Zipkin)]{@link} are not.
 * [Suffix]{@link http://www.iana.org/assignments/media-type-structured-suffix/media-type-structured-suffix.xml} rules MAY be used for handling layout.  The string MUST NOT be null terminated.  (Not present if M flag is set)
 */
declare class RSocketMimeTypes extends MimeType<Array<MimeType>> {
    /**
     * Serializes a list of MIME types into binary metadata format.
     *
     * @param {Array<MimeType>} payloads - MIME types to encode.
     * @returns {Metadata<Array<MimeType>>} The resulting metadata.
     */
    protected serializeMetadata(payloads: Array<MimeType>): Metadata<Array<MimeType>>;
    /**
     * Deserializes a byte stream into a list of `MimeType` objects.
     *
     * @param {ByteReader} reader - Source to read metadata from.
     * @param {boolean} [hasPayload=true] - Whether to read a length-prefixed block.
     * @returns {Metadata<Array<MimeType>>} Parsed metadata with MIME types.
     */
    protected deserializeMetadata(reader: ByteReader, hasPayload?: boolean): Metadata<Array<MimeType>>;
}

/**
 * # Routing Metadata Extension
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * When two system are communicating via RSocket, there are often logical divisions in the messages that are sent from the requester to the responder.  These logical divisions can often be implemented by the responder as "routes" for messages to be sent to.  This extension specification provides an interoperable structure for metadata payloads to contain routing information.  It is designed such that an arbitrary collection of tags (strings) can be used by the responder to route messages and any individual tag (or all included tags) can be ignored.
 *
 * ## Metadata Payload
 * This metadata type is intended to be used per stream, and not per connection nor individual payloads and as such it **MUST** only be used in frame types used to initiate interactions.
 * This includes [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, and [`REQUEST_CHANNEL`]{@link RequestChannelFrame}.
 * The Metadata MIME Type is `message/x.rsocket.routing.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |  Tag Length   |              Tag                             ...
 *     +---------------+-----------------------------------------------+
 *     |  Tag Length   |              Tag                             ...
 *     +---------------+-----------------------------------------------+
 *                                    ...
 * ```
 *
 * * **Tag Payload**: Any number of complete tag payloads.
 *   * **Tag Length**: (8 bits = max value 2^8-1 = 255) Unsigned 8-bit integer of Tag Length in bytes.
 *   * **Tag**:  UTF-8 encoded Token used for routing.  The string MUST NOT be null terminated.  Examples include URI path-style routes (`/person/1`, `/address`), dot-separated convention ("person.1"), or any other format (`ios-client`, `android-client`).
 */
declare class RSocketRouting extends MimeType<Array<string>> {
    /**
     * Serializes an array of routing tags (UTF-8 strings) into metadata.
     * Each tag is prefixed by its byte length as an 8-bit unsigned integer.
     *
     * @param {Array<string>} payloads - Array of routing tags to serialize.
     * @returns {Metadata<Array<string>>} Serialized metadata instance.
     */
    protected serializeMetadata(payloads: Array<string>): Metadata<Array<string>>;
    /**
     * Converts the routing tag array into a `Uint8Array` binary format.
     *
     * Format:
     * [tag_length: u8][tag: UTF-8 bytes] repeated for each tag.
     *
     * @returns {Uint8Array} Serialized routing metadata.
     */
    protected deserializeMetadata(payloads: ByteReader, hasPayload?: boolean): Metadata<Array<string>>;
}

/**
 * # Composite Metadata Extension
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * There are a number of situations where an arbitrary collection of discrete metadata types should be attached to frame.  For example, a request frame may want to include both routing metadata as well as tracing metadata.  This extension specification provides an interoperable structure for metadadata payloads to contain multiple discrete metadata types.  It is designed such that if a consumer of the metadata is unaware of a particular type, it can be safely skipped and the next one read.
 *
 * ## Metadata Payload
 * This metadata type is intended to be used per stream, and not per connection nor individual payloads and as such it **MUST** only be used in frame types used to initiate interactions.
 * This includes [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, and [`REQUEST_CHANNEL`]{@link RequestChannelFrame}.
 * Multiple metadata payloads with the same MIME type are allowed. The order of metadata payloads MUST be preserved when presented to responders.
 * The [`SETUP` Frame]{@link SetupFrame} Metadata MIME Type is `message/x.rsocket.composite-metadata.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |M| MIME ID/Len |   Metadata Encoding MIME Type                ...
 *     +---------------+---------------+---------------+---------------+
 *     |              Metadata Length                  |
 *     +-----------------------------------------------+---------------+
 *     |                     Metadata Payload                         ...
 *     +---------------+-----------------------------------------------+
 *     |M| MIME ID/Len |   Metadata Encoding MIME Type                ...
 *     +---------------+-------------------------------+---------------+
 *     |              Metadata Length                  |
 *     +-----------------------------------------------+---------------+
 *     |                     Metadata Payload                         ...
 *     +---------------------------------------------------------------+
 *                                    ...
 * ```
 *
 * * **Metadata Payload**: Any number of complete metadata payloads.
 *   * (**M**)etadata Type: Metadata type is a well known value represented by a unique integer.
 *   * **MIME ID/Length**: (7 bits = max value 2^7 = 128) Unsigned 7-bit integer.  If M flag is set, indicates a [Well-known MIME Type ID][wk].  If M flag is not set, indicates the encoding MIME Type Length in bytes.
 *   * **Metadata Encoding MIME Type**: MIME Type for encoding of Metadata. This SHOULD be a US-ASCII string that includes the [Internet media type](https://en.wikipedia.org/wiki/Internet_media_type) specified in [RFC 2045][rf].  Many are registered with [IANA][ia] and others such as [Routing][r] and [Tracing (Zipkin)][tz] are not.  [Suffix][s] rules MAY be used for handling layout.  The string MUST NOT be null terminated.  (Not present if M flag is set)
 *   * **Metadata Length**: (24 bits = max value 16,777,215) Unsigned 24-bit integer of Metadata Length in bytes.
 *   * **Metadata Payload**: User configured metadata encoded as defined by the Metadata Encoding MIME Type.
 */
declare class RSocketComposite extends MimeType<Array<Metadata<any>>> {
    /**
     * Serializes an array of `Metadata<T>` entries into composite metadata format.
     *
     * @param {Array<Metadata<any>>} payloads - Metadata entries to encode.
     * @returns {Metadata<Array<Metadata<any>>>} Composite metadata wrapper.
     */
    protected serializeMetadata(payloads: Array<Metadata<any>>): Metadata<Array<Metadata<any>>>;
    /**
     * Deserializes a composite metadata block into individual `Metadata<T>` instances.
     * Each metadata entry is parsed according to its MIME type.
     *
     * @param {ByteReader} payloads - Reader containing composite metadata.
     * @param {boolean} [hasPayload=true] - Whether the payload is prefixed with a length (i24).
     * @returns {Metadata<Array<Metadata<any>>>} The reconstructed composite metadata object.
     */
    protected deserializeMetadata(payloads: ByteReader, hasPayload?: boolean): Metadata<Array<Metadata<any>>>;
}

/**
 * Bit-level flags describing Zipkin tracing metadata behavior.
 */
type TracingZipkinFlags = {
    /** Indicates if trace/span/parent IDs are present. */
    idsSet: boolean;
    /** Forces tracing regardless of sampling. */
    debug: boolean;
    /** Marks the trace as sampled (ignored if debug is true). */
    sampled: boolean;
    /** Explicitly marks trace as not sampled (ignored if sampled/debug is true). */
    notSampled: boolean;
    /** Enables 128-bit trace ID (if false, trace ID is 64-bit). */
    traceId128: boolean;
    /** If true, includes parent span ID in metadata. */
    hasParent: boolean;
};
/**
 * Represents a deserialized payload for Zipkin Tracing metadata.
 *
 * @property {TracingZipkinFlags} flags - Bit flags affecting encoding behavior.
 * @property {bigint | [bigint, bigint]} traceId - 64- or 128-bit Trace ID.
 * @property {bigint} spanId - Unique identifier for the span.
 * @property {bigint=} parentSpanId - Optional parent span ID.
 */
type TracingZipkinPayload = {
    flags: TracingZipkinFlags;
    traceId: bigint | [bigint, bigint];
    spanId: bigint;
    parentSpanId?: bigint;
};
/**
 * # Tracing (Zipkin) Metadata Extension
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * Observability and tracing are key requirements for robust and reliable applications.  When using distributed applications connected with RSocket, it's important to propagate metadata about the current logical operations throughout the entire system.
 * One of the most popular systems for doing this kind of tracing is [Zipkin]{@link https://zipkin.io}.  This extension specification provides an interoperable structure for Zipkin metadata payloads to contain tracing information.  It is designed such that systems can efficently communicate span and trace information to a Zipkin server and propagate that information throughout a distributed system.
 *
 * ## Metadata Payload
 * This metadata type is intended to be used per stream, and not per connection nor individual payloads and as such it **MUST** only be used in frame types used to initiate interactions and payloads.  This includes [`REQUEST_FNF`]{@link RequestFireAndForgetFrame}, [`REQUEST_RESPONSE`]{@link RequestResponseFrame}, [`REQUEST_STREAM`]{@link RequestStreamFrame}, [`REQUEST_CHANNEL`]{@link RequestChannelFrame}, and [`PAYLOAD`]{@link PayloadFrame}.
 * The Metadata MIME Type is `message/x.rsocket.tracing-zipkin.v0`.
 *
 * ### Metadata Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |I|D|S|N|T|P|   |
 *     +-+-+---+---+---+-----------------------------------------------+
 *     |                                                               |
 *     +                                                               +
 *     |                                                               |
 *     +                           Trace ID                            +
 *     |                                                               |
 *     +                                                               +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *     |                                                               |
 *     +                           Span ID                             +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *     |                                                               |
 *     +                        Parent Span ID                         +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * **Flags**: (8 bits)
 *   * (**I**)Ds Set: When zero, the metadata only includes sampling information and no IDs
 *     * For example, a health check might set only the (**N**)ot Sampled flag without generating IDs
 *   * (**D**)ebug: Tracing payload should be force traced.
 *   * (**S**)ample: Tracing payload should be accepted for tracing. (Ignored when D flag is set.)
 *   * (**N**)ot Sampled: Tracing payload should not be sampled. (Ignored when S flag or D flag is set.)
 *   * (**T**)race Id Size: Unset indicates that the Trace Id is 64-bit. Set indicates that the Trace Id is 128-bit.
 *   * (**P**)arent Span Id: Tracing payload contains a parent span id.
 * * **Trace ID**: (64 or 128 bits) Unsigned 64- or 128-bit integer ID of the trace. Every span in a trace shares this ID.
 * * **Span ID**: (64 bits) Unsigned 64-bit integer ID for a particular span. This may or may not be the same as the trace id.
 * * **Parent Span ID**: (64 bits) Unsigned 64-bit integer ID for a particular parent span.  This is an optional ID that will only be present on child spans. That is the span without a parent id is considered the root of the trace. (Not present if P flag is not set)
 */
declare class RSocketTracingZipkin extends MimeType<TracingZipkinPayload> {
    /**
     * Serializes a structured tracing payload into a binary metadata block.
     *
     * @param {TracingZipkinPayload} payload - The tracing data to encode.
     * @returns {Metadata<TracingZipkinPayload>} A Metadata object with a `toUint8Array()` method.
     */
    protected serializeMetadata(payload: TracingZipkinPayload): Metadata<TracingZipkinPayload>;
    /**
     * Deserializes a binary tracing metadata payload into a structured object.
     *
     * @param {ByteReader} reader - Byte reader to extract metadata from.
     * @param {boolean} [hasPayload=true] - Whether metadata is prefixed with a length (i24).
     * @returns {Metadata<TracingZipkinPayload>} Parsed tracing metadata.
     */
    protected deserializeMetadata(reader: ByteReader, hasPayload?: boolean): Metadata<TracingZipkinPayload>;
}

/**
 * Abstract base class representing an RSocket authentication type.
 *
 * Subclasses define how specific authentication payloads are serialized and deserialized.
 * Provides facilities for working with both well-known and custom authentication types.
 *
 * @template T The type of the authentication data.
 */
declare abstract class AuthType<T> {
    readonly authType: string;
    readonly identifier?: number | undefined;
    private static _values;
    /**
     * Creates a new authentication type.
     *
     * @param authType A unique string identifier for the authentication type.
     * @param identifier An optional numeric identifier for well-known authentication types.
     */
    constructor(authType: string, identifier?: number | undefined);
    /**
     * @return `true` if this authentication type is a [well-known type]{@link WellKnownAuthType} (i.e., has a numeric identifier).
     */
    get isWellKnown(): boolean;
    /**
     * Serializes the given authentication data into the provided writer.
     *
     * @param writer A [ByteWriter]{@link ByteWriter} used to serialize the data.
     * @param data The authentication data to serialize.
     */
    abstract write(writer: ByteWriter, data: T): void;
    /**
     * Deserializes authentication data from the given reader.
     *
     * @param reader A [ByteReader]{@link ByteReader} used to read the serialized data.
     * @returns The deserialized authentication data.
     */
    abstract read(reader: ByteReader): T;
    /**
     * Wraps the authentication data with this authentication type.
     *
     * @param data The authentication data.
     * @returns An object pairing the authentication type with the provided data.
     */
    auth(data: T): {
        authType: AuthType<T>;
        data: T;
    };
    /**
     * Retrieves a registered [AuthType]{@link AuthType} by string name or numeric identifier.
     *
     * If the type is not recognized, returns a generic unknown type
     * that reads and writes raw [Uint8Array]{@link Uint8Array} data.
     *
     * @param authType A string or number representing the authentication type.
     * @returns The corresponding `AuthType` instance.
     */
    static valueOf(authType: string | number): AuthType<any>;
}

type AuthData<D> = {
    authType: AuthType<D>;
    data: D;
};
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
declare class RSocketAuth<D> extends MimeType<AuthData<D>> {
    /**
     * Serializes authentication metadata including auth type and credentials.
     *
     * If the `authType` is well-known, it writes the ID.
     * Otherwise, it writes the UTF-8 string name and the payload.
     *
     * @param {AuthData<D>} payload - Authentication data to serialize.
     * @returns {Metadata<AuthData<D>>} Metadata wrapper containing the auth data.
     */
    protected serializeMetadata(payload: AuthData<D>): Metadata<AuthData<D>>;
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
    protected deserializeMetadata(payload: ByteReader, hasPayload?: boolean): Metadata<AuthData<D>>;
}

/**
 * # Simple Authentication Type
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * Authentication is a necessary component to any real world application. The most "simple" mechanism for authenticating is leveraging a username and password for authentication. This Authentication Type provides a standardized mechanism for including a username and password in the Authentication Payload of the [Authentication Extension]{@link RSocketAuth} using the Authentication Type of `simple`.
 *
 * ## Authentication Payload
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |        Username Length        |
 *     +-------------------------------+-------------------------------+
 *     |                            Username                          ...
 *     +-------------------------------+-------------------------------+
 *     |                            Password                          ...
 *     +-------------------------------+-------------------------------+
 * ```
 *
 * * **Username Length**: (16 bits = max value 2^16-1 = 65535) Unsigned 16-bit integer of Username Length in bytes.
 * * **Username**:  The UTF-8 encoded username.  The string MUST NOT be null terminated.
 * * **Password**:  The UTF-8 encoded password.  The string MUST NOT be null terminated.
 *
 * ## Security Considerations
 * The Simple Authentication Type transmits the username and password in cleartext. Additionally, it does not protect the authenticity or confidentiality of the payload that is transmitted along with it. This means that the [Transport]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#transport-protocol} that is used should provide both authenticity and confidentiality to protect both the username and password and corresponding payload.
 *
 * The use of the UTF-8 character encoding scheme and of normalization introduces additional security considerations; see [Section 10 of RFC3629]{@link https://tools.ietf.org/html/rfc3629#section-10} and [Section 6 of RFC5198]{@link https://tools.ietf.org/html/rfc5198#section-6} for more information.
 */
declare class SimpleAuthType extends AuthType<{
    username: string;
    password: string;
}> {
    /**
     * Reads and decodes the authentication payload from the given ByteReader.
     *
     * @param {ByteReader} reader - The byte reader to extract the authentication data.
     * @returns {{ username: string, password: string }} The decoded credentials.
     */
    read(reader: ByteReader): {
        username: string;
        password: string;
    };
    /**
     * Writes the authentication payload to the given ByteWriter.
     *
     * Encodes the username and password using UTF-8 and writes:
     *  - A 16-bit unsigned integer representing the byte-length of the username.
     *  - The UTF-8 encoded username.
     *  - The UTF-8 encoded password.
     *
     * @param {ByteWriter} writer - The byte writer to write the authentication data.
     * @param {{ username: string, password: string }} data - The credentials to encode and write.
     * @returns {void}
     */
    write(writer: ByteWriter, data: {
        username: string;
        password: string;
    }): void;
}

/**
 * # Bearer Token Authentication Type
 *
 * _This extension specification is currently incubating.  While incubating the version is 0._
 *
 * ## Introduction
 * Authentication is a necessary component to any real world application. A common mechanism for authenticating is using a bearer token. A bearer token can be presented as a means of obtaining access to a resource (i.e. session ids, OAuth 2 tokens, etc).
 * This Authentication Type provides a standardized mechanism for including a bearer token in the Authentication Payload of the [Authentication Extension]{@link RSocketAuth} using the Authentication Type of `bearer`.
 *
 * ### Authentication Payload
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     | Bearer Token                                              ...
 *     +---------------+-----------------------------------------------+
 * ```
 *
 * * **Bearer Token**: The UTF-8 encoded bearer token.  The string MUST NOT be null terminated.
 */
declare class BearerAuthType extends AuthType<string> {
    /**
     * Reads a bearer token from the given byte stream.
     *
     * @param {ByteReader} reader - A stream from which to read the bearer token.
     * @returns {string} Decoded bearer token as a UTF-8 string.
     */
    read(reader: ByteReader): string;
    /**
     * Writes a bearer token to the output stream.
     *
     * @param {ByteWriter} writer - The stream to write to.
     * @param {string} data - The bearer token to encode and write.
     */
    write(writer: ByteWriter, data: string): void;
}

/**
 * Namespace containing well-known authentication types for use in
 * `RSocketAuth` metadata.
 *
 * These types represent commonly used credential schemes and are associated
 * with numeric identifiers for efficient encoding. They are typically
 * used in frames that support authentication, such as `SETUP`.
 */
declare namespace WellKnownAuthType {
    /**
     * Simple Authentication Type.
     * Uses a UTF-8 encoded `username` and `password` pair.
     * Identifier: `0`
     *
     * Example:
     * ```ts
     * {
     *   authType: WellKnownAuthType.SIMPLE,
     *   data: { username: "admin", password: "secret" }
     * }
     * ```
     */
    const SIMPLE: SimpleAuthType;
    /**
     * Bearer Authentication Type.
     * Uses a single UTF-8 encoded bearer token.
     * Identifier: `1`
     *
     * Example:
     * ```ts
     * {
     *   authType: WellKnownAuthType.BEARER,
     *   data: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
     * }
     * ```
     */
    const BEARER: BearerAuthType; /**
     * Resolves a well-known or custom authentication type by name or numeric ID.
     *
     * @param {string | number} type - The authentication type name or identifier.
     * @returns {AuthType<any>} Matching AuthType instance.
     */
    const valueOf: typeof AuthType.valueOf;
}

/**
 * Namespace containing predefined and registered well-known MIME types,
 * including both standard media types and RSocket-specific types.
 */
declare namespace WellKnownMimeType {
    /** AVRO encoded binary data. */
    const APPLICATION_AVRO: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Concise Binary Object Representation (CBOR). */
    const APPLICATION_CBOR: MimeType<Uint8Array<ArrayBufferLike>>;
    /** GraphQL query format. */
    const APPLICATION_GRAPHQL: MimeType<Uint8Array<ArrayBufferLike>>;
    /** GZIP compressed data. */
    const APPLICATION_GZIP: MimeType<Uint8Array<ArrayBufferLike>>;
    /** JavaScript source code. */
    const APPLICATION_JAVASCRIPT: MimeType<Uint8Array<ArrayBufferLike>>;
    /** JSON encoded data. */
    const APPLICATION_JSON: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Binary stream format. */
    const APPLICATION_OCTET_STREAM: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Portable Document Format. */
    const APPLICATION_PDF: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Apache Thrift binary protocol. */
    const APPLICATION_THRIFT: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Google Protocol Buffers format. */
    const APPLICATION_PROTOBUF: MimeType<Uint8Array<ArrayBufferLike>>;
    /** XML encoded data. */
    const APPLICATION_XML: MimeType<Uint8Array<ArrayBufferLike>>;
    /** ZIP compressed archive. */
    const APPLICATION_ZIP: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using aac Coding. */
    const AUDIO_AAC: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using mp3 Coding. */
    const AUDIO_MP3: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using mp4 Coding. */
    const AUDIO_MP4: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using mpeg3 Coding. */
    const AUDIO_MPEG3: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using mpeg Coding. */
    const AUDIO_MPEG: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using ogg Coding. */
    const AUDIO_OGG: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using opus Coding. */
    const AUDIO_OPUS: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Audio encoded using vorbis Coding. */
    const AUDIO_VORBIS: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Bitmap image. */
    const IMAGE_BMP: MimeType<Uint8Array<ArrayBufferLike>>;
    /** GIF image. */
    const IMAGE_GIF: MimeType<Uint8Array<ArrayBufferLike>>;
    /** HEIC image sequence. */
    const IMAGE_HEIC_SEQUENCE: MimeType<Uint8Array<ArrayBufferLike>>;
    /** HEIC image. */
    const IMAGE_HEIC: MimeType<Uint8Array<ArrayBufferLike>>;
    /** HEIF image sequence. */
    const IMAGE_HEIF_SEQUENCE: MimeType<Uint8Array<ArrayBufferLike>>;
    /** HEIF image. */
    const IMAGE_HEIF: MimeType<Uint8Array<ArrayBufferLike>>;
    /** JPEG image. */
    const IMAGE_JPEG: MimeType<Uint8Array<ArrayBufferLike>>;
    /** PNG image. */
    const IMAGE_PNG: MimeType<Uint8Array<ArrayBufferLike>>;
    /** TIFF image. */
    const IMAGE_TIFF: MimeType<Uint8Array<ArrayBufferLike>>;
    /** MIME multipart/mixed content. */
    const MULTIPART_MIXED: MimeType<Uint8Array<ArrayBufferLike>>;
    /** CSS stylesheet. */
    const TEXT_CSS: MimeType<Uint8Array<ArrayBufferLike>>;
    /** CSV (Comma Separated Values) text. */
    const TEXT_CSV: MimeType<Uint8Array<ArrayBufferLike>>;
    /** HTML document. */
    const TEXT_HTML: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Plain text. */
    const TEXT_PLAIN: MimeType<Uint8Array<ArrayBufferLike>>;
    /** XML text. */
    const TEXT_XML: MimeType<Uint8Array<ArrayBufferLike>>;
    /** H.264 video stream. */
    const VIDEO_H264: MimeType<Uint8Array<ArrayBufferLike>>;
    /** H.265 video stream. */
    const VIDEO_H265: MimeType<Uint8Array<ArrayBufferLike>>;
    /** VP8 video stream. */
    const VIDEO_VP8: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Hessian binary protocol. */
    const APPLICATION_HESSIAN: MimeType<Uint8Array<ArrayBufferLike>>;
    /** Serialized Java objects. */
    const APPLICATION_JAVA_OBJECT: MimeType<Uint8Array<ArrayBufferLike>>;
    /** CloudEvents encoded in JSON. */
    const APPLICATION_CLOUDEVENTS_JSON: MimeType<Uint8Array<ArrayBufferLike>>;
    /** RSocket metadata for MIME type declarations. */
    const MESSAGE_RSOCKET_MIMETYPE: RSocketMimeType;
    /** RSocket metadata for accepted MIME types. */
    const MESSAGE_RSOCKET_ACCEPT_MIMETYPES: RSocketMimeTypes;
    /** RSocket authentication metadata. */
    const MESSAGE_RSOCKET_AUTHENTICATION: RSocketAuth<unknown>;
    /** RSocket tracing metadata using Zipkin format. */
    const MESSAGE_RSOCKET_TRACING_ZIPKIN: RSocketTracingZipkin;
    /** RSocket routing metadata. */
    const MESSAGE_RSOCKET_ROUTING: RSocketRouting;
    /** RSocket composite metadata format. */
    const MESSAGE_RSOCKET_COMPOSITE_METADATA: RSocketComposite;
}

/**
 * Represents a metadata frame in RSocket protocol.
 *
 * This class encapsulates metadata information, including its MIME type and payload,
 * and provides methods to serialize it into binary format for transmission.
 *
 * @template T - The type of the metadata payload, defaults to `Uint8Array`.
 */
declare class Metadata<T = Uint8Array> extends FrameWriter {
    readonly mimeType: MimeType<T>;
    readonly payload: T;
    /**
     * Creates a new [Metadata]{@link Metadata} instance.
     *
     * @param mimeType - The MIME type describing the format of the metadata.
     * @param payload - The actual metadata payload.
     */
    constructor(mimeType: MimeType<T>, payload: T);
    /**
     * Converts the metadata payload to a [Uint8Array]{@link Uint8Array}.
     *
     * @returns The metadata payload as a [Uint8Array]{@link Uint8Array}.
     */
    toUint8Array(): Uint8Array;
    /**
     * Serializes the metadata and writes it to the given [ByteWriter]{@link ByteWriter}.
     *
     * @param writer - The byte writer to which the metadata will be written.
     * @param hasPayload - Indicates whether to write the payload length prefix (defaults to `true`).
     */
    write(writer: ByteWriter, hasPayload?: boolean): void;
}

/**
 * Abstract base class representing an RSocket frame.
 *
 * All specific frame types (e.g., `SetupFrame`, `RequestFrame`, etc.)
 * must extend this class to implement their frame-specific logic.
 *
 * Each frame has:
 * - A header that includes frame type, stream ID, and flags.
 * - Optional metadata and payload sections.
 *
 * This class also implements encoding logic to convert a frame into a binary buffer.
 */
declare abstract class Frame extends FrameWriter {
    readonly metadata?: Metadata<any> | undefined;
    readonly payload?: Payload<any> | undefined;
    /**
     * The internal frame header (type, flags, stream ID).
     * @protected
     */
    readonly header: Header;
    /**
     * Constructs a new frame instance.
     *
     * @param {FrameType} type - The RSocket frame type (e.g. SETUP, REQUEST_RESPONSE).
     * @param {number} streamId - The stream identifier associated with the frame.
     * @param {FrameFlag} [flags=FrameFlag.NONE] - Initial frame flags.
     * @param {Metadata<any>} [metadata] - Optional metadata section.
     * @param {Payload<any>} [payload] - Optional payload section.
     */
    protected constructor(type: FrameType, streamId: number, flags?: FrameFlag, metadata?: Metadata<any> | undefined, payload?: Payload<any> | undefined);
    /**
     * Gets the frame type.
     *
     * @returns {FrameType} The frame type value.
     */
    get type(): FrameType;
    /**
     * Checks if a specific flag is set on the frame.
     *
     * @param {FrameFlag} flag - The flag to check.
     * @returns {boolean} `true` if the flag is set, otherwise `false`.
     */
    isFlagSet(flag: FrameFlag): boolean;
    /**
     * Indicates whether the frame can be safely ignored by the peer.
     * Relies on the `IGNORE` flag being set.
     *
     * @returns {boolean} `true` if frame has IGNORE flag, otherwise `false`.
     */
    canBeIgnored(): boolean;
    /**
     * Indicates whether the frame contains metadata.
     * Relies on the `METADATA` flag being set.
     *
     * @returns {boolean} `true` if the METADATA flag is set, otherwise `false`.
     */
    hasMetadata(): boolean;
    /**
     * Serializes the frame into a `Uint8Array` for transmission.
     *
     * Frame is written as:
     *  - Header
     *  - Frame-specific body (`write()` method implemented in subclass)
     *  - Metadata (if present)
     *  - Payload (if present)
     *
     * @returns {Uint8Array} Serialized binary representation of the frame.
     *
     * @remarks
     * Implementations may impose frame size limits (e.g. 65535 bytes in Java).
     * This method does **not** enforce length limits; check before sending.
     */
    toUint8Array(): Uint8Array;
}

/**
 * A utility for deserializing raw RSocket frames from binary format.
 *
 * Adds a `toUint8Array()` method to the result for potential re-serialization
 * or caching of original bytes.
 */
declare const FrameDeserializer: {
    /**
     * Deserializes the given buffer into a `Frame` and attaches `toUint8Array()`
     * that returns the original input buffer.
     *
     * @param {Uint8Array} buffer - The raw frame bytes to deserialize.
     * @param {MimeType<any>} metadataType - MIME type for metadata decoding.
     * @param {MimeType<any>} payloadType - MIME type for payload decoding.
     * @returns {Frame} Deserialized frame with `toUint8Array()` method.
     */
    deserialize: (buffer: Uint8Array, metadataType: MimeType<any>, payloadType: MimeType<any>) => Frame;
};

/**
 * ### SETUP Frame (0x01)
 *
 * Setup frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * The SETUP frame is sent by the client to inform the server of the parameters under which it desires
 * to operate. The usage and message sequence used is shown in [Connection Establishment]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#connection-establishment}.
 *
 * One of the important parameters for a connection is the format, layout, and any schema of the data and metadata for
 * frames. This is, for lack of a better term, referred to here as "MIME Type". An implementation MAY use typical MIME type
 * values or MAY decide to use specific non-MIME type values to indicate format, layout, and any schema
 * for data and metadata. The protocol implementation MUST NOT interpret the MIME type itself. This is an application
 * concern only.
 *
 * The encoding format for Data and Metadata are included separately in the SETUP.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |Frame Type |0|M|R|L|  Flags    |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |         Major Version         |        Minor Version          |
 *     +-------------------------------+-------------------------------+
 *     |0|                 Time Between KEEPALIVE Frames               |
 *     +---------------------------------------------------------------+
 *     |0|                       Max Lifetime                          |
 *     +---------------------------------------------------------------+
 *     |         Token Length          | Resume Identification Token  ...
 *     +---------------+-----------------------------------------------+
 *     |  MIME Length  |   Metadata Encoding MIME Type                ...
 *     +---------------+-----------------------------------------------+
 *     |  MIME Length  |     Data Encoding MIME Type                  ...
 *     +---------------+-----------------------------------------------+
 *                        Metadata & Setup Payload
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x01]{@link FrameType#SETUP}
 * * [__Flags__: (10 bits)]{@link SetupFlag}
 *      * (__M__)etadata: Metadata present
 *      * (__R__)esume Enable: Client requests resume capability if possible. Resume Identification Token present.
 *      * (__L__)ease: Will honor LEASE (or not).
 * * __Major Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Major version number of the protocol.
 * * __Minor Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Minor version number of the protocol.
 * * __Time Between KEEPALIVE Frames__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) between KEEPALIVE frames that the client will send. Value MUST be > 0.
 *    * For server-to-server connections, a reasonable time interval between client KEEPALIVE frames is 500ms.
 *    * For mobile-to-server connections, the time interval between client KEEPALIVE frames is often > 30,000ms.
 * * __Max Lifetime__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) that a client will allow a server to not respond to a KEEPALIVE before it is assumed to be dead. Value MUST be > 0.
 * * __Resume Identification Token Length__: (16 bits = max value 65,535) Unsigned 16-bit integer of Resume Identification Token Length in bytes. (Not present if R flag is not set)
 * * __Resume Identification Token__: Token used for client resume identification (Not present if R flag is not set)
 * * __MIME Length__: Encoding MIME Type Length in bytes.
 * * __Encoding MIME Type__: MIME Type for encoding of Data and Metadata. This SHOULD be a US-ASCII string
 * that includes the [Internet media type](https://en.wikipedia.org/wiki/Internet_media_type) specified
 * in [RFC 2045](https://tools.ietf.org/html/rfc2045). Many are registered with
 * [IANA](https://www.iana.org/assignments/media-types/media-types.xhtml) such as
 * [CBOR](https://www.iana.org/assignments/media-types/application/cbor).
 * [Suffix](http://www.iana.org/assignments/media-type-structured-suffix/media-type-structured-suffix.xml)
 * rules MAY be used for handling layout. For example, `application/x.netflix+cbor` or
 * `application/x.reactivesocket+cbor` or `application/x.netflix+json`. The string MUST NOT be null terminated.
 * * __Setup Data__: includes payload describing connection capabilities of the endpoint sending the
 * Setup header.
 *
 * __NOTE__: A server that receives a SETUP frame that has (__R__)esume Enabled set, but does not support resuming operation, MUST reject the SETUP with an ERROR[REJECTED_SETUP].
 *
 * @description Sent by client to initiate protocol processing.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-setup}
 */
declare class SetupFrame extends Frame {
    readonly keepalive: number;
    readonly lifetime: number;
    readonly metadataType: MimeType<any>;
    readonly dataType: MimeType<any>;
    readonly resumeToken?: string | undefined;
    readonly majorVersion: number;
    readonly minorVersion: number;
    /**
     * Constructs a `SetupFrame` instance.
     *
     * @param {number} keepalive - Interval (ms) between client KEEPALIVE frames.
     * @param {number} lifetime - Max time (ms) the server allows no KEEPALIVE.
     * @param {MimeType<any>} metadataType - MIME type for metadata encoding.
     * @param {MimeType<any>} dataType - MIME type for data encoding.
     * @param {string} [resumeToken] - Optional resume token (if `RESUME` flag is set).
     * @param {number} [majorVersion=1] - Major protocol version.
     * @param {number} [minorVersion=0] - Minor protocol version.
     * @param {SetupFlag} [flags=SetupFlag.NONE] - Initial flags (LEASE, METADATA, etc).
     * @param {Metadata<any>} [metadata] - Optional metadata block.
     * @param {Payload<any>} [payload] - Optional setup payload (application-specific).
     */
    constructor(keepalive: number, lifetime: number, metadataType: MimeType<any>, dataType: MimeType<any>, resumeToken?: string | undefined, majorVersion?: number, minorVersion?: number, flags?: SetupFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Deserializes a `SetupFrame` from binary.
     *
     * @param {Header} header - Frame header containing flags and type.
     * @param {ByteReader} reader - Reader instance pointing to frame body.
     * @param {MimeType<any>} _ - Ignored metadata type from deserialization context.
     * @param {MimeType<any>} __ - Ignored payload type from deserialization context.
     * @returns {SetupFrame} Parsed setup frame.
     */
    static from(header: Header, reader: ByteReader, _: MimeType, __: MimeType): SetupFrame;
    /**
     * Writes the frame-specific portion of the `SetupFrame` to the output.
     *
     * This includes protocol version, keepalive, lifetime, resume token (if any),
     * and MIME types for metadata and data.
     *
     * @param {ByteWriter} writer - Writer to output binary data.
     */
    protected write(writer: ByteWriter): void;
    /**
     * SETUP frames must never be ignored, regardless of the IGNORE flag.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Indicates whether this frame has resume support enabled.
     * Based on the `RESUME` flag.
     *
     * @returns {boolean} `true` if resume token is present and `RESUME` flag is set.
     */
    hasResume(): boolean;
    /**
     * Indicates whether this frame honors LEASE semantics.
     * Based on the `LEASE` flag.
     *
     * @returns {boolean} `true` if the LEASE flag is set.
     */
    isRespectLease(): boolean;
}

/**
 * Represents a `RESERVED` frame (`FrameType.RESERVED`, 0x00).
 *
 * This frame type is **not valid for use** and is reserved for future extension
 * or protocol evolution. Any attempt to construct or transmit such a frame
 * should be treated as a protocol violation.
 *
 * The class exists solely to support deserialization in edge cases
 * (e.g., for debugging, protocol fuzzing, or error reporting).
 *
 * ### Important:
 * - **Must not be constructed** at runtime intentionally.
 * - Always uses `FrameFlag.IGNORE`.
 *
 * @throws {Error} Always throws on construction to prevent misuse.
 *
 * @see [RSocket Protocol - Frame Types](https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-types)
 */
declare class ReservedFrame extends Frame {
    /**
     * Constructs a `ReservedFrame`. Throws immediately.
     *
     * @param {number} streamId - The stream ID associated with the frame.
     * @throws {Error} Always throws to prevent use of reserved frames.
     */
    constructor(streamId: number);
    /**
     * Deserializes a `ReservedFrame` from a stream.
     *
     * This method exists only to allow the parser to safely return
     * a `ReservedFrame` when the frame type byte equals `0x00`.
     *
     * @param {Header} header - Frame header.
     * @param {ByteReader} _ - Unused.
     * @param {MimeType} __ - Unused.
     * @param {MimeType} ___ - Unused.
     * @returns {ReservedFrame} A reserved frame instance (throws).
     * @throws {Error} Always throws on instantiation.
     */
    static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): ReservedFrame;
    /**
     * Reserved frame has no body and should never be written.
     *
     * @param {ByteWriter} _ - Unused.
     */
    protected write(_: ByteWriter): void;
}

/**
 * ### LEASE Frame (0x02)
 *
 * Lease frames MAY be sent by the client-side or server-side Responders and inform the
 * Requester that it may send Requests for a period of time and how many it may send during that duration.
 * See [Lease Semantics](#lease-semantics) for more information.
 *
 * The last received LEASE frame overrides all previous LEASE frame values.
 *
 * Lease frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|M|     Flags     |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |0|                       Time-To-Live                          |
 *     +---------------------------------------------------------------+
 *     |0|                     Number of Requests                      |
 *     +---------------------------------------------------------------+
 *                                 Metadata
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x02]{@link FrameType#LEASE}
 * * [__Flags__: (10 bits)]{@link FrameFlag}
 *      * (__M__)etadata: Metadata present
 * * __Time-To-Live (TTL)__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Time (in milliseconds) for validity of LEASE from time of reception. Value MUST be > 0.
 * * __Number of Requests__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Number of Requests that may be sent until next LEASE. Value MUST be > 0.
 *
 * A Responder implementation MAY stop all further requests by sending a LEASE with a value of 0 for __Number of Requests__ or __Time-To-Live__.
 *
 * When a LEASE expires due to time, the value of the __Number of Requests__ that a Requester may make is implicitly 0.
 *
 * This frame only supports Metadata, so the Metadata Length header MUST NOT be included, even if the (M)etadata flag is set true.
 *
 * @description Sent by Responder to grant the ability to send requests.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-lease}
 */
declare class LeaseFrame extends Frame {
    readonly ttl: number;
    readonly requestLimit: number;
    /**
     * Constructs a `LeaseFrame` instance.
     *
     * @param {number} ttl - Time-To-Live (in milliseconds) for which the lease is valid. Must be > 0.
     * @param {number} requestLimit - Maximum number of requests allowed under this lease. Must be > 0.
     * @param {Metadata<any>} [metadata] - Optional metadata (without length prefix).
     */
    constructor(ttl: number, requestLimit: number, metadata?: Metadata<any>);
    /**
     * Parses a `LeaseFrame` from a byte stream.
     *
     * @param {Header} header - Frame header (must have `Stream ID = 0`).
     * @param {ByteReader} reader - Reader positioned at TTL.
     * @param {MimeType} metadataType - MIME type to decode metadata.
     * @param {MimeType} _ - Payload MIME type (ignored).
     * @returns {LeaseFrame} Parsed instance.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, _: MimeType): LeaseFrame;
    /**
     * Writes the TTL and request limit, followed by optional metadata (without metadata length prefix).
     *
     * @param {ByteWriter} writer - Writer for binary serialization.
     */
    protected write(writer: ByteWriter): void;
    /**
     * `LEASE` frames must never be ignored, as they control permission to send requests.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
}

/**
 * ### KEEPALIVE Frame (0x03)
 *
 * KEEPALIVE frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * KEEPALIVE frames MUST be initiated by the client and sent periodically with the (__R__)espond flag set.
 *
 * KEEPALIVE frames MAY be initiated by the server and sent upon application request with the (__R__)espond flag set.
 *
 * Reception of a KEEPALIVE frame with the (__R__)espond flag set MUST cause a client or server to send
 * back a KEEPALIVE with the (__R__)espond flag __NOT__ set. The data in the received KEEPALIVE MUST be
 * echoed back in the generated KEEPALIVE.
 *
 * Reception of a KEEPALIVE by a server indicates to the server that the client is alive.
 *
 * Reception of a KEEPALIVE by a client indicates to the client that the server is alive.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|0|R|    Flags    |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |0|                  Last Received Position                     |
 *     +                                                               +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *                                   Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x03]{@link FrameType#KEEPALIVE}
 * * [__Flags__: (10 bits)]{@link KeepaliveFlag}
 *      * (__R__)espond with KEEPALIVE or not
 * * __Last Received Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of Resume Last Received Position. Value MUST be > 0. (optional. Set to all 0s when not supported.)
 * * __Data__: Data attached to a KEEPALIVE.
 *
 * @description Keepalive: Connection keepalive.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-keepalive}
 */
declare class KeepaliveFrame extends Frame {
    private readonly lastReceivedPosition;
    /**
     * Constructs a new `KeepaliveFrame` instance.
     *
     * @param {KeepaliveFlag} flags - Indicates if a response is required (`RESPOND`).
     * @param {bigint} lastReceivedPosition - Resume position received (or `0n` if not used).
     * @param {Payload<any>} [payload] - Optional payload to echo (must be echoed back if RESPOND is set).
     */
    constructor(flags?: KeepaliveFlag, lastReceivedPosition?: bigint, payload?: Payload<any>);
    /**
     * Parses a `KeepaliveFrame` from a binary stream.
     *
     * @param {Header} header - Frame header (must be type `KEEPALIVE`).
     * @param {ByteReader} reader - Reader positioned at frame body.
     * @param {MimeType} _ - Metadata type (ignored).
     * @param {MimeType} payloadType - Used to deserialize payload.
     * @returns {KeepaliveFrame} Parsed frame.
     */
    static from(header: Header, reader: ByteReader, _: MimeType, payloadType: MimeType): KeepaliveFrame;
    /**
     * Parses a `KeepaliveFrame` from a binary stream.
     *
     * @param {Header} header - Frame header (must be type `KEEPALIVE`).
     * @param {ByteReader} reader - Reader positioned at frame body.
     * @param {MimeType} _ - Metadata type (ignored).
     * @param {MimeType} payloadType - Used to deserialize payload.
     * @returns {KeepaliveFrame} Parsed frame.
     */
    isFlagSet(flag: KeepaliveFlag): boolean;
    /**
     * Serializes the resume position into the stream.
     *
     * @param {ByteWriter} writer - Binary writer.
     */
    protected write(writer: ByteWriter): void;
    /**
     * Indicates that this frame cannot be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * `KEEPALIVE` never contains metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
    /**
     * Returns `true` if the `RESPOND` flag is set, meaning the peer must reply.
     *
     * @returns {boolean}
     */
    isRequireRespond(): boolean;
}

/**
 * ### REQUEST_RESPONSE Frame (0x04)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|M|F|     Flags   |
 *     +-------------------------------+
 *                          Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x04]{@link FrameType#REQUEST_RESPONSE}
 * * [__Flags__: (10 bits)]{@link RequestResponseFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description Request single response.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-response}
 */
declare class RequestResponseFrame extends Frame {
    /**
     * Constructs a new `RequestResponseFrame`.
     *
     * @param {number} streamId - The stream ID assigned to this request.
     * @param {RequestResponseFlag} flags - Flags indicating metadata and fragmentation.
     * @param {Metadata<any>} [metadata] - Optional metadata block.
     * @param {Payload<any>} [payload] - Optional payload block.
     */
    constructor(streamId: number, flags: RequestResponseFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Parses a `RequestResponseFrame` from a byte stream.
     *
     * @param {Header} header - Frame header (should be of type `REQUEST_RESPONSE`).
     * @param {ByteReader} reader - Byte stream positioned at frame body.
     * @param {MimeType} metadataType - MIME type used for metadata decoding.
     * @param {MimeType} payloadType - MIME type used for payload decoding.
     * @returns {RequestResponseFrame} The parsed frame.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestResponseFrame;
    /**
     * Serializes the frame body.
     *
     * This frame has no fixed header body fields, so this method is a no-op.
     *
     * @param {ByteWriter} _ - Unused writer.
     */
    protected write(_: ByteWriter): void;
    /**
     * Checks if a specific flag is set.
     *
     * @param {RequestResponseFlag} flag - The flag to check.
     * @returns {boolean} `true` if the flag is present.
     */
    isFlagSet(flag: RequestResponseFlag): boolean;
    /**
     * `REQUEST_RESPONSE` frames must not be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Indicates whether this frame is fragmented.
     *
     * @returns {boolean} `true` if the `FOLLOWS` flag is set.
     */
    hasFollows(): boolean;
}

/**
 * ### REQUEST_FNF (Fire-n-Forget) Frame (0x05)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|M|F|    Flags    |
 *     +-------------------------------+
 *                           Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x05]{@link FrameType#REQUEST_FNF}
 * * [__Flags__: (10 bits)]{@link FireAndForgetFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description A single one-way message.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-fnf}
 */
declare class RequestFireAndForgetFrame extends Frame {
    /**
     * Constructs a `REQUEST_FNF` frame instance.
     *
     * @param {number} streamId - The ID of the stream.
     * @param {FireAndForgetFlag} flags - Flags (e.g., METADATA, FOLLOWS).
     * @param {Metadata<any>} [metadata] - Optional metadata.
     * @param {Payload<any>} [payload] - Optional payload.
     */
    constructor(streamId: number, flags: FireAndForgetFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Deserializes a `REQUEST_FNF` frame from the byte stream.
     *
     * @param {Header} header - Frame header.
     * @param {ByteReader} reader - Byte reader positioned at frame body.
     * @param {MimeType<any>} metadataType - Metadata MIME type for decoding.
     * @param {MimeType<any>} payloadType - Payload MIME type for decoding.
     * @returns {RequestFireAndForgetFrame} Parsed frame.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestFireAndForgetFrame;
    /**
     * Serializes the frame-specific body.
     * This frame has no fixed fields; metadata and payload are written separately.
     *
     * @param {ByteWriter} _ - Writer (unused in this method).
     */
    protected write(_: ByteWriter): void;
    /**
     * Serializes the frame-specific body.
     * This frame has no fixed fields; metadata and payload are written separately.
     *
     * @param {ByteWriter} _ - Writer (unused in this method).
     */
    isFlagSet(flag: FireAndForgetFlag): boolean;
    /**
     * Serializes the frame-specific body.
     * This frame has no fixed fields; metadata and payload are written separately.
     *
     * @param {ByteWriter} _ - Writer (unused in this method).
     */
    canBeIgnored(): boolean;
    /**
     * Returns `true` if the frame is fragmented (i.e. `FOLLOWS` flag is set).
     *
     * @returns {boolean} `true` if additional fragments follow.
     */
    hasFollows(): boolean;
}

/**
 *
 * ### REQUEST_STREAM Frame (0x06)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-------------+-------------------------------+
 *     |Frame Type |0|M|F|    Flags    |
 *     +-------------------------------+-------------------------------+
 *     |0|                    Initial Request N                        |
 *     +---------------------------------------------------------------+
 *                           Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x06]{@link FrameType#REQUEST_STREAM}
 * * [__Flags__: (10 bits)]{@link RequestStreamFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 * * __Initial Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the initial number of items to request. Value MUST be > 0.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * See [Flow Control: Reactive Streams Semantics](#flow-control-reactive-streams) for more information on RequestN behavior.
 *
 * @description Request a completable stream.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-stream}
 */
declare class RequestStreamFrame extends Frame {
    readonly request: number;
    /**
     * Creates a `REQUEST_STREAM` frame.
     *
     * @param {number} streamId - The unique stream identifier.
     * @param {RequestStreamFlag} flags - Frame flags (e.g., METADATA, FOLLOWS).
     * @param {number} request - Initial number of items requested (must be > 0).
     * @param {Metadata<any>} [metadata] - Optional metadata block.
     * @param {Payload<any>} [payload] - Optional payload block.
     */
    constructor(streamId: number, flags: RequestStreamFlag, request: number, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Parses a `REQUEST_STREAM` frame from binary.
     *
     * @param {Header} header - Frame header (must be type `REQUEST_STREAM`).
     * @param {ByteReader} reader - Reader positioned at frame body.
     * @param {MimeType<any>} metadataType - MIME type for decoding metadata.
     * @param {MimeType<any>} payloadType - MIME type for decoding payload.
     * @returns {RequestStreamFrame} The parsed frame instance.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestStreamFrame;
    /**
     * Serializes the initial request count.
     *
     * @param {ByteWriter} writer - Writer to output the frame body.
     */
    protected write(writer: ByteWriter): void;
    /**
     * Checks whether a specific flag is set.
     *
     * @param {RequestStreamFlag} flag - The flag to test.
     * @returns {boolean} True if the flag is set.
     */
    isFlagSet(flag: RequestStreamFlag): boolean;
    /**
     * Indicates whether this frame may be safely ignored.
     * Always returns `false`.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Returns `true` if the frame has the `FOLLOWS` flag set, indicating
     * that additional fragments follow this one.
     *
     * @returns {boolean} `true` if the frame is fragmented.
     */
    hasFollows(): boolean;
}

/**
 * ### REQUEST_CHANNEL Frame (0x07)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-+-----------+-------------------------------+
 *     |Frame Type |0|M|F|C|  Flags    |
 *     +-------------------------------+-------------------------------+
 *     |0|                    Initial Request N                        |
 *     +---------------------------------------------------------------+
 *                            Metadata & Request Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x07]{@link FrameType#REQUEST_CHANNEL}
 * * [__Flags__: (10 bits)]{@link RequestChannelFlag}
 *     * (__M__)etadata: Metadata present
 *     * (__F__)ollows: More fragments follow this fragment.
 *     * (__C__)omplete: bit to indicate stream completion.
 *       * If set, `onComplete()` or equivalent will be invoked on Subscriber/Observer.
 * * __Initial Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the initial request N value for channel. Value MUST be > 0.
 * * __Request Data__: identification of the service being requested along with parameters for the request.
 *
 * @description Request Channel: Request a completable stream in both directions.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-channel}
 */
declare class RequestChannelFrame extends Frame {
    readonly request: number;
    /**
     * Constructs a new `RequestChannelFrame` instance.
     *
     * @param {number} streamId - Unique stream ID.
     * @param {RequestChannelFlag} flags - Flags (e.g. METADATA, FOLLOWS, COMPLETE).
     * @param {number} request - Initial number of items requested (must be > 0).
     * @param {Metadata<any>} [metadata] - Optional metadata block.
     * @param {Payload<any>} [payload] - Optional payload block.
     */
    constructor(streamId: number, flags: RequestChannelFlag, request: number, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Parses a `RequestChannelFrame` from a binary stream.
     *
     * @param {Header} header - Parsed frame header.
     * @param {ByteReader} reader - Stream reader positioned at frame body.
     * @param {MimeType} metadataType - MIME type for decoding metadata.
     * @param {MimeType} payloadType - MIME type for decoding payload.
     * @returns {RequestChannelFrame} Parsed frame instance.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestChannelFrame;
    /**
     * Serializes the initial `requestN` value.
     *
     * @param {ByteWriter} writer - Writer for binary serialization.
     */
    protected write(writer: ByteWriter): void;
    /**
     * Checks if a specific flag is set on this frame.
     *
     * @param {RequestChannelFlag} flag - The flag to check.
     * @returns {boolean} `true` if set.
     */
    isFlagSet(flag: RequestChannelFlag): boolean;
    /**
     * `REQUEST_CHANNEL` frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Returns `true` if the frame is fragmented (i.e. `FOLLOWS` flag is set).
     */
    hasFollows(): boolean;
    /**
     * Returns `true` if the stream should be marked as complete after the initial payload.
     */
    isComplete(): boolean;
}

/**
 * ### REQUEST_N Frame (0x08)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|     Flags     |
 *     +-------------------------------+-------------------------------+
 *     |0|                         Request N                           |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x08]{@link FrameType#REQUEST_N}
 * * __Request N__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the number of items to request. Value MUST be > 0.
 *
 * See Flow Control: Reactive Streams Semantics for more information on RequestN behavior.
 *
 * @description Request N: Request N more items with Reactive Streams semantics.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-request-n}
 */
declare class RequestNFrame extends Frame {
    readonly request: number;
    /**
     * Constructs a `RequestNFrame` instance.
     *
     * @param {number} streamId - The ID of the stream to request more items on.
     * @param {number} request - The number of additional items to request (must be > 0).
     */
    constructor(streamId: number, request: number);
    /**
     * Parses a `RequestNFrame` from a binary stream.
     *
     * @param {Header} header - Frame header (should be of type `REQUEST_N`).
     * @param {ByteReader} reader - Reader positioned at the body.
     * @param {MimeType} _ - Ignored metadata type.
     * @param {MimeType} __ - Ignored payload type.
     * @returns {RequestNFrame} Parsed frame instance.
     */
    static from(header: Header, reader: ByteReader, _: MimeType, __: MimeType): RequestNFrame;
    /**
     * Writes the body of the `RequestNFrame` (a single 31-bit integer).
     *
     * @param {ByteWriter} writer - Binary writer to serialize the frame.
     */
    protected write(writer: ByteWriter): void;
    /**
     * Indicates that this frame must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Indicates that this frame does not contain metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
}

/**
 * ### CANCEL Frame (0x09)
 * Frame Contents
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|    Flags      |
 *     +-------------------------------+-------------------------------+
 * ```
 * * [__Frame Type__: (6 bits) 0x09]{@link FrameType#CANCEL}
 *
 * @description  Cancel outstanding request.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-cancel}
 */
declare class CancelFrame extends Frame {
    /**
     * Constructs a `CancelFrame` for the given stream.
     *
     * @param {number} streamId - Stream ID to cancel (must be > 0).
     */
    constructor(streamId: number);
    /**
     * Parses a `CancelFrame` from the header.
     *
     * @param {Header} header - Frame header (must have type `CANCEL`).
     * @param {ByteReader} _ - Reader (ignored, as this frame has no body).
     * @param {MimeType} __ - Metadata type (unused).
     * @param {MimeType} ___ - Payload type (unused).
     * @returns {CancelFrame} Parsed frame.
     */
    static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): CancelFrame;
    /**
     * Serializes the frame — does nothing as `CANCEL` has no body.
     *
     * @param {ByteWriter} _ - Writer (unused).
     */
    protected write(_: ByteWriter): void;
    /**
     * `CANCEL` frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * `CANCEL` frames never carry metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
}

/**
 * ### PAYLOAD Frame (0x0A)
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+-+-+-+---------+-------------------------------+
 *     |Frame Type |0|M|F|C|N|  Flags  |
 *     +-------------------------------+-------------------------------+
 *                             Metadata & Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0A]{@link FrameType#PAYLOAD}
 * [__Flags__: (10 bits)]{@link PayloadFlag}
 *     * (__M__)etadata: Metadata Present.
 *     * (__F__)ollows: More fragments follow this fragment.
 *     * (__C__)omplete: bit to indicate stream completion.
 *        * If set, `onComplete()` or equivalent will be invoked on Subscriber/Observer.
 *     * (__N__)ext: bit to indicate Next (Payload Data and/or Metadata present).
 *        * If set, `onNext(Payload)` or equivalent will be invoked on Subscriber/Observer.
 * * __Payload Data__: payload for Reactive Streams onNext.
 *
 * Valid combinations of (C)omplete and (N)ext flags are:
 *
 * - Both (C)omplete and (N)ext set meaning PAYLOAD contains data and signals stream completion.
 *   - For example: An Observable stream receiving `onNext(payload)` followed by `onComplete()`.
 * - Just (C)omplete set meaning PAYLOAD contains no data and only signals stream completion.
 *   - For example: An Observable stream receiving `onComplete()`.
 * - Just (N)ext set meaning PAYLOAD contains data stream is NOT completed.
 *   - For example: An Observable stream receiving `onNext(payload)`.
 *
 * A PAYLOAD MUST NOT have both (C)complete and (N)ext empty (false).
 *
 * The reason for the (N)ext flag instead of just deriving from Data length being > 0 is that 0 length data can be considered a valid PAYLOAD resulting in a delivery to the application layer with a PAYLOAD containing 0 bytes of data.
 *
 * For example: An Observable stream receiving data via `onNext(payload)` where payload contains 0 bytes of data.
 *
 * @description Payload on a stream. For example, response to a request, or message on a channel.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-payload}
 */
declare class PayloadFrame extends Frame {
    /**
     * Constructs a new `PayloadFrame`.
     *
     * @param {number} streamId - The stream ID this frame belongs to.
     * @param {PayloadFlag} flags - Flags (NEXT, COMPLETE, METADATA, FOLLOWS).
     * @param {Metadata<any>} [metadata] - Optional metadata.
     * @param {Payload<any>} [payload] - Optional payload.
     */
    constructor(streamId: number, flags: PayloadFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Parses a `PayloadFrame` from binary data.
     *
     * @param {Header} header - The frame header.
     * @param {ByteReader} reader - The byte reader positioned at the payload.
     * @param {MimeType} metadataType - Metadata MIME type.
     * @param {MimeType} payloadType - Payload MIME type.
     * @returns {PayloadFrame} The parsed payload frame.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): PayloadFrame;
    /**
     * Writes the frame-specific body to the writer.
     * PAYLOAD has no fixed header fields beyond metadata/payload.
     *
     * @param {ByteWriter} _ - Writer (unused here).
     */
    protected write(_: ByteWriter): void;
    /**
     * Checks if the specified flag is set.
     *
     * @param {PayloadFlag} flag - The flag to check.
     * @returns {boolean} `true` if the flag is set.
     */
    isFlagSet(flag: PayloadFlag): boolean;
    /**
     * Indicates that PAYLOAD frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Returns `true` if the `FOLLOWS` flag is set,
     * meaning more fragments are expected.
     */
    hasFollows(): boolean;
    /**
     * Returns `true` if this frame signals stream completion.
     */
    isComplete(): boolean;
    /**
     * Returns `true` if this frame contains an application payload.
     */
    isNext(): boolean;
}

/**
 * Enum representing possible frame error codes.
 * Used in protocol-level error handling for setup, connection, or stream errors.
 */
declare enum FrameErrorCode {
    /** Reserved. */
    RESERVED_ZERO = 0,
    /** The Setup frame is invalid for the server. Stream ID MUST be 0. */
    INVALID_SETUP = 1,
    /** Some parameters specified by the client are unsupported. Stream ID MUST be 0. */
    UNSUPPORTED_SETUP = 2,
    /** Server rejected the setup, reason may be specified in payload. Stream ID MUST be 0. */
    REJECTED_SETUP = 3,
    /** Server rejected resume attempt. Reason may be specified. Stream ID MUST be 0. */
    REJECTED_RESUME = 4,
    /** Connection is being terminated immediately. Stream ID MUST be 0. */
    CONNECTION_ERROR = 257,
    /** Connection is being terminated gracefully. Stream ID MUST be 0. */
    CONNECTION_CLOSE = 258,
    /** Application layer raised an error (onError). Stream ID MUST be > 0. */
    APPLICATION_ERROR = 513,
    /** Valid request rejected by responder. No processing guaranteed. Stream ID MUST be > 0. */
    REJECTED = 514,
    /** Responder canceled the request. Side-effects may exist. Stream ID MUST be > 0. */
    CANCELED = 515,
    /** Request was invalid. Stream ID MUST be > 0. */
    INVALID = 516,
    /** Reserved for extension use. */
    RESERVED_ONE = 4294967295
}
declare namespace FrameErrorCode {
    /**
     * Resolves a FrameErrorCode from a numeric byte value.
     * Matches the code exactly (no bitmask logic).
     *
     * @param {number} byte - The byte value to interpret as a FrameErrorCode.
     * @returns {FrameErrorCode | undefined} The matching FrameErrorCode, or `undefined` if no match.
     */
    function fromByte(byte: number): FrameErrorCode;
}

/**
 * ### ERROR Frame (0x0B)
 *
 * Error frames are used for errors on individual requests/streams as well as connection errors and in response to SETUP frames.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|      Flags    |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |                          Error Code                           |
 *     +---------------------------------------------------------------+
 *                                Error Data
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0B]{@link FrameType#ERROR}
 * * __Error Code__: (32 bits = max value 2^31-1 = 2,147,483,647) Type of Error.
 *      * See list of valid Error Codes below.
 * * __Error Data__: includes Payload describing error information. Error Data SHOULD be a UTF-8 encoded string. The string MUST NOT be null terminated.
 *
 * A Stream ID of 0 means the error pertains to the connection., including connection establishment. A Stream ID > 0 means the error pertains to a given stream.
 *
 * The Error Data is typically an Exception message, but could include stringified stacktrace information if appropriate.
 *
 * #### [Error Codes]{@link FrameErrorCode}
 *
 * |  Type                          | Value      | Description |
 * |:-------------------------------|:-----------|:------------|
 * | __RESERVED__                   | 0x00000000 | __Reserved__ |
 * | __INVALID_SETUP__              | 0x00000001 | The Setup frame is invalid for the server (it could be that the client is too recent for the old server). Stream ID MUST be 0. |
 * | __UNSUPPORTED_SETUP__          | 0x00000002 | Some (or all) of the parameters specified by the client are unsupported by the server. Stream ID MUST be 0. |
 * | __REJECTED_SETUP__             | 0x00000003 | The server rejected the setup, it can specify the reason in the payload. Stream ID MUST be 0. |
 * | __REJECTED_RESUME__            | 0x00000004 | The server rejected the resume, it can specify the reason in the payload. Stream ID MUST be 0. |
 * | __CONNECTION_ERROR__           | 0x00000101 | The connection is being terminated. Stream ID MUST be 0. Sender or Receiver of this frame MAY close the connection immediately without waiting for outstanding streams to terminate.|
 * | __CONNECTION_CLOSE__           | 0x00000102 | The connection is being terminated. Stream ID MUST be 0. Sender or Receiver of this frame MUST wait for outstanding streams to terminate before closing the connection. New requests MAY not be accepted.|
 * | __APPLICATION_ERROR__          | 0x00000201 | Application layer logic generating a Reactive Streams _onError_ event. Stream ID MUST be > 0. |
 * | __REJECTED__                   | 0x00000202 | Despite being a valid request, the Responder decided to reject it. The Responder guarantees that it didn't process the request. The reason for the rejection is explained in the Error Data section. Stream ID MUST be > 0. |
 * | __CANCELED__                   | 0x00000203 | The Responder canceled the request but may have started processing it (similar to REJECTED but doesn't guarantee lack of side-effects). Stream ID MUST be > 0. |
 * | __INVALID__                    | 0x00000204 | The request is invalid. Stream ID MUST be > 0. |
 * | __RESERVED__                   | 0xFFFFFFFF | __Reserved for Extension Use__ |
 *
 * __NOTE__: Unsed values in the range of 0x0001 to 0x00300 are reserved for future protocol use. Values in the range of 0x00301 to 0xFFFFFFFE are reserved for application layer errors.
 *
 * When this document refers to a specific Error Code as a frame, it uses this pattern: ERROR[error_code] or ERROR[error_code|error_code]
 *
 * For example:
 *
 * - ERROR[INVALID_SETUP] means the ERROR frame with the INVALID_SETUP code
 * - ERROR[REJECTED] means the ERROR frame with the REJECTED code
 * - ERROR[CONNECTION_ERROR|REJECTED_RESUME] means the ERROR frame with either the CONNECTION_ERROR or REJECTED_RESUME code
 *
 * @description Error at connection or application level.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-error}
 */
declare class ErrorFrame extends Frame {
    readonly code: FrameErrorCode;
    /**
     * Creates an `ErrorFrame` instance.
     *
     * @param {number} streamId - The stream ID (0 for connection-level errors).
     * @param {FrameErrorCode} code - The specific error code.
     * @param {Payload<any>} [payload] - Optional error payload (usually UTF-8 message).
     */
    constructor(streamId: number, code: FrameErrorCode, payload?: Payload<any>);
    /**
     * Parses an `ErrorFrame` from binary data.
     *
     * @param {Header} header - The frame header.
     * @param {ByteReader} reader - Reader positioned at error code.
     * @param {MimeType} _ - Metadata MIME type (ignored).
     * @param {MimeType} payloadType - Used to decode the error payload.
     * @returns {ErrorFrame} The parsed error frame.
     */
    static from(header: Header, reader: ByteReader, _: MimeType, payloadType: MimeType): ErrorFrame;
    /**
     * Serializes the frame body (error code + optional payload).
     *
     * @param {ByteWriter} writer - Writer for binary serialization.
     */
    protected write(writer: ByteWriter): void;
    /**
     * `ERROR` frames must not be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * `ERROR` frames never carry metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
}

/**
 * ### METADATA_PUSH Frame (0x0C)
 *
 * A Metadata Push frame can be used to send asynchronous metadata notifications from a Requester or
 * Responder to its peer.
 *
 * METADATA_PUSH frames MUST always use Stream ID 0 as they pertain to the Connection.
 *
 * Metadata tied to a particular stream uses the individual Payload frame Metadata flag.
 *
 * Frame Contents
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|1|     Flags     |
 *     +-------------------------------+-------------------------------+
 *                                 Metadata
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0C]{@link FrameType#METADATA_PUSH}
 *
 * This frame only supports Metadata, so the Metadata Length header MUST NOT be included.
 *
 * @description  Metadata: Asynchronous Metadata frame
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-metadata-push}
 */
declare class MetadataPushFrame extends Frame {
    /**
     * Constructs a new `MetadataPushFrame` with given metadata.
     *
     * @param {Metadata<any>} metadata - The metadata to push.
     */
    constructor(metadata: Metadata<any>);
    /**
     * Deserializes a `MetadataPushFrame` from a byte stream.
     *
     * @param {Header} _ - Frame header (unused, must be `FrameType.METADATA_PUSH`).
     * @param {ByteReader} reader - Reader positioned at metadata body.
     * @param {MimeType} metadataType - MIME type for decoding metadata.
     * @param {MimeType} __ - Payload type (ignored).
     * @returns {MetadataPushFrame} Parsed frame instance.
     */
    static from(_: Header, reader: ByteReader, metadataType: MimeType, __: MimeType): MetadataPushFrame;
    /**
     * Overrides the `write` method to disable metadata length encoding.
     * This frame must write raw metadata only, without a 24-bit length prefix.
     *
     * @param {ByteWriter} _ - Writer for serialization (not used here).
     */
    protected write(_: ByteWriter): void;
    /**
     * `METADATA_PUSH` frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Always returns `true`, since this frame only carries metadata.
     *
     * @returns {true}
     */
    hasMetadata(): boolean;
}

/**
 * #### RESUME Frame (0x0D)
 *
 * The general format for a Resume frame is given below.
 *
 * RESUME frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|    Flags      |
 *     +-------------------------------+-------------------------------+
 *     |        Major Version          |         Minor Version         |
 *     +-------------------------------+-------------------------------+
 *     |         Token Length          | Resume Identification Token  ...
 *     +---------------------------------------------------------------+
 *     |0|                                                             |
 *     +                 Last Received Server Position                 +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 *     |0|                                                             |
 *     +                First Available Client Position                +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0D]{@link FrameType#RESUME}
 * * __Major Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Major version number of the protocol.
 * * __Minor Version__: (16 bits = max value 65,535) Unsigned 16-bit integer of Minor version number of the protocol.
 * * __Resume Identification Token Length__: (16 bits = max value 65,535) Unsigned 16-bit integer of Resume Identification Token Length in bytes.
 * * __Resume Identification Token__: Token used for client resume identification. Same Resume Identification used in the initial SETUP by the client.
 * * __Last Received Server Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the last implied position the client received from the server.
 * * __First Available Client Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the earliest position that the client can rewind back to prior to resending frames.
 *
 * @description Resume: Replaces [SETUP]{@link SetupFrame} for Resuming Operation (optional)
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-resume}
 */
declare class ResumeFrame extends Frame {
    readonly resumeToken: string;
    readonly lastReceivedServerPosition: bigint;
    readonly firstAvailableClientPosition: bigint;
    readonly majorVersion: number;
    readonly minorVersion: number;
    /**
     * Creates a new `ResumeFrame`.
     *
     * @param {string} resumeToken - Identifier for the resume session, must match the token from `SETUP`.
     * @param {bigint} lastReceivedServerPosition - The last byte position received from the server before disconnection.
     * @param {bigint} firstAvailableClientPosition - The earliest byte position from which the client can replay messages.
     * @param {number} [majorVersion=1] - Protocol major version.
     * @param {number} [minorVersion=0] - Protocol minor version.
     */
    constructor(resumeToken: string, lastReceivedServerPosition: bigint, firstAvailableClientPosition: bigint, majorVersion?: number, minorVersion?: number);
    /**
     * Deserializes a `ResumeFrame` from the binary stream.
     *
     * @param {Header} _ - The frame header (must be type `RESUME`).
     * @param {ByteReader} reader - Binary reader positioned at the body.
     * @param {MimeType} __ - Ignored metadata type (no metadata in RESUME).
     * @param {MimeType} ___ - Ignored payload type (no payload in RESUME).
     * @returns {ResumeFrame} A parsed `ResumeFrame` instance.
     */
    static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeFrame;
    /**
     * Writes the `ResumeFrame` to the binary stream.
     *
     * Format includes protocol version, resume token, and position fields.
     *
     * @param {ByteWriter} writer - Writer used to serialize the frame body.
     */
    protected write(writer: ByteWriter): void;
    /**
     * Resume frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * Resume frames never contain metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
}

/**
 * #### RESUME_OK Frame (0x0E)
 *
 * The general format for a Resume OK frame is given below.
 *
 * RESUME OK frames MUST always use Stream ID 0 as they pertain to the connection.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                       Stream ID = 0                         |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |0|0|    Flags      |
 *     +-------------------------------+-------------------------------+
 *     |0|                                                             |
 *     +               Last Received Client Position                   +
 *     |                                                               |
 *     +---------------------------------------------------------------+
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x0E]{@link FrameType#RESUME_OK}
 * * __Last Received Client Position__: (63 bits = max value 2^63-1) Unsigned 63-bit long of the last implied position the server received from the client.
 *
 * @description Sent in response to a RESUME if resuming operation possible (optional)
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-resume-ok}
 */
declare class ResumeOkFrame extends Frame {
    readonly lastReceivedClientPosition: bigint;
    /**
     * @param {bigint} lastReceivedClientPosition - The last position (in bytes) the server received from the client before disconnection.
     */
    constructor(lastReceivedClientPosition: bigint);
    /**
     * Creates a `ResumeOkFrame` instance from a binary stream.
     *
     * @param {Header} _ - Parsed header (unused, must be type RESUME_OK).
     * @param {ByteReader} reader - Binary reader positioned at frame body.
     * @param {MimeType} __ - Metadata MIME type (ignored for this frame).
     * @param {MimeType} ___ - Payload MIME type (ignored for this frame).
     * @returns {ResumeOkFrame} Parsed frame instance.
     */
    static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeOkFrame;
    /**
     * Serializes the frame body into a binary writer.
     *
     * Writes a single 63-bit unsigned integer representing the client's last acknowledged position.
     *
     * @param {ByteWriter} writer - Writer to output binary data.
     */
    protected write(writer: ByteWriter): void;
    /**
     * `RESUME_OK` frames must never be ignored.
     *
     * @returns {false}
     */
    canBeIgnored(): boolean;
    /**
     * `RESUME_OK` frames do not contain metadata.
     *
     * @returns {false}
     */
    hasMetadata(): boolean;
}

/**
 * ### EXT (Extension) Frame (0x3F)
 *
 * The general format for an extension frame is given below.
 *
 * ```
 *      0                   1                   2                   3
 *      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *     |0|                         Stream ID                           |
 *     +-----------+-+-+---------------+-------------------------------+
 *     |Frame Type |I|M|1|2|3|4|5|6|7|8|
 *     +-------------------------------+-------------------------------+
 *     |0|                      Extended Type                          |
 *     +---------------------------------------------------------------+
 *                         Depends on Extended Type...
 * ```
 *
 * * [__Frame Type__: (6 bits) 0x3F]{@link FrameType#EXT}
 * * [__Flags__: (10 bits)]{@link ExtensionFlag}
 *     * (__I__)gnore: Can the frame be ignored if not understood?
 *     * (__M__)etadata: Ext  Present.
 *     * EXT_(__1__): Flag 1 Present.
 *     * EXT_(__2__): Flag 2 Present.
 *     * EXT_(__3__): Flag 3 Present.
 *     * EXT_(__4__): Flag 4 Present.
 *     * EXT_(__5__): Flag 5 Present.
 *     * EXT_(__6__): Flag 6 Present.
 *     * EXT_(__7__): Flag 7 Present.
 *     * EXT_(__8__): Flag 8 Present.
 * * __Extended Type__: (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer of Extended type information. Value MUST be > 0.
 *
 * @description Used To Extend more frame types as well as extensions.
 * @see [Official documentation]{@link https://github.com/rsocket/rsocket/blob/master/Protocol.md#frame-ext}
 */
declare class ExtensionFrame extends Frame {
    readonly extendedType: number;
    /**
     * Constructs an `ExtensionFrame` instance.
     *
     * @param {number} streamId - Associated stream ID (`0` for connection-level extensions).
     * @param {ExtensionFlag} flags - Extension and metadata flags.
     * @param {number} extendedType - Custom extension type (must be > 0).
     * @param {Metadata<any>} [metadata] - Optional metadata block.
     * @param {Payload<any>} [payload] - Optional payload block.
     */
    constructor(streamId: number, flags: ExtensionFlag, extendedType: number, // todo придумать как типизировать, возможно стоит делать через factory
    metadata?: Metadata<any>, payload?: Payload<any>);
    /**
     * Parses an `ExtensionFrame` from binary data.
     *
     * @param {Header} header - Frame header (must be `FrameType.EXT`).
     * @param {ByteReader} reader - Byte stream reader.
     * @param {MimeType} metadataType - Metadata MIME type for decoding.
     * @param {MimeType} payloadType - Payload MIME type for decoding.
     * @returns {ExtensionFrame} Parsed extension frame instance.
     */
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): ExtensionFrame;
    /**
     * Checks whether a specific flag is set on this extension frame.
     *
     * @param {ExtensionFlag} flag - The flag to check.
     * @returns {boolean} `true` if the flag is present.
     */
    isFlagSet(flag: ExtensionFlag): boolean;
    /**
     * Serializes the extension frame (writes extended type and optional metadata/payload).
     *
     * @param {ByteWriter} writer - Writer for binary serialization.
     */
    protected write(writer: ByteWriter): void;
}

export { AuthType, CancelFrame, ErrorFrame, ExtensionFlag, ExtensionFrame, FireAndForgetFlag, Frame, FrameDeserializer, FrameFlag, FrameType, Header, KeepaliveFlag, KeepaliveFrame, LeaseFrame, Metadata, MetadataPushFrame, MimeType, Payload, PayloadFlag, PayloadFrame, RequestChannelFlag, RequestChannelFrame, RequestFireAndForgetFrame, RequestNFrame, RequestResponseFlag, RequestResponseFrame, RequestStreamFlag, RequestStreamFrame, ReservedFrame, ResumeFrame, ResumeOkFrame, SetupFlag, SetupFrame, WellKnownAuthType, WellKnownMimeType };
