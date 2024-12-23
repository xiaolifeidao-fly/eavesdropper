import { Page } from "playwright";
import { ActionCommand } from "@model/door/door";
import { MonitorChain } from "../monitor/monitor";

export class ActionResult {
    success: boolean;
    message: string|undefined;
    data: {[key: string]: any} = {};

    constructor(success: boolean = true, data: {[key: string]: any} = {}, message?: string) {
        this.success = success;
        this.data = data;
        this.message = message;
    }
}

export class ActionChain {

    private actionCommands: ActionCommand[] = [];

    constructor(){
    }

    public addActionCommand(actionCommand: ActionCommand): void {
        this.actionCommands.push(actionCommand);
    }

    public addActionCommands(actionCommands: ActionCommand[]): void {
        this.actionCommands.push(...actionCommands);
    }


    public async do(page: Page, data : any = undefined): Promise<ActionResult> {
        let prevResult: any = null;
        let result: ActionResult = new ActionResult();
        let resultData: {[key: string]: any} = {};
        for (const actionCommand of this.actionCommands) {
            const dynamicFunction = new Function(actionCommand.code)();
            prevResult = await dynamicFunction(page, prevResult, data);
            if(!prevResult){
                result.success = false;
                result.data = resultData;
                return result;
            }
            resultData[prevResult.key] = prevResult.data;
            if(!prevResult.success){
                result.success = false;
                result.data = resultData;
                return result;
            }
        }
        result.data = resultData;
        return result;
    }


}
