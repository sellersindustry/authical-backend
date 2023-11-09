import { Config } from "@sellers-industry/authical-core";
import { Log_Dummy } from "./src/authical/interface/log/dummy";
import { Profile_CouchDB } from "./src/authical/interface/profile/couchdb";
import { OTP_Redis } from "./src/authical/interface/otp/redis";
import { Session_Redis } from "./src/authical/interface/session/redis";
import { Settings_Redis } from "./src/authical/interface/settings/redis";
import { Token_Redis } from "./src/authical/interface/token/redis";
import { Email_SendGrid } from "./src/authical/interface/email/sendgrid";


export const GlobalConfig:Config = {
    // Starting Admin Emails
    admins: ["sellersew@gmail.com"],

    // Fontend URL - Used for Sending Emails (No slash at end)
    applicationHomePage: "http://localhost:3000",

    // Access to Databases
    database: {
        profile: new Profile_CouchDB(process.env.DB_COUCHDB as string),
        otp: new OTP_Redis(process.env.DB_REDIS as string),
        session: new Session_Redis(process.env.DB_REDIS as string),
        settings: new Settings_Redis(process.env.DB_REDIS as string),
        token: new Token_Redis(process.env.DB_REDIS as string)
    },

    // Access to other operations
    interface: {
        log: new Log_Dummy(),
        email: new Email_SendGrid(
            process.env.EMAIL_ADDRESS as string, // Email Sender Address
            process.env.EMAIL_NAME as string,    // Email Sender Name
            process.env.EMAIL_SECRET as string   // Send Grid Secret
        )
    },

    // Action Hooks - Get Called when actions happen
    hooks: {
        onAccountCreated: undefined,
        onAccountUpdated: undefined,
        onAccountDeleted: undefined,
    },

    // Operational Standins
    standin: {
        isValidEmail: undefined,  // Validate an account can be created using this email
        generateOTP: undefined    // Generate OTP (defaults to random 4 digits)
    },

    // User Profile Metadata Schema (AJV)
    metadata: undefined
};
