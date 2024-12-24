require('module-alias/register');

import {  InvokeType, Protocols } from "@eleapi/base";
import { uploadFile } from "@src/door/mb/file/file";

import { MbFileApi } from "@eleapi/door/file/mb.file";

export class MbFileApiImpl extends MbFileApi {

    @InvokeType(Protocols.INVOKE)
    async upload(resourceId : number, paths: string[]) {
        uploadFile(resourceId, paths,"");
    }
}

