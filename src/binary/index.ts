import bebyte, {type ByteReader, type ByteWriter} from "bebyte";

/**
 * Creates a zero-copy big-endian reader over an existing byte view.
 *
 * @param bytes Bytes to read.
 * @returns A complete `bebyte` reader, including every integer width.
 */
export function createReader(bytes: Uint8Array): ByteReader {
    return bebyte.reader(bytes);
}

/**
 * Creates a growable big-endian writer.
 *
 * @param initialCapacity Optional number of bytes to reserve.
 * @returns A complete `bebyte` writer.
 */
export function createWriter(initialCapacity = 0): ByteWriter {
    return bebyte.writer(initialCapacity);
}
