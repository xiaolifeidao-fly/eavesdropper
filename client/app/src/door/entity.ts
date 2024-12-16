

export class DoorEntity{
    code: boolean;
    data : {};

    constructor(code: boolean = true, data: {} = {}){
        this.code = code;
        this.data = data;
    }

    public getCode(){
        return this.code;
    }

    public getData(){
        return this.data;
    }
}