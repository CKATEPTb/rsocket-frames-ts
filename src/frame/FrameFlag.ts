enum _FrameFlag {
    NONE = 0,
    IGNORE = 512, // Ignore frame if not understood.
    METADATA = 256 // Must be set if metadata is present in the frame.
}

export const FrameFlag = Object.assign({
    combine: (...flags: FrameFlag[]) => flags.reduce((prev, curr) => prev | curr, 0)
}, _FrameFlag);
export type FrameFlag = number | _FrameFlag;

enum _KeepaliveFlag {
    RESPOND = 128 // Respond with KEEPALIVE or not
}

export const KeepaliveFlag = Object.assign({}, _KeepaliveFlag, FrameFlag);
export type KeepaliveFlag = FrameFlag | _KeepaliveFlag;

enum _ExtensionFlag {
    EXT_1 = 128,
    EXT_2 = 64,
    EXT_3 = 32,
    EXT_4 = 16,
    EXT_5 = 8,
    EXT_6 = 4,
    EXT_7 = 2,
    EXT_8 = 1
}

export const ExtensionFlag = Object.assign({}, _ExtensionFlag, FrameFlag);
export type ExtensionFlag = FrameFlag | _ExtensionFlag;

enum _SetupFlag {
    RESUME = 128,
    LEASE = 64,
}

export const SetupFlag = Object.assign({}, _SetupFlag, FrameFlag);
export type SetupFlag = FrameFlag | _SetupFlag;

enum FollowsFlag {
    FOLLOWS = 128
}
export const FireAndForgetFlag = Object.assign({}, FollowsFlag, FrameFlag);
export type FireAndForgetFlag = FrameFlag | FollowsFlag;

export const RequestResponseFlag = FireAndForgetFlag;
export type RequestResponseFlag = FireAndForgetFlag

export const RequestStreamFlag = RequestResponseFlag;
export type RequestStreamFlag = RequestResponseFlag;

enum CompleteFlag {
    COMPLETE = 64
}

enum _PayloadFlag {
    NEXT = 32
}

export const RequestChannelFlag = Object.assign({}, FollowsFlag, CompleteFlag, FrameFlag);
export type RequestChannelFlag = FrameFlag | FollowsFlag | CompleteFlag;

export const PayloadFlag = Object.assign({}, _PayloadFlag, RequestChannelFlag);
export type PayloadFlag = _PayloadFlag | RequestChannelFlag;