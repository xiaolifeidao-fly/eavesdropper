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
        log.info("validateAction try begin");
        const validateUrl = params[0];
        const validateParams = params[1];
        const autoFlag = params[2];
        let preResult = params[3];
        let retryCount = params[4];
        if(!autoFlag){
            log.info("手动验证模式 - 等待用户操作");
            return;
        }
        
        log.info(`自动验证模式开始处理: ${validateUrl.substring(0, 100)}... 重试次数: ${retryCount || 0}`);

        // 等待页面加载
        await page.waitForTimeout(2000);
        let frame = await getFrame(page);
        
        if(validateUrl.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
            log.info("识别到常规滑块验证码，开始处理");
            await validateByCaptcha(page, frame, preResult);
            log.info("常规滑块验证码处理完成");
            return;
        }
        
        if(!validateParams && validateUrl.includes("api/upload.api/_____tmd_____/punish")){
            log.info("识别到拼图验证码，开始处理");
            const verified = await validateByPuzzleCaptcha(page, frame, retryCount || 0);
            log.info(`拼图验证码处理结果: ${verified ? '成功' : '失败'}`);
            return;
        }

        log.info("未识别的验证码类型，跳过自动处理");
    } catch(error){
        log.error("validateAction处理错误", error);
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
    log.info("validateByPuzzleCaptcha =========== 调用");
  const element = frame.locator("#puzzle-captcha-question-img").first(); // 选择要截图的元素
  if (element) {
      const qrCodeFileName = uuidv4() + ".jpeg";
      const userDataPath = app.getPath('userData');
      const qrCodeFilePath = path.join(userDataPath,'resource','temp', qrCodeFileName);
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
                  
                  // 计算滑动距离 - 更智能的调整逻辑
                  let slideDistance = slideContent.data.px_distance;
                  // 基于重试次数的自适应距离调整策略
                  if (retryCount > 0) {
                    // 大范围调整策略（交替正负微调）
                    const adjustRange = retryCount * (1 + Math.random() * 0.5); // 范围随重试次数增加
                    
                    if (retryCount % 3 === 1) {
                      // 小幅减少距离
                      const reduction = 2 + adjustRange;
                      slideDistance = slideDistance - reduction;
                      log.info(`重试${retryCount}: 距离减少${reduction.toString()}`);
                    } else if (retryCount % 3 === 2) {
                      // 中幅增加距离
                      const increase = 3 + adjustRange * 1.2;
                      slideDistance = slideDistance + increase;
                      log.info(`重试${retryCount}: 距离增加${increase.toString()}`);
                    } else {
                      // 更精确的微调 - 在原距离附近随机波动
                      const variability = 5 + adjustRange * 0.8;
                      const fineAdjustment = (Math.random() * 2 - 1) * variability;
                      slideDistance = slideDistance + fineAdjustment;
                      log.info(`重试${retryCount}: 距离精确微调${fineAdjustment.toString()}`);
                    }
                  }
                  
                  let endX = startX + slideDistance; // 目标位置的 X 坐标
                  log.info("humanLikeDrag startX ====", startX, "startY ====", startY);
                  
                  // 执行滑动
                  await simulateHumanPresenceSimple(page, sliderBox.x, sliderBox.y);
                  
                  // 注意这里使用高级滑动函数
                  const speedFactor = Math.max (0.6, 1.0 - retryCount * 0.07);
                  await slideSliderV2(page, {x : startX, y : startY}, {x : endX, y : startY}, speedFactor);
                  
                  // 等待验证结果
                  await page.waitForTimeout(1500 + Math.random() * 500);
                  const verified = await checkVerificationResult(frame, page);
                  log.info(`验证结果: ${verified ? '成功' : '失败'}`);
                  
                  return verified;
              }
          }
      }
  }
  return false;
}

/**
 * 改进的验证结果检查函数，同时监控网络请求结果
 */
