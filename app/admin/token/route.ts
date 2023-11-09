import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN_NO_MACHINES, async (authical:SDK) => {
        return await authical.Admin?.Token?.getAll();
    });
}


export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN_NO_MACHINES, async (authical:SDK) => {
        return await authical.Admin?.Token?.add(await req.json());
    });
}

