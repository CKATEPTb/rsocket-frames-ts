import Header from "@/frame/context/Header";
import {Payload} from "@/frame/context/Payload";
import {FrameType} from "@/frame/FrameType";
import {FrameFlag} from "@/frame/FrameFlag";
import {FrameWriter} from "@/frame/FrameWriter";
import bebyte from "bebyte";
import {Metadata} from "@/frame/context/Metadata";

export abstract class Frame extends FrameWriter {
    protected readonly header: Header

    protected constructor(
        type: FrameType,
        streamId: number,
        flags: FrameFlag = FrameFlag.NONE,
        public readonly metadata?: Metadata<any>,
        public readonly payload?: Payload<any>
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
        const writer = bebyte.writer()
        this.header.write(writer)
        this.write(writer)
        this.metadata?.write?.(writer)
        this.payload?.write?.(writer)
        // TODO в каждой реализации может быть разный frame length limit, в java например это 65535, нужно проверить длину перед отправкой
        return writer.toUint8Array()
    }
}