import {Metadata, MimeType} from "@/mimetype/MimeType";
import {RSocketMimeType, RSocketMimeTypes} from "@/mimetype/message/RSocketMimeType";
import {RSocketRouting} from "@/mimetype/message/RSocketRouting";
import {RSocketComposite} from "@/mimetype/message/RSocketComposite";
import {RSocketTracingZipkin} from "@/mimetype/message/RSocketTracingZipkin";
import {RSocketAuth} from "@/mimetype/message/security/RSocketAuth";
import {WellKnownAuthType} from "@/mimetype/message/security";

export {
    MimeType, Metadata, WellKnownAuthType
}

export namespace WellKnownMimeType {
    export const APPLICATION_AVRO = new MimeType('application/avro', 0x00)
    export const APPLICATION_CBOR = new MimeType('application/cbor', 0x01)
    export const APPLICATION_GRAPHQL = new MimeType('application/graphql', 0x02)
    export const APPLICATION_GZIP = new MimeType('application/gzip', 0x03)
    export const APPLICATION_JAVASCRIPT = new MimeType('application/javascript', 0x04)
    export const APPLICATION_JSON = new MimeType('application/json', 0x05)
    export const APPLICATION_OCTET_STREAM = new MimeType('application/octet-stream', 0x06)
    export const APPLICATION_PDF = new MimeType('application/pdf', 0x07)
    export const APPLICATION_THRIFT = new MimeType('application/vnd.apache.thrift.binary', 0x08)
    export const APPLICATION_PROTOBUF = new MimeType('application/vnd.google.protobuf', 0x09)
    export const APPLICATION_XML = new MimeType('application/xml', 0x0A)
    export const APPLICATION_ZIP = new MimeType('application/zip', 0x0B)
    export const AUDIO_AAC = new MimeType('audio/aac', 0x0C)
    export const AUDIO_MP3 = new MimeType('audio/mp3', 0x0D)
    export const AUDIO_MP4 = new MimeType('audio/mp4', 0x0E)
    export const AUDIO_MPEG3 = new MimeType('audio/mpeg3', 0x0F)
    export const AUDIO_MPEG = new MimeType('audio/mpeg', 0x10)
    export const AUDIO_OGG = new MimeType('audio/ogg', 0x11)
    export const AUDIO_OPUS = new MimeType('audio/opus', 0x12)
    export const AUDIO_VORBIS = new MimeType('audio/vorbis', 0x13)
    export const IMAGE_BMP = new MimeType('image/bmp', 0x14)
    export const IMAGE_GIF = new MimeType('image/gif', 0x15)
    export const IMAGE_HEIC_SEQUENCE = new MimeType('image/heic-sequence', 0x16)
    export const IMAGE_HEIC = new MimeType('image/heic', 0x17)
    export const IMAGE_HEIF_SEQUENCE = new MimeType('image/heif-sequence', 0x18)
    export const IMAGE_HEIF = new MimeType('image/heif', 0x19)
    export const IMAGE_JPEG = new MimeType('image/jpeg', 0x1A)
    export const IMAGE_PNG = new MimeType('image/png', 0x1B)
    export const IMAGE_TIFF = new MimeType('image/tiff', 0x1C)
    export const MULTIPART_MIXED = new MimeType('multipart/mixed', 0x1D)
    export const TEXT_CSS = new MimeType('text/css', 0x1E)
    export const TEXT_CSV = new MimeType('text/csv', 0x1F)
    export const TEXT_HTML = new MimeType('text/html', 0x20)
    export const TEXT_PLAIN = new MimeType('text/plain', 0x21)
    export const TEXT_XML = new MimeType('text/xml', 0x22)
    export const VIDEO_H264 = new MimeType('video/H264', 0x23)
    export const VIDEO_H265 = new MimeType('video/H265', 0x24)
    export const VIDEO_VP8 = new MimeType('video/VP8', 0x25)
    export const APPLICATION_HESSIAN = new MimeType('application/x-hessian', 0x26)
    export const APPLICATION_JAVA_OBJECT = new MimeType('application/x-java-object', 0x27)
    export const APPLICATION_CLOUDEVENTS_JSON = new MimeType('application/cloudevents+json', 0x28)
    export const MESSAGE_RSOCKET_MIMETYPE = new RSocketMimeType('message/x.rsocket.mime-type.v0', 0x7A)
    export const MESSAGE_RSOCKET_ACCEPT_MIMETYPES = new RSocketMimeTypes('message/x.rsocket.accept-mime-types.v0', 0x7b)
    export const MESSAGE_RSOCKET_AUTHENTICATION = new RSocketAuth('message/x.rsocket.authentication.v0', 0x7C)
    export const MESSAGE_RSOCKET_TRACING_ZIPKIN = new RSocketTracingZipkin('message/x.rsocket.tracing-zipkin.v0', 0x7D)
    export const MESSAGE_RSOCKET_ROUTING = new RSocketRouting('message/x.rsocket.routing.v0', 0x7E)
    export const MESSAGE_RSOCKET_COMPOSITE_METADATA = new RSocketComposite('message/x.rsocket.composite-metadata.v0', 0x7F)
    export const valueOf = MimeType.valueOf
}