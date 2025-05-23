import {Frame, FrameDeserializer, KeepaliveFrame} from "@/frame";
import {KeepaliveFlag} from "@/frame/FrameFlag";

function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(' ')
}

const arr = new KeepaliveFrame(KeepaliveFlag.RESPOND).toUint8Array()
console.log(toHexString(arr))

const frame = FrameDeserializer.deserialize(arr)
console.log(frame, (frame as KeepaliveFrame).isFlagSet(KeepaliveFlag.RESPOND), KeepaliveFlag.RESPOND)
