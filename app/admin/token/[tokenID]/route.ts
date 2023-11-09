import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest, { params }: { params: { tokenID: string } }) {
    return await Middleware(req, Permission.USER_ADMIN_NO_MACHINES, async (authical:SDK) => {
        return await authical.Admin?.Token.get(params.tokenID);
    });
}


export async function DELETE(req:NextRequest, { params }: { params: { tokenID: string } }) {
    return await Middleware(req, Permission.USER_ADMIN_NO_MACHINES, async (authical:SDK) => {
        return await authical.Admin?.Token.del(params.tokenID);
    });
}

