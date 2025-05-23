import {Frame} from "@/frame/Frame";
import {Buffer} from "bebyte";
import {FrameType} from "@/frame/enums/FrameType";
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
import Header from "@/frame/context/Header";

function deserialize(buffer: Uint8Array): Frame {
    const reader = Buffer.reader(buffer)
    const header = Header.from(reader)
    switch (header.frameType) {
        case FrameType.RESERVED:
            return ReservedFrame.from(header, reader)
        case FrameType.SETUP:
            return SetupFrame.from(header, reader)
        case FrameType.LEASE:
            return LeaseFrame.from(header, reader)
        case FrameType.KEEPALIVE:
            return KeepaliveFrame.from(header, reader)
        case FrameType.REQUEST_RESPONSE:
            return RequestResponseFrame.from(header, reader)
        case FrameType.REQUEST_FNF:
            return RequestFireAndForgetFrame.from(header, reader)
        case FrameType.REQUEST_STREAM:
            return RequestStreamFrame.from(header, reader)
        case FrameType.REQUEST_CHANNEL:
            return RequestChannelFrame.from(header, reader)
        case FrameType.REQUEST_N:
            return RequestNFrame.from(header, reader)
        case FrameType.CANCEL:
            return CancelFrame.from(header, reader)
        case FrameType.PAYLOAD:
            return PayloadFrame.from(header, reader)
        case FrameType.ERROR:
            return ErrorFrame.from(header, reader)
        case FrameType.METADATA_PUSH:
            return MetadataPushFrame.from(header, reader)
        case FrameType.RESUME:
            return ResumeFrame.from(header, reader)
        case FrameType.RESUME_OK:
            return ResumeOkFrame.from(header, reader)
        case FrameType.EXT:
            return ExtensionFrame.from(header, reader)
        default:
            throw new Error('Unknown frame type')
    }
}

export const FrameDeserializer = {
    deserialize: (buffer: Uint8Array): Frame => {
        return Object.assign(deserialize(buffer), {
            toUint8Array: () => buffer
        })
    }
}