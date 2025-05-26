import {FireAndForgetFlag, FrameDeserializer, KeepaliveFrame, RequestFireAndForgetFrame} from "@/frame";
import {KeepaliveFlag} from "@/frame/FrameFlag";
import {decode, encode} from "@/utils";
import Payload from "@/frame/context/Payload";
import {Metadata, WellKnownMimeType} from "@/mimetype";

function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(' ')
}

const arr = new RequestFireAndForgetFrame(
    1,
    FireAndForgetFlag.NONE,
    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING.toMetadata(['fnf']),
    new Payload(encode(JSON.stringify({
        num: 1
    })))
).toUint8Array()
console.log(toHexString(arr))

const frame = FrameDeserializer.deserialize(arr, WellKnownMimeType.APPLICATION_JSON) as RequestFireAndForgetFrame
console.log(frame, decode(frame.metadata?.payload), decode(frame.payload?.data))
//          +-------------------------------------------------+
//          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
// +--------+-------------------------------------------------+----------------+
// |00000000| 66 6e 66                                        |fnf             |
// +--------+-------------------------------------------------+----------------+
// Data:
//          +-------------------------------------------------+
//          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
// +--------+-------------------------------------------------+----------------+
// |00000000| 7b 22 6e 75 6d 22 3a 31 7d                      |{"num":1}       |
// +--------+-------------------------------------------------+----------------+


//Frame => Stream ID: 1 Type: REQUEST_FNF Flags: 0b100000000 Length: 26
// Metadata:
//          +-------------------------------------------------+
//          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
// +--------+-------------------------------------------------+----------------+
// |00000000| fe 00 00 04 03 66 6e 66                         |.....fnf        |
// +--------+-------------------------------------------------+----------------+
// Data:
//          +-------------------------------------------------+
//          |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
// +--------+-------------------------------------------------+----------------+
// |00000000| 7b 22 6e 75 6d 22 3a 31 7d                      |{"num":1}       |
// +--------+-------------------------------------------------+----------------+