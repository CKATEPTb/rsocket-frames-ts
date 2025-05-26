import {MimeType} from "@/mimetype/MimeType";
import {ByteReader} from "bebyte";
import {Metadata} from "@/frame/context/Metadata";

// TODO https://github.com/rsocket/rsocket/blob/master/Extensions/Tracing-Zipkin.md
export class RSocketTracingZipkin extends MimeType {
    protected serializeMetadata(payload: Uint8Array): Metadata<Uint8Array> {
        return super.serializeMetadata(payload);
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<Uint8Array> {
        return super.deserializeMetadata(payload, hasPayload);
    }
}
