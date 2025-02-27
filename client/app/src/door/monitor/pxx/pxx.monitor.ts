import { PDD } from "@enums/source";
import { MonitorRequest, MonitorResponse } from "../monitor";

export abstract class PxxMonitorRequest<T> extends MonitorRequest<T> {
    
    getType(): string {
        return PDD;
    }
}

export abstract class PxxMonitorResponse<T> extends MonitorResponse<T> {

    getType(): string {
        return PDD;
    }

}