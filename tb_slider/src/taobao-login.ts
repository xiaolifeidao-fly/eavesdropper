import { chromium, Page, Frame, FrameLocator } from 'playwright';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 淘宝登录自动化工具
 * 实现功能：
 * 1. 自动打开淘宝登录页面
 * 2. 输入用户名和密码
 * 3. 检测并处理滑块验证码
 */
async function loginTaobao() {
  // 定义用户数据目录
  const userDataDir = path.join(__dirname, '../chrome-data');
  
  // 确保目录存在
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  
  // 使用launchPersistentContext代替launch
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 100, // 增加操作延迟，更像人类
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    hasTouch: false,
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

  try {
    // 开启网络监听功能 - 简化版
    await context.route('**/*', async route => {
      const request = route.request();
      
      // 监听与验证相关的请求
      if (request.url().includes('captcha') || request.url().includes('verify') || request.url().includes('check')) {
        console.log(`发现验证相关请求: ${request.url()}`);
        console.log(`请求方法: ${request.method()}`);
        
        try {
          const postData = request.postData();
          if (postData) {
            console.log(`请求数据: ${postData}`);
          }
        } catch (e) {
          console.log(`无法获取请求数据: ${e}`);
        }
      }
      
      // 继续请求
      await route.continue();
    });
    
    // 获取页面内JavaScript错误
    context.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`页面错误: ${msg.text()}`);
      }
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
    
    const page = await context.newPage();
    
    // 随机延迟和鼠标移动，增加真实性
    async function randomDelay(min = 100, max = 1000) {
      const delay = Math.floor(Math.random() * (max - min)) + min;
      await page.waitForTimeout(delay);
    }
    
    async function moveMouseRandomly() {
      const randomX = Math.random() * page.viewportSize()!.width;
      const randomY = Math.random() * page.viewportSize()!.height;
      await page.mouse.move(randomX, randomY);
      await randomDelay(50, 200);
    }
    
    // 添加随机鼠标移动和延迟
    for (let i = 0; i < 3; i++) {
      await moveMouseRandomly();
    }

    // 添加一个函数来尝试多种URL获取登录页面
    async function tryLoadLoginPage(page: Page) {
      // 尝试不同的登录URL列表
      const loginUrls = [
        'https://login.taobao.com/member/login.jhtml',
        'https://login.taobao.com',
        'https://h5.m.taobao.com/mlapp/login.html',
        'https://world.taobao.com/markets/all/login'
      ];
      
      let pageLoaded = false;
      
      // 依次尝试不同URL
      for (const url of loginUrls) {
        try {
          console.log(`尝试打开登录页面: ${url}`);
          
          // 打开指定的URL
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          
          // 等待页面渲染完成
          await page.waitForTimeout(3000);
          
          // 尝试查找登录表单元素
          const usernameField = await page.locator('#fm-login-id, input[name="fm-login-id"], input[type="text"]').first().isVisible().catch(() => false);
          
          // 截图保存
          await captureScreenshot(page, `login-try-${url.replace(/[^a-zA-Z0-9]/g, '-')}`);
          
          if (usernameField) {
            console.log(`✅ 成功在 ${url} 找到登录表单`);
            pageLoaded = true;
            break;
          } else {
            console.log(`❌ 在 ${url} 中未找到登录表单`);
          }
        } catch (error) {
          console.error(`访问 ${url} 时出错:`, error);
        }
      }
      
      return pageLoaded;
    }

    // 1. 打开淘宝登录页面, 增加等待时间确保页面完全加载
    console.log('正在打开淘宝登录页面...');

    // 尝试多种方式加载登录页面
    const loginSuccess = await tryLoadLoginPage(page);

    if (!loginSuccess) {
      console.log('尝试所有URL均未找到登录表单，将使用默认URL');
      await page.goto('https://login.taobao.com/member/login.jhtml', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
    }

    // 页面加载后等待更长时间，确保所有元素都渲染完成
    await page.waitForTimeout(5000);
    
    // 尝试滚动页面，确保所有内容加载
    await page.evaluate(() => {
      window.scrollTo(0, 100);
      setTimeout(() => window.scrollTo(0, 0), 300);
    });
    
    // 等待DOM完全稳定
    await page.waitForSelector('body', { state: 'attached', timeout: 10000 });
    
    // 尝试点击页面的某个区域，激活页面
    try {
      await page.mouse.click(640, 400);
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('尝试点击页面激活:', e);
    }
    
    // 随机延迟，模拟真实阅读页面的时间
    await randomDelay(2000, 5000);
    
    // 再做一些随机鼠标移动
    for (let i = 0; i < 4; i++) {
      await moveMouseRandomly();
    }
    
    // 截图保存当前页面状态
    await captureScreenshot(page, 'login-page-fixed');
    
    // 如果仍然看不到登录表单，尝试直接定位登录元素并截图
    const usernameInputExists = await page.locator('#fm-login-id').isVisible().catch(() => false);
    console.log(`用户名输入框是否可见: ${usernameInputExists}`);
    
    if (!usernameInputExists) {
      console.log('尝试切换到扫码登录...');
      const qrCodeSuccess = await tryQrCodeLogin(page);
      
      if (qrCodeSuccess) {
        console.log('已成功切换到扫码登录，请扫描二维码');
        // 等待足够长的时间给用户扫码
        await page.waitForTimeout(30000);
      } else {
        console.log('尝试查找替代的登录元素...');
        
        // 查找可能的替代登录元素
        const possibleLoginElements = [
          '#login-form',
          '.login-form',
          '.login-box',
          '.fm-field',
          'input[type="text"]',
          'button.submit'
        ];
        
        for (const selector of possibleLoginElements) {
          const elementVisible = await page.locator(selector).isVisible().catch(() => false);
          if (elementVisible) {
            console.log(`找到可见元素: ${selector}`);
            await captureScreenshot(page, `found-element-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
          }
        }
        
        // 输出页面源码以供调试
        const pageContent = await page.content();
        console.log('页面HTML长度:', pageContent.length);
      }
    }

    // 2. 输入用户名和密码
    console.log('正在输入用户名和密码...');
    
    // 使用指定的选择器和手机号
    const usernameInput = page.locator('#fm-login-id');
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill('18817353434');
    
    const passwordInput = page.locator('#fm-login-password');
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill('18817353434');
    
    // 截图保存输入完成状态
    await captureScreenshot(page, 'credentials-filled');
    
    // 3. 点击登录按钮，直到出现滑块验证码
    console.log('点击登录按钮，等待滑块验证码出现...');
    let sliderFound = false;
    let attempts = 0;
    const maxAttempts = 10; // 最大尝试次数

    // 使用指定的选择器点击登录按钮
    while (!sliderFound && attempts < maxAttempts) {
      attempts++;
      console.log(`尝试登录 (${attempts}/${maxAttempts})...`);
      
      // 尝试多种可能的登录按钮选择器
      try {
        // 选择器列表，按优先级尝试
        const loginButtonSelectors = [
          'button[type="submit"][tabindex="3"][class="fm-button fm-submit password-login  button-low-light"]',
          'button.fm-button.fm-submit.password-login',
          'button[type="submit"]',
          '.fm-button'
        ];
        
        let buttonClicked = false;
        for (const selector of loginButtonSelectors) {
          const loginButton = page.locator(selector);
          if (await loginButton.count() > 0) {
            console.log(`找到登录按钮: ${selector}`);
            await loginButton.first().click();
            buttonClicked = true;
            break;
          }
        }
        
        if (!buttonClicked) {
          console.log('未找到任何登录按钮，尝试截图分析页面');
          await captureScreenshot(page, `login-attempt-${attempts}`);
          // 尝试使用坐标点击
          await page.mouse.click(500, 500); // 尝试点击页面中央
        }
      } catch (e: any) {
        console.log(`点击登录按钮失败: ${e.message}`);
        await captureScreenshot(page, `login-error-${attempts}`);
      }
      
      // 等待一段时间，看滑块是否出现
      await page.waitForTimeout(3000);
      
      // 检查滑块是否出现 - 使用多种可能的ID
      try {
        // 可能的滑块选择器列表
        const sliderSelectors = ['#nc_1_n1z', '.nc-lang-cnt', '.nc_iconfont'];
        
        for (const selector of sliderSelectors) {
          const slider = page.locator(selector);
          const isVisible = await slider.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`滑块验证码已出现！找到选择器: ${selector}`);
            await captureScreenshot(page, 'slider-found');
            sliderFound = true;
            
            // 处理滑块验证
            await handleSliderVerification(page);
            break;
          }
        }
        
        if (!sliderFound) {
          // 检查是否有iframe
          const frames = page.frames();
          console.log(`检测到 ${frames.length} 个frames`);
          
          for (const frame of frames) {
            try {
              const url = frame.url();
              console.log(`检查frame: ${url}`);
              
              for (const selector of sliderSelectors) {
                const slider = frame.locator(selector);
                const isVisible = await slider.isVisible({ timeout: 1000 }).catch(() => false);
                
                if (isVisible) {
                  console.log(`在frame中找到滑块: ${url}, 选择器: ${selector}`);
                  await captureScreenshot(page, 'slider-in-frame-found');
                  sliderFound = true;
                  
                  // 处理iframe中的滑块验证
                  await handleSliderVerificationInFrame(page, frame);
                  break;
                }
              }
              
              if (sliderFound) break;
            } catch (e: any) {
              console.log(`检查frame失败: ${e.message}`);
            }
          }
        }
      } catch (e: any) {
        console.log(`检查滑块失败: ${e.message}`);
        await captureScreenshot(page, `slider-check-error-${attempts}`);
      }
      
      if (!sliderFound) {
        console.log('未找到滑块，继续尝试...');
      }
    }

    if (!sliderFound) {
      console.error('达到最大尝试次数，未能触发滑块验证码');
      await captureScreenshot(page, 'final-state-no-slider');
    }
    
    // 最后等待一段时间，查看结果
    await page.waitForTimeout(10000);
    await captureScreenshot(page, 'final-state');
    
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭浏览器
    await context.close();
  }
}

/**
 * 处理滑块验证
 */
async function handleSliderVerification(page: Page) {
  try {
    console.log('开始处理滑块验证...');
    
    // 找到滑块元素 - 使用指定的ID
    const sliderSelectors = ['#nc_1_n1z', '.slidetounlock', '.nc-lang-cnt button'];
    let slider = null;
    let sliderSelector = '';
    
    for (const selector of sliderSelectors) {
      const tempSlider = page.locator(selector);
      if (await tempSlider.isVisible({ timeout: 1000 }).catch(() => false)) {
        slider = tempSlider;
        sliderSelector = selector;
        break;
      }
    }
    
    if (!slider) {
      console.error('无法找到滑块元素');
      return;
    }
    
    console.log(`找到滑块元素: ${sliderSelector}`);
    
    // 等待滑块元素可见
    await slider.waitFor({ state: 'visible', timeout: 5000 });
    
    // 获取滑块的位置和尺寸
    const sliderHandle = await slider.boundingBox();
    if (!sliderHandle) {
      console.error('无法获取滑块位置');
      await captureScreenshot(page, 'slider-no-bounds');
      return;
    }
    
    // 获取轨道长度
    const trackSelectors = ['#nc_1__scale_text', '.nc-lang-cnt', '.slidetounlock'];
    let track = null;
    let trackSelector = '';
    
    for (const selector of trackSelectors) {
      const tempTrack = page.locator(selector);
      if (await tempTrack.isVisible({ timeout: 1000 }).catch(() => false)) {
        track = tempTrack;
        trackSelector = selector;
        break;
      }
    }
    
    if (!track) {
      console.error('无法找到轨道元素');
      return;
    }
    
    console.log(`找到轨道元素: ${trackSelector}`);
    
    const trackBox = await track.boundingBox();
    if (!trackBox) {
      console.error('无法获取轨道位置');
      await captureScreenshot(page, 'track-no-bounds');
      return;
    }
    
    // 计算拖动的距离
    const startX = sliderHandle.x + sliderHandle.width / 2;
    const startY = sliderHandle.y + sliderHandle.height / 2;
    const endX = trackBox.x + trackBox.width - 10; // 轨道终点位置，减去一些边距
    const distance = endX - startX;
    
    console.log(`滑块起始位置: (${startX}, ${startY}), 拖动距离: ${distance}px`);
    
    // 模拟人类拖动滑块的行为
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(300);
    await page.mouse.down();
    
    // 非线性多步拖动，模拟人类行为
    const steps = 40; // 增加步数使运动更平滑
    for (let i = 1; i <= steps; i++) {
      // 使用三次贝塞尔曲线模拟人类拖动特性
      // 前半段加速，后半段减速
      let progress = i / steps;
      let currentDistance;
      
      if (progress < 0.5) {
        // 加速阶段
        currentDistance = distance * (progress * progress * 2);
      } else {
        // 减速阶段
        progress = progress - 0.5;
        currentDistance = distance * (0.5 + progress * (1 - progress));
      }
      
      // 添加随机性，模拟手抖
      const xOffset = Math.random() * 2 - 1; // -1到1之间的随机数
      const yOffset = Math.random() * 2 - 1; // -1到1之间的随机数
      
      await page.mouse.move(startX + currentDistance + xOffset, startY + yOffset);
      
      // 随机延迟，增加真实性
      // 在开始和结束时移动更慢
      let delay;
      if (i < 5 || i > steps - 5) {
        delay = Math.random() * 20 + 15; // 15-35ms
      } else {
        delay = Math.random() * 8 + 5;   // 5-13ms
      }
      await page.waitForTimeout(delay);
    }
    
    // 确保滑块到达终点
    await page.mouse.move(endX, startY);
    await page.waitForTimeout(300);
    await page.mouse.up();
    
    console.log('滑块验证完成');
    await captureScreenshot(page, 'slider-completed');
    
    // 等待验证结果
    await page.waitForTimeout(3000);
    await captureScreenshot(page, 'after-slider-verification');
    
  } catch (error) {
    console.error('滑块验证处理失败:', error);
    await captureScreenshot(page, 'slider-error');
  }
}

/**
 * 处理iframe中的滑块验证 - 更高级的滑块处理策略
 */
async function handleSliderVerificationInFrame(page: Page, frame: Frame) {
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
    await captureScreenshot(page, 'before-slider-verification');
    
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
    await captureScreenshot(page, 'slider-found-in-iframe');
    
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
    await simulateHumanPresenceSimple(page, frame);
    
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
        const requestResponses: any[] = [];
        const requestListener = (request: any) => {
          if (
            request.url().includes('captcha') || 
            request.url().includes('verify') || 
            request.url().includes('check')
          ) {
            console.log(`[监控] 滑块相关请求: ${request.url()}`);
            request.response().then((response: any) => {
              if (response) {
                response.text().then((text: string) => {
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
        
        // 使用简化版轨迹生成算法
        const moveTrack = generateSimpleTrack(distance);
        console.log(`生成了 ${moveTrack.length} 个移动点`);
        
        // 开始滑动操作
        console.log('开始执行滑动操作...');
        
        // 直接移动到滑块位置
        await page.mouse.move(startX, startY, { steps: 5 });
        await randomDelay(300, 500);
        await page.mouse.down();
        await randomDelay(100, 200);
        
        // 执行移动轨迹
        let currentX = startX;
        let currentY = startY;
        let totalDelay = 0;
        
        for (const [index, point] of moveTrack.entries()) {
          // 移动到新位置
          currentX += point.xOffset;
          currentY += point.yOffset;
          
          // 确保只有正向移动
          currentX = Math.max(startX, currentX);
          
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
        const finalPosition = Math.min(endX - 2, currentX);
        await page.mouse.move(finalPosition, currentY, { steps: 3 });
        await randomDelay(200, 300);
        
        // 松开鼠标
        await page.mouse.up();
        
        console.log('滑块自动验证操作完成');
        
        // 等待验证结果
        await page.waitForTimeout(3000);
        await captureScreenshot(page, `after-auto-verification-attempt-${retryCount+1}`);
        
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
    await captureScreenshot(page, 'final-verification-state');
    
  } catch (error) {
    console.error('iframe中滑块验证处理失败:', error);
    await captureScreenshot(page, 'slider-error');
  }
}

/**
 * 简化版人类行为模拟 - 减少可能被识别为机器人的行为
 */
async function simulateHumanPresenceSimple(page: Page, frame: Frame) {
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
 * 检查验证是否成功
 */
async function checkVerificationResult(frame: Frame): Promise<boolean> {
  try {
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
      'text="再来一次"'
    ];
    
    // 检查是否成功
    let isSuccess = false;
    for (const selector of successSelectors) {
      try {
        isSuccess = await frame.locator(selector).isVisible({ timeout: 500 });
        if (isSuccess) {
          console.log(`验证成功，匹配选择器: ${selector}`);
          return true;
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
          isFailed = await frame.locator(selector).isVisible({ timeout: 500 });
          if (isFailed) {
            console.log(`验证失败，匹配选择器: ${selector}`);
            return false;
          }
        } catch (e) {
          // 忽略错误，继续检查其他选择器
        }
      }
    }
    
    // 检查DOM内的文本判断
    try {
      const frameContent = await frame.content();
      const successTexts = ['验证通过', '验证成功', 'success', '成功'];
      const failTexts = ['验证失败', '失败', 'fail', '出错', 'error'];
      
      for (const text of successTexts) {
        if (frameContent.includes(text)) {
          console.log(`在页面内容中发现成功文本: "${text}"`);
          return true;
        }
      }
      
      for (const text of failTexts) {
        if (frameContent.includes(text)) {
          console.log(`在页面内容中发现失败文本: "${text}"`);
          return false;
        }
      }
    } catch (e) {
      console.log('获取页面内容失败:', e);
    }
    
    // 默认返回未确定
    console.log('⚠️ 无法确定验证结果');
    return false;
  } catch (e) {
    console.error('检查验证结果时出错:', e);
    return false;
  }
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

/**
 * 截图并保存
 */
async function captureScreenshot(page: Page, name: string) {
  try {
    // 确保目录存在
    const dir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 保存截图
    const screenshotPath = path.join(dir, `${name}-${new Date().getTime()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`截图已保存: ${screenshotPath}`);
  } catch (e: any) {
    console.error(`截图失败: ${e.message}`);
  }
}

// 添加扫码登录的选项
async function tryQrCodeLogin(page: Page) {
  console.log('尝试切换到扫码登录方式...');
  
  // 可能的QR码登录按钮选择器
  const qrCodeSelectors = [
    'a[class*="qrcode-login"], a[href*="qrcode"]',
    'a.login-switch',
    'li.login-switch-item',
    'div[data-status="qrcode"]',
    'i.iconfont-qrcode',
    '.icon-qrcode',
    '.qrcode-login-icon'
  ];
  
  // 截图记录当前状态
  await captureScreenshot(page, 'before-finding-qrcode');
  
  // 查找并点击QR码登录按钮
  for (const selector of qrCodeSelectors) {
    try {
      const qrButton = page.locator(selector);
      const isVisible = await qrButton.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`找到扫码登录按钮: ${selector}`);
        await qrButton.click();
        console.log('已点击扫码登录按钮');
        
        // 等待QR码显示
        await page.waitForTimeout(3000);
        await captureScreenshot(page, 'after-click-qrcode');
        
        // 尝试检查QR码图像是否已加载
        const qrImageSelectors = [
          'img[alt*="qrcode"], img[class*="qrcode"]',
          'canvas.qrcode',
          '.qrcode-img',
          '.qrcode-panel img',
          'img[src*="qr"]'
        ];
        
        for (const imgSelector of qrImageSelectors) {
          const qrImage = page.locator(imgSelector);
          if (await qrImage.isVisible().catch(() => false)) {
            console.log(`成功找到扫码图像: ${imgSelector}`);
            await captureScreenshot(page, 'qrcode-image-found');
            return true;
          }
        }
      }
    } catch (error) {
      console.log(`尝试切换到扫码登录时出错:`, error);
    }
  }
  
  console.log('未能找到扫码登录选项');
  return false;
}

// 执行登录
loginTaobao().catch(error => {
  console.error('运行出错:', error);
  process.exit(1);
}); 