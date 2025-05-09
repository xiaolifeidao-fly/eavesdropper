

import { DoorEngine } from "../engine";

export class MbEngine<T> extends DoorEngine<T> {

    public getNamespace(): string{
        return "mb";
    }

}
