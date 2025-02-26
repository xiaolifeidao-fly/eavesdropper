

import { Page } from "playwright";
import { DoorEngine } from "../engine";
import { DoorEntity } from "../entity";

export class MbEngine<T> extends DoorEngine<T> {

    public getNamespace(): string{
        return "mb";
    }

}
