import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function POST(req:NextRequest, { params }: { params: { email: string } }) {
    return await Middleware(req, Permission.NONE, async (authical:SDK) => {
        let body = await req.json();
        return await authical.Profile?.emailVerify(params.email, body.secret);
    });
}


