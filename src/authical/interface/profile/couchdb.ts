import { DatabaseProfile, Email, Profile, ProfileStrictID, UserID } from "@sellers-industry/authical-core";
import nano from "nano";


export class Profile_CouchDB implements DatabaseProfile {
    
    client: nano.ServerScope;
    profile: nano.DocumentScope<Profile>;

    constructor(couchHost: string) {
        this.client  = nano(couchHost);
        this.profile = {} as nano.DocumentScope<Profile>;
    }


    async connect():Promise<void> {
        this.profile = await this.getCollection("profile");
    }


    async set(userID:UserID, profile:Profile):Promise<void> {
        try {
            let _profile = await this.profile.get(userID);
            await this.profile.insert({
                ...this.castProfileIn(profile),
                _id: userID,
                _rev: _profile._rev
            });
        } catch {
            await this.profile.insert({
                ...this.castProfileIn(profile),
                _id: userID
            });
        }
    }


    async del(userID:UserID):Promise<void> {
        let document = await this.profile.get(userID);
        await this.profile.destroy(userID, document._rev);
    }


    async get(userID:UserID):Promise<ProfileStrictID|undefined> {
        return this.castProfileOut(await this.profile.get(userID));
    }

    async getByEmail(email:Email):Promise<ProfileStrictID|undefined> {        
        let docs = (await this.profile.find({
            selector: {
                "email.active": { "$all": [ email ] },
            },
            limit: 1
        })).docs;
        return (docs.length != 0) ? this.castProfileOut(docs[0]) : undefined;
    }


    async getByEmailPending(email:string):Promise<ProfileStrictID|undefined> {
        let docs = (await this.profile.find({
            selector: {
                "email.pending.name": { "$eq": email },
            },
            limit: 1
        })).docs;
        return (docs.length != 0) ? this.castProfileOut(docs[0]) : undefined;
    }


    private async getCollection(collection: string): Promise<nano.DocumentScope<any>> {
        if (!(await this.client.db.list()).includes(collection)) {
            await this.client.db.create(collection);
        }
        return this.client.db.use(collection);
    }
    

    private castProfileIn(profile:Profile):nano.IdentifiedDocument&Profile {
        let id:UserID = profile.id ? profile.id : "";
        delete profile.id;
        return { _id: id, ...profile };
    }


    private castProfileOut(profile:nano.IdentifiedDocument&Profile):ProfileStrictID {
        let _profile = profile as unknown as any;
        let id:UserID = _profile._id ? _profile._id : "";
        delete _profile._id;
        delete _profile._rev;
        return { id: id, ..._profile };
    }


}

