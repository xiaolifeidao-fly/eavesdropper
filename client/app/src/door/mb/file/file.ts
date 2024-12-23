import { FileData, MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";
import { MbEngine } from "../mb.engine";


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

export async function uploadFile(resourceId : number, paths: string[], sourceSkuId? : string){
    const mbEngine = new MbEngine(resourceId, false);
    try{
        const page = await mbEngine.init("https://qn.taobao.com/home.htm/sucai-tu/home");
        const monitor = new MbFileUploadMonitor(resourceId);
        monitor.setAllowRepeat(true);
        mbEngine.addMonitor(monitor);
        await monitor.start();
        const functionCode = new Function(code)();
        const result = await functionCode(page, {paths : paths}, undefined);
        console.log(result);
        const fileResult = await monitor.waitForAction();
        console.log(fileResult);
    }finally{
        await mbEngine.closePage();
    }
}