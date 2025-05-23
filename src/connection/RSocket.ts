import {Flux, Mono} from "@ckateptb/reactive-core-js";

export default interface RSocket {
    fireAndForget<T>(payload: Mono<T>): Mono<void>

    requestResponse<T, R>(payload: Mono<T>): Mono<R>

    requestStream<T, R>(payload: Mono<T>): Flux<R>

    requestChannel<T, R>(payload: Flux<T>): Flux<R>

    metadataPush<T>(payload: Mono<T>): Mono<void>

    disconnect(): void
}