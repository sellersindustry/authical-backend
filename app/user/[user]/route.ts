import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest, { params }: { params: { user: string } }) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK) => {
        let profile = await authical.Profile?.get(params.user);
        delete profile?.email.previous;
        delete profile?.email.pending;
        delete profile?.isAdmin;
        return profile;
    });
}

