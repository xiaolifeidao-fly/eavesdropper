
import {  InvokeType, Protocols } from "@eleapi/base";
import { uploadFile } from "@src/door/mb/file/file";

import { MbFileApi } from "@eleapi/door/file/mb.file";
import { MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";

export class MbFileApiImpl extends MbFileApi {


    @InvokeType(Protocols.INVOKE)
    async upload(resourceId : number, paths: string[]) {
        // return await uploadFile(resourceId, paths, new MbFileUploadMonitor(resourceId));
    }
}

