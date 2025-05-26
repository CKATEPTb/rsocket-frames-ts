import { Mono, Flux } from '@ckateptb/reactive-core-js';
import { ByteWriter, ByteReader } from 'bebyte';

interface RSocket {
    fireAndForget<T>(payload: Mono<T>): Mono<void>;
    requestResponse<T, R>(payload: Mono<T>): Mono<R>;
    requestStream<T, R>(payload: Mono<T>): Flux<R>;
    requestChannel<T, R>(payload: Flux<T>): Flux<R>;
    metadataPush<T>(payload: Mono<T>): Mono<void>;
    disconnect(): void;
}

declare enum FrameType {
    RESERVED = 0,// Reserved
    SETUP = 1,// Setup: Sent by client to initiate protocol processing
    LEASE = 2,// Lease: Sent by Responder to grant the ability to send requests
    KEEPALIVE = 3,// Keepalive: Connection keepalive
    REQUEST_RESPONSE = 4,// Request Response: Request single response
    REQUEST_FNF = 5,// Fire And Forget: A single one-way message
    REQUEST_STREAM = 6,// Request Stream: Request a completable stream
    REQUEST_CHANNEL = 7,// Request Channel: Request a completable stream in both directions
    REQUEST_N = 8,// Request N: Request N more items with Reactive Streams semantics
    CANCEL = 9,// Cancel Request: Cancel outstanding request
    PAYLOAD = 10,// Payload: Payload on a stream. For example, response to a request, or message on a channel
    ERROR = 11,// Error: Error at connection or application level
    METADATA_PUSH = 12,// Metadata: Asynchronous Metadata frame
    RESUME = 13,// Resume: Replaces SETUP for Resuming Operation (optional)
    RESUME_OK = 14,// Resume OK : Sent in response to a RESUME if resuming operation possible (optional)
    EXT = 63
}
declare namespace FrameType {
    function fromByte(byte: number): FrameType;
}

