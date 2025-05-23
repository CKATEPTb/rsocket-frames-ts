import {FrameType} from "@/frame/enums/FrameType";
import {ByteReader, ByteWriter} from "bebyte";
import {FrameFlag} from "@/frame/FrameFlag";
import {FrameWriter} from "@/frame/FrameWriter";

//      0                   1                   2                   3
//      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |0|                         Stream ID                           |
//     +-----------+-+-+---------------+-------------------------------+
//     |Frame Type |I|M|     Flags     |     Depends on Frame Type    ...
//     +-------------------------------+
export default class Header extends FrameWriter {
    constructor(
        public readonly frameType: FrameType,  // (31 bits = max value 2^31-1 = 2,147,483,647) Unsigned 31-bit integer representing the stream Identifier for this frame or 0 to indicate the entire connection.
        public readonly streamId: number, // 6 bits = max value 63) Type of Frame.
        public readonly flags: FrameFlag // flags (10 bits) Any Flag bit not specifically indicated in the frame type should be set to 0 when sent and not interpreted on reception. Flags generally depend on Frame Type, but all frame types MUST provide space for the following flags
    ) {
        super()
    }

    public static from(reader: ByteReader): Header {
        const streamId = reader.i32()
        const frameTypeAndFlagsByte = reader.i16()
        const frameType = FrameType.fromByte(frameTypeAndFlagsByte >> 10)
        const flags = frameTypeAndFlagsByte & 0x03FF
        return new Header(frameType, streamId, flags)
    }

    public isFlagSet(flag: FrameFlag): boolean {
        return (this.flags & flag) == flag
    }

    public write(writer: ByteWriter): void {
        writer.i31(this.streamId) // streamId
        writer.i16(
            this.frameType << 10 |
            this.flags
        )
    }
}