import { Config, Email, Settings, UserID, Secret, AuthicalError, Profile as ProfileModel, ProfileStrictID as ProfileStrictIDModel, Utility as AuthicalCoreUtility } from "@sellers-industry/authical-core";
import { Utility } from "../utility";
import { Authenication } from "./authenication";
import { Session } from "./session";
import sharp from "sharp";


export const ADMIN_MODE = true;

export class Profile {

    config: Config;
    settings: Settings;
    authenication: Authenication;
    session: Session;
    
    constructor (config:Config, settings:Settings, authenication:Authenication, session:Session) {
        this.config        = config;
        this.settings      = settings;
        this.authenication = authenication;
        this.session       = session;
    }
    

    async get(user:Email|UserID, adminMode=false):Promise<ProfileStrictIDModel> {
        let profile;
        if (Utility.Validator.email(user)) {
            user    = Utility.EmailCaseSafety.single(user);
            profile = await this.config.database.profile.getByEmail(user);
            if (!profile)
                throw new AuthicalError("Account Not Found", 404, "Unable to find account by email", user);
        } else {
            profile = await this.config.database.profile.get(user);
            if (!profile)
                throw new AuthicalError("Account Not Found", 404, "Unable to find account by userID", user);
        }
        if (!adminMode) {
            profile.isAdmin       = this.isAdmin(profile);
            profile.email.pending = profile.email.pending?.map((pending) => {
                delete pending.secret;
                return pending;
            });
        }
        return profile;
    }


    async set(user:Email|UserID, newProfile:ProfileModel, adminMode=false) {
        newProfile = Utility.EmailCaseSafety.profile(newProfile);
        delete newProfile.id;
        delete newProfile.isAdmin;
        newProfile.avatar = await this.resizeBase64Image(newProfile.avatar, 64, 64);
        let oldProfile = await this.get(user, ADMIN_MODE);
        await this.validateProfiles(newProfile, oldProfile);
        let profile = adminMode ? newProfile : { ...newProfile, email: oldProfile.email };
        delete profile.isAdmin;
        await this.config.database.profile.set(oldProfile.id, profile);
    }


    async delete(user:Email|UserID):Promise<void> {
        let userID = (await this.get(user)).id as UserID;
        await this.config.database.profile.del(userID);
        await this.config.database.otp.del(userID);
        await this.session.revolkAll(userID);
    }


    async emailAdd(user:Email|UserID, email:Email) {
        let profile = await this.get(user, ADMIN_MODE);
        let secret = Utility.Secret.generateSessionSecret();
        profile.email.pending?.push({
            email: email,
            secret: secret,
            updated: Utility.Time.timestamp()
        });
        let userID = `${profile.id}`;
        await this.set(profile.id, profile, ADMIN_MODE);
        await this.sendEmailVerify(userID, profile.name.first, email, secret);
    }


    async emailRemove(user:Email|UserID, email:Email) {
        let profile           = await this.get(user, ADMIN_MODE);
        let removedFromActive = false;
        profile.email.active = profile.email.active.filter((cemail) => {
            if (cemail == email) removedFromActive = true;
            return cemail != email;
        });
        if (profile.email.pending) {
            profile.email.pending = profile.email.pending.filter((pending) => {
                return pending.email != email;
            });
        }
        profile.email.previous?.push({
            email: email,
            updated: Utility.Time.timestamp(),
        });
        await this.set(profile.id, profile, ADMIN_MODE);
        if (removedFromActive)
            await this.sendEmailRemoved(profile.name.first, email);
    }


    async emailSetPrimary(user:Email|UserID, email:Email) {
        let profile  = await this.get(user, ADMIN_MODE);
        let oldEmail = profile.email.primary;
        profile.email.primary = email;
        await this.set(profile.id, profile, ADMIN_MODE);
        if (oldEmail != email)
            await this.sendEmailPrimaryChange(profile.name.first, email, oldEmail);
    }


    async emailVerify(user:Email|UserID, secret:Secret) {
        let profile = await this.get(user, ADMIN_MODE);
        let pendingEmails = profile.email.pending?.filter((pendingEmail) => {
            return pendingEmail.secret == secret;
        });
        if (!pendingEmails || pendingEmails?.length == 0)
            throw new AuthicalError("Email Validation Not Found", 404, "Validation Not Found By Secret", user);
        let pendingEmail = pendingEmails[0];
        profile.email.pending = profile.email.pending?.filter((pendingEmail) => {
            return pendingEmail.email != pendingEmail.email;
        });
        let age = Utility.Time.diff(Utility.Time.timestamp(), pendingEmail.updated);
        if (age > this.settings.account.ttl.pendingEmail) {
            await this.config.database.profile.set(profile.id, profile);
            throw new AuthicalError("Email Validation Not Found", 404, "Validation Timeout", user);
        }
        profile.email.active.push(pendingEmail.email);
        await this.config.database.profile.set(profile.id, profile);
    }


