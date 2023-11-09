import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { AuthicalError } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function POST(req:NextRequest) {
    return await Middleware(req, Permission.USER_ADMIN, async (authical:SDK) => {
        let body = await req.json();
        if (!body.bearer)
            throw new AuthicalError("No Bearer", 400);
        return await authical.Admin?.Session.verify(body.bearer);
    });
}

export const dynamic = "force-dynamic";
