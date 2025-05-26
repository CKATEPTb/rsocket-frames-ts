import {Frame} from "@/frame/Frame";
import {FrameType} from "@/frame/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import Header from "@/frame/context/Header";
import {FrameFlag} from "@/frame";
import {MimeType} from "@/mimetype";

/**
 *
 * [__Frame Type__: (6 bits) 0x00]{@link FrameType#RESERVED}
 * @description Reserved
 */
export class ReservedFrame extends Frame {
    public constructor(streamId: number) {
        super(FrameType.RESERVED, streamId, FrameFlag.IGNORE)
        throw new Error("Reserved frame could not be created!")
    }

    public static from(header: Header, _: ByteReader, __: MimeType, ___: MimeType): ReservedFrame {
        return new ReservedFrame(header.streamId)
    }

    protected write(_: ByteWriter) {
    }
}