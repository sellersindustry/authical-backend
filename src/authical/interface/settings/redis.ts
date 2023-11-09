import { DatabaseSettings, Settings } from "@sellers-industry/authical-core";
import { createClient } from "redis";


const MASTER_KEY = "AUTHICAL:SETTINGS";


export class Settings_Redis implements DatabaseSettings {

    client: any;
    host: string;

    constructor (host:string) {
        this.host = host;
    }


    async connect():Promise<void> {
        this.client = await createClient({ url: this.host })
            .on("error", (err:any) => console.log("Redis Client Error", err))
            .connect();
    }


    async get():Promise<Settings|undefined> {
        let settings = await this.client.json.get(MASTER_KEY);
        return settings != null ? settings : undefined;
    }


    async set(settings:Settings):Promise<void> {
        await await this.client.json.set(MASTER_KEY, "$", settings);
    }
    
    
}
