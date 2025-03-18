import { getFileKey, MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";
import { MbEngine } from "../mb.engine";
import { getDoorFileRecordByKey } from "@api/door/file.api";
import { getSkuFiles } from "@api/sku/sku.file";


const code = `

let result = {
    code: false,
    data: null,
}
class FileUpload {


    constructor(page, params){
        this.page = page;
        this.params = params;
    }

    async getFileUploadButton(){
        console.log("start getFileUploadButton")
        const elements = await this.page.locator('.next-btn.next-medium.next-btn-primary').all();
        for(let element of elements){
            const buttonText = await element.innerText();
            if(buttonText === "上传文件"){
                return element;
            }
        }
        return undefined;
    }

    async openUploadPage(){
        let fileUploadButton = await this.getFileUploadButton(this.page);
        if(!fileUploadButton){
            await this.page.waitForTimeout(5000);
            fileUploadButton = await this.getFileUploadButton(this.page);
            if(!fileUploadButton){
                return false;
            }
        }
        await fileUploadButton.click();
        await this.page.waitForTimeout(1500);
        return true;
    }

    async gotoUploadButton(){
        const fileUploadButtons = await this.page.locator('.next-btn.next-medium.next-btn-primary.next-btn-text').all();
        if(!fileUploadButtons){
            return false;
        }
        for(let fileUploadButton of fileUploadButtons){
            const buttonText = await fileUploadButton.innerText();
            if(buttonText === "继续上传"){
                await fileUploadButton.click();
                await this.page.waitForTimeout(1500);
                return true;
            }
        }
        return false;
    }

    async openFileUpload(){
        const target = await this.page.locator('#sucai-tu-upload');
        if(!target){
            return false;
        }
        await target.click();
        await this.page.waitForTimeout(1500);
        return true;
    }

    async doHandler(preResult){
        const openResult = await this.openUploadPage(this.page);
        if(!openResult){
            return result;
        }
        await this.openFileUpload();
    }
}

return async function doHandler(page, params, preResult){
    page.on('filechooser', async fileChooser => {
        await fileChooser.setFiles(params.paths);
        await page.waitForTimeout(3000);
    });
    return await new FileUpload(page, params).doHandler(preResult);
}

`

export async function getUnUploadFile(source : string, resourceId : number, paths: string[]){
    const unUploadFiles = [];
    for(let path of paths){
        // const fileKey = getFileKey(path);
        // const doorFileRecord = await getDoorFileRecordByKey(source, resourceId, fileKey);
        // if(doorFileRecord){
        //     continue;
        // }
        unUploadFiles.push(path);
    }
    return unUploadFiles;
}


export async function uploadFile(resourceId : number, skuItemId : string, paths: string[], monitor : MbFileUploadMonitor){
    const unUploadFiles = await getUnUploadFile(monitor.getType(), resourceId, paths);
    if(unUploadFiles.length === 0){
        const skuFiles = await getSkuFiles(skuItemId, resourceId);
        return skuFiles;
    }
    const mbEngine = new MbEngine(resourceId, false);
    const page = await mbEngine.init("https://qn.taobao.com/home.htm/sucai-tu/home");
    try{
        monitor.setAllowRepeat(true);
        mbEngine.addMonitor(monitor);
        await monitor.start();
        const functionCode = new Function(code)();
        const filePathList = [];
        for(let path of unUploadFiles){
            filePathList.push(path);
        }
        await functionCode(page, {paths : filePathList}, undefined);
        for(let path of unUploadFiles){
            await monitor.waitForAction();
        }
        const skuFiles = await getSkuFiles(skuItemId, resourceId);
        return skuFiles;
    }finally{
        if(page){
            console.log("page upload finished")
            await page.waitForTimeout(5000);
            // await mbEngine.closePage();
        }
    }
}

