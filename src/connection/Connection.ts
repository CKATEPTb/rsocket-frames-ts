import RSocket from "@/connection/RSocket";
import {
    FireAndForgetFlag,
    Frame,
    FrameDeserializer,
    FrameType,
    KeepaliveFlag,
    KeepaliveFrame,
    RequestFireAndForgetFrame,
    SetupFrame
} from "@/frame";
import {Flux, ManySink, Mono, Sinks} from "@ckateptb/reactive-core-js";
import {encode} from "@/utils";
import Payload from "@/frame/context/Payload";
import {Metadata, MimeType, WellKnownAuthType, WellKnownMimeType} from "@/mimetype";

class StreamIdSupplier {
    public constructor(private init: number) {
    }

    public next(): number {
        return this.init += 2
    }
}

export class Connection implements RSocket {
    private readonly websocket: WebSocket
    private readonly requests: ManySink<Frame> = Sinks.many().multicast();
    private readonly callbacks: ManySink<Frame> = Sinks.many().multicast();
    private readonly streamIds: StreamIdSupplier = new StreamIdSupplier(-1);

    public constructor(private readonly url: string) {
        const backpressure = Flux.from(this.requests)
            .subscribe({
                onNext: frame => {
                    try {
                        this.sendFrame(frame)
                    } catch (e) {
                        console.error(e)
                    }
                },
                onError: err => {
                    console.error(err)
                },
                onComplete: () => {
                    console.error('Why complete?')
                }
            })
        this.websocket = new WebSocket(url)
        this.websocket.binaryType = 'arraybuffer'
        this.websocket.onopen = () => {
            console.log("Connection opened")
            const subscription = Flux.from(this.callbacks)
                .filter(frame => frame.type == FrameType.KEEPALIVE)
                .cast<KeepaliveFrame>()
                .filter(frame => frame.isRequireRespond())
                .doOnSubscribe(({request}) => request(Number.MAX_SAFE_INTEGER))
                .subscribe({
                    onNext: (_) => {
                        this.sendFrame(new KeepaliveFrame())
                    }
                })
            backpressure.request(Number.MAX_SAFE_INTEGER)

            this.sendFrame(new SetupFrame(15000, 15000, WellKnownMimeType.MESSAGE_RSOCKET_ROUTING, WellKnownMimeType.APPLICATION_JSON))
            setInterval(() => {
                this.sendFrame(new KeepaliveFrame(KeepaliveFlag.RESPOND))
            }, 7500)
        }
        this.websocket.onerror = ev => {
            console.error(ev)
        }
        this.websocket.onclose = ev => {
            console.error('close', ev)
        }
        this.websocket.onmessage = msg => {
            this.callbacks.next(FrameDeserializer.deserialize(new Uint8Array(msg.data), WellKnownMimeType.APPLICATION_JSON))
        }
    }

    protected sendFrame(frame: Frame) {
        this.websocket.send(frame.toUint8Array().buffer)
    }

    public fireAndForget<T>(payload: Mono<T>): Mono<void> {
        const sink = Sinks.one()
        const streamId = this.streamIds.next()
        payload.subscribe({
            onNext: value => {
                this.requests.next(new RequestFireAndForgetFrame(
                    streamId,
                    FireAndForgetFlag.NONE,
                    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING.toMetadata(['fnf']),
                    new Payload(encode(JSON.stringify(value)))
                ))
                sink.complete()
            }
        }).request(1)
        return Mono.from<void>(sink)
    }

    public requestResponse<T, R>(payload: Mono<T>): Mono<R> {
        // const sink = Sinks.one<R>()
        // const streamId = this.streamIds.next()
        // const subscription = Flux.from(this.callbacks)
        //     .filter(value => value.streamId === streamId)
        //     .doOnSubscribe(({request}) => request(Number.MAX_SAFE_INTEGER))
        //     .subscribe({
        //         onNext: ({data}) => {
        //             subscription.unsubscribe()
        //             if (data != null) sink.next(data)
        //             else sink.complete()
        //         }
        //     })
        // payload.subscribe({ // todo on error and on complete, проверить unsubscribe когда complete
        //     onNext: value => {
        //         this.requests.next({
        //             streamId: streamId,
        //             payload: value as unknown as Payload, // TODO
        //             completed: true
        //         })
        //     }
        // }).request(1)
        // return Mono.from<R>(sink)
        return undefined as unknown as Mono<R> // todo

    }

    public requestStream<T, R>(payload: Mono<T>): Flux<R> {
        return undefined as unknown as Flux<R> // todo
    }

    public requestChannel<T, R>(payload: Flux<T>): Flux<R> {
        return undefined as unknown as Flux<R> // todo
    }

    public metadataPush<T>(payload: Mono<T>): Mono<void> {
        return undefined as unknown as Mono<void> // todo
    }

    public disconnect(): void {

    }
}