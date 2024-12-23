
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
        const elements = await this.page.locator('.next-btn.next-medium.next-btn-primary');
        for(let element of elements){
            const buttonText = await element.innerText();
            console.log(buttonText);
            if(buttonText === "上传文件"){
                return element;
            }
        }
        return undefined;
    }

    async openUploadPage(){
        const fileUploadButton = await this.getFileUploadButton(this.page);
        if(!fileUploadButton){
            return false;
        }
        await fileUploadButton.click();
        await this.page.waitForTimeout(1500);
        return true;
    }

    async gotoUploadButton(){
        const fileUploadButtons = await this.page.locator('.next-btn.next-medium.next-btn-primary.next-btn-text');
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

    async moveToFileUpload(){
        const target = await this.page.locator('#sucai-tu-upload-target');
        if(!target){
            return false;
        }
        await page.dragAndDrop("/Users/fly/Downloads/test/1.jpeg", target);
        await this.page.waitForTimeout(1500);
        return true;
    }

    async doHandler(preResult){
        const openResult = await this.openUploadPage(this.page);
        if(!openResult){
            return result;
        }
        await moveToFileUpload();
    }
}

async function doHandler(page, params, preResult){
    return await new FileUpload(page, params).doHandler(preResult);
}
