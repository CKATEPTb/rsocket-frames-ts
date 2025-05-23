import {MetadataPayload} from "@/frame/context/Metadata";

export class WellKnownMimeType {
    public constructor(
        public readonly mimeType: string,
        public readonly identifier?: number,
    ) {
    }

    public get isWellKnown() {
        return this.identifier != null
    }

    public static APPLICATION_AVRO = new WellKnownMimeType('application/avro', 0x00)
    public static APPLICATION_CBOR = new WellKnownMimeType('application/cbor', 0x01)
    public static APPLICATION_GRAPHQL = new WellKnownMimeType('application/graphql', 0x02)
    public static APPLICATION_GZIP = new WellKnownMimeType('application/gzip', 0x03)
    public static APPLICATION_JAVASCRIPT = new WellKnownMimeType('application/javascript', 0x04)
    public static APPLICATION_JSON = new WellKnownMimeType('application/json', 0x05)
    public static APPLICATION_OCTET_STREAM = new WellKnownMimeType('application/octet-stream', 0x06)
    public static APPLICATION_PDF = new WellKnownMimeType('application/pdf', 0x07)
    public static APPLICATION_THRIFT = new WellKnownMimeType('application/vnd.apache.thrift.binary', 0x08)
    public static APPLICATION_PROTOBUF = new WellKnownMimeType('application/vnd.google.protobuf', 0x09)
    public static APPLICATION_XML = new WellKnownMimeType('application/xml', 0x0A)
    public static APPLICATION_ZIP = new WellKnownMimeType('application/zip', 0x0B)
    public static AUDIO_AAC = new WellKnownMimeType('audio/aac', 0x0C)
    public static AUDIO_MP3 = new WellKnownMimeType('audio/mp3', 0x0D)
    public static AUDIO_MP4 = new WellKnownMimeType('audio/mp4', 0x0E)
    public static AUDIO_MPEG3 = new WellKnownMimeType('audio/mpeg3', 0x0F)
    public static AUDIO_MPEG = new WellKnownMimeType('audio/mpeg', 0x10)
    public static AUDIO_OGG = new WellKnownMimeType('audio/ogg', 0x11)
    public static AUDIO_OPUS = new WellKnownMimeType('audio/opus', 0x12)
    public static AUDIO_VORBIS = new WellKnownMimeType('audio/vorbis', 0x13)
    public static IMAGE_BMP = new WellKnownMimeType('image/bmp', 0x14)
    public static IMAGE_GIF = new WellKnownMimeType('image/gif', 0x15)
    public static IMAGE_HEIC_SEQUENCE = new WellKnownMimeType('image/heic-sequence', 0x16)
    public static IMAGE_HEIC = new WellKnownMimeType('image/heic', 0x17)
    public static IMAGE_HEIF_SEQUENCE = new WellKnownMimeType('image/heif-sequence', 0x18)
    public static IMAGE_HEIF = new WellKnownMimeType('image/heif', 0x19)
    public static IMAGE_JPEG = new WellKnownMimeType('image/jpeg', 0x1A)
    public static IMAGE_PNG = new WellKnownMimeType('image/png', 0x1B)
    public static IMAGE_TIFF = new WellKnownMimeType('image/tiff', 0x1C)
    public static MULTIPART_MIXED = new WellKnownMimeType('multipart/mixed', 0x1D)
    public static TEXT_CSS = new WellKnownMimeType('text/css', 0x1E)
    public static TEXT_CSV = new WellKnownMimeType('text/csv', 0x1F)
    public static TEXT_HTML = new WellKnownMimeType('text/html', 0x20)
    public static TEXT_PLAIN = new WellKnownMimeType('text/plain', 0x21)
    public static TEXT_XML = new WellKnownMimeType('text/xml', 0x22)
    public static VIDEO_H264 = new WellKnownMimeType('video/H264', 0x23)
    public static VIDEO_H265 = new WellKnownMimeType('video/H265', 0x24)
    public static VIDEO_VP8 = new WellKnownMimeType('video/VP8', 0x25)
    public static APPLICATION_HESSIAN = new WellKnownMimeType('application/x-hessian', 0x26)
    public static APPLICATION_JAVA_OBJECT = new WellKnownMimeType('application/x-java-object', 0x27)
    public static APPLICATION_CLOUDEVENTS_JSON = new WellKnownMimeType('application/cloudevents+json', 0x28)
    public static MESSAGE_RSOCKET_MIMETYPE = new WellKnownMimeType('message/x.rsocket.mime-type.v0', 0x7A)
    public static MESSAGE_RSOCKET_ACCEPT_MIMETYPES = new WellKnownMimeType('message/x.rsocket.accept-mime-types.v0', 0x7b)
    public static MESSAGE_RSOCKET_AUTHENTICATION = new WellKnownMimeType('message/x.rsocket.authentication.v0', 0x7C)
    public static MESSAGE_RSOCKET_TRACING_ZIPKIN = new WellKnownMimeType('message/x.rsocket.tracing-zipkin.v0', 0x7D)
    public static MESSAGE_RSOCKET_ROUTING = new WellKnownMimeType('message/x.rsocket.routing.v0', 0x7E)
    public static MESSAGE_RSOCKET_COMPOSITE_METADATA = new WellKnownMimeType('message/x.rsocket.composite-metadata.v0', 0x7F)

    public static valueOf(mimeType: string | number): WellKnownMimeType {
        return Object.values(WellKnownMimeType).filter(
                v => v instanceof WellKnownMimeType
            ).find(v => mimeType == (typeof mimeType == "string" ? v.mimeType : v.identifier)) ||
            new WellKnownMimeType(String(mimeType));
    }

    public asMetadataPayload(data: Uint8Array): MetadataPayload {
        // TODO реализовать отдельно для composite, router, zipkin в соответствии к спецификации.
        return new MetadataPayload(this, data)
    }
}