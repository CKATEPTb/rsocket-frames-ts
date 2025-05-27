import bebyte from "bebyte";
import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ReservedFrame} from "@/frame/wellknown/ReservedFrame";
import {SetupFrame} from "@/frame/wellknown/SetupFrame";
import {LeaseFrame} from "@/frame/wellknown/LeaseFrame";
import {KeepaliveFrame} from "@/frame/wellknown/KeepaliveFrame";
import {RequestResponseFrame} from "@/frame/wellknown/RequestResponseFrame";
import {RequestFireAndForgetFrame} from "@/frame/wellknown/RequestFireAndForgetFrame";
import {RequestStreamFrame} from "@/frame/wellknown/RequestStreamFrame";
import {RequestChannelFrame} from "@/frame/wellknown/RequestChannelFrame";
import {RequestNFrame} from "@/frame/wellknown/RequestNFrame";
import {CancelFrame} from "@/frame/wellknown/CancelFrame";
import {PayloadFrame} from "@/frame/wellknown/PayloadFrame";
import {ErrorFrame} from "@/frame/wellknown/ErrorFrame";
import {MetadataPushFrame} from "@/frame/wellknown/MetadataPushFrame";
import {ResumeFrame} from "@/frame/wellknown/ResumeFrame";
import {ResumeOkFrame} from "@/frame/wellknown/ResumeOkFrame";
import {ExtensionFrame} from "@/frame/wellknown/ExtensionFrame";
import {Header} from "@/frame/context/Header";
import {MimeType} from "@/mimetype/MimeType";

/**
 * Deserializes a raw RSocket frame buffer into a strongly typed `Frame` object.
 *
 * This function reads the header to determine the `FrameType`, then delegates
 * to the appropriate frame-specific parser.
 *
 * @param {Uint8Array} buffer - The raw frame buffer to deserialize.
 * @param {MimeType<any>} metadataType - The metadata MIME type to use during decoding.
 * @param {MimeType<any>} payloadType - The payload MIME type to use during decoding.
 * @returns {Frame} A fully deserialized RSocket frame.
 * @throws {Error} If the frame type is unknown or unsupported.
 */
function deserialize(buffer: Uint8Array, metadataType: MimeType<any>, payloadType: MimeType<any>): Frame {
    const reader = bebyte.reader(buffer)
    const header = Header.from(reader)
    switch (header.frameType) {
        case FrameType.RESERVED:
            return ReservedFrame.from(header, reader, metadataType, payloadType)
        case FrameType.SETUP:
            return SetupFrame.from(header, reader, metadataType, payloadType)
        case FrameType.LEASE:
            return LeaseFrame.from(header, reader, metadataType, payloadType)
        case FrameType.KEEPALIVE:
            return KeepaliveFrame.from(header, reader, metadataType, payloadType)
        case FrameType.REQUEST_RESPONSE:
            return RequestResponseFrame.from(header, reader, metadataType, payloadType)
        case FrameType.REQUEST_FNF:
            return RequestFireAndForgetFrame.from(header, reader, metadataType, payloadType)
        case FrameType.REQUEST_STREAM:
            return RequestStreamFrame.from(header, reader, metadataType, payloadType)
        case FrameType.REQUEST_CHANNEL:
            return RequestChannelFrame.from(header, reader, metadataType, payloadType)
        case FrameType.REQUEST_N:
            return RequestNFrame.from(header, reader, metadataType, payloadType)
        case FrameType.CANCEL:
            return CancelFrame.from(header, reader, metadataType, payloadType)
        case FrameType.PAYLOAD:
            return PayloadFrame.from(header, reader, metadataType, payloadType)
        case FrameType.ERROR:
            return ErrorFrame.from(header, reader, metadataType, payloadType)
        case FrameType.METADATA_PUSH:
            return MetadataPushFrame.from(header, reader, metadataType, payloadType)
        case FrameType.RESUME:
            return ResumeFrame.from(header, reader, metadataType, payloadType)
        case FrameType.RESUME_OK:
            return ResumeOkFrame.from(header, reader, metadataType, payloadType)
        case FrameType.EXT:
            return ExtensionFrame.from(header, reader, metadataType, payloadType)
        default:
            throw new Error('Unknown frame type')
    }
}

/**
 * A utility for deserializing raw RSocket frames from binary format.
 *
 * Adds a `toUint8Array()` method to the result for potential re-serialization
 * or caching of original bytes.
 */
export const FrameDeserializer = {
    /**
     * Deserializes the given buffer into a `Frame` and attaches `toUint8Array()`
     * that returns the original input buffer.
     *
     * @param {Uint8Array} buffer - The raw frame bytes to deserialize.
     * @param {MimeType<any>} metadataType - MIME type for metadata decoding.
     * @param {MimeType<any>} payloadType - MIME type for payload decoding.
     * @returns {Frame} Deserialized frame with `toUint8Array()` method.
     */
    deserialize: (buffer: Uint8Array, metadataType: MimeType<any>, payloadType: MimeType<any>): Frame => {
        return Object.assign(deserialize(buffer, metadataType, payloadType), {
            toUint8Array: () => buffer
        })
    }
}