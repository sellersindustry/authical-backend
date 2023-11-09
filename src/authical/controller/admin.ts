import { AuthicalError, Bearer, Config, Email, Log, Profile as ProfileModel,
    Secret, SessionID, Settings, Token, TokenID, TokenStrictID,
    TokenStrictSecretAndID, UserID, Utility as CoreUtility } from "@sellers-industry/authical-core";
import { Utility } from "../utility";
import { ADMIN_MODE, Profile } from "./profile";
import { Session } from "./session";


export class Admin {

    config: Config;
    settings: Settings;
    profile: Profile;
    session: Session;
    
    constructor (config:Config, settings:Settings, profile:Profile, session:Session) {
        this.config   = config;
        this.settings = settings;
        this.profile  = profile;
        this.session  = session;
    }


    Settings = {
        get:async():Promise<Settings> => {
            return await this.config.database.settings.get() as Settings;
        },
        set:async(settings:Settings):Promise<void> => {
            settings = Utility.EmailCaseSafety.settings(settings);
            Utility.Validator.settings(settings);
            await this.config.database.settings.set(settings);
        }
    };


    User = {
        get:async(user:UserID|Email):Promise<ProfileModel> => {
            return await this.profile.get(user, ADMIN_MODE);
        },
        set:async(user:UserID|Email, profile:ProfileModel) => {
            await this.profile.set(user, profile, ADMIN_MODE);
        },
        delete:async(user:UserID|Email):Promise<void> => {
            await this.profile.delete(user);
        }
    };


    Session = {
        verify:async(bearer:Bearer):Promise<undefined|{ user:UserID, session:SessionID }> => {
            try {
                let session = CoreUtility.parseBearer(bearer);
                if (session[0] != "USER")
                    return undefined;
                if (!(await this.session.verify(session[1], session[2], session[3])))
                    return undefined;
                return { user: session[1], session: session[2] };
            } catch {
                return undefined;
            }
        }
    };


    Logs = {
        get:async(pageNumber:number=0):Promise<Log[]> => {
            return await this.config.interface.log.get(pageNumber, 50); 
        }
    };


    Token = {
        add:async(token:Token):Promise<TokenStrictSecretAndID> => {
            let tokenID:TokenID = Utility.ID.generate();
            let secret:string   = Utility.Secret.generateSessionSecret();
            if (!token.description)
                throw new AuthicalError("Token has no description", 400);
            let _token = {
                id: tokenID,
                secret: secret,
                description: token.description
            };
            await this.config.database.token.add(tokenID, _token);
            return _token;
        },
        get:async(tokenID:TokenID):Promise<TokenStrictID> => {
            let token = await this.config.database.token.get(tokenID) as TokenStrictID;
            if (!token)
                throw new AuthicalError("Token Not Found", 404, "Unable to find token", tokenID);
            delete token.secret;
            return token;
        },
        del:async(tokenID:TokenID):Promise<void> => {
            await this.config.database.token.del(tokenID);
        },
        getAll:async():Promise<TokenStrictID[]> => {
            return (await this.config.database.token.getAll()).map((token:TokenStrictID) => {
                delete token.secret;
                return token;
            });
        },
        verify:async(tokenID:TokenID, secret:Secret):Promise<boolean> => {
            let token = await this.config.database.token.get(tokenID);
            if (!token) return false;
            return Utility.Secret.equals(token.secret, secret);
        }
    };


}