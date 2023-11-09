import { Config, Settings, DefaultSettings } from "@sellers-industry/authical-core";
import { Authenication } from "./authenication";
import { Session } from "./session";
import { Profile } from "./profile";
import { Admin } from "./admin";
import { Utility } from "../utility";


export class SDK {

    config: Config;
    settings: Settings|undefined;
    Authenication: Authenication|undefined;
    Session: Session|undefined;
    Profile: Profile|undefined;
    Admin: Admin|undefined;


    constructor (config:Config) {
        this.config = Utility.EmailCaseSafety.config(config);
    }


    async init() {
        await this.config.interface.email.connect();
        await this.config.interface.log.connect();
        await this.config.database.otp.connect();
        await this.config.database.profile.connect();
        await this.config.database.session.connect();
        await this.config.database.settings.connect();
        await this.config.database.token.connect();

        this.settings      = await this.getSettings();
        this.Authenication = new Authenication(this.config, this.settings);
        this.Session       = new Session(this.config, this.settings);
        this.Profile       = new Profile(this.config, this.settings, this.Authenication, this.Session);
        this.Admin         = new Admin(this.config, this.settings, this.Profile, this.Session);
    }


    private async getSettings():Promise<Settings> {
        let settings = await this.config.database.settings.get();
        if (!settings) {
            await this.config.database.settings.set(DefaultSettings);
            settings = DefaultSettings;
        }
        return settings;
    }


}

