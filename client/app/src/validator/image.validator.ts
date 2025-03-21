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
import { humanLikeDrag, humanLikeMouseMove, simulateHumanPresenceSimple, slideSlider } from "@src/door/utils/page.utils";

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
        if(!autoFlag){
            return;
        }
        if(validateUrl.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
            log.info("validateAction auto start");
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
        //     await validateByPuzzleCaptcha(page, frame);
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
async function validateByPuzzleCaptcha(page : Page, frame : Frame){
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
                  // log.info("humanLikeMouseMove startX ====", startX, "startY ====", startY);
                  // await humanLikeMouseMove(page, 233, 333, startX, startY);
                  let endX = startX + slideContent.data.px_distance; // 目标位置的 X 坐标
                  // await slideSlider(page, {x : startX, y : startY}, {x : endX, y : startY});
                  await simulateHumanPresenceSimple(page, sliderBox.x, sliderBox.y);
                  log.info("humanLikeDrag startX ====", startX, "startY ====", startY);
                  // await humanLikeDrag(page, startX, startY, endX, endY);
                  await slideSlider(page, {x : startX, y : startY}, {x : endX, y : startY});
              }
              // await humanLikeDragHorizontally(page, frame,"#puzzle-captcha-btn", slideContent.data.px_distance, {
              //     maxVerticalVariation: 2,
              //     speedVariation: 0.02,
              //     steps: 100
              // });
          }
      }
  }
}

async function moveCaptchaVerifyImgSlide(page : Page, startX : number, startY : number, endX : number, slideWidth : number){
        
        // 确保随机值在合理范围内
        const maxRandomOffset = Math.min(10, slideWidth * 0.1); // 最大随机偏移量，不超过滑块宽度的10%
        const randomEndNext = endX + Math.random() * maxRandomOffset; // 随机超出目标位置
        const randomEndPre = Math.max(startX + 5, endX - Math.random() * maxRandomOffset); // 随机回退位置，确保大于起始位置
        
        log.info("startX ====", startX, "startY ====", startY, "endX ====", endX);
        log.info("randomEndNext ====", randomEndNext, "randomEndPre ====", randomEndPre);
        
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
        log.info('Slider moved successfully with irregular pattern (X and Y axis) at 5x slower speed');
    // 增加完成后的等待时间
    await page.waitForTimeout(5000); // 从2000增加到5000
}


/**
 * 模拟人类行为的水平拖拽元素
 * @param page Playwright页面对象
 * @param sourceSelector 要拖拽的元素选择器
 * @param distance 移动距离
 * @param options 可选配置项
 */
async function humanLikeDragHorizontally(
    page: Page,
    frame: Frame,
    sourceSelector: string,
    distance: number,
    options: {
      // 拖拽过程中的最大垂直偏移（模拟人手不稳定）
      maxVerticalVariation?: number;
      // 拖拽速度变化（模拟人类加速减速）
      speedVariation?: number;
      // 拖拽步数（越高越平滑）
      steps?: number;
    } = {}
  ) {
    // 设置默认值
    const maxVerticalVariation = options.maxVerticalVariation ?? 5;
    const speedVariation = options.speedVariation ?? 0.3;
    const steps = options.steps ?? 20;
  
    // 获取源元素
    const sourceElement = await frame.$(sourceSelector);
    if (!sourceElement) {
      throw new Error(`未找到源元素: ${sourceSelector}`);
    }
  
    // 获取源元素的边界框
    const sourceBoundingBox = await sourceElement.boundingBox();
    if (!sourceBoundingBox) {
      throw new Error(`无法获取元素边界: ${sourceSelector}`);
    }
  
    // 计算源元素的中心点
    const sourceX = sourceBoundingBox.x + sourceBoundingBox.width / 2;
    const sourceY = sourceBoundingBox.y + sourceBoundingBox.height / 2;
  
    // 鼠标移动到源元素上并按下
    await page.mouse.move(sourceX, sourceY, { steps: 5 });
    
    // 短暂停顿，模拟人类思考
    await page.waitForTimeout(100 + Math.random() * 200);
    
    await page.mouse.down();
    
    // 短暂停顿，模拟人类准备拖动
    await page.waitForTimeout(50 + Math.random() * 100);
  
    
    // 模拟人类拖拽行为：不均匀的速度和微小的垂直偏移
    for (let i = 1; i <= steps; i++) {
      // 使用三次贝塞尔曲线模拟加速和减速
      // 开始慢，中间快，结束慢
      const progress = i / steps;
      const easeInOutCubic = progress < 0.5
        ? 4 * progress ** 3
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // 添加速度变化
      const speedFactor = 1 + (Math.random() * 2 - 1) * speedVariation;
      const currentProgress = Math.min(1, Math.max(0, easeInOutCubic * speedFactor));
      
      // 计算当前位置
      const currentX = sourceX + distance * currentProgress;
      
      // 添加微小的垂直偏移，模拟手部抖动
      const verticalVariation = (Math.random() * 2 - 1) * maxVerticalVariation;
      const currentY = sourceY + verticalVariation;
      
      // 移动鼠标
      await page.mouse.move(currentX, currentY, { steps: 1 });
      
      // 随机的微小延迟，模拟人类拖拽的不均匀性
      if (Math.random() < 0.2) {
        await page.waitForTimeout(Math.random() * 20);
      }
    }
  
    // 短暂停顿，模拟人类确认位置
    await page.waitForTimeout(50 + Math.random() * 100);
    
    // 释放鼠标
    await page.mouse.up();
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


 async function validateImage(validateItem : ValidateItem, autoFlag : boolean = false){
      const engine = new MbEngine(validateItem.resourceId, autoFlag);
      try{
          const page = await engine.init();
          const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource',"validate_image.html");
          const validateUrl = validateItem.validateUrl;
          if(page){
            let url = "file://" + sessionDirPath + "?iframeUrl=" + encodeBase64(validateUrl);
            const validateParams = validateItem.validateParams;
            if(validateParams){
                url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));
            }
            let result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, true);
            let validateNum = 0;
            while(!isValidateSuccess(result) && validateNum <=3 ){
                validateNum++;
                log.info("checkValidate error retry validate ", validateNum);
                engine.resetMonitor();
                engine.resetListener(page);
                result = await engine.openWaitMonitor(page, undefined, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, false);
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
            let result = await validateImage(validateItem, autoFlag);
            if(!isValidateSuccess(result) && autoFlag){
                result = await validateImage(validateItem, false);
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



