import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID) => {
        return await authical.Session?.getAll(userID);
    });
}


export async function DELETE(req:NextRequest) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID) => {
        await authical.Session?.revolkAll(userID);
    });
}

