import { MbEngine } from "@src/door/mb/mb.engine";
import { ImageValidatorMonitor } from "@src/door/monitor/mb/validate/image.validator";
import { BrowserView, session } from "electron";
import path from "path";
import log from "electron-log"
import { DoorEntity } from "@src/door/entity";
import { Frame, Page } from "playwright-core";
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
import axios from "axios";
import { slideSliderV2, simulateHumanPresenceSimple, slideSlider } from "@src/door/utils/page.utils";

const {app, BrowserWindow } = require('electron');

const createBrowserView = async (resourceId : number, header : {[key:string]:any}, validateUrl : string)=>{
    const sessionInstance = session.fromPartition(`persist:-validate-image-session`, { cache: true });
    await sessionInstance.clearData();
    // const cookieData = header["cookie"].split(';');
    // for(let cookieItem of cookieData){
    //     const cookieItemData = cookieItem.split('=');
    //     await sessionInstance.cookies.set({
    //         url: "https://stream-upload.taobao.com",
    //         name: cookieItemData[0].trim(),
    //         value: cookieItemData[1].trim(),
    //     });
    // }
     // 修改请求头
     log.info(header);
     sessionInstance.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['Referer'] = validateUrl;
        details.requestHeaders['Sec-Fetch-Dest'] = 'image';
        details.requestHeaders['Sec-Fetch-Mode'] = 'no-cors';
        details.requestHeaders['Sec-Fetch-Site'] = 'same-site';
        details.requestHeaders['sec-ch-ua-mobile'] = header["sec-ch-ua-mobile"];
        details.requestHeaders['sec-ch-ua-platform'] = header["sec-ch-ua-platform"];
        details.requestHeaders['sec-ch-ua'] = header["sec-ch-ua"];
        details.requestHeaders['user-agent'] = header['user-agent'];
        details.requestHeaders['cookie'] = header["cookie"];
        callback({ requestHeaders: details.requestHeaders });
    });

    // 创建 BrowserView
    // const browserView = new BrowserView({
    //     webPreferences: {
    //         session: sessionInstance
    //     }
    // });
    // 将 BrowserView 附加到主窗口
    // browserView.webContents.loadURL(validateUrl);
    const windowInstance = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
          session: sessionInstance,
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          webviewTag: true, // 启用 webview 标签
          webSecurity: false,
          nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
        }
      });
    // windowInstance.webContents.openDevTools();
    windowInstance.loadURL(validateUrl);
    // windowInstance.addBrowserView(browserView);
 }

class ValidateItem {
    waitResolve: (value: {header: {[key:string]:any}, result: boolean}) => void = () => {};
    waitPromise: Promise<{header: {[key:string]:any}, result: boolean}>;
    resourceId: number;
    header: {[key:string]:any};
    validateUrl: string;
    validateParams: { [key: string]: any } | undefined;
   
    constructor(resourceId: number, header: {[key:string]:any}, validateUrl: string, validateParams: { [key: string]: any } | undefined){
        this.resourceId = resourceId;
        this.header = header;
        this.validateUrl = validateUrl;
        this.validateParams = validateParams;
        this.waitPromise = new Promise<{header: {[key:string]:any}, result: boolean}>((resolve) => {
            this.waitResolve = resolve;
        });
    }

    public resolve(header: {[key:string]:any}, value: boolean){
        const result = {
            header : header,
            result : value
        }
        this.waitResolve(result);
    }

    public async wait(){
        return await this.waitPromise;
    }

}

class ValidateQueueProcessor {
    private queue: ValidateItem[] = [];
    private waiting: ((value: ValidateItem) => void)[] = [];

    // 非阻塞的 put 方法
    public put(item: ValidateItem): void {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            if (resolve) {
                resolve(item);
            }
        } else {
            this.queue.push(item);
        }
    }

    // 阻塞的 take 方法
    public take(): ValidateItem|undefined {
        if (this.queue.length > 0) {
            return this.queue.shift();
        }
        return undefined;
    }
}
const validateQueueProcessor = new ValidateQueueProcessor();

