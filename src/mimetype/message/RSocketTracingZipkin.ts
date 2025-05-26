import {Metadata, MimeType} from "@/mimetype/MimeType";
import {ByteReader} from "bebyte";

export class RSocketTracingZipkin extends MimeType {
    public toMetadata(payload: Uint8Array): Metadata {
        // TODO https://github.com/rsocket/rsocket/blob/master/Extensions/Tracing-Zipkin.md
        return super.toMetadata(payload);
    }

    public readMetadata(reader: ByteReader, hasPayload: boolean = true): Metadata {
        // TODO https://github.com/rsocket/rsocket/blob/master/Extensions/Tracing-Zipkin.md
        return super.readMetadata(reader, hasPayload);
    }
}
