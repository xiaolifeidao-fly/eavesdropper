import axios from "axios";
import { StepResult, StepUnit } from "../../step.unit";
import log from "electron-log"
import { AbsPublishStep } from "./abs.publish";

export class UpdateDraftStep extends AbsPublishStep {

    async doStep(): Promise<StepResult> {
        const header = this.getHeader();
        const draftData = this.getParams("draftData");
        const draftId = this.getParams("draftId");
        const catId = this.getParams("catId");
        const startTraceId = this.getParams("startTraceId");
        const updateResult = await this.updateDraftData(catId, draftId, header, startTraceId, draftData);
        if(!updateResult){
            return new StepResult(false, "更新草稿失败");
        }
        return new StepResult(true, "更新草稿成功");
    }

    async updateDraftData(catId: string, draftId: string, header: { [key: string]: any }, startTraceId: string, draftData: {}) {
        const url = "https://item.upload.taobao.com/sell/draftOp/update.json?catId=" + catId;
        const data = {
            "id": draftId,
            "dbDraftId": draftId,
            "jsonBody": JSON.stringify(draftData),
            "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
        };
    
        const res = await axios.post(url, data, {
            headers: header
        })
        if (!res.data || (typeof (res.data) == 'string' && res.data == '')) {
            log.info("res is empty", res.data);
            return false;
        }
        if (!res.data.success) {
            log.info("res is not success ", res.data);
            return false;
        }
        // log.info("draftData is ", JSON.stringify(draftData));
        return true;
    }

}