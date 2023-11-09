import { Config, Email, Profile, Settings } from "@sellers-industry/authical-core";


export class EmailCaseSafety {

    
    static single(email:Email):Email {
        return email.toLowerCase();
    }


    static list(emails:Email[]):Email[] {
        emails = emails.map(email => this.single(email));
        return emails.filter(function(email:Email, index:number) {
            return emails.indexOf(email) == index;
        });
    }


    static settings(settings:Settings):Settings {
        settings.admins                   = this.list(settings.admins);
        settings.account.whitelist.emails = this.list(settings.account.whitelist.emails);
        settings.account.blacklist.emails = this.list(settings.account.blacklist.emails);
        return settings;
    }


    static config(config:Config):Config {
        config.admins = this.list(config.admins);
        return config;
    }


    static profile(profile:Profile):Profile {
        profile.email.primary = this.single(profile.email.primary);
        profile.email.active  = this.list(profile.email.active);
        profile.email.pending = profile.email.pending?.map((pending) => {
            return {
                ...pending,
                email: this.single(pending.email)
            };
        });
        profile.email.previous = profile.email.previous?.map((previous) => {
            return {
                ...previous,
                email: this.single(previous.email)
            };
        });
        return profile;
    }

    
}

