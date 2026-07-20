// @ts-expect-error Binary primitives belong to bebyte and are not re-exported here.
import type {ByteReader as LeakedByteReader} from "@/index";
import * as api from "@/index";
import {Frame, FrameDeserializer} from "@/index";

/** Compile-time sentinel ensuring the expected-error import remains part of this file. */
type PublicApiMustNotExposeByteReader = LeakedByteReader;

describe("public package surface", () => {
    test("exposes one transport codec without TCP-specific alternatives", () => {
        expect(api).toHaveProperty("FrameCodec");
        expect(api).not.toHaveProperty("TcpFrameDecoder");
        expect(api).not.toHaveProperty("LengthPrefixedFrameDecoder");
        expect(Frame.prototype).not.toHaveProperty("toTcpUint8Array");
        expect(FrameDeserializer).not.toHaveProperty("deserializeTcp");
    });

    test("does not proxy bebyte runtime exports", () => {
        expect(api).not.toHaveProperty("ByteReader");
        expect(api).not.toHaveProperty("ByteWriter");
    });
});

void (0 as unknown as PublicApiMustNotExposeByteReader);
