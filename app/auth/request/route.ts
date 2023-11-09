import { SDK } from "@/src/authical/controller";
import { Middleware, revolkSession } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { SessionID, UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.NONE, async (authical:SDK, userID:UserID, sessionID:SessionID) => {
        await revolkSession(userID, sessionID, authical);
        let body  = await req.json();
        let otpID = await authical.Authenication?.request(body.email);
        return { "otpID": otpID };
    });
}