async function waitTimes(times : number){
    return await new Promise((resolve) => {
        setTimeout(resolve, times);
    });
}

export async function validate(resourceId : number, header : {[key:string]:any}, validateUrl : string, validateParams : { [key: string]: any } | undefined){
    const validateItem = new ValidateItem(resourceId, header, validateUrl, validateParams);
    validateQueueProcessor.put(validateItem);
    return await validateItem.wait();
}

checkValidate();

function encodeBase64(str : string) {
    return btoa(str);
}

async function getFrame(page: Page) {
    const frame = await page.mainFrame();
    const childFrames = await frame.childFrames();
    for (const child of childFrames) {
        const url = await child.url();
        if(url.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
            log.info("get from childFrame ", url);
            return child;
        }
        if(url.includes("api/upload.api/_____tmd_____/punish")){
            log.info("get from childFrame ", url);
            return child;
        }
    }
    log.info("get from mainFrame ");
    return page.mainFrame();
}

async function validateAction(page : Page, ...params : any[]){
    try{
        const validateUrl = params[0];
        const validateParams = params[1];
        const autoFlag = params[2];
        let preResult = params[3];
        let retryCount = params[4];
        if(!autoFlag){
            return;
        }
        if(validateUrl.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
            log.info("validateAction auto start");
            await page.waitForTimeout(3000);
            let frame = await getFrame(page);
            await validateByCaptcha(page, frame, preResult);
            log.info("validateAction auto end");
            return;
        }
        if(validateParams){
            return;
        }
        // if(validateUrl.includes("api/upload.api/_____tmd_____/punish")){
        //     let frame = await getFrame(page);
        //     await validateByPuzzleCaptcha(page, frame, retryCount);
        // }

    }catch(error){
        log.error("openLoginPageAction error", error);
    }
}


async function validateByCaptcha(page : Page, frame : Frame, preResult : boolean = true){
  if(!preResult){
      const errorLoading = frame.locator("#nc_1_wrapper .errloading").first();
      if (await errorLoading.isVisible({ timeout: 1000 })) {
        log.info("validateByCaptcha click errLoading found");
        await errorLoading.click();
        await page.waitForTimeout(3000);
      }else{
        log.info("validateByCaptcha click errLoading not found");
      }
  }

  const slider = frame.locator("#nc_1_n1z").first(); // 选择要截图的元素
  if (slider) {
      const sliderBox = await slider.boundingBox();
      log.info("sliderBox x ====", sliderBox);
      if(!sliderBox){
          return;
      }
      const trackBox = frame.locator("#nc_1__scale_text").first();
      const trackBoxBoundingBox = await trackBox.boundingBox();
      log.info("trackBoxBoundingBox ====", trackBoxBoundingBox);
      if(!trackBoxBoundingBox){
          return;
      }
      //随机5位小数 值为0.    
      const startX = sliderBox.x + sliderBox.width / 2;// 起始位置的 X 坐标
      const startY = sliderBox.y + sliderBox.height / 2; // 起始位置的 Y 坐标

      // 计算滑动距离 - 每次尝试使用略微不同的距离
      //生成5位随机小数
      const random = Math.random();
      const random5 = random.toFixed(5);

      let endX = trackBoxBoundingBox.x + trackBoxBoundingBox.width - 2 - parseFloat(random5);
      // 确保不会滑过头
      const distance = Math.max(10, Math.min(endX - startX, trackBoxBoundingBox.width * 0.95)) + 50;
      log.info("distance ====", distance);
      endX = startX + distance;
      await simulateHumanPresenceSimple(page, sliderBox.x, sliderBox.y);

      await slideSlider(page, {x: startX, y: startY}, {x: endX, y: startY});
  }
}
async function validateByPuzzleCaptcha(page : Page, frame : Frame, retryCount : number = 0){
  const element = frame.locator("#puzzle-captcha-question-img").first(); // 选择要截图的元素
  if (element) {
      const qrCodeFileName = uuidv4() + ".jpeg";
      const qrCodeFilePath = path.join(path.dirname(app.getAppPath()),'resource','temp', qrCodeFileName);
      const buffer = await element.screenshot({ path: qrCodeFilePath}); // 保存截图
      const imageSharp = sharp(buffer);
      const boundingBox = await element.boundingBox();
      const width = boundingBox?.width;
      const height = boundingBox?.height;
      log.info("validate width ", width,  " height ", height);
      const imageBuffer = await imageSharp
      .resize(Number(width), Number(height)).toBuffer() // 设置宽高
      const imageBase64 = await convertImageToBase64WithHeader(imageBuffer);
      if(imageBase64){
          const slideContent = await getSlideContent(imageBase64);
          log.info("slideContent is ", slideContent);
          if (slideContent && slideContent.code == 200){
              log.info("slideContent.data.px_distance ====", slideContent.data.px_distance);
              const slider = await frame.locator('#puzzle-captcha-btn').first();
              if (slider) {
                  const sliderBox = await slider.boundingBox();
                  log.info("sliderBox x ====", sliderBox);
                  if(!sliderBox){
                      return;
                  }
                  
                  //随机5位小数 值为0.    
                  const startX = sliderBox.x + sliderBox.width / 2;
                  const startY = sliderBox.y + sliderBox.height / 2;
                  let endX = startX + slideContent.data.px_distance; // 目标位置的 X 坐标
                  log.info("humanLikeDrag startX ====", startX, "startY ====", startY);
                  const speedFactor = Math.max (0.6, 1.0 - retryCount * 0.07);
                  await slideSliderV2(page, {x : startX, y : startY}, {x : endX, y : startY});
              }
          }
      }
  }
}

