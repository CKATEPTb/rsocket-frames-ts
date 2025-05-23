export enum ErrorCode {
    RESERVED_ZERO = 0x00000000,
    INVALID_SETUP = 0x00000001,
    UNSUPPORTED_SETUP = 0x00000002,
    REJECTED_SETUP = 0x00000003,
    REJECTED_RESUME = 0x00000004,
    CONNECTION_ERROR = 0x00000101,
    CONNECTION_CLOSE = 0x00000102,
    APPLICATION_ERROR = 0x00000201,
    REJECTED = 0x00000202,
    CANCELED = 0x00000203,
    INVALID = 0x00000204,
    RESERVED_ONE = 0xFFFFFFFF
}

export namespace ErrorCode {
    export function fromByte(byte: number): ErrorCode {
        return Array.from(Object.entries(ErrorCode))
            .filter(([key, _]) => Number.isNaN(Number(key)))
            .filter(([_, value]) => (byte & value as number) == value)
            .map(([_, value]) => value)
            .reverse()
            .shift() as ErrorCode
    }
}