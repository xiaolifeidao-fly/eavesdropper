


export class DoorEntity<T>{
    code: boolean;
    data : T;
    headerData : { [key: string]: any; };
    requestBody : { [key: string]: any; };
    responseHeaderData : { [key: string]: any; };
    url: string;
    validateUrl : string | undefined;
    validateParams : { [key: string]: any; } | undefined;
    constructor(code: boolean = true, data: T = {} as T, url: string = "", headerData : { [key: string]: string; } = {}, requestBody : { [key: string]: any; } = {}, validateUrl : string | undefined = undefined, responseHeaderData : { [key: string]: any; } = {}){
        this.code = code;
        this.data = data;
        this.headerData = headerData;
        this.requestBody = requestBody;
        this.url = url;
        this.validateUrl = validateUrl;
        this.responseHeaderData = responseHeaderData;
    }

    setValidateParams(params: { [key: string]: any; }){
        this.validateParams = params;
    }

    getValidateParams(){
        return this.validateParams;
    }

    public getValidateUrl(){
        return this.validateUrl;
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

    public getResponseHeaderData(){
        return this.responseHeaderData;
    }
}