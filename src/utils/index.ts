const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function encode(value?: string): Uint8Array {
    return encoder.encode(value)
}

export function decode(value?: Uint8Array): string {
    return decoder.decode(value)
}