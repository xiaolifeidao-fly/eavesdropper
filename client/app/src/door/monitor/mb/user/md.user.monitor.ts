import { MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";


export class MbUserInfoMonitor extends MbMonitorResponse<{}>{

    getApiName(): string{
        return "mtop.user.getusersimple";
    }

    getKey(): string{
        return "userInfo";
    }

}