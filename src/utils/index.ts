/**
 * A `TextEncoder` instance used to convert strings to UTF-8 encoded `Uint8Array`.
 * Defaults to UTF-8 encoding.
 * @const
 */
const encoder = new TextEncoder()
/**
 * A `TextDecoder` instance used to convert UTF-8 encoded `Uint8Array` back to strings.
 * Defaults to UTF-8 decoding.
 * @const
 */
const decoder = new TextDecoder()

/**
 * Encodes a string into a UTF-8 `Uint8Array`.
 * If the value is `undefined`, the string `"undefined"` will be encoded.
 *
 * @param {string} [value] - The string to encode.
 * @returns {Uint8Array} The encoded byte array.
 */
export function encode(value?: string): Uint8Array {
    return encoder.encode(value)
}

/**
 * Decodes a UTF-8 `Uint8Array` back into a string.
 * If `value` is `undefined`, this will throw a `TypeError`.
 *
 * @param {Uint8Array} [value] - The byte array to decode.
 * @returns {string} The decoded string.
 */
export function decode(value?: Uint8Array): string {
    return decoder.decode(value)
}