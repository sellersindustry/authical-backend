import { v4 as uuidV4 } from "uuid";


export class ID {

    static generate():string {
        return uuidV4();
    }

}

