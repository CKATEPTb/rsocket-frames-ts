A complete [**RSocket**](https://github.com/rsocket/rsocket) frame codec for browsers and Node.js, implemented
with [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) for
high-performance serialization and deserialization. Supports all core and extension frames, including MIME types,
routing, tracing (Zipkin), and authentication metadata. Ideal for building custom RSocket clients, servers, or
intermediaries.

## 🚀 Features

- ✔️ Complete RSocket frame specification: Setup, Request, Response, Error, Cancel, Lease, Resume, Payload, etc.
- ✔️ Fully binary-safe serialization/deserialization via bebyte
- ✔️ Support for metadata and data MIME types
- ✔️ Support for Composite Metadata Extension
- ✔️ Includes RSocket routing, tracing (Zipkin), authentication (Simple/Bearer) extensions
- ✔️ Factory pattern for dynamic MIME type and auth type resolution
- ✔️ Works seamlessly in browsers, Node.js, and edge environments

## 📦 Installation

To install the package using **npm**:

```bash
npm install rsocket-frames-ts bebyte
```

To install the package using **pnpm**:

```bash
pnpm install rsocket-frames-ts bebyte
```

To install the package using **yarn**:

```bash
yarn install rsocket-frames-ts bebyte
```

## ✅ Recommended Use Cases

- Browser-based RSocket client implementations
- Custom RSocket proxies and middlewares
- Testing tools, fuzzers, and protocol introspection
- Server-side gateways / bridge adapters

## 🧰 Usage

### Describe your own serializer/deserializer for MimeType

```typescript
import {MimeType, Metadata, Payload, ByteReader} from "rsocket-frames-ts";

export class ApplicationJson<T = any> extends MimeType<T> {
    private readonly encode = new TextEncoder().encode
    private readonly decode = new TextDecoder().decode

    protected serializePayload(payload: T): Payload<T> {
        return super.serializePayload(this.encode(JSON.stringify(payload)) as T)
    }

    protected deserializePayload(payload: ByteReader): Payload<T> {
        return JSON.parse(this.decode(payload.readRemaining()))
    }


    protected serializeMetadata(payload: T): Metadata<T> {
        // ... write your metadata serializer here
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload: boolean = true): Metadata<T> {
        // ... write your metadata deserializer here
    }
}

export namespace SerializableMimeType {
    export const APPLICATION_JSON = new ApplicationJson('application/json', 0x05)
}
```

### Create and serialize a frame

```typescript
const frame = new RequestFireAndForgetFrame(
    1, // streamId
    FireAndForgetFlag.combine(FireAndForgetFlag.METADATA, FireAndForgetFlag.FOLLOWS), // Flags
    WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.toMetadata([ // Metadata
        WellKnownMimeType.MESSAGE_RSOCKET_ROUTING.toMetadata(["fnf"]),
        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION.toMetadata(
            WellKnownAuthType.SIMPLE.auth({username: "user", password: "pass"})
        )
    ]),
    SerializableMimeType.APPLICATION_JSON.toPayload({ // Payload
        count: 2
    })
)

const serialized = frame.toUint8Array();
```

### Deserialize incoming frame

```typescript
const deserializedFrame = FrameDeserializer.deserialize(
    serialized, // serialized frame (Uint8Array)
    WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA, // Metadata MimeType
    SerializableMimeType.APPLICATION_JSON // Payload MimeType
)
```

## Contributing

### 1. Clone the repository:

```bash
git clone https://github.com/CKATEPTb/rsocket-frames-ts.git
```

### 2. Install dependencies::

```bash
pnpm install
```

### 3. Run the build::

```bash
pnpm run build
```

## License

### This project is licensed under the LGPL-3.0-only License.

See the [LICENSE.md](LICENSE.md) file for details.

## Author

### [CKATEPTb](https://github.com/CKATEPTb), [fakeivchenko](https://github.com/fakeivchenko)

Feel free to open issues and submit pull requests to improve the library!
