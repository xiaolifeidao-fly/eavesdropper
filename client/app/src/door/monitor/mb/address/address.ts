import { Response } from "playwright-core";
import { MbMonitorResponse } from "../mb.monitor";


export class MbAddressQueryMonitor extends MbMonitorResponse<{}> {

    getApiName(): string | string[] {
        return "user/logis_tools.htm";
    }

    getKey(): string {
        return "address.query.api";
    }

    public needHeaderData(): boolean {
        return true;
    }

    public async getResponseData(response: Response): Promise<any> {
        return {};
    }

}