    private async validateProfiles(newProfile:ProfileModel, oldProfile:ProfileStrictIDModel):Promise<void> {
        Utility.Validator.profile(newProfile);
        this.validateEmails(newProfile);
        this.validatePrimaryEmail(newProfile);
        if (this.config.metadata) {
            Utility.Validator.ajv(this.config.metadata, newProfile);
        }
        let emails = AuthicalCoreUtility.copyObject(newProfile.email.active);
        if (newProfile.email.pending)
            emails.push(...newProfile.email.pending.map((pending) => pending.email));
        await this.validateEmailsAvailable(emails, oldProfile.id);
    }


    private validateEmails(profile:ProfileModel) {
        let emails = AuthicalCoreUtility.copyObject(profile.email.active);
        if (profile.email.pending)
            emails.push(...profile.email.pending.map((pending) => pending.email));
        [profile.email.primary, ...emails].forEach((email:Email) => {
            if (!Utility.Validator.email(email))
                throw new AuthicalError("Invalid Email", 400, "Email RegEx Failure", email);
            if (this.isBlacklistedEmail(email))
                throw new AuthicalError("Invalid Email", 400, "Blacklist Failure", email);
        });
        let duplicates = emails.filter((item:any, index:any) => emails.indexOf(item) !== index);
        if (duplicates.length != 0)
            throw new AuthicalError("Invalid Email", 400, "Duplicated email", duplicates.join(", "));
    }


    private isBlacklistedEmail(email:Email):boolean {
        if (this.settings.account.blacklist.enable)
            return this.settings.account.blacklist.emails.indexOf(email) != -1;
        return false;
    }


    private validatePrimaryEmail(newProfile:ProfileModel) {
        if (!newProfile.email.active.includes(newProfile.email.primary))
            throw new AuthicalError("Invalid Primary Email - selected primary email is not active", 400, undefined, newProfile.email.primary);
    }


    private async validateEmailsAvailable(emails:Email[], userID:UserID) {
        await Promise.all(emails.map(async (email:Email) => {
            let active  = await this.config.database.profile.getByEmail(email);
            let pending = await this.config.database.profile.getByEmailPending(email);
            if (active && active.id != userID)
                throw new AuthicalError("Email Already Used", 400, undefined, email);
            if (pending && pending.id != userID)
                throw new AuthicalError("Email Already Used", 400, undefined, email);
        }));
    }


    private async sendEmailPrimaryChange(name:string, newEmail:Email, oldEmail:Email) {
        let data = {
            name: name,
            newEmail: newEmail,
            oldEmail: oldEmail,
            time: Utility.Time.timestamp(),
            branding: this.settings.branding
        };
        let template     = this.settings.emailTemplates.changePrimaryEmail;
        let title:string = Utility.Template.render(template.title, data);
        let body:string  = Utility.Template.render(template.body, data);
        try {
            await this.config.interface.email.send(oldEmail, title, body);
        } catch {
            await this.config.interface.log.log("Failed to Send Email", `Failed to send email to "${oldEmail}" for a primary email change`);
        }
    }


    private async sendEmailVerify(user:UserID, name:string, email:Email, secret:Secret) {
        let data = {
            user: user,
            name: name,
            email: email,
            secret: secret,
            time: Utility.Time.timestamp(),
            branding: this.settings.branding,
            frontend: this.config.applicationHomePage
        };
        let template     = this.settings.emailTemplates.approveNewEmail;
        let title:string = Utility.Template.render(template.title, data);
        let body:string  = Utility.Template.render(template.body, data);
        try {
            await this.config.interface.email.send(email, title, body);
        } catch {
            await this.config.interface.log.log("Failed to Send Email", `Failed to send email to "${email}" with secret "${secret}" for a email verification`);
        }
    }


    private async sendEmailRemoved(name:string, email:Email) {
        let data = {
            name: name,
            email: email,
            time: Utility.Time.timestamp(),
            branding: this.settings.branding
        };
        let template     = this.settings.emailTemplates.removeEmail;
        let title:string = Utility.Template.render(template.title, data);
        let body:string  = Utility.Template.render(template.body, data);
        try {
            await this.config.interface.email.send(email, title, body);
        } catch {
            await this.config.interface.log.log("Failed to Send Email", `Failed to send email to "${email}" for a email removal`);
        }
    }


    private isAdmin(profile:ProfileModel):boolean {
        for (let email of profile.email.active) {
            if (this.settings?.admins.map(o => o.toLowerCase()).includes(email))
                return true;
            if (this.config.admins.map(o => o.toLowerCase()).includes(email))
                return true;
        }
        return false;
    }
    

    private async resizeBase64Image(base64Image:string, maxHeight:number, maxWidth:number):Promise<string> {
        const destructImage = base64Image.split(";");
        const mimType = destructImage[0].split(":")[1];
        const imageData = destructImage[1].split(",")[1];
        let resizedImage = Buffer.from(imageData, "base64");
        resizedImage = await sharp(resizedImage).resize(maxHeight, maxWidth).toBuffer();   
        return `data:${mimType};base64,${resizedImage.toString("base64")}`;
    }


}
