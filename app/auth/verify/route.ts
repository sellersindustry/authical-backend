import { SDK } from "@/src/authical/controller";
import { GetDevice, Middleware, revolkSession } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { SessionID, UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.NONE, async (authical:SDK, userID:UserID, sessionID:SessionID) => {
        await revolkSession(userID, sessionID, authical);
        let body   = await req.json();
        let bearer = await authical.Authenication?.verify(
            body.email,
            body.otpID,
            body.secret,
            GetDevice(req)
        );
        return { "bearer": bearer };
    });
}
