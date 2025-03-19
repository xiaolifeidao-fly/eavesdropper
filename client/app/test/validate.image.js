const { chromium } = require('playwright');


async function getBrowser() {
    return await chromium.launch({
        headless: false,
        // slowMo: 100, // 增加操作延迟，更像人类
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--window-size=1280,800',
            '--start-maximized'
          ]
    });
}

const fs = require('fs');
const path = require('path');
async function getBrowserContext(){
    // 定义用户数据目录
  const userDataDir = path.join(__dirname, '../chrome-data1');
  
  // 确保目录存在
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  
  // 使用launchPersistentContext代替launch
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 30, // 增加操作延迟，更像人类
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    hasTouch: false,
    ignoreHTTPSErrors: true,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    permissions: ['geolocation'],
    bypassCSP: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,800',
      '--start-maximized'
    ]
  });
   // 基本的浏览器指纹伪装
   await context.addInitScript(() => {
    // 覆盖webdriver属性
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });
    
    // 伪装Chrome特有属性
    // @ts-ignore
    window.chrome = { runtime: {} };
  });
  return context;
}

(async () => {
    const browser = await getBrowser();
    // const context = await browser.newContext({
    //     bypassCSP: true,
    //     locale: 'zh-CN',
    //     screen: { width: 1280, height: 800 },
    //     storageState: '/Users/fly/Documents/develop/project/develop/private/eavesdropper/client/resource/session/mb/26/1742315460788.json',
    //     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    //     extraHTTPHeaders: {
    //       'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
    //       'sec-ch-ua-mobile': '?0',
    //       'sec-ch-ua-platform': '"macOS"'
    //     }
    // });
    // const context = await browser.newContext({
    //   bypassCSP: true,
    // });
    const page = await browser.newPage();
    await page.goto('file:///Users/fly/Documents/develop/project/develop/private/eavesdropper/client/resource/validate_image.html?iframeUrl=aHR0cHM6Ly9zdHJlYW0tdXBsb2FkLnRhb2Jhby5jb206NDQzLy9hcGkvdXBsb2FkLmFwaS9fX19fX3RtZF9fX19fL3B1bmlzaD94NXNlY2RhdGE9eGQyZjc3NzQyY2QxNTk5ZmQxNGQ5NDg0ODdhYTdlN2IzZDExNDU5Y2Y5ZWMxYTExNzgxNzQyMzcyNDU5YTE4NTUxNDQxMzhhMzcyNzU5NDAzYWJhYWMyZG4yMjE5NDg5MzU0NzUxamNhcHB1enpsZV9fYnhfX3N0cmVhbS11cGxvYWQudGFvYmFvLmNvbSUzQTQ0MyUyRmFwaSUyRnVwbG9hZC5hcGkmeDVzdGVwPTImYWN0aW9uPWNhcHRjaGFjYXBwdXp6bGUmcHVyZUNhcHRjaGE9');
    // const validateUrl = "https://error.item.taobao.com/error/noitem?itemid=811803022077";
    // const validateParams = {
    //     dialogSize : {
    //         "width" : 800,
    //         "height" : 800
    //     }
    //   }
    // let url = "file:///Users/fly/Documents/develop/project/develop/private/eavesdropper/client/resource/validate_image.html?iframeUrl=" + encodeBase64(validateUrl);
    // url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));

    await page.goto(url);
    await page.waitForTimeout(5000);
    const frame = await getFrame(page);
    // const slider = frame.locator("#nc_1_n1z").first(); // 选择要截图的元素
    // if (slider) {
    //     const sliderBox = await slider.boundingBox();
    //     console.log("sliderBox x ====", sliderBox);
    //     if(!sliderBox){
    //         return;
    //     }
    //     const trackBox = frame.locator("#nc_1__scale_text").first();
    //     const trackBoxBoundingBox = await trackBox.boundingBox();
    //     console.log("trackBoxBoundingBox ====", trackBoxBoundingBox);
    //     //随机5位小数 值为0.    
    //     const startX = sliderBox.x + sliderBox.width / 2;// 起始位置的 X 坐标
    //     const startY = sliderBox.y + sliderBox.height / 2; // 起始位置的 Y 坐标

    //     // 计算滑动距离 - 每次尝试使用略微不同的距离
    //     //生成5位随机小数
    //     const random = Math.random();
    //     const random5 = random.toFixed(5);

    //     let endX = trackBoxBoundingBox.x + trackBoxBoundingBox.width - 2 - random5;
    //     // 确保不会滑过头
    //     const distance = Math.max(10, Math.min(endX - startX, trackBoxBoundingBox.width * 0.95)) + 50;
    //     console.log("distance ====", distance);
    //     endX = startX + distance;
    //     await simulateHumanPresenceSimple(page, sliderBox.x, sliderBox.y);

    //     await slideSlider(page, {x: startX, y: startY}, {x: endX, y: startY});
    // }

    await validateByPuzzleCaptcha(page, frame);
    // await handleSliderVerificationInFrame(page, frame);
})();

