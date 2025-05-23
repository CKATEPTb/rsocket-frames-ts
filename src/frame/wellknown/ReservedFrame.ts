import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {FrameFlag} from "@/frame";

export class ReservedFrame extends Frame {
    public constructor(streamId: number) {
        super(FrameType.RESERVED, streamId, FrameFlag.IGNORE)
        throw new Error("Reserved frame could not be created!")
    }

    public static from(header: Header, _: ByteReader): ReservedFrame {
        return new ReservedFrame(header.streamId)
    }

    protected write(_: ByteWriter) {
    }
}