import { DoorEngine } from "../engine";


export class PxxEngine<T> extends DoorEngine<T>{

    getNamespace(): string {
        return "pxx";
    }

}
