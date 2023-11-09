import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        let page = 0;
        try {
            if (req.nextUrl.searchParams.has("page"))
                page = parseInt(req.nextUrl.searchParams.get("page") as string);
        } catch { /* empty */ }
        return await authical.Admin?.Logs.get(page);
    });
}

export const dynamic = "force-dynamic";
