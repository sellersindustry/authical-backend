import { GlobalConfig } from "@/authical.config";
import { SDK } from "./controller";

export async function AuthicalServerContructor():Promise<SDK> {
    let controller = new SDK(GlobalConfig);
    await controller.init();
    return controller;
}
