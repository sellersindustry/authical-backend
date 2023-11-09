import { Secret as AuthicalSecret } from "@sellers-industry/authical-core";
import { randomBytes } from "crypto";


export class Secret {

    static generate4Digit():AuthicalSecret {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    static generateSessionSecret():AuthicalSecret {
        return randomBytes(48).toString("hex");
    }

    static equals(buffer1:string, buffer2:string):boolean {
        let isNotEqual = false;
        for (let i = 0; i < Math.max(buffer1.length, buffer2.length); i++) {
            if (i >= buffer1.length || i >= buffer2.length) {
                isNotEqual = true;
            } else if (buffer1[i] != buffer2[i]) {
                isNotEqual = true;
            }
        }
        return !isNotEqual;
    }

}