async function convertImageToBase64WithHeader(imageInfo : Buffer<ArrayBufferLike>) {
    try {
      const mimeType = "image/jpeg";
      log.info('Base64 Image with Header:', mimeType);
      // 转换为 Base64 编码
      const base64Image = imageInfo.toString('base64');
      return `data:${mimeType};base64,${base64Image}`;
    } catch (err) {
      console.error('Error:', err);
    }
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


 async function validateImage(validateItem : ValidateItem, autoFlag : boolean = false, retryCount : number = 2){
      const engine = new MbEngine(validateItem.resourceId, autoFlag);
      try{
          const page = await engine.init();
          const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource',"validate_image.html");
          const validateUrl = validateItem.validateUrl;
          if(page){
            let url = "file://" + sessionDirPath + "?iframeUrl=" + encodeBase64(validateUrl);
            const validateParams = validateItem.validateParams;
            if(validateParams && Object.keys(validateParams).length > 0){
                url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));
            }
            let result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, true);
            let validateNum = 0;
            while(!isValidateSuccess(result) && validateNum <=retryCount ){
                validateNum++;
                log.info("checkValidate error retry validate ", validateNum);
                engine.resetMonitor();
                engine.resetListener(page);
                result = await engine.openWaitMonitor(page, undefined, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, false, validateNum);
            }
            return result;
        }
      } catch(error){
          log.error("checkValidate error", error);
          validateItem.resolve({}, false);
          return undefined;
      }finally{
          engine.closePage();
      }
 }


function checkValidate(){
    setInterval(async () => {
        const validateItem = validateQueueProcessor.take();
        if(validateItem){
            const url = validateItem.validateUrl; 
            let autoFlag = false;
            if(url.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
                autoFlag = true;
            }
            log.info("validateImage autoFlag ", autoFlag);
            let result = await validateImage(validateItem, autoFlag, 1);
            if(!isValidateSuccess(result) && autoFlag){
                result = await validateImage(validateItem, false, 2);
            }
            if(result && isValidateSuccess(result)){
                validateItem.resolve(result.getHeaderData(), true);
            }else{
                validateItem.resolve({}, false);
            }
        }   
    }, 1000);
}


function isValidateSuccess(result : DoorEntity<any>|undefined){
    if(!result){
        return false;
    }
    if(!result.getCode()){
        return false;
    }
    return true;
}



