import { Response } from "playwright-core";
import { MbMonitorResponse } from "../mb.monitor";
import { DoorEntity } from "@src/door/entity";


export class MbAddressQueryMonitor extends MbMonitorResponse<{}> {

    getApiName(): string | string[] {
        return "user/template_setting.htm";
    }

    getKey(): string {
        return "address.query.api";
    }

    public needHeaderData(): boolean {
        return true;
    }

    public async getResponseData(response: Response): Promise<DoorEntity<{}>> {
        return new DoorEntity<{}>(true, {} as {});
    }

}