import { ByteWriter, ByteReader } from 'bebyte';

declare enum WellKnownMimeType {
    UNPARSEABLE_MIME_TYPE = "UNPARSEABLE_MIME_TYPE_DO_NOT_USE",
    UNKNOWN_RESERVED_MIME_TYPE = "UNKNOWN_YET_RESERVED_DO_NOT_USE",
    APPLICATION_AVRO = "application/avro",
    APPLICATION_CBOR = "application/cbor",
    APPLICATION_GRAPHQL = "application/graphql",
    APPLICATION_GZIP = "application/gzip",
    APPLICATION_JAVASCRIPT = "application/javascript",
    APPLICATION_JSON = "application/json",
    APPLICATION_OCTET_STREAM = "application/octet-stream",
    APPLICATION_PDF = "application/pdf",
    APPLICATION_THRIFT = "application/vnd.apache.thrift.binary",
    APPLICATION_PROTOBUF = "application/vnd.google.protobuf",
    APPLICATION_XML = "application/xml",
    APPLICATION_ZIP = "application/zip",
    AUDIO_AAC = "audio/aac",
    AUDIO_MP3 = "audio/mp3",
    AUDIO_MP4 = "audio/mp4",
    AUDIO_MPEG3 = "audio/mpeg3",
    AUDIO_MPEG = "audio/mpeg",
    AUDIO_OGG = "audio/ogg",
    AUDIO_OPUS = "audio/opus",
    AUDIO_VORBIS = "audio/vorbis",
    IMAGE_BMP = "image/bmp",
    IMAGE_GIG = "image/gif",
    IMAGE_HEIC_SEQUENCE = "image/heic-sequence",
    IMAGE_HEIC = "image/heic",
    IMAGE_HEIF_SEQUENCE = "image/heif-sequence",
    IMAGE_HEIF = "image/heif",
    IMAGE_JPEG = "image/jpeg",
    IMAGE_PNG = "image/png",
    IMAGE_TIFF = "image/tiff",
    MULTIPART_MIXED = "multipart/mixed",
    TEXT_CSS = "text/css",
    TEXT_CSV = "text/csv",
    TEXT_HTML = "text/html",
    TEXT_PLAIN = "text/plain",
    TEXT_XML = "text/xml",
    VIDEO_H264 = "video/H264",
    VIDEO_H265 = "video/H265",
    VIDEO_VP8 = "video/VP8",
    APPLICATION_HESSIAN = "application/x-hessian",
    APPLICATION_JAVA_OBJECT = "application/x-java-object",
    APPLICATION_CLOUDEVENTS_JSON = "application/cloudevents+json",
    MESSAGE_RSOCKET_MIMETYPE = "message/x.rsocket.mime-type.v0",
    MESSAGE_RSOCKET_ACCEPT_MIMETYPES = "message/x.rsocket.accept-mime-types.v0",
    MESSAGE_RSOCKET_AUTHENTICATION = "message/x.rsocket.authentication.v0",
    MESSAGE_RSOCKET_TRACING_ZIPKIN = "message/x.rsocket.tracing-zipkin.v0",
    MESSAGE_RSOCKET_ROUTING = "message/x.rsocket.routing.v0",
    MESSAGE_RSOCKET_COMPOSITE_METADATA = "message/x.rsocket.composite-metadata.v0"
}
declare namespace WellKnownMimeType {
    function valueOf(mimeType: string): WellKnownMimeType;
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

declare class Metadata extends FrameWriter {
    write(writer: ByteWriter, hasPayload?: boolean): void;
    static from(reader: ByteReader): Metadata;
}

declare class Payload extends FrameWriter {
    write(writer: ByteWriter): Uint8Array;
    static from(reader: ByteReader): Payload;
}

declare abstract class Frame extends FrameWriter {
    protected readonly metadata?: Metadata | undefined;
    protected readonly payload?: Payload | undefined;
    protected readonly header: Header;
    protected constructor(type: FrameType, streamId: number, flags?: FrameFlag, metadata?: Metadata | undefined, payload?: Payload | undefined);
    get type(): FrameType;
    isFlagSet(flag: FrameFlag): boolean;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
    toUint8Array(): Uint8Array;
}

declare const FrameDeserializer: {
    deserialize: (buffer: Uint8Array) => Frame;
};

declare class SetupFrame extends Frame {
    readonly keepalive: number;
    readonly lifetime: number;
    readonly metadataType: WellKnownMimeType;
    readonly dataType: WellKnownMimeType;
    readonly resumeToken?: string | undefined;
    readonly majorVersion: number;
    readonly minorVersion: number;
    constructor(keepalive: number, lifetime: number, metadataType: WellKnownMimeType, dataType: WellKnownMimeType, resumeToken?: string | undefined, majorVersion?: number, minorVersion?: number, flags?: SetupFlag, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): SetupFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasResume(): boolean;
    isRespectLease(): boolean;
}

declare class ReservedFrame extends Frame {
    constructor(streamId: number);
    static from(header: Header, _: ByteReader): ReservedFrame;
    protected write(_: ByteWriter): void;
}

declare class LeaseFrame extends Frame {
    readonly ttl: number;
    readonly requestLimit: number;
    constructor(ttl: number, requestLimit: number, metadata?: Metadata);
    static from(header: Header, reader: ByteReader): LeaseFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
}

declare class KeepaliveFrame extends Frame {
    private readonly lastReceivedPosition;
    constructor(flags?: KeepaliveFlag, lastReceivedPosition?: bigint, payload?: Payload);
    static from(header: Header, reader: ByteReader): KeepaliveFrame;
    isFlagSet(flag: KeepaliveFlag): boolean;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
    isRequireRespond(): boolean;
}

declare class RequestResponseFrame extends Frame {
    constructor(streamId: number, flags: RequestResponseFlag, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): RequestResponseFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: RequestResponseFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
}

declare class RequestFireAndForgetFrame extends Frame {
    constructor(streamId: number, flags: FireAndForgetFlag, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): RequestFireAndForgetFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: FireAndForgetFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
}

declare class RequestStreamFrame extends Frame {
    readonly request: number;
    constructor(streamId: number, flags: RequestStreamFlag, request: number, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): RequestStreamFrame;
    protected write(writer: ByteWriter): void;
    isFlagSet(flag: RequestStreamFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
}

declare class RequestChannelFrame extends Frame {
    readonly request: number;
    constructor(streamId: number, flags: RequestChannelFlag, request: number, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): RequestChannelFrame;
    protected write(writer: ByteWriter): void;
    isFlagSet(flag: RequestChannelFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
    isComplete(): boolean;
}

declare class RequestNFrame extends Frame {
    readonly request: number;
    constructor(streamId: number, request: number);
    static from(header: Header, reader: ByteReader): RequestNFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class CancelFrame extends Frame {
    constructor(streamId: number);
    static from(header: Header, _: ByteReader): CancelFrame;
    protected write(_: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class PayloadFrame extends Frame {
    constructor(streamId: number, flags: PayloadFlag, metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): PayloadFrame;
    protected write(_: ByteWriter): void;
    isFlagSet(flag: PayloadFlag): boolean;
    canBeIgnored(): boolean;
    hasFollows(): boolean;
    isComplete(): boolean;
    isNext(): boolean;
}

declare enum ErrorCode {
    RESERVED_ZERO = 0,
    INVALID_SETUP = 1,
    UNSUPPORTED_SETUP = 2,
    REJECTED_SETUP = 3,
    REJECTED_RESUME = 4,
    CONNECTION_ERROR = 257,
    CONNECTION_CLOSE = 258,
    APPLICATION_ERROR = 513,
    REJECTED = 514,
    CANCELED = 515,
    INVALID = 516,
    RESERVED_ONE = 4294967295
}
declare namespace ErrorCode {
    function fromByte(byte: number): ErrorCode;
}

declare class ErrorFrame extends Frame {
    protected readonly code: ErrorCode;
    constructor(streamId: number, code: ErrorCode, payload?: Payload);
    static from(header: Header, reader: ByteReader): ErrorFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class MetadataPushFrame extends Frame {
    constructor(metadata: Metadata);
    static from(_: Header, reader: ByteReader): MetadataPushFrame;
    protected write(_: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class ResumeFrame extends Frame {
    readonly resumeToken: string;
    readonly lastReceivedServerPosition: bigint;
    readonly firstAvailableClientPosition: bigint;
    readonly majorVersion: number;
    readonly minorVersion: number;
    constructor(resumeToken: string, lastReceivedServerPosition: bigint, firstAvailableClientPosition: bigint, majorVersion?: number, minorVersion?: number);
    static from(_: Header, reader: ByteReader): ResumeFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class ResumeOkFrame extends Frame {
    readonly lastReceivedClientPosition: bigint;
    constructor(lastReceivedClientPosition: bigint);
    static from(header: Header, reader: ByteReader): ResumeOkFrame;
    protected write(writer: ByteWriter): void;
    canBeIgnored(): boolean;
    hasMetadata(): boolean;
}

declare class ExtensionFrame extends Frame {
    readonly extendedType: number;
    constructor(streamId: number, flags: ExtensionFlag, extendedType: number, // todo придумать как типизировать, возможно стоит делать через factory
    metadata?: Metadata, payload?: Payload);
    static from(header: Header, reader: ByteReader): ExtensionFrame;
    isFlagSet(flag: ExtensionFlag): boolean;
    protected write(writer: ByteWriter): void;
}

export { CancelFrame, ErrorFrame, ExtensionFlag, ExtensionFrame, FireAndForgetFlag, Frame, FrameDeserializer, FrameFlag, FrameType, KeepaliveFlag, KeepaliveFrame, LeaseFrame, MetadataPushFrame, PayloadFlag, PayloadFrame, RequestChannelFlag, RequestChannelFrame, RequestFireAndForgetFrame, RequestNFrame, RequestResponseFlag, RequestResponseFrame, RequestStreamFlag, RequestStreamFrame, ReservedFrame, ResumeFrame, ResumeOkFrame, SetupFlag, SetupFrame, WellKnownMimeType };
