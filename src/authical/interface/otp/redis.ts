import { DatabaseOTP, OTP, OTPID } from "@sellers-industry/authical-core";
import { createClient } from "redis";

export class OTP_Redis implements DatabaseOTP {

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


    async set(otpID:OTPID, otp:OTP, ttl:number):Promise<void> {
        await this.client.json.set(this.key(otpID), "$", otp);
        await this.client.expire(this.key(otpID), ttl);
    }


    async get(otpID:OTPID):Promise<OTP|undefined> {
        let otp = await this.client.json.get(this.key(otpID));
        return otp != null ? otp : undefined;
    }


    async del(otpID:OTPID):Promise<void> {
        await this.client.del(this.key(otpID));
    }


    async patch(otpID:OTPID, otp:OTP):Promise<void> {
        await this.client.json.merge(this.key(otpID), "$", otp);
    }


    private key(otpID:OTPID):string {
        return `OTP:${otpID}`;
    }
    
    
}