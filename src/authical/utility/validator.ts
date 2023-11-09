import { AuthicalError, Email, Profile, ProfileValidator, Settings } from "@sellers-industry/authical-core";
import { SettingsValidator } from "@sellers-industry/authical-core";
import { validate as EmailValidate } from "email-validator";


export class Validator {

    
    static email(email:Email):boolean {
        return EmailValidate(email);
    }


    static settings(settings:Settings) {
        Validator.ajv(SettingsValidator, settings);
    }


    static profile(profile:Profile) {
        Validator.ajv(ProfileValidator, profile);
    }


    static ajv(model:any, payload:object) {
        let res = true;
        try {
            res = model(payload);
        } catch {
            throw new AuthicalError("Invalid AJV Schema", 500, "Unable to Execute Validator, must be AJV Schema");
        }
        if (!res) {
            throw new AuthicalError(model.errors.map((o:any) => {
                let path:string = o.instancePath.replace("/", ".");
                return `${(path == "") ? "." : path}: ${(o.message) ? o.message : o.keyword}`;
            }).join("\n"), 400);
        }
    }

    
}
