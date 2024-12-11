require('module-alias/register');

import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { TestApi } from "@eleapi/test";
import { ipcMain } from "electron";
import log from "electron-log";


export class TestApiImpl extends TestApi { 

    
    @InvokeType(Protocols.INVOKE)
    test(text: string, num: number): string {
        this.send('onTest', text + num);
        return text + num
    }

}



