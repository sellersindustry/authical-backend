import { SDK } from "@/src/authical/controller";
import { Middleware } from "@/src/middleware";
import { Permission } from "@/src/middleware/model";
import { UserID } from "@sellers-industry/authical-core";
import { NextRequest } from "next/server";


export async function POST(req:NextRequest, { params }: { params: { email: string } }) {
    return await Middleware(req, Permission.USER_BASIC, async (authical:SDK, userID:UserID) => {
        return await authical.Profile?.emailSetPrimary(userID, params.email);
    });
}

