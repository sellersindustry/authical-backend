import mustache from "mustache";


export class Template {

    static render(content:string, data:object):string {
        return mustache.render(content, data);
    }

}