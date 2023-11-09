import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.NONE, (authical:SDK) => {
        return authical.settings?.branding;
    });
}

export const dynamic = "force-dynamic";
