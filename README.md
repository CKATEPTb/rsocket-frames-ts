# rsocket-frames-ts

ESM-only TypeScript codecs for RSocket 1.0 frames and metadata. The package
supports raw frames for WebSocket and length-prefixed frames for TCP.

## Install

```bash
npm install rsocket-frames-ts
```

`bebyte` is installed automatically. A separate installation is not required.

## Create and decode a frame

```ts
import {
  FrameCodec,
  FrameFlag,
  RequestResponseFrame,
  WellKnownMimeType
} from "rsocket-frames-ts";

const metadataMime = WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA;
const dataMime = WellKnownMimeType.APPLICATION_JSON;
const codec = new FrameCodec({
  transport: "websocket",
  mimetype: {
    metadata: metadataMime,
    data: dataMime
  }
});

const route = WellKnownMimeType.MESSAGE_RSOCKET_ROUTING.toMetadata([
  "account.find"
]);
const metadata = metadataMime.toMetadata([route]);
const data = dataMime.toPayload({accountId: 42});

const outgoing = new RequestResponseFrame(
  1,
  FrameFlag.NONE,
  metadata,
  data
);

webSocket.send(codec.serialize(outgoing));

const [incoming] = codec.deserialize(bytesFromWebSocket);

if (incoming !== undefined) console.log(incoming.payload);
```

Use an odd stream ID for a client request and an even stream ID for a server
request. The package validates wire field widths, frame sizes and truncated
input. Interaction-level handling remains the caller's responsibility.

## TCP

Select `tcp` on the same codec. It adds the required three-byte frame length
and handles split or coalesced socket reads internally.

```ts
import {
  FrameCodec,
  WellKnownMimeType
} from "rsocket-frames-ts";

const codec = new FrameCodec({
  transport: "tcp",
  mimetype: {
    metadata: WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA,
    data: WellKnownMimeType.APPLICATION_JSON
  }
});

socket.write(codec.serialize(outgoing));

socket.on("data", chunk => {
  for (const frame of codec.deserialize(chunk)) {
    handleFrame(frame);
  }
});

socket.on("end", () => codec.finish());
socket.on("error", () => codec.reset());
```

## MIME types

Every built-in codec is available through `WellKnownMimeType`.

| Value type | Constants |
| --- | --- |
| JSON values | `APPLICATION_JSON`, `APPLICATION_CLOUDEVENTS_JSON` |
| Strings | `APPLICATION_GRAPHQL`, `APPLICATION_JAVASCRIPT`, `APPLICATION_XML`, `TEXT_CSS`, `TEXT_CSV`, `TEXT_HTML`, `TEXT_PLAIN`, `TEXT_XML` |
| Binary `Uint8Array` | `APPLICATION_AVRO`, `APPLICATION_CBOR`, `APPLICATION_GZIP`, `APPLICATION_OCTET_STREAM`, `APPLICATION_PDF`, `APPLICATION_THRIFT`, `APPLICATION_PROTOBUF`, `APPLICATION_ZIP`, `MULTIPART_MIXED`, all `AUDIO_*`, `IMAGE_*`, `VIDEO_*`, `APPLICATION_HESSIAN`, `APPLICATION_JAVA_OBJECT`, `APPLICATION_X_CAPNP`, `APPLICATION_X_FLATBUFFERS` |
| RSocket metadata | `MESSAGE_RSOCKET_MIMETYPE`, `MESSAGE_RSOCKET_ACCEPT_MIMETYPES`, `MESSAGE_RSOCKET_AUTHENTICATION`, `MESSAGE_RSOCKET_TRACING_ZIPKIN`, `MESSAGE_RSOCKET_ROUTING`, `MESSAGE_RSOCKET_COMPOSITE_METADATA` |

`toPayload(value)` creates frame data and `toPayload(bytes)` decodes data.
`toMetadata(value)` creates metadata. To decode standalone metadata bytes, use
`toMetadata(bytes, false)`; `true` means the bytes start with an `i24` length.

```ts
const encoded = WellKnownMimeType.APPLICATION_JSON.toPayload({id: 1});
const bytes = encoded.toUint8Array();

const decoded = WellKnownMimeType.APPLICATION_JSON.toPayload(bytes);
console.log(decoded.id);
```

For an already encoded custom binary format, the generic codec is sufficient:

```ts
import {MimeType} from "rsocket-frames-ts";

const msgpack = new MimeType<Uint8Array>("application/msgpack");
const payload = msgpack.toPayload(encodedMsgpack);
const metadata = msgpack.toMetadata(encodedMsgpack, false);
```

Custom names are encoded as ASCII MIME strings. Numeric identifiers are only
for values assigned by the RSocket well-known MIME registry.

## Routing and authentication

Routing and authentication are separate entries inside composite metadata.

```ts
import {
  WellKnownAuthType,
  WellKnownMimeType
} from "rsocket-frames-ts";

const route = WellKnownMimeType.MESSAGE_RSOCKET_ROUTING.toMetadata([
  "account.sign-in"
]);

const auth = WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION.toMetadata(
  WellKnownAuthType.BEARER.auth("access-token")
);

const metadata =
  WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.toMetadata([
    route,
    auth
  ]);
```

Simple authentication is also available:

```ts
const auth = WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION.toMetadata(
  WellKnownAuthType.SIMPLE.auth({
    username: "user@example.com",
    password: "secret"
  })
);
```

Simple credentials are cleartext inside the frame. Use `wss` or TLS-wrapped
TCP.

## Implement a MIME codec

Extend `MimeType<T>`. Serialization returns a `Payload<T>` or `Metadata<T>`;
deserialization returns the application value. Creating the codec registers
its name so composite metadata can resolve it while decoding.

```ts
import {Metadata, MimeType, Payload} from "rsocket-frames-ts";
import type {ByteReader} from "bebyte";

class UInt32MimeType extends MimeType<number> {
  constructor() {
    super("application/x.uint32");
  }

  protected override serializePayload(value: number): Payload<number> {
    const bytes = this.encode(value);
    return new Payload(this, value, bytes);
  }

  protected override deserializePayload(reader: ByteReader): Payload<number> {
    const bytes = reader.viewRemaining();
    return this.decode(bytes) as unknown as Payload<number>;
  }

  protected override serializeMetadata(value: number): Metadata<number> {
    const bytes = this.encode(value);
    return new Metadata(this, value, bytes);
  }

  protected override deserializeMetadata(
    reader: ByteReader,
    hasPayload = true
  ): Metadata<number> {
    const bytes = hasPayload
      ? reader.viewBytes(reader.i24())
      : reader.viewRemaining();
    return this.decode(bytes) as unknown as Metadata<number>;
  }

  private encode(value: number): Uint8Array {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value, false);
    return bytes;
  }

  private decode(bytes: Uint8Array): number {
    if (bytes.byteLength !== 4) {
      throw new RangeError("UInt32 payload must contain exactly four bytes");
    }
    return new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength
    ).getUint32(0, false);
  }
}

export const UINT32 = new UInt32MimeType();
```

## Scope and specification

This package encodes and decodes frames. It does not open sockets, allocate
stream IDs, apply backpressure or fragment application payloads.

- [RSocket 1.0 protocol specification](https://github.com/rsocket/rsocket/blob/master/Protocol.md)
- [RSocket metadata extension specifications](https://github.com/rsocket/rsocket/tree/master/Extensions)
- [Well-known MIME type registry](https://github.com/rsocket/rsocket/blob/master/Extensions/WellKnownMimeTypes.md)

License: [MIT](LICENSE.md).
