
import { MbMonitorResponse } from "../mb.monitor";
import { Response } from "playwright";
import log from "electron-log"
import { DoorEntity } from "@src/door/entity";
export class ImageValidatorMonitor extends MbMonitorResponse<any>{

    getApiName(): string | string[] {
        return ["api/upload.api/_____tmd_____/puzzleCaptchaValidate","_____tmd_____/slide","_____tmd_____/gridConnectVerify"];
    }
    getKey(): string {
        return "image.validator";
    }

    public async getResponseData(response: Response): Promise<any> {
        const data = await response.json();
        if(data.success && data.code === 0 && data.dt === "success"){
            log.info("image validator success", data.result);
            return new DoorEntity<{}>(true, data.result as {});
        }
        log.error("image validator error", JSON.stringify(data));
        return new DoorEntity<{}>(false, {} as {});
    }

}
