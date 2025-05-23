import Header from "@/frame/context/Header";
import Metadata from "@/frame/context/Metadata";
import Payload from "@/frame/context/Payload";
import {FrameType} from "@/frame/enums/FrameType";
import {FrameFlag} from "@/frame/FrameFlag";
import {FrameWriter} from "@/frame/FrameWriter";
import {Buffer} from "bebyte";

export abstract class Frame extends FrameWriter {
    protected readonly header: Header

    protected constructor(
        type: FrameType,
        streamId: number,
        flags: FrameFlag = FrameFlag.NONE,
        protected readonly metadata?: Metadata,
        protected readonly payload?: Payload
    ) {
        super()
        this.header = new Header(
            type,
            streamId,
            FrameFlag.combine(flags, this.metadata != null ? FrameFlag.METADATA : FrameFlag.NONE)
        )
    }

    public get type() {
        return this.header.frameType
    }

    public isFlagSet(flag: FrameFlag): boolean {
        return this.header.isFlagSet(flag)
    }

    public canBeIgnored(): boolean {
        return this.isFlagSet(FrameFlag.IGNORE)
    }

    public hasMetadata(): boolean {
        return this.isFlagSet(FrameFlag.METADATA)
    }

    public toUint8Array(): Uint8Array {
        const writer = Buffer.writer()
        this.header.write(writer)
        this.write(writer)
        this.metadata?.write?.(writer, this.payload != null)
        this.payload?.write?.(writer)
        // TODO в каждой реализации может быть разный frame length limit, в java например это 65535, нужно проверить длину перед отправкой
        return writer.toUint8Array()
    }
}