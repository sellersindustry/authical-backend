import { Email, InterfaceEmail } from "@sellers-industry/authical-core";
import sgMail from "@sendgrid/mail";

export class Email_SendGrid implements InterfaceEmail {

    private senderEmail: string;
    private senderName:  string;
    private secret:      string;

    constructor (senderEmail:string, senderName:string, secret:string) {
        this.senderEmail = senderEmail;
        this.senderName  = senderName;
        this.secret      = secret;
    }

    connect() {
        sgMail.setApiKey(this.secret);
    }

    async send(email:Email, title:string, body:string):Promise<void> {
        await sgMail.send({
            to: email,
            from: {
                name: this.senderName,
                email: this.senderEmail
            },
            subject: title,
            html: body,
        });
    }

}
