import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest, { params }: { params: { userID: string } }) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        return await authical.Admin?.User?.get(params.userID);
    });
}


export async function POST(req:NextRequest, { params }: { params: { userID: string } }) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        return await authical.Admin?.User?.set(params.userID, await req.json());
    });
}


export async function DELETE(req:NextRequest, { params }: { params: { userID: string } }) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        await authical.Admin?.User.delete(params.userID);
    });
}

