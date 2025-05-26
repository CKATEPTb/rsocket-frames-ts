import {ByteReader, ByteWriter} from "bebyte";
import {decode, encode} from "@/utils";
import {AuthType} from "@/mimetype/message/security/AuthType";

export class BearerAuthType extends AuthType<string> {
    public read(reader: ByteReader): string {
        return decode(reader.readRemaining());
    }

    public write(writer: ByteWriter, data: string): void {
        writer.write(encode(data))
    }
}