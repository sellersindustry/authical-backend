import { SDK } from "@/src/authical/controller";
import { GetDevice, Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { SessionID, UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID, sessionID:SessionID) => {
        return await authical.Session?.get(userID, sessionID);
    });
}


export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID, sessionID:SessionID) => {
        await authical.Session?.refresh(userID, sessionID, GetDevice(req));
    });
}


export async function DELETE(req:NextRequest) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID, sessionID:SessionID) => {
        await authical.Session?.revolk(userID, sessionID);
    });
}

