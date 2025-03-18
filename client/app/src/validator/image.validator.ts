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
     console.log(header);
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

 /**
 * 封装的滑块滑动函数 - 从起始位置滑动到目标位置
 * @param page Playwright页面对象
 * @param startPosition 起始位置坐标 {x, y}
 * @param endPosition 目标位置坐标 {x, y}
 * @returns 滑动操作是否成功完成
 */
export async function slideSlider(
    page: Page, 
    startPosition: { x: number, y: number }, 
    endPosition: { x: number, y: number }
  ): Promise<boolean> {
    try {
      console.log(`执行滑块滑动: 从(${startPosition.x}, ${startPosition.y}) 滑动到 (${endPosition.x}, ${endPosition.y})`);
      
      // 计算滑动距离
      const distance = endPosition.x - startPosition.x;
      
      if (distance <= 0) {
        console.error('滑动距离必须为正值');
        return false;
      }
      
      // 使用简化版轨迹生成算法
      const moveTrack = generateSimpleTrack(distance);
      console.log(`生成了 ${moveTrack.length} 个移动点`);
      
      // 开始滑动操作
      console.log('开始执行滑动操作...');
      
      // 直接移动到滑块位置
      await page.mouse.move(startPosition.x, startPosition.y, { steps: 5 });
      await randomDelay(300, 500);
      await page.mouse.down();
      await randomDelay(100, 200);
      
      // 执行移动轨迹
      let currentX = startPosition.x;
      let currentY = startPosition.y;
      let totalDelay = 0;
      
      for (const [index, point] of moveTrack.entries()) {
        // 移动到新位置
        currentX += point.xOffset;
        currentY += point.yOffset;
        
        // 确保只有正向移动
        currentX = Math.max(startPosition.x, currentX);
        
        // 检查范围，确保不会移出屏幕
        currentX = Math.min(page.viewportSize()!.width - 1, currentX);
        currentY = Math.max(0, Math.min(page.viewportSize()!.height - 1, currentY));
        
        const options = index === 0 ? { steps: 1 } : {};
        await page.mouse.move(currentX, currentY, options);
        
        // 确保最后几步的延迟更长，以展示减速效果
        let delay;
        if (index > moveTrack.length * 0.8) {
          delay = 30 + Math.random() * 20;
        } else {
          delay = point.delay;
        }
        
        await page.waitForTimeout(delay);
        totalDelay += delay;
      }
      
      console.log(`滑动轨迹执行完成，总耗时: ${totalDelay}ms`);
      
      // 确保最终位置接近目标但不过头
      const finalPosition = Math.min(endPosition.x - 2, currentX);
      await page.mouse.move(finalPosition, currentY, { steps: 3 });
      await randomDelay(200, 300);
      
      // 松开鼠标
      await page.mouse.up();
      
      return true;
    } catch (error) {
      console.error('滑动操作失败:', error);
      return false;
    }
  }
  
  /**
 * 生成简化的滑动轨迹，专注于平滑自然的移动，无回拉
 * @param distance 总滑动距离
 * @returns 移动轨迹点数组
 */
function generateSimpleTrack(distance: number) {
    // 使用更简单的轨迹生成算法，确保滑动平滑且不回拉
    const track = [];
    const totalSteps = 40 + Math.floor(Math.random() * 10); // 40-50步
    
    // 使用正弦加速度模型
    for (let i = 0; i < totalSteps; i++) {
      const ratio = i / totalSteps;
      
      // 使用正弦函数创建加速-减速曲线
      const acceleration = Math.sin(ratio * Math.PI);
      const stepDistance = (distance / totalSteps) * acceleration * 1.5;
      
      // 确保步进值始终为正（向前移动）
      const xOffset = Math.max(0.5, stepDistance);
      
      // 添加很小的垂直抖动
      const yOffset = (Math.random() * 2 - 1) * 0.8;
      
      // 计算合适的延迟 - 开始和结束时较慢，中间较快
      let delay;
      if (ratio < 0.2 || ratio > 0.8) {
        delay = 25 + Math.random() * 15; // 较慢
      } else {
        delay = 15 + Math.random() * 10; // 较快
      }
      
      track.push({
        xOffset,
        yOffset,
        delay
      });
    }
    
    // 确保末尾没有回拉操作，最后几步都是向前的小步移动
    for (let i = 0; i < 4; i++) {
      track.push({
        xOffset: 1.0 + Math.random() * 0.5, // 小幅向前移动
        yOffset: (Math.random() * 2 - 1) * 0.3, // 几乎不做垂直移动
        delay: 40 + Math.random() * 30 // 较长的延迟，模拟减速
      });
    }
    
    return track;
  }

  /**
 * 随机延迟函数
 * @param min 最小延迟(ms)
 * @param max 最大延迟(ms)
 */
