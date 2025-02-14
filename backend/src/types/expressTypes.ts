import { UserPayload } from "./reqTypes.js"

declare module 'express'{
    export interface Request{
        user?: UserPayload
    }
}
