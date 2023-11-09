import { Config, Settings, Session as SessionModel, SessionID, UserID, AuthicalError, Device } from "@sellers-industry/authical-core";
import { Utility } from "../utility";


export class Session {

    config: Config;
    settings: Settings;

    constructor (config:Config, settings:Settings) {
        this.config = config;
        this.settings = settings;
    }


    async get(userID:UserID, sessionID:SessionID):Promise<SessionModel> {
        let session = await this.getValidSession(userID, sessionID);
        delete session.secret;
        return session;
    }


    async getAll(userID:UserID):Promise<SessionModel[]> {
        return (await this.config.database.session.getAllByUserID(userID)).filter((session:SessionModel) => {
            try {
                this.validSession(userID, session);
                return true;
            } catch {
                return false;
            }
        }).map((session:SessionModel) => {
            delete session.secret;
            return session;
        });
    }


    async verify(userID:UserID, sessionID:SessionID, secret:string):Promise<boolean> {
        let session = await this.getValidSession(userID, sessionID);
        if (!session.secret)
            throw new Error("Session Interface requires property \"secret\"");
        return Utility.Secret.equals(session.secret, secret);
    }


    async revolk(userID:UserID, sessionID:SessionID):Promise<void> {
        await this.getValidSession(userID, sessionID);
        await this.config.database.session.del(sessionID);
    }


    async revolkAll(userID:UserID):Promise<void> {
        let sessions = await this.config.database.session.getAllByUserID(userID);
        await Promise.all(sessions.map(async (session:SessionModel) => {
            if (session.id)
                await this.revolk(userID, session.id);
        }));
    }


    async refresh(userID:UserID, sessionID:SessionID, device:Device):Promise<void> {
        let session = await this.getValidSession(userID, sessionID);
        await this.config.database.session.patch(sessionID, {
            ...session,
            device: device,
            updated: Utility.Time.timestamp()
        }, this.settings.account.ttl.session);
    }


    private async getValidSession(userID:UserID, sessionID:SessionID):Promise<SessionModel> {
        let session = await this.config.database.session.get(sessionID);
        if (!session)
            throw new AuthicalError("Session Not Found", 404, undefined, userID);
        this.validSession(userID, session);
        return session;
    }


    private validSession(userID:UserID, session:SessionModel) {
        if (session.user != userID)
            throw new AuthicalError("Session Not Found", 404, "UserID do not match", userID);
    }


}

