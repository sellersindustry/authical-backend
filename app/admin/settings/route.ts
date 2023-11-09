import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        return await authical.Admin?.Settings.get();
    });
}


export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        return await authical.Admin?.Settings.set(await req.json());
    });
}

