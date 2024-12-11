require('module-alias/register');

import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { TestApi } from "@eleapi/test";
import { get, set } from "@src/store/local";
import { ipcMain } from "electron";
import log from "electron-log";


export class TestApiImpl extends TestApi { 

    
    @InvokeType(Protocols.INVOKE)
    async test(text: string, num: number) {
        try{
            set('username', 'john_doe');
            const username = get('username');  // 获取数据
            console.log('Username:', username);     // 输出: john_doe
        }catch(e){
            log.error(e);
        }
        this.send('onTest', text + num);
        return text + num
    }

}



