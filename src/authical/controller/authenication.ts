import { Config, Device, Email, OTPID, Secret, SessionID, Bearer, Settings, UserID, AuthicalError, Utility as AuthicalCoreUtility } from "@sellers-industry/authical-core";
import { Utility } from "../utility";


export class Authenication {

    config: Config;
    settings: Settings;
    
    constructor (config:Config, settings:Settings) {
        this.config = config;
        this.settings = settings;
    }


    async request(email:Email):Promise<OTPID> {
        email = Utility.EmailCaseSafety.single(email);
        await this.isValidEmail(email);
        let user      = await this.config.database.profile.getByEmail(email);
        let userID    = user?.id;
        let isNewUser = user == undefined;
        if (user == undefined || userID == undefined) {
            await this.config.interface.log.log("Creating New User", email);
            userID = await this.createProfile(email);
        }
        let [id, secret] = await this.createOTP(userID, email);
        await this.sendEmail(email, secret, user?.name.first, isNewUser);
        return id;   
    }


    async verify(email:Email, otpID:OTPID, secret:string, device:Device):Promise<Bearer> {
        email = Utility.EmailCaseSafety.single(email);
        let profile = await this.config.database.profile.getByEmail(email);
        if (!profile)
            throw new AuthicalError("OTP Not Found", 400, "Unable to Authenicate 1", email);
        await this.validateOTP(profile.id, email, secret);
        await this.config.database.otp.del(profile.id);
        return this.createSession(profile.id, device);
    }


    private async isValidEmail(email:Email):Promise<void> {
        if (!Utility.Validator.email(email))
            throw new AuthicalError("Invalid Email", 400, "Email RegEx Failure", email);
        if (!this.isWhitelistedEmail(email))
            throw new AuthicalError("Not Whitelisted Email", 400, "Whitelist Failure", email);
        if (this.isBlacklistedEmail(email))
            throw new AuthicalError("Invalid Email", 400, "Blacklist Failure", email);
        if (!this.config.standin || !this.config.standin.isValidEmail) 
            return;
        if (!(await this.config.standin.isValidEmail(email)))
            throw new AuthicalError("Invalid Email", 400, "Email Validation Standin Rejected", email);
    }


    private isWhitelistedEmail(email:Email):boolean {
        if (this.settings.account.whitelist.enable)
            return this.settings.account.whitelist.emails.indexOf(email) != -1;
        return true;
    }


    private isBlacklistedEmail(email:Email):boolean {
        if (this.settings.account.blacklist.enable)
            return this.settings.account.blacklist.emails.indexOf(email) != -1;
        return false;
    }


    private async createOTP(userID:UserID, email:Email):Promise<[OTPID, string]> {
        let id:OTPID      = Utility.ID.generate();
        let secret:string = await this.generateOTP();
        await this.config.database.otp.set(userID, {
            id: id,
            email: email,
            secret: secret,
            attempts: 0,
            created: Utility.Time.timestamp()
        }, this.settings.account.ttl.otp);
        return [id, secret];
    }


    private async generateOTP():Promise<Secret> {
        if (!this.config.standin || !this.config.standin.generateOTP)
            return Utility.Secret.generate4Digit();
        return await this.config.standin.generateOTP();
    }


    private async sendEmail(email:Email, secret:string, name:string|undefined, isNewUser:boolean) {
        let data = {
            email: email,
            secret: secret,
            name: name ? name : "friend",
            time: Utility.Time.timestamp(),
            branding: this.settings.branding
        };
        let templates    = this.settings.emailTemplates;
        let template     = isNewUser ? templates.signup : templates.signin;
        let title:string = Utility.Template.render(template.title, data);
        let body:string  = Utility.Template.render(template.body, data);
        try {
            await this.config.interface.email.send(email, title, body);
        } catch {
            await this.config.interface.log.log("Unable to Send Email", `Failed to send email to "${email}" with secret "${secret}"`);
        }
    }


    private async createProfile(email:Email):Promise<UserID> {
        let userID:string = Utility.ID.generate();
        await this.config.database.profile.set(userID, {
            id: userID,
            avatar: this.settings.account.defaultAvatar,
            name: {
                first: "",
                last: ""
            },
            email: {
                primary: email,
                active: [email],
                pending: [],
                previous: []
            },
            metadata: {}
        });
        if (this.config.hooks && this.config.hooks.onAccountCreated)
            await this.config.hooks.onAccountCreated(userID);
        return userID;
    }


    private async validateOTP(userID:UserID, email:Email, secret:string):Promise<void> {
        let otp = await this.config.database.otp.get(userID);
        if (!otp)
            throw new AuthicalError("OTP Not Found", 400, "Unable to Authenicate 2", email);
        if (otp.email != email || otp.secret != secret) {
            let attempts:number = otp.attempts + 1;
            if (attempts >= this.settings.account.maxLoginAttempts) {
                await this.config.database.otp.del(userID);
            } else {
                await this.config.database.otp.patch(userID, {
                    ...otp,
                    attempts: otp.attempts + 1
                });
            }
            throw new AuthicalError("OTP Invalid", 400, "Unable to Authenicate", email);
        }
    }


    private async createSession(userID:UserID, device:Device):Promise<Bearer> {
        let sessionID:SessionID = Utility.ID.generate();
        let secret:string       = Utility.Secret.generateSessionSecret();
        await this.config.database.session.set(sessionID, {
            id: sessionID,
            user: userID,
            secret: secret,
            device: device,
            updated: Utility.Time.timestamp(),
            created: Utility.Time.timestamp()
        }, this.settings.account.ttl.session);
        return AuthicalCoreUtility.generateUserBearer(userID, sessionID, secret);
    }


}

