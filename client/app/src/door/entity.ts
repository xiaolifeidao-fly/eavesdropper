


export class DoorEntity<T>{
    code: boolean;
    data : T;

    constructor(code: boolean = true, data: T = {} as T){
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