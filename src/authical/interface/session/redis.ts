import { DatabaseSession, Session, SessionID, SessionStrictID, UserID } from "@sellers-industry/authical-core";
import { createClient } from "redis";


export class Session_Redis implements DatabaseSession {
    
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


    async set(sessionID:SessionID, session:Session, ttl:number):Promise<void> {
        await this.client.json.set(this.key(sessionID), "$", session);
        await this.client.expire(this.key(sessionID), ttl);
        await this.client.sAdd(this.keyByUser(session.user), sessionID);
        await this.client.expire(this.keyByUser(session.user), ttl);
        await this.getAllByUserID(session.user);
    }


    async patch(sessionID:SessionID, session:Session, ttl:number):Promise<void> {
        await this.client.json.merge(this.key(sessionID), "$", session);
        await this.client.expire(this.keyByUser(session.user), ttl);
    }


    async get(sessionID:SessionID):Promise<SessionStrictID|undefined> {
        let session = await this.client.json.get(this.key(sessionID));
        return session != null ? session : undefined;
    }


    async del(sessionID:SessionID):Promise<void> {
        let session = await this.get(sessionID);
        if (session) {
            await this.client.sRem(this.keyByUser(session.user), sessionID);
        }
        await this.client.del(this.key(sessionID));
    }


    async getAllByUserID(userID:UserID):Promise<SessionStrictID[]> {
        let sessionIDs = await this.client.sMembers(this.keyByUser(userID));
        if (sessionIDs == null) return [];
        let sessions:SessionStrictID[] = [];
        await Promise.all(sessionIDs.map(async (sessionID:SessionID) => {
            let session = await this.get(sessionID);
            if (session != undefined) {
                sessions.push({
                    ...session,
                    id: sessionID
                });
            } else {
                await this.client.sRem(this.keyByUser(userID), sessionID);
            }
        }));
        return sessions;
    }


    private key(sessionID:SessionID):string {
        return `SESSION:${sessionID}`;
    }


    private keyByUser(userID:UserID):string {
        return `USER-SESSIONS:${userID}`;
    }


}