declare enum _FrameFlag {
    NONE = 0,
    IGNORE = 512,// Ignore frame if not understood.
    METADATA = 256
}
declare const FrameFlag: {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type FrameFlag = number | _FrameFlag;
declare enum _KeepaliveFlag {
    RESPOND = 128
}
declare const KeepaliveFlag: typeof _KeepaliveFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type KeepaliveFlag = FrameFlag | _KeepaliveFlag;
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
declare const ExtensionFlag: typeof _ExtensionFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type ExtensionFlag = FrameFlag | _ExtensionFlag;
declare enum _SetupFlag {
    RESUME = 128,
    LEASE = 64
}
declare const SetupFlag: typeof _SetupFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type SetupFlag = FrameFlag | _SetupFlag;
declare enum FollowsFlag {
    FOLLOWS = 128
}
declare const FireAndForgetFlag: typeof FollowsFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type FireAndForgetFlag = FrameFlag | FollowsFlag;
declare const RequestResponseFlag: typeof FollowsFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestResponseFlag = FireAndForgetFlag;
declare const RequestStreamFlag: typeof FollowsFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestStreamFlag = RequestResponseFlag;
declare enum CompleteFlag {
    COMPLETE = 64
}
declare enum _PayloadFlag {
    NEXT = 32
}
declare const RequestChannelFlag: typeof FollowsFlag & typeof CompleteFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type RequestChannelFlag = FrameFlag | FollowsFlag | CompleteFlag;
declare const PayloadFlag: typeof _PayloadFlag & typeof FollowsFlag & typeof CompleteFlag & {
    combine: (...flags: FrameFlag[]) => number;
} & typeof _FrameFlag;
type PayloadFlag = _PayloadFlag | RequestChannelFlag;

declare abstract class FrameWriter {
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
    constructor(frameType: FrameType, // (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the stream Identifier for this frame or 0 to indicate the entire connection.
    streamId: number, // 6 bits = max value 63) Type of Frame.
    flags: FrameFlag);
    static from(reader: ByteReader): Header;
    isFlagSet(flag: FrameFlag): boolean;
    write(writer: ByteWriter): void;
}

declare class Metadata<T = Uint8Array> extends FrameWriter {
    readonly mimeType: MimeType<T>;
    readonly payload: T;
    constructor(mimeType: MimeType<T>, payload: T);
    toUint8Array(): Uint8Array;
    write(writer: ByteWriter, hasPayload?: boolean): void;
}

declare class MimeType<T = Uint8Array> {
    readonly mimeType: string;
    readonly identifier?: number | undefined;
    private static _values;
    constructor(mimeType: string, identifier?: number | undefined);
    get isWellKnown(): boolean;
    protected serializeMetadata(payload: T): Metadata<T>;
    protected deserializeMetadata(payload: ByteReader, hasPayload?: boolean): Metadata<T>;
    toMetadata(payload: ByteReader | T, hasPayload?: boolean): Metadata<T>;
    protected serializePayload(payload: T): Payload<T>;
    protected deserializePayload(payload: ByteReader): Payload<T>;
    toPayload(payload: ByteReader | T): Payload<T>;
    static valueOf(mimeType: string | number): MimeType;
}

declare class Payload<T = Uint8Array> extends FrameWriter {
    readonly mimeType: MimeType<T>;
    readonly payload: T;
    constructor(mimeType: MimeType<T>, payload: T);
    toUint8Array(): Uint8Array;
    write(writer: ByteWriter): void;
}

declare abstract class Frame extends FrameWriter {
    readonly metadata?: Metadata<any> | undefined;
    readonly payload?: Payload<any> | undefined;
    protected readonly header: Header;
    protected constructor(type: FrameType, streamId: number, flags?: FrameFlag, metadata?: Metadata<any> | undefined, payload?: Payload<any> | undefined);
    get type(): FrameType;
    isFlagSet(flag: FrameFlag): boolean;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
    toUint8Array(): Uint8Array;
}

declare const FrameDeserializer: {
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
    constructor(keepalive: number, lifetime: number, metadataType: MimeType<any>, dataType: MimeType<any>, resumeToken?: string | undefined, majorVersion?: number, minorVersion?: number, flags?: SetupFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, _: MimeType, __: MimeType): SetupFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasResume(): boolean;
    isRespectLease(): boolean;
}

/**
 *
 * [__Frame Type__: (6 bits) 0x00]{@link FrameType#RESERVED}
 * @description Reserved
 */
declare class ReservedFrame extends Frame {
    constructor(streamId: number);
    static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): ReservedFrame;
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
    constructor(ttl: number, requestLimit: number, metadata?: Metadata<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, _: MimeType): LeaseFrame;
    protected write(writer: ByteWriter): void;
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
    constructor(flags?: KeepaliveFlag, lastReceivedPosition?: bigint, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, _: MimeType, payloadType: MimeType): KeepaliveFrame;
    isFlagSet(flag: KeepaliveFlag): boolean;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
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
    constructor(streamId: number, flags: RequestResponseFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestResponseFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: RequestResponseFlag): boolean;
    canBeIgnored(): boolean;
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
    constructor(streamId: number, flags: FireAndForgetFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestFireAndForgetFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: FireAndForgetFlag): boolean;
    canBeIgnored(): boolean;
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
    constructor(streamId: number, flags: RequestStreamFlag, request: number, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestStreamFrame;
    protected write(writer: ByteWriter): void;
    isFlagSet(flag: RequestStreamFlag): boolean;
    canBeIgnored(): boolean;
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
    constructor(streamId: number, flags: RequestChannelFlag, request: number, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): RequestChannelFrame;
    protected write(writer: ByteWriter): void;
    isFlagSet(flag: RequestChannelFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
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
    constructor(streamId: number, request: number);
    static from(header: Header, reader: ByteReader, _: MimeType, __: MimeType): RequestNFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(streamId: number);
    static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): CancelFrame;
    protected write(_: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(streamId: number, flags: PayloadFlag, metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): PayloadFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: PayloadFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
    isComplete(): boolean;
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
    protected readonly code: FrameErrorCode;
    constructor(streamId: number, code: FrameErrorCode, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, _: MimeType, payloadType: MimeType): ErrorFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(metadata: Metadata<any>);
    static from(_: Header, reader: ByteReader, metadataType: MimeType, __: MimeType): MetadataPushFrame;
    protected write(_: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(resumeToken: string, lastReceivedServerPosition: bigint, firstAvailableClientPosition: bigint, majorVersion?: number, minorVersion?: number);
    static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(lastReceivedClientPosition: bigint);
    static from(_: Header, reader: ByteReader, __: MimeType, ___: MimeType): ResumeOkFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
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
    constructor(streamId: number, flags: ExtensionFlag, extendedType: number, // todo придумать как типизировать, возможно стоит делать через factory
    metadata?: Metadata<any>, payload?: Payload<any>);
    static from(header: Header, reader: ByteReader, metadataType: MimeType, payloadType: MimeType): ExtensionFrame;
    isFlagSet(flag: ExtensionFlag): boolean;
    protected write(writer: ByteWriter): void;
}

declare class Connection implements RSocket {
    private readonly url;
    private readonly websocket;
    private readonly requests;
    private readonly callbacks;
    private readonly streamIds;
    constructor(url: string);
    protected sendFrame(frame: Frame): void;
    fireAndForget<T>(payload: Mono<T>): Mono<void>;
    requestResponse<T, R>(payload: Mono<T>): Mono<R>;
    requestStream<T, R>(payload: Mono<T>): Flux<R>;
    requestChannel<T, R>(payload: Flux<T>): Flux<R>;
    metadataPush<T>(payload: Mono<T>): Mono<void>;
    disconnect(): void;
}

export { CancelFrame, Connection, ErrorFrame, ExtensionFlag, ExtensionFrame, FireAndForgetFlag, Frame, FrameDeserializer, FrameFlag, FrameType, KeepaliveFlag, KeepaliveFrame, LeaseFrame, MetadataPushFrame, MimeType, PayloadFlag, PayloadFrame, RequestChannelFlag, RequestChannelFrame, RequestFireAndForgetFrame, RequestNFrame, RequestResponseFlag, RequestResponseFrame, RequestStreamFlag, RequestStreamFrame, ReservedFrame, ResumeFrame, ResumeOkFrame, SetupFlag, SetupFrame };
