import {ByteWriter} from "bebyte";

export abstract class FrameWriter {
    protected abstract write(writer: ByteWriter): void;
}