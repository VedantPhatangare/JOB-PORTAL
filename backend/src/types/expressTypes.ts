import { UserPayload } from "./userPayload.js";

declare module 'express'{
    export interface Request{
        user?: UserPayload
    }
}