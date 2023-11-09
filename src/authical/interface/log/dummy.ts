import { InterfaceLog, Log } from "@sellers-industry/authical-core";


export class Log_Dummy implements InterfaceLog {

    client: any;

    constructor() {}


    async connect():Promise<void> {}


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async log(event: string, message: string):Promise<void> {}


    // eslint-disable-next-line @typescript-eslint/no-unused-vars, require-await
    async get(pageNum:number, pageSize:number):Promise<Log[]> {
        return [];
    }


}