function encodeBase64(str ) {
    return btoa(str);
}
async function getFrame(page) {
    const frame = await page.mainFrame();
    const childFrames = await frame.childFrames();
    for (const childFrame of childFrames) {
        const url = await childFrame.url();
        // if(url.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
        //     console.log("get from childFrame ", url);
        //     return child;
        // }
        if(url.includes("api/upload.api/_____tmd_____/punish")){
            console.log("get from childFrame ", url);
            return childFrame;
        }
    }
    for (const child of childFrames) {
        const childFrames = await child.childFrames();
        for (const childFrameChild of childFrames) {
            const url = await childFrameChild.url();
            if(url.includes("mtop.relationrecommend.wirelessrecommend.recommend")){
                console.log("get from childFrame ", url);
                return childFrameChild;
            }
        }
    }
    console.log("get from mainFrame ");
    return page.mainFrame();
}
const axios = require('axios');
const sharp = require('sharp');

async function validateByPuzzleCaptcha(page , frame){
    const element = frame.locator("#puzzle-captcha-question-img").first(); // 选择要截图的元素
    if (element) {
        const qrCodeFileName = "../test" + ".jpeg";
        const buffer = await element.screenshot({ path: qrCodeFileName}); // 保存截图
        const imageSharp = sharp(buffer);
        const boundingBox = await element.boundingBox();
        const width = boundingBox?.width;
        const height = boundingBox?.height;
        console.log("validate width ", width,  " height ", height);
        const imageBuffer = await imageSharp
        .resize(Number(width), Number(height)).toBuffer() // 设置宽高
        const imageBase64 = await convertImageToBase64WithHeader(imageBuffer);
        if(imageBase64){
            const slideContent = await getSlideContent(imageBase64);
            console.log("slideContent is ", slideContent);
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
                    const startX = sliderBox.x + sliderBox.width / 2; // 起始位置的 X 坐标
                    const startY = sliderBox.y + sliderBox.height / 2; // 起始位置的 Y 坐标
                    // console.log("humanLikeMouseMove startX ====", startX, "startY ====", startY);
                    // await humanLikeMouseMove(page, 233, 333, startX, startY);
                    let endX = startX + slideContent.data.px_distance; // 目标位置的 X 坐标
                    const endY = sliderBox.y + sliderBox.height / 2 + 0.123132;;
                    // await slideSlider(page, {x : startX, y : startY}, {x : endX, y : startY});
                    console.log("humanLikeDrag startX ====", startX, "startY ====", startY);
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

  async function getSlideContent(imageInfo) {
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

  
  async function convertImageToBase64WithHeader(imageInfo) {
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


/**
 * 处理iframe中的滑块验证 - 更高级的滑块处理策略
 */
async function handleSliderVerificationInFrame(page, frame) {
    try {
      console.log('开始处理iframe中的滑块验证...');
      
      // 设置为自动模式
      const useManualMode = false; 
      
      // 配置滑动参数 - 调整为更自然的滑动
      const slideOptions = {
        maxRetries: 3,                // 最大重试次数
        initialDelayBeforeSlide: 1000, // 滑动前的初始延迟，增加到1000ms
        jitterFactor: 0.8,            // 减少抖动系数
        pullbackEnabled: false,       // 关闭回拉功能！
        slowStartFactor: 0.2,         // 增加慢启动系数
        endSlowdownFactor: 0.3,       // 增加结束减速系数
        speedVariation: 0.15,         // 减少速度变化，让滑动更平滑
        randomPauseChance: 0.05,      // 减少随机暂停概率
        pauseDuration: [30, 100],     // 减少暂停持续时间
        overshootChance: 0,           // 禁用过冲功能
        reserveDistance: 5,           // 减少终点预留距离
        randomnessInDelay: 0.3        // 减少延迟随机性
      };
      
      // 截图记录验证前的状态
    //   await captureScreenshot(page, 'before-slider-verification');
      
      // 找到滑块元素
      const sliderSelectors = [
        '#nc_1_n1z', 
        '.slidetounlock', 
        '.nc-lang-cnt button',
        '.btn_slide',
        '.nc_iconfont',
        '#nc_1__scale_text'
      ];
      
      let slider = null;
      let sliderSelector = '';
      
      for (const selector of sliderSelectors) {
        const tempSlider = frame.locator(selector);
        if (await tempSlider.isVisible({ timeout: 1000 }).catch(() => false)) {
          slider = tempSlider;
          sliderSelector = selector;
          console.log(`找到滑块元素: ${sliderSelector}`);
          break;
        }
      }
      
      if (!slider) {
        console.error('无法在iframe中找到滑块元素');
        return;
      }
      
      // 截图记录找到滑块的状态
    //   await captureScreenshot(page, 'slider-found-in-iframe');
      
      // 获取滑块的位置和尺寸
      const sliderHandle = await slider.boundingBox();
      if (!sliderHandle) {
        console.error('无法获取iframe中滑块位置');
        return;
      }
      
      console.log('滑块位置信息:', sliderHandle);
      
      // 自动模式代码 - 简化版滑块自动化实现
      console.log('开始自动滑块验证 - 使用平滑轨迹策略...');
      // 在验证前，先进行模拟人类行为的随机操作，但减少操作次数
      await simulateHumanPresenceSimple(page, sliderHandle.x, sliderHandle.y);
      
      // 获取滑块的位置
      const startX = sliderHandle.x + sliderHandle.width / 2;
      const startY = sliderHandle.y + sliderHandle.height / 2;
      
      // 获取滑动轨道信息
      const trackSelectors = [
        '#nc_1__scale_text', 
        '.nc-lang-cnt', 
        '.slidetounlock',
        '.scale_text',
        '.nc_bg',
        '.nc_scale'
      ];
      
      let trackBox = null;
      for (const selector of trackSelectors) {
        const track = frame.locator(selector);
        if (await track.isVisible({ timeout: 1000 }).catch(() => false)) {
          trackBox = await track.boundingBox();
          if (trackBox) {
            console.log(`找到轨道元素: ${selector}`);
            break;
          }
        }
      }
      
      if (!trackBox) {
        // 如果找不到轨道，估算一个合理的滑动距离
        console.log('无法获取轨道信息，使用估算的滑动距离');
        trackBox = {
          x: sliderHandle.x,
          y: sliderHandle.y,
          width: 300, // 估算的轨道宽度
          height: sliderHandle.height
        };
      }
      
      // 初始化重试计数器
      let retryCount = 0;
      let verificationSuccess = false;
      
      // 尝试多次滑动，直到成功或达到最大尝试次数
      while (retryCount < slideOptions.maxRetries && !verificationSuccess) {
        try {
          // 计算滑动距离 - 每次尝试使用略微不同的距离
          const endX = trackBox.x + trackBox.width - sliderHandle.width - slideOptions.reserveDistance;
          // 确保不会滑过头
          const distance = Math.max(10, Math.min(endX - startX, trackBox.width * 0.95)) + 50;
          
          console.log(`尝试 ${retryCount + 1}/${slideOptions.maxRetries}: 滑块起始位置: (${startX}, ${startY}), 预计滑动距离: ${distance}px`);
          
          // 设置网络监听
          const requestResponses = [];
          const requestListener = (request) => {
            if (
              request.url().includes('captcha') || 
              request.url().includes('verify') || 
              request.url().includes('check')
            ) {
              console.log(`[监控] 滑块相关请求: ${request.url()}`);
              request.response().then((response) => {
                if (response) {
                  response.text().then((text) => {
                    requestResponses.push({
                      url: request.url(),
                      status: response.status(),
                      text: text
                    });
                    
                    // 尝试从响应中检测成功信号
                    if (
                      text.includes('success') && 
                      text.includes('true') && 
                      !text.includes('false')
                    ) {
                      console.log('⚡ 检测到成功响应:', request.url());
                      verificationSuccess = true;
                    }
                  }).catch(() => {});
                }
              }).catch(() => {});
            }
          };
          
          page.on('request', requestListener);
          
          // 添加随机初始延迟
          await randomDelay(
            slideOptions.initialDelayBeforeSlide * 0.8, 
            slideOptions.initialDelayBeforeSlide * 1.2
          );
  
          // 执行滑块滑动
          await slideSlider(page, { x: startX, y: startY }, { x: startX + distance, y: startY });
          
          console.log('滑块自动验证操作完成');
          
          // 等待验证结果
          await page.waitForTimeout(3000);
        //   await captureScreenshot(page, `after-auto-verification-attempt-${retryCount+1}`);
          
          // 移除请求监听器
          page.removeListener('request', requestListener);
          
          // 检查是否成功完成验证
          if (!verificationSuccess) {
            verificationSuccess = await checkVerificationResult(frame);
          }
          
          // 如果成功，退出循环
          if (verificationSuccess) {
            console.log(`✅ 第 ${retryCount + 1} 次尝试成功验证！`);
            break;
          } else {
            console.log(`❌ 第 ${retryCount + 1} 次尝试未能验证成功`);
            
            // 重试前的延迟
            const retryDelay = 1000 + retryCount * 1000;
            console.log(`等待 ${retryDelay}ms 后进行下一次尝试...`);
            await page.waitForTimeout(retryDelay);
            
            // 重置验证界面（如果有重试按钮）
            const resetSelectors = [
              'button.retry', 
              '.nc-lang-cnt', 
              'text=重试',
              'text=Try Again',
              'text=刷新',
              'text=重新验证'
            ];
            
            for (const selector of resetSelectors) {
              try {
                const resetBtn = frame.locator(selector);
                if (await resetBtn.isVisible({ timeout: 500 })) {
                  console.log(`找到重试按钮: ${selector}，点击重置`);
                  await resetBtn.click();
                  await page.waitForTimeout(1000);
                  break;
                }
              } catch (e) {
                // 忽略错误，继续尝试其他选择器
              }
            }
          }
          
        } catch (e) {
          console.error('滑动操作出错:', e);
        }
        
        retryCount++;
      }
      
      // 最终状态截图
    //   await captureScreenshot(page, 'final-verification-state');
      
    } catch (error) {
      console.error('iframe中滑块验证处理失败:', error);
    //   await captureScreenshot(page, 'slider-error');
    }
  }



async function moveCaptchaVerifyImgSlide(page, startX , startY , endX , slideWidth){
        
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
    console.log("endX ====", endX);
    await page.mouse.move(endX, startY); // 最终位置回到原始Y坐标
    await page.waitForTimeout(300); // 到达目标位置后短暂停顿
    await page.mouse.up(); // 释放鼠标
    console.log('Slider moved successfully with irregular pattern (X and Y axis) at 5x slower speed');
// 增加完成后的等待时间
await page.waitForTimeout(5000); // 从2000增加到5000
}



/**
 * 封装的滑块滑动函数 - 从起始位置滑动到目标位置
 * @param page Playwright页面对象
 * @param startPosition 起始位置坐标 {x, y}
 * @param endPosition 目标位置坐标 {x, y}
 * @returns 滑动操作是否成功完成
 */
async function slideSlider(
    page, 
    startPosition,
    endPosition
  ){
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
        currentX = Math.min(page.viewportSize().width - 1, currentX);
        currentY = Math.max(0, Math.min(page.viewportSize().height - 1, currentY));
        
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
   * 简化版人类行为模拟 - 减少可能被识别为机器人的行为
   */
  async function simulateHumanPresenceSimple(page, x , y) {
    console.log('[人类模拟] 执行验证前的随机操作...');
    
    // 在滑块附近随机移动鼠标 - 只做基本操作
    for (let i = 0; i < 2; i++) {
      const x = 400 + Math.random() * 200;
      const y = 400 + Math.random() * 100;
      await page.mouse.move(x, y);
      await randomDelay(100, 200);
    }
    
    // 随机等待一段时间，模拟人类阅读
    await randomDelay(500, 1000);
    
    console.log('[人类模拟] 随机操作完成，准备开始滑动验证');
  }
  
  /**
   * 生成简化的滑动轨迹，专注于平滑自然的移动，无回拉
   * @param distance 总滑动距离
   * @returns 移动轨迹点数组
   */
  function generateSimpleTrack(distance) {
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
  async function randomDelay(min, max) {
    const delay = Math.floor(min + Math.random() * (max - min));
    await new Promise(resolve => setTimeout(resolve, delay));
    return delay;
  }