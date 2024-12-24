export class Task {

    id : number|undefined;
    status : string|undefined;

    constructor(id? : number, status? : string){
        this.id = id;
        this.status = status;
    }
}