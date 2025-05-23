// TODO сделать нормальный factory, поддерживающий кастомные mimetype

export enum WellKnownMimeType {
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

export namespace WellKnownMimeType {
    export function valueOf(mimeType: string): WellKnownMimeType {
        return Array.from(Object.entries(WellKnownMimeType))
            .filter(([_, value]) => mimeType == value)
            .map(([_, value]) => value)
            .shift() as WellKnownMimeType
    }
}