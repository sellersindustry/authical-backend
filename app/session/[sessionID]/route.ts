import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest, { params }: { params: { sessionID: string } }) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID) => {
        return await authical.Session?.get(userID, params.sessionID);
    });
}


export async function DELETE(req:NextRequest, { params }: { params: { sessionID: string } }) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID) => {
        await authical.Session?.revolk(userID, params.sessionID);
    });
}

