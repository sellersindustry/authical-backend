import { DatabaseToken, TokenID, TokenStrictSecret, TokenStrictSecretAndID } from "@sellers-industry/authical-core";
import { createClient } from "redis";


export class Token_Redis implements DatabaseToken {
    
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


    async get(tokenID:TokenID):Promise<TokenStrictSecretAndID|undefined> {
        let session = await this.client.json.get(this.key(tokenID));
        return session != null ? session : undefined;
    }


    async add(tokenID:TokenID, token:TokenStrictSecret):Promise<void> {
        await this.client.json.set(this.key(tokenID), "$", token);
        await this.client.sAdd(this.keyList(), tokenID);
    }


    async del(tokenID:TokenID):Promise<void> {
        await this.client.del(this.key(tokenID));
        await this.client.sRem(this.keyList(), tokenID);
    }


    async getAll():Promise<TokenStrictSecretAndID[]> {
        let tokenIDs = await this.client.sMembers(this.keyList());
        if (tokenIDs == null) return [];
        let sessions:TokenStrictSecretAndID[] = [];
        await Promise.all(tokenIDs.map(async (tokenID:TokenID) => {
            let session = await this.get(tokenID);
            if (session) sessions.push(session);
        }));
        return sessions;
    }


    private key(tokenID:TokenID):string {
        return `TOKEN:${tokenID}`;
    }


    private keyList():string {
        return "SYSTEM-TOKENS";
    }


}

