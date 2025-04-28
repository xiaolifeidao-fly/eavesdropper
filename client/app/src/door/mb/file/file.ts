import { getFileKey, MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";
import { MbEngine } from "../mb.engine";
import { getDoorFileRecordByKey } from "@api/door/file.api";
import { getSkuFiles } from "@api/sku/sku.file";
import { Frame, Locator, Page } from "playwright-core";
import { humanLikeDrag, humanLikeMouseMove } from "@src/door/utils/page.utils";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import sharp from "sharp";
import axios from "axios";
import log from "electron-log";
import { app } from "electron";



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
    for(let filePath of paths){
        const testFileUpload = process.env.TEST_FILE_UPLOAD;
        if (testFileUpload && testFileUpload === "true"){
            unUploadFiles.push(filePath);
            continue;
        }
        let fileName = path.basename(filePath);
        const fileKey = getFileKey(fileName);
        const doorFileRecord = await getDoorFileRecordByKey(source, resourceId, fileKey);
        if(doorFileRecord){
            continue;
        }
        unUploadFiles.push(filePath);
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
            monitor.waitForAction();
        }
        if(page){
            await page.waitForTimeout(10000);
            await validateFile(page);
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


async function moveCaptchaVerifyImgSlide(page : Page, startX : number, startY : number, endX : number, slideWidth : number){
        
    // 确保随机值在合理范围内
    const maxRandomOffset = Math.min(10, slideWidth * 0.1); // 最大随机偏移量，不超过滑块宽度的10%
    const randomEndNext = endX + Math.random() * maxRandomOffset; // 随机超出目标位置
    const randomEndPre = Math.max(startX + 5, endX - Math.random() * maxRandomOffset); // 随机回退位置，确保大于起始位置
    
    console.log("startX ====", startX, "startY ====", startY, "endX ====", endX);
    console.log("randomEndNext ====", randomEndNext, "randomEndPre ====", randomEndPre);
    
    // 增加初始等待时间，模拟人类思考
    await page.waitForTimeout(500);
    await page.mouse.move(startX, startY); // 移动到起始点
    await page.waitForTimeout(300); // 短暂停顿后再按下
    await page.mouse.down(); // 按住鼠标左键
    await page.waitForTimeout(200); // 按下后短暂停顿
    
    // 增加步数使移动更平滑
    const steps = 25; // 总步数增加为原来的2倍
    
    // 第一阶段：加速移动到随机超出点
    const firstStageSteps = Math.floor(steps * 0.6); // 60%的步数用于第一阶段
    for (let i = 0; i < firstStageSteps; i++) {
        // 使用缓动函数模拟加速
        const progress = i / firstStageSteps;
        // 使用三次方缓动，使加速更加平缓
        const easeProgress = progress * progress * (3 - 2 * progress);
        const x = startX + (randomEndNext - startX) * easeProgress;
        
        // 添加Y轴上下浮动，范围在0-1像素之间
        const yOffset = (Math.random() - 0.5) * 2; // 生成-1到1之间的随机值
        
        await page.mouse.move(x, startY + yOffset);
        // 延迟时间增加5倍
        await page.waitForTimeout(Math.random() * 25 + 25); // 随机延迟，模拟人类移动速度不均匀
    }
    
    // 第二阶段：回退到随机回退点
    const secondStageSteps = Math.floor(steps * 0.2); // 20%的步数用于第二阶段
    for (let i = 0; i < secondStageSteps; i++) {
        const progress = i / secondStageSteps;
        // 使用缓动函数使回退更自然
        const easeProgress = progress * (2 - progress);
        const x = randomEndNext - (randomEndNext - randomEndPre) * easeProgress;
        
        // 添加Y轴上下浮动，范围在0-1像素之间，回退阶段稍微增加波动
        const yOffset = (Math.random() - 0.5) * 2.2; // 生成-1.1到1.1之间的随机值
        
        await page.mouse.move(x, startY + yOffset);
        // 延迟时间增加5倍
        await page.waitForTimeout(Math.random() * 50 + 50); // 回退时速度更慢
    }
    
    // 第三阶段：精确移动到目标位置
    const thirdStageSteps = steps - firstStageSteps - secondStageSteps;
    for (let i = 0; i < thirdStageSteps; i++) {
        const progress = i / thirdStageSteps;
        // 使用缓动函数使精确移动更自然
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        const x = randomEndPre + (endX - randomEndPre) * easeProgress;
        
        // 添加Y轴上下浮动，精确阶段减小波动
        const yOffset = (Math.random() - 0.5) * 1.5; // 生成-0.75到0.75之间的随机值
        
        await page.mouse.move(x, startY + yOffset);
        // 延迟时间增加5倍
        await page.waitForTimeout(Math.random() * 75 + 75); // 精确调整时速度更慢
    }
    
    // 最后确保精确到达目标位置
    log.info("endX ====", endX);
    await page.mouse.move(endX, startY); // 最终位置回到原始Y坐标
    await page.waitForTimeout(300); // 到达目标位置后短暂停顿
    await page.mouse.up(); // 释放鼠标
    console.log('Slider moved successfully with irregular pattern (X and Y axis) at 5x slower speed');
// 增加完成后的等待时间
await page.waitForTimeout(5000); // 从2000增加到5000
}

async function getFrame(page: Page) {
    const frame = await page.mainFrame();
    for (const child of frame.childFrames()) {
        const url = await child.url();
        if(url.includes("api/upload.api/_____tmd_____/punish")){
            log.info("get from childFrame ", url);
            return child;
        }
    }
    log.info("get from mainFrame ");
    return page.mainFrame();
}

async function getImageBase64ByScreenshot(page : Page, element : Locator){
    const boundingBox = await element.boundingBox();
    const width = boundingBox?.width;
    const height = boundingBox?.height;
    const qrCodeFileName = uuidv4() + ".jpeg";
    const qrCodeFilePath = path.join(path.dirname(app.getAppPath()),'resource','temp', qrCodeFileName);
    const buffer = await element.screenshot({ path: qrCodeFilePath}); // 保存截图
    const imageSharp = sharp(buffer);
    log.info("validate width ", width,  " height ", height);
    const imageBuffer = await imageSharp
    .resize(Number(width), Number(height)).toBuffer() // 设置宽高
    const imageBase64 = await convertImageToBase64WithHeader(imageBuffer);
    return imageBase64;
}

async function getImageBase64ByLocator(page : Page, frame : Frame, locator : Locator){
    const puzzleCaptchaPuzzle = await frame.locator(".puzzle-captcha-puzzle").first();
    const puzzleCaptchaPuzzleImage = await puzzleCaptchaPuzzle.locator("img").first();
    const puzzleCaptchaPuzzleImageSrc = await puzzleCaptchaPuzzleImage.getAttribute("src");
    const puzzleCaptchaQuestionImg = await frame.locator("#puzzle-captcha-question-img").first();
    const puzzleCaptchaQuestionImgSrc = await puzzleCaptchaQuestionImg.getAttribute("src");
    const offsetInfo = await puzzleCaptchaPuzzle.evaluate((el) => {
        return {
            top : el.offsetTop,
            left : el.offsetLeft
        }
    });
    if(!puzzleCaptchaPuzzleImageSrc || !puzzleCaptchaQuestionImgSrc){
        return null;
    }
    return await generalImage(puzzleCaptchaPuzzleImageSrc, puzzleCaptchaQuestionImgSrc, offsetInfo.left, offsetInfo.top);
}

async function mergeImage(littleImageBase64 : string, bigImageBase64 : string, embedX : number, embedY : number){
    const littleImageBuffer = await base64ToSharpBuffer(littleImageBase64);
    const bigImageBuffer = await base64ToSharpBuffer(bigImageBase64);
    log.info("littleImageBuffer ====", littleImageBuffer);
    log.info("bigImageBuffer ====", bigImageBuffer);
    const result = await sharp(bigImageBuffer).composite([
        {
        input: littleImageBuffer,
        top: embedY,
        left: embedX
        }
    ]).toBuffer();
    return  result;
}   

async function generalImage(littleImageBase64 : string, bigImageBase64 : string, embedX : number, embedY : number){
    const result = await mergeImage(littleImageBase64, bigImageBase64, embedX, embedY);
    const base64Image = await convertImageToBase64WithHeader(result);
    return base64Image;
}


async function validateFile(page : Page){
    let frame = await getFrame(page);
        const element = frame.locator("#puzzle-captcha-question-img").first(); // 选择要截图的元素
        if (element) {
            const imageBase64 = await getImageBase64ByLocator(page, frame, element);
            if(imageBase64){
                const slideContent = await getSlideContent(imageBase64);
                log.info("slideContent is ", slideContent);
                if (slideContent && slideContent.code == 200){
                    console.log("slideContent.data.px_distance ====", slideContent.data.px_distance);
                    const slider = await frame.locator('#puzzle-captcha-btn').first();
                    if (slider) {
                        const sliderBox = await slider.boundingBox();
                        console.log("sliderBox x ====", sliderBox);
                        if(!sliderBox){
                            return;
                        }
                        
                        //随机5位小数 值为0.    
                        const startX = sliderBox.x + sliderBox.width / 2 + 0.123122; // 起始位置的 X 坐标
                        const startY = sliderBox.y + sliderBox.height / 2 + 0.323122; // 起始位置的 Y 坐标
                        log.info("humanLikeMouseMove startX ====", startX, "startY ====", startY);
                        await humanLikeMouseMove(page, 233, 333, startX, startY);
                        let endX = startX + slideContent.data.px_distance; // 目标位置的 X 坐标
                        const endY = sliderBox.y + sliderBox.height / 2 + 0.123132;;
                        // await slideSlider(page, {x : startX, y : startY}, {x : endX, y : startY});
                        log.info("humanLikeDrag startX ====", startX, "startY ====", startY);
                        await humanLikeDrag(page, startX, startY, endX, endY);
                        // await moveCaptchaVerifyImgSlide(page, startX, startY, endX, sliderBox.width);
                    }
                    // await moveCaptchaVerifyImgSlide(page, frame, slideContent.data.px_distance);
                    // await humanLikeDragHorizontally(page, frame,"#puzzle-captcha-btn", slideContent.data.px_distance, {
                    //     maxVerticalVariation: 2,
                    //     speedVariation: 0.02,
                    //     steps: 100
                    // });
                }
            }
          
        }
}


async function convertImageToBase64WithHeader(imageInfo : Buffer<ArrayBufferLike>) {
    try {
      const mimeType = "image/jpeg";
      console.log('Base64 Image with Header:', mimeType);
      // 转换为 Base64 编码
      const base64Image = imageInfo.toString('base64');
      return `data:${mimeType};base64,${base64Image}`;
    } catch (err) {
      console.error('Error:', err);
    }
  }

  // 基础转换
async function base64ToSharpBuffer(base64String : string) {
    // 移除 base64 的 header (例如 "data:image/jpeg;base64,")
    const base64Image = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // 转换 base64 为 buffer
    return Buffer.from(base64Image, 'base64');
}

async function getSlideContent(imageInfo : string) {
    try {
      const response = await axios.post('http://www.detayun.cn/openapi/verify_code_identify/', {
        key: 'nULF2C3SE5oy8My8dfF8',
        verify_idf_id: '56',
        img_base64:imageInfo
      });
      return response.data;
    } catch (err) {
      console.error('Error:', err);
    }
  }