async function randomDelay(min: number, max: number) {
    const delay = Math.floor(min + Math.random() * (max - min));
    await new Promise(resolve => setTimeout(resolve, delay));
    return delay;
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

async function validateAction(page : Page, ...params : any[]){
    // try{
    //     const validateUrl = params[0];
    //     const validateParams = params[1];
    //     if(validateUrl.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
    //         return;
    //     }
    //     if(validateParams){
    //         return;
    //     }
    //     let frame = await getFrame(page);
    //     const element = frame.locator("#puzzle-captcha-question-img").first(); // 选择要截图的元素
    //     if (element) {
    //         const qrCodeFileName = uuidv4() + ".jpeg";
    //         const qrCodeFilePath = path.join(path.dirname(app.getAppPath()),'resource','temp', qrCodeFileName);
    //         const buffer = await element.screenshot({ path: qrCodeFilePath}); // 保存截图
    //         const imageSharp = sharp(buffer);
    //         const boundingBox = await element.boundingBox();
    //         const width = boundingBox?.width;
    //         const height = boundingBox?.height;
    //         log.info("validate width ", width,  " height ", height);
    //         const imageBuffer = await imageSharp
    //         .resize(Number(width), Number(height)).toBuffer() // 设置宽高
    //         const imageBase64 = await convertImageToBase64WithHeader(imageBuffer);
    //         if(imageBase64){
    //             const slideContent = await getSlideContent(imageBase64);
    //             log.info("slideContent is ", slideContent);
    //             if (slideContent && slideContent.code == 200){
    //                 console.log("slideContent.data.px_distance ====", slideContent.data.px_distance);
    //                 // const slider = await frame.locator('#puzzle-captcha-btn').first();
    //                 // if (slider) {
    //                 //     const sliderBox = await slider.boundingBox();
    //                 //     console.log("sliderBox x ====", sliderBox);
    //                 //     if(!sliderBox){
    //                 //         return;
    //                 //     }
    //                 //     //随机5位小数 值为0.    
    //                 //     const startX = sliderBox.x + sliderBox.width / 2 + 0.123122; // 起始位置的 X 坐标
    //                 //     const startY = sliderBox.y + sliderBox.height / 2 + 0.323122; // 起始位置的 Y 坐标
    //                 //     let endX = startX + slideContent.data.px_distance; // 目标位置的 X 坐标
    //                 //     await slideSlider(page, {x : startX, y : startY}, {x : endX, y : startY});
    //                 // }                
    //                 await moveCaptchaVerifyImgSlide(page, frame, slideContent.data.px_distance);
    //                 // await humanLikeDragHorizontally(page, frame,"#puzzle-captcha-btn", slideContent.data.px_distance, {
    //                 //     maxVerticalVariation: 2,
    //                 //     speedVariation: 0.02,
    //                 //     steps: 100
    //                 // });
    //             }
    //         }
          
    //     }
    // }catch(error){
    //     log.error("openLoginPageAction error", error);
    // }
}

async function moveCaptchaVerifyImgSlide(page : Page, frame : Frame, distance : number){
    const slider = await frame.locator('#puzzle-captcha-btn').first();
    if (slider) {
        const sliderBox = await slider.boundingBox();
        console.log("sliderBox x ====", sliderBox);
        if(!sliderBox){
            return;
        }
        const startX = sliderBox.x + sliderBox.width / 2 + 0.23244; // 起始位置的 X 坐标
        const startY = sliderBox.y + sliderBox.height / 2 + 0.25244; // 起始位置的 Y 坐标
        let endX = startX + distance; // 目标位置的 X 坐标
        
        // 确保随机值在合理范围内
        const maxRandomOffset = Math.min(10, sliderBox.width * 0.1); // 最大随机偏移量，不超过滑块宽度的10%
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
    }
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
      console.log('Base64 Image with Header:', mimeType);
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



function checkValidate(){
    setInterval(async () => {
        const validateItem = validateQueueProcessor.take();
        if(validateItem){
            const engine = new MbEngine(validateItem.resourceId, false);
            try{
                const page = await engine.init();
                const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource',"validate_image.html");
            if(page){
                let url = "file://" + sessionDirPath + "?iframeUrl=" + encodeBase64(validateItem.validateUrl);
                const validateParams = validateItem.validateParams;
                if(validateParams){
                    url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));
                }
                let result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor(), {}, validateAction, validateItem.validateUrl, validateParams);
                let validateNum = 0;
                while(!isValidateSuccess(result) && validateNum <=3 ){
                    validateNum++;
                    log.info("checkValidate error retry validate ", validateNum);
                    engine.resetMonitor();
                    result = await engine.openWaitMonitor(page, undefined, new ImageValidatorMonitor(), {}, validateAction, validateItem.validateUrl, validateParams);
                }
                if(isValidateSuccess(result)){
                    validateItem.resolve(result.getHeaderData(), true);
                }else{
                    validateItem.resolve({}, false);
                }
            }
            } catch(error){
                log.error("checkValidate error", error);
                validateItem.resolve({}, false);
            }finally{
                engine.closePage();
            }
        }   
    }, 1000);
}


function isValidateSuccess(result : DoorEntity<any>){
    if(!result || !result.getCode()){
        return false;
    }
    return true;
}



