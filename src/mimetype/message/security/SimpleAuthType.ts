import {ByteReader, ByteWriter} from "bebyte";
import {decode, encode} from "@/utils";
import {AuthType} from "@/mimetype/message/security/AuthType";

export class SimpleAuthType extends AuthType<{
    username: string,
    password: string
}> {
    public read(reader: ByteReader): { username: string; password: string } {
        return {
            username: decode(reader.read(reader.i16())),
            password: decode(reader.readRemaining())
        }
    }

    public write(writer: ByteWriter, data: { username: string; password: string }): void {
        const username = encode(data.username)
        writer.i16(username.length)
        writer.write(username)
        writer.write(encode(data.password))
    }
}