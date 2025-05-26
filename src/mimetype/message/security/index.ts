import {AuthType, BearerAuthType, SimpleAuthType} from "@/mimetype/message/security/AuthType";

export {
    AuthType
}

export namespace WellKnownAuthType {
    export const SIMPLE = new SimpleAuthType("simple", 0)
    export const BEARER = new BearerAuthType("bearer", 1)
    export const valueOf = AuthType.valueOf
}