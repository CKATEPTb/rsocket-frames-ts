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

You can define a custom MIME type by extending the abstract `MimeType<T>` class and implementing four methods:
`serializePayload`, `deserializePayload`, `serializeMetadata`, `deserializeMetadata`.

The numeric identifier (second constructor argument) is **optional** and is only required for
[Well-Known MIME Types](https://github.com/rsocket/rsocket/blob/master/Extensions/WellKnownMimeTypes.md)
— a compact registry defined by the RSocket spec that allows encoding a MIME type as a single byte instead of
a full string, reducing frame overhead. If omitted, the type is identified solely by its string name.

Once instantiated, the type is **automatically registered** in the global `MimeType` registry and can be
looked up later via `MimeType.valueOf<T>(mimeType)`.

```typescript
import { MimeType, Metadata, Payload, ByteReader } from "rsocket-frames-ts";

// Instantiate with `new (class extends MimeType<T> { ... })(mimeTypeName, optionalWellKnownId)`
const APPLICATION_JSON = new (class extends MimeType<any> {

    protected serializePayload(payload: any): Payload<any> {
        return super.serializePayload(
            new TextEncoder().encode(JSON.stringify(payload)) as unknown as any
        );
    }

    protected deserializePayload(payload: ByteReader): Payload<any> {
        const raw = payload.readRemaining();
        if (raw.length === 0) return undefined as unknown as Payload<any>;
        const str = new TextDecoder().decode(raw);
        try {
            return JSON.parse(str);
        } catch {
            return str as unknown as Payload<any>;
        }
    }

    protected serializeMetadata(payload: any): Metadata<any> {
        return super.serializeMetadata(
            new TextEncoder().encode(JSON.stringify(payload)) as unknown as any
        );
    }

    protected deserializeMetadata(payload: ByteReader, hasPayload = true): Metadata<any> {
        // When `hasPayload` is true, metadata is length-prefixed with a 24-bit (3-byte)
        // integer that indicates how many bytes belong to the metadata field.
        // This is required by the RSocket Composite Metadata framing: each metadata entry
        // is encoded as [mimeType][length:24bit][metadataBytes][...dataBytes].
        // When `hasPayload` is false (e.g. MetadataPush frame), the frame carries
        // only metadata with no data section — so we read until the end of the buffer.
        const raw = hasPayload ? payload.read(payload.i24()) : payload.readRemaining();
        if (raw.length === 0) return undefined as unknown as Metadata<any>;
        const str = new TextDecoder().decode(raw);
        try {
            return JSON.parse(str);
        } catch {
            return str as unknown as Metadata<any>;
        }
    }
})("application/json" /*, 0x05 — omit unless registering as a Well-Known MIME Type */);

// Later in your codebase — no need to import the instance directly:
const jsonMime = MimeType.valueOf<any>("application/json");
```
> **Note on metadata framing:** The `hasPayload` flag controls how the metadata length is
> determined. When a frame carries **both metadata and data** (e.g. `REQUEST_RESPONSE`,
> `PAYLOAD`), the metadata region is prefixed with a **24-bit unsigned integer** (3 bytes)
> that encodes its length — allowing the parser to split metadata from the following data.
> When a frame carries **only metadata** (e.g. `METADATA_PUSH`), no length prefix is
> written and the metadata extends to the end of the frame buffer, so `readRemaining()` is
> used instead. Always match your read strategy to the frame type to avoid reading corrupt
> or shifted bytes.

> **Note:** The numeric ID `0x05` corresponds to `application/json` in the
> [RSocket Well-Known MIME Types table](https://github.com/rsocket/rsocket/blob/master/Extensions/WellKnownMimeTypes.md).
> Include it only if you need compact single-byte encoding in frames
> (e.g. in the SETUP frame's metadata/data MIME type fields). For custom or
> application-specific types, omit it and use the string name only.

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