async function checkVerificationResult(frame: Frame, page: Page): Promise<boolean> {
  try {
    // 设置一个标志来跟踪是否收到失败请求
    let receivedFailRequest = false;
    let requestPromise: Promise<boolean> = new Promise((resolve) => {
      // 监控网络请求（有效期5秒）
      const timeout = setTimeout(() => resolve(false), 5000);
      
      // 设置临时请求监听器
      const onRequest = (request: any) => {
        const url = request.url();
        
        // 检查是否包含失败相关关键词
        if (url.includes('verifyFail') || 
            url.includes('reportCaptcha') || 
            url.includes('failed') || 
            (url.includes('report') && url.includes('type='))) {
          
          log.info(`⚠️ 检测到验证失败的网络请求: ${url}`);
          receivedFailRequest = true;
          clearTimeout(timeout);
          // @ts-ignore - 忽略类型错误
          page.removeListener('request', onRequest);
          resolve(false);
        }
        
        // 检查是否包含成功相关关键词
        if (url.includes('verifySuccess') || 
            url.includes('successReport')) {
          
          log.info(`✅ 检测到验证成功的网络请求: ${url}`);
          clearTimeout(timeout);
          // @ts-ignore - 忽略类型错误
          page.removeListener('request', onRequest);
          resolve(true);
        }
      };
      
      // @ts-ignore - 忽略类型错误
      page.on('request', onRequest);
    });
    
    // 1. 先检查网络请求，等待2秒
    const networkResult = await Promise.race([
      requestPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ]);
    
    // 如果网络请求明确表示失败，直接返回失败
    if (networkResult === false) {
      log.info('❌ 网络请求表明验证失败');
      return false;
    }
    
    // 2. 检查DOM元素
    // 成功提示可能的选择器
    const successSelectors = [
      'text=验证通过', 
      '.nc-result-icon-success',
      '.nc_success',
      'text=SUCCESS',
      'text=通过',
      '.icon-ok'
    ];
    
    // 错误提示可能的选择器
    const errorSelectors = [
      'text=验证失败', 
      '.nc-result-icon-error',
      '.nc_fail',
      'text=出错了',
      'text=重试',
      'text=FAIL',
      'text="再来一次"',
      'text="没有移到对应位置"',
      'text="请拖动滑块"',
      'text="请等待题目刷新"'
    ];
    
    // 检查是否成功
    let isSuccess = false;
    for (const selector of successSelectors) {
      try {
        isSuccess = await frame.locator(selector).isVisible({ timeout: 500 }).catch(() => false);
        if (isSuccess) {
          log.info(`找到成功选择器: ${selector}`);
          
          // 即使找到成功选择器，如果收到失败请求，仍然判定为失败
          if (receivedFailRequest) {
            log.info('⚠️ 虽然页面显示成功，但网络请求表明失败，判定为失败');
            return false;
          }
          
          // 网络请求明确成功 或 没有失败请求则认为成功
          if (networkResult === true || !receivedFailRequest) {
            return true;
          }
        }
      } catch (e) {
        // 忽略错误，继续检查其他选择器
      }
    }
    
    // 检查是否失败
    let isFailed = false;
    if (!isSuccess) {
      for (const selector of errorSelectors) {
        try {
          isFailed = await frame.locator(selector).isVisible({ timeout: 500 }).catch(() => false);
          if (isFailed) {
            log.info(`找到失败选择器: ${selector}`);
            return false;
          }
        } catch (e) {
          // 忽略错误，继续检查其他选择器
        }
      }
    }
    
    // 3. 检查DOM内的文本判断
    try {
      const frameContent = await frame.content();
      const successTexts = ['验证通过', '验证成功', 'success', '成功'];
      const failTexts = ['验证失败', '失败', 'fail', '出错', 'error', '没有移到对应位置'];
      
      for (const text of successTexts) {
        if (frameContent.includes(text)) {
          log.info(`在页面内容中发现成功文本: "${text}"`);
          
          // 即使页面内容显示成功，如果收到失败请求，仍然判定为失败
          if (receivedFailRequest) {
            log.info('⚠️ 虽然页面内容显示成功，但网络请求表明失败，判定为失败');
            return false;
          }
          
          return true;
        }
      }
      
      for (const text of failTexts) {
        if (frameContent.includes(text)) {
          log.info(`在页面内容中发现失败文本: "${text}"`);
          return false;
        }
      }
    } catch (e) {
      log.info('获取页面内容失败:', e);
    }
    
    // 如果网络请求表明成功，则返回成功
    if (networkResult === true) {
      return true;
    }
    
    // 默认返回未确定，此时认为失败，需要重试
    log.info('⚠️ 无法确定验证结果，将视为失败并重试');
    return false;
  } catch (e) {
    log.error('检查验证结果时出错:', e);
    return false;
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
          const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource',"html","validate_image.html");
          const validateUrl = validateItem.validateUrl;
          if(page){
            log.info(`开始验证，自动模式: ${autoFlag}, 最大重试次数: ${retryCount}`);
            
            let url = "file://" + sessionDirPath + "?iframeUrl=" + encodeBase64(validateUrl);
            const validateParams = validateItem.validateParams;
            if(validateParams && Object.keys(validateParams).length > 0){
                url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));
            }
            
            log.info(`加载验证页面: ${url.substring(0, 100)}...`);
            let result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, true);
            let validateNum = 0;
            while(!isValidateSuccess(result) && validateNum < retryCount){
                validateNum++;
                log.info(`验证失败，尝试第 ${validateNum}/${retryCount} 次重试`);
                
                // 等待一段时间，让验证码刷新
                await page.waitForTimeout(2000);
                
                engine.resetMonitor();
                engine.resetListener(page);
                result = await engine.openWaitMonitor(page, undefined, new ImageValidatorMonitor(), {}, validateAction, validateUrl, validateParams, autoFlag, false, validateNum);
            }
            
            if (isValidateSuccess(result)) {
                log.info(`验证成功，总共尝试 ${validateNum + 1} 次`);
            } else {
                log.info(`验证最终失败，尝试了 ${validateNum + 1} 次`);
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
            log.info(`接收到验证请求: ${url.substring(0, 100)}...`);
            
            let autoFlag = true;
            if(url.includes("mtop.relationrecommend.wirelessrecommend.recommend") ||
               url.includes("api/upload.api/_____tmd_____/punish")){
                autoFlag = true;
                log.info("检测到可自动验证的URL类型");
            }
            
            log.info(`验证模式: ${autoFlag ? '自动' : '手动'}`);
            
            // 先尝试自动验证
            let result = await validateImage(validateItem, autoFlag, 3);
            
            // 如果自动验证失败且原本设置为自动，降级为手动
            if(!isValidateSuccess(result) && autoFlag){
                log.info("自动验证失败，降级为手动验证模式");
                result = await validateImage(validateItem, false, 1);
            }
            
            if(result && isValidateSuccess(result)){
                log.info("验证最终成功，返回成功结果");
                validateItem.resolve(result.getHeaderData(), true);
            }else{
                log.info("验证最终失败，返回失败结果");
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



