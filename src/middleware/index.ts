import { SessionID, UserID, Utility as CoreUtility, AuthicalError, Device } from "@sellers-industry/authical-core";
import { SDK } from "../authical/controller";
import { AuthicalServerContructor } from "../authical/constructor";
import { Permission, Callback, SessionData } from "./model";
import { NextRequest, userAgent } from "next/server";


const ENABLE_SUCCESSFUL_LOGS = false;


export function GetDevice(req:NextRequest):Device {
    const { os, browser } = userAgent(req);
    let ip = "N/A";
    if (req.ip) {
        ip = req.ip;
    } else if (req.headers.get("x-real-ip")) {
        ip = req.headers.get("x-real-ip") as string;
    }
    return {
        ip: ip,
        os: os.name ? os.version ? `${os.name} ${os.version}` : os.name : "N/A",
        browser: browser.name ? browser.version ? `${browser.name} ${browser.version}` : browser.name : "N/A",
        location: (req.geo?.city && req.geo?.country) ? `${req.geo.city}, ${req.geo.country}` : undefined
    };
}


export async function Middleware(req:NextRequest, permission:Permission, callback:Callback):Promise<Response> {
    let controller  = await AuthicalServerContructor();
    try {
        let sessionInfo = [undefined, undefined] as SessionData;
        let adminOnly   = permission == Permission.USER_ADMIN;
        let noMachines  = permission == Permission.USER_ADMIN_NO_MACHINES || permission == Permission.USER_BASIC;
        if ([Permission.USER_BASIC, Permission.USER_ADMIN, Permission.USER_ADMIN_NO_MACHINES].includes(permission)) {
            sessionInfo = await Validate(req, controller, adminOnly, noMachines);
        } else {
            sessionInfo = await ValidateNone(req, controller);
        }
        let res = await callback(
            controller,
            sessionInfo[0] as UserID,
            sessionInfo[1] as SessionID
        );
        if (ENABLE_SUCCESSFUL_LOGS)
            controller.config.interface.log.log(req.url, `user: ${sessionInfo[0]}, session: ${sessionInfo[0]}`);
        return res ? Response.json(res) : new Response();
    } catch (error:any) {
        return handleErrorResponse(req.url, error, controller);
    }
}


async function Validate(req:NextRequest, sdk:SDK, adminOnly:boolean, noMachines:boolean):Promise<SessionData> {
    let bearer       = req.headers.get("Authorization");
    let authoization = CoreUtility.parseBearer(bearer);
    if (authoization[0] == "MACHINE") {
        if (!(await sdk.Admin?.Token?.verify(authoization[1], authoization[2])))
            throw new AuthicalError("Invalid Authication", 401, undefined, authoization[1]);
        if (noMachines)
            throw new AuthicalError("Lacking Permissions", 403, "No Machines are allowed to use this method");
        return [authoization[1], undefined];
    }
    if (authoization[0] == "USER") {
        if (!(await sdk.Session?.verify(authoization[1], authoization[2], authoization[3])))
            throw new AuthicalError("Invalid Authication", 401, undefined, authoization[1]);
        if (adminOnly && !(await isAdmin(authoization[1], sdk)))
            throw new AuthicalError("Lacking Permissions", 403, undefined, authoization[1]);
        return [authoization[1], authoization[2]];
    }
    return [undefined, undefined];
}


async function ValidateNone(req:NextRequest, sdk:SDK):Promise<SessionData> {
    try {
        return await Validate(req, sdk, false, false);
    } catch {
        return [undefined, undefined];
    }
}


export async function revolkSession(
    userID:UserID|undefined,
    sessionID:SessionID|undefined,
    sdk:SDK
) {
    if (!userID || !sessionID) return;
    try {
        await sdk.Session?.revolk(userID, sessionID);
    } catch {
        return;
    }
}


async function isAdmin(userID:UserID, sdk:SDK):Promise<boolean> {
    let profile = await sdk.config.database.profile.get(userID);
    if (!profile) return false;
    for (let email of profile.email.active) {
        if (sdk.settings?.admins.map(o => o.toLowerCase()).includes(email))
            return true;
        if (sdk.config.admins.map(o => o.toLowerCase()).includes(email))
            return true;
    }
    return false;
}


function handleErrorResponse(url:string, error:any, sdk:SDK):Response {
    sdk.config.interface.log.log(url, error.log + " - " + error.message);
    console.log(error);
    if (error.status) {
        return new Response(error.message, { status: error.status });
    } else {
        return new Response(error.message, { status: 500 });
    }
}

