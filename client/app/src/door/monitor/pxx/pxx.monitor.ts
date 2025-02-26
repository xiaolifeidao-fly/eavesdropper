import { MonitorRequest, MonitorResponse } from "../monitor";

export abstract class PxxMonitorRequest<T> extends MonitorRequest<T> {
    
    getType(): string {
        return "pxx";
    }
}

export abstract class PxxMonitorResponse<T> extends MonitorResponse<T> {

    getType(): string {
        return "pxx";
    }

}