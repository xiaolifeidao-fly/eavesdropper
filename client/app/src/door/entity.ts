


export class DoorEntity<T>{
    code: boolean;
    data : T;
    headerData : { [key: string]: string; };
    requestBody : { [key: string]: any; };
    url: string;
    constructor(code: boolean = true, data: T = {} as T, url: string = "", headerData : { [key: string]: string; } = {}, requestBody : { [key: string]: any; } = {}){
        this.code = code;
        this.data = data;
        this.headerData = headerData;
        this.requestBody = requestBody;
        this.url = url;
    }

    public getRequestBody(){
        return this.requestBody;
    }

    public getCode(){
        return this.code;
    }

    public getData(){
        return this.data;
    }

    public getHeaderData(){
        return this.headerData;
    }

    public getUrl(){
        return this.url;
    }
}