

import { Page } from "playwright";
import { DoorEngine } from "../engine";
import { DoorEntity } from "../entity";

export class MbEngine extends DoorEngine {

    doWaitFor(windowId: string, page: Page): Promise<{} | undefined> {
        throw new Error("Method not implemented.");
    }
    doCallback(doorEntity: DoorEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public getNamespace(): string{
        return "mb";
    }

}
