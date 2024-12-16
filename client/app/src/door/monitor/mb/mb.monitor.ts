require('module-alias/register');
import { Route, Request } from "playwright";
import { Monitor, MonitorRequest, MonitorResponse } from "../monitor";
import { DoorEntity } from "@src/door/entity";


export abstract class MbMonitorRequest extends MonitorRequest{


}

export abstract class MbMonitorResponse extends MonitorResponse {


}