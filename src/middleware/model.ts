import { SessionID, TokenID, UserID } from "@sellers-industry/authical-core";
import { SDK } from "../authical/controller";

export type SessionData = [TokenID, undefined]|[UserID, SessionID]|[undefined, undefined];

export type Callback = (
    authical:SDK,
    userID:UserID|TokenID,
    sessionID:SessionID
) => Promise<any>|any;

export enum Permission {
    NONE,
    USER_BASIC,
    USER_ADMIN,
    USER_ADMIN_NO_MACHINES
}

