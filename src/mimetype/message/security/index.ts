import {AuthType} from "@/mimetype/message/security/AuthType";
import {SimpleAuthType} from "@/mimetype/message/security/SimpleAuthType";
import {BearerAuthType} from "@/mimetype/message/security/BearerAuthType";

export {
    AuthType
}

export namespace WellKnownAuthType {
    export const SIMPLE = new SimpleAuthType("simple", 0)
    export const BEARER = new BearerAuthType("bearer", 1)
    export const valueOf = AuthType.valueOf
}