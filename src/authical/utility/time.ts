import { Timestamp } from "@sellers-industry/authical-core";


export class Time {
    
    static timestamp():Timestamp {
        return (new Date()).toISOString();
    }

    static diff(time1:Timestamp, time2:Timestamp) {
        let epoch1:number = Math.round(Date.parse(time1) / 1000);
        let epoch2:number = Math.round(Date.parse(time2) / 1000);
        return Math.abs(epoch1 - epoch2);
    }

}
