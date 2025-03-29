import { chromium, Page, Frame, FrameLocator } from 'playwright';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import sharp from 'sharp';

// 添加到文件顶部，其他import语句之后
interface Window {
  webkitAudioContext?: AudioContext;
}

/**
 * 淘宝登录自动化工具
 * 实现功能：
 * 1. 自动打开本地验证页面
 * 2. 获取验证码图片
 * 3. 请求打码平台计算滑动距离
 * 4. 执行滑块验证
 * 5. 失败时自动等待刷新并重试
 */
async function loginTaobao() {
  // 定义用户数据目录
  const userDataDir = path.join(__dirname, '../chrome-data/chrome-data-' + Math.floor(Math.random() * 1000));
  
  // 确保目录存在
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  
  // 随机化viewport尺寸，更真实
  const viewportWidth = 1280 + Math.floor(Math.random() * 200);
  const viewportHeight = 780 + Math.floor(Math.random() * 120);
  
  // 使用launchPersistentContext代替launch，增强隐身性
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, // 修改为无头模式
    slowMo: 15 + Math.floor(Math.random() * 30), // 随机化慢动作
    viewport: { width: viewportWidth, height: viewportHeight },
    deviceScaleFactor: 1,
    hasTouch: false,
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    permissions: ['clipboard-read', 'clipboard-write', 'geolocation'], // 不要启用敏感权限
    bypassCSP: true,
    acceptDownloads: true,
    isMobile: false,
    javaScriptEnabled: true,
    // 重要：设置与真实浏览器一致的颜色默认值和动作时间
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    forcedColors: 'none',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      `--window-size=${viewportWidth},${viewportHeight}`,
      '--start-maximized',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-extensions',
      '--allow-running-insecure-content',
      '--disable-web-security',
      '--lang=zh-CN',
      // 屏蔽自动化特征
      '--disable-automation',
      '--disable-remote-fonts',
      // 禁用权限API避免policy violation
      '--disable-permissions-api',
      // 禁用设备方向传感器API
      '--disable-device-orientation',
      // 禁用WebGL，防止硬件指纹
      '--disable-webgl',
      '--disable-webgl2',
      // 无头模式下的额外参数
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // 在无头模式中禁用GPU
      '--disable-gpu',
      // 模拟有头浏览器的参数
      '--no-first-run',
      '--no-zygote'
    ]
  });

  // 声明一个变量用于存储页面对象，以便在finally块中访问
  let pageInstance: Page | null = null;

  try {
    // 增强的浏览器指纹伪装
    await context.addInitScript(() => {
      // =================== 关键浏览器指纹伪装 ===================
      
      // 1. 覆盖navigator对象的关键属性
      const overrideNavigator = () => {
        // 覆盖webdriver属性
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false
        });
        
        // 语言伪装
        Object.defineProperty(navigator, 'languages', {
          get: function() {
            return ['zh-CN', 'zh', 'en-US', 'en'];
          }
        });
        
        // 硬件并发伪装
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: function() {
            return 8; // 大多数普通用户的值
          }
        });
        
        // deviceMemory
        Object.defineProperty(navigator, 'deviceMemory', {
          get: function() {
            return 8; // 常见值
          }
        });
        
        // 连接类型伪装
        // @ts-ignore
        if (navigator.connection) {
          // @ts-ignore
          Object.defineProperty(navigator.connection, 'rtt', {
            get: function() {
              return 50 + Math.floor(Math.random() * 40);
            }
          });
        }
        
        // 阻止权限查询
        const originalPermissions = navigator.permissions;
        if (originalPermissions) {
          // 完全绕过TypeScript类型检查来修改权限API
          Object.defineProperty(navigator.permissions, 'query', {
            // @ts-ignore - 必须忽略类型检查以实现反检测
            value: function() {
              return Promise.resolve({
                state: "prompt",
                onchange: null
              });
            }
          });
        }
      };
      
      // 2. 覆盖WebGL指纹
      const overrideWebGL = () => {
        try {
          // 伪装WebGL
          const getParameterProto = WebGLRenderingContext.prototype.getParameter;
          // @ts-ignore
          WebGLRenderingContext.prototype.getParameter = function(parameter) {
            // 扰乱指纹值
            if (parameter === 37445) {
              return 'Intel Open Source Technology Center';
            }
            if (parameter === 37446) {
              return 'Mesa DRI Intel(R) HD Graphics 630 (Kaby Lake GT2)';
            }
            return getParameterProto.apply(this, [...arguments] as unknown as [number]);
          };
        } catch (e) {}
      };
      
      // 3. 覆盖Chrome特有属性
      const overrideChrome = () => {
        // @ts-ignore
        window.chrome = {
          runtime: {},
          loadTimes: function() {
            return {
              firstPaintTime: 0,
              firstPaintAfterLoadTime: 0,
              navigationType: "Other",
              requestTime: Date.now() / 1000,
              startLoadTime: Date.now() / 1000,
              finishDocumentLoadTime: Date.now() / 1000,
              finishLoadTime: Date.now() / 1000,
              firstPaintChromeTime: Date.now() / 1000,
              wasAlternateProtocolAvailable: false,
              wasFetchedViaSpdy: false,
              wasNpnNegotiated: false,
              npnNegotiatedProtocol: "http/1.1",
              connectionInfo: "h2",
            };
          },
          app: {
            isInstalled: false,
            getDetails: function(){},
            getIsInstalled: function(){},
            installState: function(){
              return "disabled";
            },
            runningState: function(){
              return "cannot_run";
            }
          },
          csi: function() {
            return {
              startE: Date.now(),
              onloadT: Date.now(),
              pageT: Date.now(),
              tran: 15
            };
          }
        };
      };
      
      // 4. 伪装通知API
      const overrideNotification = () => {
        if (window.Notification) {
          Object.defineProperty(window.Notification, 'permission', {
            get: () => "default"
          });
        }
      };
      
      // 5. 伪造Canvas指纹 - 安全的类型处理
      const overrideCanvas = () => {
        try {
          const originalGetContext = HTMLCanvasElement.prototype.getContext;
          // @ts-ignore - 忽略类型检查来执行必要的DOM修改
          HTMLCanvasElement.prototype.getContext = function(contextType) {
            // 将arguments转换为数组以修复类型错误
            const contextId = arguments[0] as string;
            const options = arguments.length > 1 ? arguments[1] : undefined;
            const context = originalGetContext.call(this, contextId, options);
            
            if (contextType === '2d' && context) {
              // @ts-ignore - 这里我们确定是2d上下文
              const originalFillText = context.fillText;
              // @ts-ignore
              context.fillText = function() {
                const args = Array.from(arguments);
                if (args.length > 0 && typeof args[0] === 'string') {
                  args[0] = args[0] + ' '; // 添加空格来改变文本
                }
                return originalFillText.apply(this, args);
              };
              
              // @ts-ignore
              const originalGetImageData = context.getImageData;
              // @ts-ignore
              context.getImageData = function() {
                const args = Array.from(arguments);
                const imageData = originalGetImageData.apply(this, args);
                if (imageData && imageData.data && imageData.data.length > 0) {
                  // 轻微修改像素数据，使其更难被追踪
                  for (let i = 0; i < 10; i++) {
                    const offset = Math.floor(Math.random() * imageData.data.length);
                    imageData.data[offset] = imageData.data[offset] ^ 1; // 改变一个位
                  }
                }
                return imageData;
              };
            }
            return context;
          };
        } catch (e) {
          console.log('Canvas指纹修改失败，但继续执行', e);
        }
      };
      
      // 6. 隐藏自动化特征
      const hideAutomationFeatures = () => {
        // 隐藏Playwright特征
        Object.defineProperty(window, 'outerWidth', {
          get: function() { return window.innerWidth; }
        });
        Object.defineProperty(window, 'outerHeight', {
          get: function() { return window.innerHeight; }
        });
        
        // 阻止检测自动化的navigator特性
        Object.defineProperty(navigator, 'plugins', {
          get: function() {
            // 常见插件
            const fakePlugins = [];
            const flash = { name: 'Shockwave Flash', description: 'Shockwave Flash 32.0 r0', filename: 'internal-flash.plugin', version: '32.0.0' };
            const pdf = { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf.plugin', version: '1.0' };
            const pdfViewer = { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', version: '1.0' };
            
            // @ts-ignore
            fakePlugins.push(flash, pdf, pdfViewer);
            
            // 添加可迭代性
            // @ts-ignore
            fakePlugins.item = function(index) { return this[index]; };
            // @ts-ignore
            fakePlugins.namedItem = function(name) { 
              // @ts-ignore
              return this.find(p => p.name === name); 
            };
            // @ts-ignore
            fakePlugins.refresh = function() {};
            
            return fakePlugins;
          }
        });
        
        // 伪造指纹特征
        const originalQuery = Element.prototype.querySelectorAll;
        // @ts-ignore
        Element.prototype.querySelectorAll = function(selector) {
          if (selector && selector.includes(':target')) {
            // 扰乱指纹
            return document.createElement('div');
          }
          return originalQuery.apply(this, [...arguments] as unknown as [string]);
        };
        
        // 无头模式特殊修复 - 修复window.Notification
        if (window.Notification === undefined) {
          // @ts-ignore
          window.Notification = {
            permission: 'default',
            requestPermission: function() {
              return Promise.resolve('default');
            }
          };
        }
        
        // 修复headless Chrome检测
        const patchHeadlessDetect = () => {
          // 模拟浏览器连接
          // @ts-ignore
          if (!navigator.connection) {
            // @ts-ignore
            navigator.connection = {
              downlink: 10 + Math.random() * 5,
              effectiveType: "4g",
              onchange: null,
              rtt: 50 + Math.random() * 30,
              saveData: false
            };
          }
          
          // 修复无头WebDriver检测
          Object.defineProperty(navigator, 'userAgent', {
            get: function() {
              return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
            }
          });
          
          // 模拟媒体设备
          if (navigator.mediaDevices === undefined) {
            // @ts-ignore
            navigator.mediaDevices = {
              enumerateDevices: function() {
                return Promise.resolve([
                  {kind: 'audioinput', deviceId: 'default', groupId: 'default', label: ''},
                  {kind: 'videoinput', deviceId: 'default', groupId: 'default', label: ''}
                ]);
              }
            };
          }
        };
        
        patchHeadlessDetect();
      };
      
      // 7. 阻止指纹收集
      const blockFingerprinting = () => {
        // 阻止FP收集常用的脚本
        Object.defineProperty(performance, 'mark', {
          value: function() {
            // 记录性能但如果调用与fingerprint相关就扰乱
            const args = Array.from(arguments);
            if (args.length > 0 && typeof args[0] === 'string' && 
                (args[0].includes('finger') || args[0].includes('detect') || args[0].includes('bot'))) {
              return null;
            }
            return performance.mark.apply(this, [...arguments] as unknown as [string, PerformanceMarkOptions?]);
          }
        });
        
        // 干扰AudioContext指纹
        if (window.AudioContext || (window as any).webkitAudioContext) {
          const OriginalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
          // @ts-ignore
          window.AudioContext = (window as any).webkitAudioContext = function() {
            const audioContext = new OriginalAudioContext();
            const originalGetChannelData = audioContext.createAnalyser().getFloatFrequencyData;
            // @ts-ignore
            audioContext.createAnalyser().getFloatFrequencyData = function(array) {
              const result = originalGetChannelData.apply(this, [...arguments] as unknown as [Float32Array]);
              // 轻微改变音频数据
              if (array && array.length > 0) {
                for (let i = 0; i < array.length; i += 200) {
                  array[i] = array[i] + Math.random() * 0.01;
                }
              }
              return result;
            };
            return audioContext;
          };
        }
        
        // 无头模式特殊处理 - 修复语音合成
        if (window.speechSynthesis === undefined) {
          // @ts-ignore
          window.speechSynthesis = {
            pending: false,
            speaking: false,
            paused: false,
            onvoiceschanged: null,
            getVoices: function() { return []; },
            speak: function() {},
            cancel: function() {},
            pause: function() {},
            resume: function() {}
          };
        }
      };
      
      // 8. 无头浏览器专用反检测
      const antiHeadlessDetection = () => {
        // 模拟物理屏幕尺寸
        Object.defineProperty(screen, 'availWidth', {
          get: function() { return window.innerWidth; }
        });
        Object.defineProperty(screen, 'availHeight', {
          get: function() { return window.innerHeight; }
        });
        Object.defineProperty(screen, 'width', {
          get: function() { return window.innerWidth; }
        });
        Object.defineProperty(screen, 'height', {
          get: function() { return window.innerHeight; }
        });
        
        // 模拟WebGL
        const overrideWebGL2 = () => {
          if (window.WebGL2RenderingContext) {
            const getParameterProto = WebGL2RenderingContext.prototype.getParameter;
            // @ts-ignore
            WebGL2RenderingContext.prototype.getParameter = function(parameter) {
              if (parameter === 37445) {
                return 'Intel Open Source Technology Center';
              }
              if (parameter === 37446) {
                return 'Mesa DRI Intel(R) HD Graphics 630 (Kaby Lake GT2)';
              }
              return getParameterProto.apply(this, [...arguments] as unknown as [number]);
            };
          }
        };
        
        try {
          overrideWebGL2();
        } catch (e) {}
        
        // 处理无头模式中navigator.plugins和mimeTypes
        if (navigator.plugins.length === 0) {
          Object.defineProperty(navigator, 'plugins', {
            get: function() {
              const ChromePDFPlugin = { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' };
              const FakeMimeType = { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' };
              
              // @ts-ignore
              ChromePDFPlugin.__proto__ = MimeType.prototype;
              const pluginArray = [ChromePDFPlugin];
              
              // 添加迭代功能
              // @ts-ignore
              pluginArray.item = function(index) { return this[index]; };
              // @ts-ignore
              pluginArray.namedItem = function(name) { return this[0].name === name ? this[0] : null; };
              // @ts-ignore
              pluginArray.refresh = function() {};
              // @ts-ignore
              pluginArray.length = 1;
              
              return pluginArray;
            }
          });
        }
        
        if (navigator.mimeTypes.length === 0) {
          Object.defineProperty(navigator, 'mimeTypes', {
            get: function() {
              const mimeTypes = [
                { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: {} }
              ];
              
              // @ts-ignore
              mimeTypes.item = function(index) { return this[index]; };
              // @ts-ignore
              mimeTypes.namedItem = function(name) { return this[0].type === name ? this[0] : null; };
              // @ts-ignore
              mimeTypes.length = 1;
              
              return mimeTypes;
            }
          });
        }
      };
      
      // 执行所有伪装
      try {
        overrideNavigator();
        overrideWebGL();
        overrideChrome();
        overrideNotification();
        overrideCanvas();
        hideAutomationFeatures();
        blockFingerprinting();
        antiHeadlessDetection(); // 添加无头浏览器专用反检测
      } catch (err) {
        // 忽略错误继续执行
      }
    });
    
    // 更深度的网络拦截
    await context.route('**/*', async route => {
      const request = route.request();
      let headers = request.headers();
      
      // 修改请求头，增加更多人类特征
      const customHeaders = {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'Referer': 'https://world.taobao.com/',
        'Origin': 'https://world.taobao.com'
      };
      
      // 合并头部信息
      headers = { ...headers, ...customHeaders };
      
      // 监听与验证相关的请求
      if (request.url().includes('captcha') || 
          request.url().includes('verify') || 
          request.url().includes('check') || 
          request.url().includes('report') || 
          request.url().includes('punish') || 
          request.url().includes('_____tmd_____')) {
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
      
      try {
        // 继续请求，但使用修改后的头部
        await route.continue({ headers });
      } catch (e) {
        // 如果修改失败，则以原始方式继续
        await route.continue();
      }
    });
    
    // 获取页面内JavaScript错误
    context.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`页面错误: ${msg.text()}`);
      }
    });
    
    // 增加随机延迟后打开页面
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // 修改页面打开方法
    const page = await context.newPage();
    // 保存page引用以供finally块使用
    pageInstance = page;
    
    // 设置HTTP头信息
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    });
    
    // 修改为本地文件URL，与validate.image.roc.js类似
    const validateUrl = 'file:///Users/chai/code/eavesdropper/client/resource/validate_image.html?iframeUrl=aHR0cHM6Ly9zdHJlYW0tdXBsb2FkLnRhb2Jhby5jb206NDQzLy9hcGkvdXBsb2FkLmFwaS9fX19fX3RtZF9fX19fL3B1bmlzaD94NXNlY2RhdGE9eGRlZTVkYzE0YWYzZDFlZTNmNTk0MjlhZWNmOGIyZWI4NGZmNDMwMjdiMWRhZTE3ZDMxNzQzMjQ2NzIyYTE4NTUxNDQxMzhhMzcyNzU5NDAzYWJhYWMyZGo4NjI5NjEyNzBqY2FwcHV6emxlX19ieF9fc3RyZWFtLXVwbG9hZC50YW9iYW8uY29tJTNBNDQzJTJGYXBpJTJGdXBsb2FkLmFwaSZ4NXN0ZXA9MiZhY3Rpb249Y2FwdGNoYWNhcHB1enpsZSZwdXJlQ2FwdGNoYT0=';
    
    console.log('开始加载验证页面...');
    
    // 页面访问前的随机延迟
    await page.waitForTimeout(800 + Math.random() * 1200);
    
    // 访问页面并添加一些随机操作
    await page.goto(validateUrl, { timeout: 60000 });
    
    // 等待页面加载并模拟真实用户行为
    await simulateRealUserBrowsing(page);
    
    console.log('页面加载完成，开始获取iframe...');
    const frame = await getFrame(page);
    
    console.log('开始自动验证流程，失败将自动重试...');
    await autoValidateWithRetry(page, frame);
    
    // 等待一段时间查看结果
    await page.waitForTimeout(5000 + Math.random() * 5000);
    await captureScreenshot(page, 'final-state');
    
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  } finally {
    // 随机的关闭延迟，避免太快关闭
    try {
      if (pageInstance) {
        await pageInstance.waitForTimeout(2000 + Math.random() * 3000);
      }
    } catch (e) {
      console.log('关闭延迟出错:', e);
    }
    await context.close();
    
    // 清理临时用户目录
    try {
      // fs.rmSync(userDataDir, { recursive: true, force: true });
      console.log(`保留用户数据目录以供分析: ${userDataDir}`);
    } catch (e) {
      console.log('清理用户数据目录失败:', e);
    }
  }
}

/**
 * 模拟真实用户的浏览行为
 */
async function simulateRealUserBrowsing(page: Page): Promise<void> {
  // 随机滚动页面，模拟人类浏览行为
  await page.waitForTimeout(1000 + Math.random() * 1000);
  
  // 根据概率决定是否执行操作
  if (Math.random() < 0.8) {
    // 缓慢滚动
    const scrollAmount = Math.floor(Math.random() * 100);
    await page.mouse.wheel(0, scrollAmount);
    await page.waitForTimeout(400 + Math.random() * 500);
    
    // 偶尔会反向滚动一下
    if (Math.random() < 0.4) {
      await page.mouse.wheel(0, -Math.floor(scrollAmount / 2));
      await page.waitForTimeout(300 + Math.random() * 300);
    }
  }
  
  // 偶尔移动鼠标
  if (Math.random() < 0.7) {
    // 随机鼠标移动
    const randomX = 100 + Math.floor(Math.random() * 500);
    const randomY = 100 + Math.floor(Math.random() * 300);
    await page.mouse.move(randomX, randomY, { steps: 10 });
    await page.waitForTimeout(200 + Math.random() * 500);
  }
  
  // 随机等待页面加载完成
  await page.waitForTimeout(2000 + Math.random() * 3000);
}

/**
 * 获取包含验证码的iframe
 */
async function getFrame(page: Page): Promise<Frame> {
  const frame = await page.mainFrame();
  const childFrames = await frame.childFrames();
  
  for (const childFrame of childFrames) {
    const url = await childFrame.url();
    if (url.includes("api/upload.api/_____tmd_____/punish")) {
      console.log("从childFrame获取frame: ", url);
      return childFrame;
    }
  }
  
  for (const child of childFrames) {
    const childFrames = await child.childFrames();
    for (const childFrameChild of childFrames) {
      const url = await childFrameChild.url();
      if (url.includes("mtop.relationrecommend.wirelessrecommend.recommend")) {
        console.log("从嵌套childFrame获取frame: ", url);
        return childFrameChild;
      }
    }
  }
  
  console.log("未找到特定frame，使用主frame");
  return page.mainFrame();
}

/**
 * 自动验证流程，支持失败重试
 * @param page Playwright页面对象
 * @param frame 包含滑块的iframe
 */
async function autoValidateWithRetry(page: Page, frame: Frame) {
  // 设置最大重试次数和计数器
  const maxRetryAttempts = 10;
  let retryCount = 0;
  let verified = false;
  let lastImageHash = ''; // 用于检测验证码图片是否已刷新
  let lastTrack: {x: number, y: number, t: number}[] = []; // 保存最后一次轨迹
  
  // 记录开始时间以计算总耗时
  const startTime = Date.now();
  
  while (!verified && retryCount < maxRetryAttempts) {
    try {
      console.log(`\n===== 开始第 ${retryCount + 1} 次验证尝试 =====`);
      
      // 清空上次轨迹
      lastTrack = [];
      
      // 设置轨迹记录回调
      const trackRecorder = (track: {x: number, y: number, t: number}[]) => {
        lastTrack = [...track]; // 保存轨迹副本
      };
      
      // 获取验证码图片并验证
      const result = await validatePuzzleCaptchaOnce(page, frame, retryCount, trackRecorder);
      
      // 检查验证结果
      verified = result.verified;
      
      if (verified) {
        // 验证成功，保存成功轨迹特征
        if (lastTrack.length > 0) {
          console.log(`记录成功轨迹特征，共${lastTrack.length}个点`);
          saveSuccessTrackFeatures(lastTrack);
        }
        
        // 验证成功
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ 验证成功！总共尝试 ${retryCount + 1} 次，总耗时 ${totalTime} 秒`);
        await captureScreenshot(page, 'verification-success');
        break;
      } else {
        // 验证失败
        console.log(`❌ 验证失败，准备重试 (${retryCount + 1}/${maxRetryAttempts})`);
        await captureScreenshot(page, `verification-fail-${retryCount}`);
        
        // 如果当前图片哈希值存在，更新为上次图片哈希
        if (result.imageHash) {
          lastImageHash = result.imageHash;
        }
        
        // 等待验证码刷新
        await waitForRefresh(frame, lastImageHash);
        retryCount++;
      }
    } catch (error) {
      console.error(`验证过程出错:`, error);
      await captureScreenshot(page, `verification-error-${retryCount}`);
      
      // 等待恢复并继续尝试
      await page.waitForTimeout(2000);
      await waitForRefresh(frame, lastImageHash);
      retryCount++;
    }
  }
  
  if (!verified) {
    console.error(`⚠️ 达到最大重试次数 ${maxRetryAttempts}，验证失败`);
  }
  
  return verified;
}

/**
 * 执行一次完整验证流程
 */
async function validatePuzzleCaptchaOnce(
  page: Page, 
  frame: Frame, 
  retryCount: number,
  trackRecorder?: (track: {x: number, y: number, t: number}[]) => void
): Promise<{verified: boolean, imageHash?: string}> {
  try {
    // 查找拼图验证码图片元素
    const element = frame.locator("#puzzle-captcha-question-img").first();
    
    if (!await element.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("验证码图片未显示");
      return { verified: false };
    }
    
    // 获取验证码图片
    const imageBuffer = await element.screenshot();
    
    // 计算图片哈希用于检测刷新
    const imageHash = await getImageHash(imageBuffer);
    
    // 获取验证码图片位置信息
    const boundingBox = await element.boundingBox();
    if (!boundingBox) {
      console.error("无法获取验证码图片的位置信息");
      return { verified: false, imageHash };
    }
    
    const width = boundingBox.width;
    const height = boundingBox.height;
    console.log("验证码图片尺寸: ", width, " x ", height);
    
    // 截取验证码图片
    const qrCodeFileName = "../test" + ".jpeg";
    await element.screenshot({ path: qrCodeFileName });
    
    // 使用sharp处理图片
    const imageSharp = sharp(imageBuffer);
    const processedBuffer = await imageSharp
      .resize(Number(width), Number(height))
      .toBuffer();
    
    // 转换为Base64
    const imageBase64 = await convertImageToBase64WithHeader(processedBuffer);
    
    if (!imageBase64) {
      console.error("图片转Base64失败");
      return { verified: false, imageHash };
    }
    
    // 请求打码平台获取滑动距离
    const slideContent = await getSlideContent(imageBase64).catch(err => {
      console.error("打码平台请求失败:", err.message);
      return null;
    });
    
    console.log("打码平台返回结果: ", slideContent);
    
    if (!slideContent || slideContent.code !== 200 || !slideContent.data) {
      console.error("打码平台返回错误或无数据");
      return { verified: false, imageHash };
    }
    
    let slideDistance = slideContent.data.px_distance;
    console.log("打码平台返回的滑动距离: ", slideDistance);
    
    // 检查打码平台给的距离是否合理，如果超出或过小则舍弃
    if (slideDistance <= 10 || slideDistance >= 300) {
      console.log(`滑动距离 ${slideDistance}px 不合理，使用默认推测距离`);
      // 验证码通常滑块在1/3到2/3之间
      slideDistance = Math.floor(width * (0.4 + Math.random() * 0.2));
    }
    
    // 更智能的滑动距离调整逻辑
    let adjustedDistance = slideDistance;
    
    // 基于重试次数的自适应距离调整策略
    if (retryCount > 0) {
      // 大范围调整策略（交替正负微调）
      const adjustRange = retryCount * (1 + Math.random() * 0.5); // 范围随重试次数增加
      
      if (retryCount % 3 === 1) {
        // 小幅减少距离
        const reduction = 2 + adjustRange;
        adjustedDistance = slideDistance - reduction;
        console.log(`重试${retryCount}: 距离减少${reduction.toFixed(1)}px`);
      } else if (retryCount % 3 === 2) {
        // 中幅增加距离
        const increase = 3 + adjustRange * 1.2;
        adjustedDistance = slideDistance + increase;
        console.log(`重试${retryCount}: 距离增加${increase.toFixed(1)}px`);
      } else {
        // 更精确的微调 - 在原距离附近随机波动
        const variability = 5 + adjustRange * 0.8;
        const fineAdjustment = (Math.random() * 2 - 1) * variability;
        adjustedDistance = slideDistance + fineAdjustment;
        console.log(`重试${retryCount}: 距离精确微调${fineAdjustment.toFixed(1)}px`);
      }
      
      // 高级重试策略：在多次尝试后使用更大范围随机值
      if (retryCount >= 5) {
        // 在第5次及以后的重试中，大幅度改变距离
        const bigChange = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 15);
        adjustedDistance += bigChange;
        console.log(`第${retryCount}次重试(高级): 额外偏移${bigChange.toFixed(1)}px`);
      }
    }
    
    // 确保调整后的距离在合理范围内 (避免太小或太大的调整)
    const minDistance = Math.max(slideDistance * 0.7, 30);
    const maxDistance = Math.min(slideDistance * 1.3, boundingBox.width * 0.9);
    adjustedDistance = Math.max(minDistance, Math.min(adjustedDistance, maxDistance));
    
    // 最终滑动距离
    console.log(`最终滑动距离: ${adjustedDistance.toFixed(2)}px (原始: ${slideDistance}px)`);
    
    // 找到滑块元素
    const slider = await frame.locator('#puzzle-captcha-btn').first();
    if (!await slider.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.error("未找到滑块元素");
      return { verified: false, imageHash };
    }
    
    const sliderBox = await slider.boundingBox();
    if (!sliderBox) {
      console.error("无法获取滑块元素的位置信息");
      return { verified: false, imageHash };
    }
    
    console.log("滑块位置: ", sliderBox);
    
    // 计算起始和目标位置
    const startX = sliderBox.x + sliderBox.width / 2;
    const startY = sliderBox.y + sliderBox.height / 2;
    
    // 目标位置使用调整后的距离
    const endX = startX + adjustedDistance;
    
    console.log(`滑动起点: (${startX}, ${startY}), 终点: (${endX}, ${startY})`);
    
    // 执行滑块滑动前的人类行为模拟
    await simulateHumanPresenceSimple(page, sliderBox.x, sliderBox.y);
    
    // 优化：根据重试次数调整滑动速度
    const speedFactor = Math.max(0.6, 1.0 - retryCount * 0.07);
    
    // 执行滑动操作
    const slideResult = await slideSlider(
      page, 
      {x: startX, y: startY}, 
      {x: endX, y: startY}, 
      speedFactor,
      trackRecorder
    );
    
    if (!slideResult) {
      console.error("滑动操作执行失败");
      return { verified: false, imageHash };
    }
    
    // 等待验证结果 - 时间更灵活
    const verificationWait = 1800 + Math.random() * 700;
    await page.waitForTimeout(verificationWait);
    
    // 检查验证结果
    const verified = await checkVerificationResult(frame, page);
    
    return { verified, imageHash };
  } catch (error) {
    console.error('验证过程出错:', error);
    return { verified: false };
  }
}

/**
 * 等待验证码刷新
 * @param frame 包含验证码的iframe
 * @param lastImageHash 上一次的图片哈希值
 */
async function waitForRefresh(frame: Frame, lastImageHash?: string) {
  console.log("等待验证码刷新...");
  
  // 尝试点击刷新按钮
  try {
    // 尝试点击刷新按钮或错误提示
    const refreshButtonSelectors = [
      'button:has-text("刷新")', 
      '.refresh-btn', 
      '.retry', 
      '.reload',
      '.captcha-reload',
      'text="请等待题目刷新后重新尝试"',
      'text="重新验证"',
      'text="再来一次"'
    ];
    
    for (const selector of refreshButtonSelectors) {
      const refreshButton = frame.locator(selector);
      if (await refreshButton.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log(`找到刷新元素: ${selector}，点击刷新`);
        await refreshButton.click();
        break;
      }
    }
  } catch (e) {
    console.log("没有找到可点击的刷新元素");
  }
  
  // 等待一段时间让验证码自动刷新
  console.log("等待3秒让验证码刷新...");
  await frame.waitForTimeout(3000);
  
  // 检查验证码图片是否已更新
  const imageElement = frame.locator("#puzzle-captcha-question-img").first();
  
  // 等待图片出现
  let imageReady = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!imageReady && attempts < maxAttempts) {
    imageReady = await imageElement.isVisible({ timeout: 1000 }).catch(() => false);
    if (!imageReady) {
      console.log(`等待验证码图片出现 (${attempts + 1}/${maxAttempts})...`);
      await frame.waitForTimeout(1000);
      attempts++;
    }
  }
  
  // 如果有上一次的图片哈希值，检查图片是否真的刷新了
  if (imageReady && lastImageHash) {
    try {
      const imageBuffer = await imageElement.screenshot();
      const currentHash = await getImageHash(imageBuffer);
      
      if (currentHash === lastImageHash) {
        console.log("验证码图片未真正刷新，继续等待...");
        await frame.waitForTimeout(2000);
      } else {
        console.log("✓ 验证码已成功刷新");
      }
    } catch (e) {
      console.error("检查图片刷新状态出错:", e);
    }
  }
  
  return imageReady;
}

/**
 * 计算图片的简单哈希值，用于检测图片是否变化
 * @param imageBuffer 图片buffer
 * @returns 简单哈希字符串
 */
async function getImageHash(imageBuffer: Buffer): Promise<string> {
  // 压缩图片到很小尺寸，计算像素均值作为简单哈希
  try {
    const resizedBuffer = await sharp(imageBuffer)
      .resize(16, 16, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();
    
    // 计算简单哈希值
    let hash = '';
    for (let i = 0; i < Math.min(resizedBuffer.length, 64); i++) {
      hash += resizedBuffer[i].toString(16).padStart(2, '0');
    }
    
    return hash;
  } catch (e) {
    console.error('计算图片哈希出错:', e);
    return Date.now().toString(); // 出错时返回时间戳，确保唯一性
  }
}

/**
 * 将图片转换为带header的Base64字符串
 */
async function convertImageToBase64WithHeader(imageBuffer: Buffer): Promise<string | undefined> {
  try {
    const mimeType = "image/jpeg";
    const base64Image = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Image}`;
  } catch (err) {
    console.error('转换图片为Base64时出错:', err);
    return undefined;
  }
}

/**
 * 请求打码平台API获取滑动距离
 */
async function getSlideContent(imageBase64: string) {
  try {
    const response = await axios.post('http://www.detayun.cn/openapi/verify_code_identify/', {
      key: 'nULF2C3SE5oy8My8dfF8', // 请替换为你的API密钥
      verify_idf_id: '56',
      img_base64: imageBase64
    });
    return response.data;
  } catch (err) {
    console.error('请求打码平台API失败:', err);
    return null;
  }
}

/**
 * 模拟人类用户行为
 */
async function simulateHumanPresenceSimple(page: Page, x: number, y: number) {
  console.log('[人类模拟] 执行验证前的随机操作...');
  
  // 首先模拟页面浏览行为
  // 可能的浏览区域 - 页面区域
  const viewportActions = Math.floor(Math.random() * 3); // 0-2次随机浏览行为
  
  if (viewportActions > 0) {
    // 用户先看看页面，再关注滑块
    for (let i = 0; i < viewportActions; i++) {
      // 看页面上部
      const randomPageX = 200 + Math.random() * 700;
      const randomPageY = 100 + Math.random() * 200;
      await page.mouse.move(randomPageX, randomPageY, { steps: 10 });
      
      // 模拟阅读时间
      await randomDelay(500, 1000);
      
      // 偶尔的无意义点击
      if (Math.random() < 0.3) {
        await page.mouse.down();
        await randomDelay(30, 70);
        await page.mouse.up();
      }
    }
  }
  
  // 然后才聚焦验证码区域
  const captchaAreaX = x - 50 - Math.random() * 100;
  const captchaAreaY = y - 100 - Math.random() * 50;
  await page.mouse.move(captchaAreaX, captchaAreaY, { steps: 8 });
  
  // 看验证码图片区域
  await randomDelay(300, 700);
  
  // 更加自然的鼠标移动模式
  const movesCount = 2 + Math.floor(Math.random() * 3); // 2-4次移动
  
  // 定义可能的验证码周围区域
  for (let i = 0; i < movesCount; i++) {
    // 更多聚焦在滑块附近
    const randomX = x - 70 + Math.random() * 150;
    const randomY = y - 30 + Math.random() * 60;
    
    // 使用不同步数移动，更自然
    const steps = 5 + Math.floor(Math.random() * 8);
    await page.mouse.move(randomX, randomY, { steps });
    
    // 随机暂停，模拟人类观察
    await randomDelay(150, 400);
    
    // 偶尔执行点击操作（模拟用户误操作或确认）
    if (Math.random() < 0.15) {
      await page.mouse.down();
      await randomDelay(40, 120);
      await page.mouse.up();
      await randomDelay(200, 500);
    }
  }
  
  // 最终移动到滑块附近，但不是精确位置 - 故意迟疑
  const offsetX = x - 12 + Math.random() * 24;
  const offsetY = y - 7 + Math.random() * 14;
  await page.mouse.move(offsetX, offsetY, { steps: 8 });
  
  // 模拟犹豫 - 有时在滑块附近微微移动
  if (Math.random() < 0.7) {
    await randomDelay(100, 300);
    const microMoveX = offsetX + (Math.random() * 8 - 4);
    const microMoveY = offsetY + (Math.random() * 6 - 3);
    await page.mouse.move(microMoveX, microMoveY, { steps: 3 });
  }
  
  // 模拟人类阅读和准备的时间 - 更接近人类行为的随机分布
  let readingTime: number;
  
  if (Math.random() < 0.2) {
    // 偶尔会思考很久
    readingTime = 1500 + Math.random() * 1500;
  } else {
    // 大多数时候的思考时间
    readingTime = 700 + Math.random() * 1100;
  }
  
  console.log(`[人类模拟] 阅读和准备时间: ${Math.round(readingTime)}ms`);
  await page.waitForTimeout(readingTime);
  
  // 最后移动到精确位置 - 分段移动更自然
  if (Math.abs(offsetX - x) > 10 || Math.abs(offsetY - y) > 5) {
    // 如果离得较远，先快速接近
    const intermediateX = x + (offsetX - x) * 0.3;
    const intermediateY = y + (offsetY - y) * 0.3;
    await page.mouse.move(intermediateX, intermediateY, { steps: 3 });
    await randomDelay(50, 100);
  }
  
  // 最后稳稳移到滑块位置
  await page.mouse.move(x, y, { steps: 4 });
  await randomDelay(80, 200);
  
  console.log('[人类模拟] 随机操作完成，准备开始滑动验证');
}

/**
 * 高度模拟人类的滑块滑动函数 
 */
async function slideSlider(
  page: Page, 
  startPosition: { x: number, y: number }, 
  endPosition: { x: number, y: number },
  speedFactor: number = 1.0,
  trackRecorder?: (track: {x: number, y: number, t: number}[]) => void
): Promise<boolean> {
  try {
    console.log(`执行滑块滑动: 从(${startPosition.x}, ${startPosition.y}) 滑动到 (${endPosition.x}, ${endPosition.y}), 速度因子: ${speedFactor}`);
    
    // 计算滑动距离
    const totalDistance = endPosition.x - startPosition.x;
    
    if (totalDistance <= 0) {
      console.error('滑动距离必须为正值');
      return false;
    }
    
    // 记录实际滑动轨迹
    const actualTrack: {x: number, y: number, t: number}[] = [];
    const startTime = Date.now();
    
    // 首先移动到滑块位置
    await moveToSlider(page, startPosition);
    
    // 记录起始点
    actualTrack.push({
      x: Math.round(startPosition.x),
      y: Math.round(startPosition.y),
      t: 0
    });
    
    // 阶段划分
    const phases = [
      {type: 'delay', duration: 800 + Math.random() * 1000}, // 初始延迟
      {type: 'accelerate', ratio: 0.6}, 
      {type: 'decelerate', ratio: 0.35},
      {type: 'adjust', count: 2 + Math.floor(Math.random() * 3)}
    ];
    
    // 鼠标按下
    await page.mouse.down();
    
    actualTrack.push({
      x: Math.round(startPosition.x),
      y: Math.round(startPosition.y),
      t: Date.now() - startTime
    });
    
    let currentX = startPosition.x;
    let currentY = startPosition.y;
    let currentTime = Date.now() - startTime;
    
    // 生成轨迹核心逻辑
    let plannedTrack: {x: number, y: number, t: number}[] = [];
    
    for (const phase of phases) {
      switch(phase.type) {
        case 'delay':
          // 延迟阶段
          const delayPoints = generateDelayPoints(
            currentX, 
            currentY, 
            currentTime, 
            phase.duration as number
          );
          plannedTrack.push(...delayPoints);
          break;
          
        case 'accelerate':
          // 加速阶段 - 使用Sigmoid曲线前半部分
          const accelPoints = generateSigmoidCurve(
            currentX,
            currentY,
            totalDistance * (phase.ratio as number),
            currentTime,
            'accelerate',
            speedFactor
          );
          plannedTrack.push(...accelPoints);
          break;
          
        case 'decelerate':
          // 减速阶段 - 使用Sigmoid曲线后半部分
          const lastAccelPoint = plannedTrack[plannedTrack.length - 1];
          const decelPoints = generateSigmoidCurve(
            lastAccelPoint.x,
            lastAccelPoint.y,
            totalDistance * (phase.ratio as number),
            lastAccelPoint.t,
            'decelerate',
            speedFactor
          );
          plannedTrack.push(...decelPoints);
          break;
          
        case 'adjust':
          // 微调阶段 - 模拟手抖动
          const lastPoint = plannedTrack[plannedTrack.length - 1];
          const adjustPoints = simulateHandTremor(
            lastPoint.x,
            lastPoint.y,
            endPosition.x,
            startPosition.y,
            lastPoint.t,
            phase.count as number
          );
          plannedTrack.push(...adjustPoints);
          break;
      }
      
      // 更新当前状态
      if (plannedTrack.length > 0) {
        const lastTrackPoint = plannedTrack[plannedTrack.length - 1];
        currentX = lastTrackPoint.x;
        currentY = lastTrackPoint.y;
        currentTime = lastTrackPoint.t;
      }
    }
    
    // 确保最后一个点是目标位置
    plannedTrack.push({
      x: endPosition.x,
      y: startPosition.y + (Math.random() * 1 - 0.5),
      t: currentTime + 50 + Math.random() * 100
    });
    
    // 添加浏览器同步和执行
    await executeTrack(page, plannedTrack, startTime, actualTrack);
    
    // 释放鼠标
    await releaseSlider(page, endPosition, startPosition);
    
    // 记录最终点
    actualTrack.push({
      x: Math.round(endPosition.x),
      y: Math.round(startPosition.y),
      t: Date.now() - startTime
    });
    
    // 打印实际轨迹数据
    console.log(`\n=== 自动滑动实际轨迹 (${actualTrack.length}个点) ===`);
    console.log(JSON.stringify(actualTrack));
    
    // 打印轨迹统计信息
    const totalTime = actualTrack[actualTrack.length-1].t - actualTrack[0].t;
    const totalXDistance = actualTrack[actualTrack.length-1].x - actualTrack[0].x;
    console.log(`\n轨迹统计信息:`);
    console.log(`- 总点数: ${actualTrack.length}`);
    console.log(`- 总时间: ${totalTime}ms`);
    console.log(`- 滑动距离: ${totalXDistance}px`);
    console.log(`- 平均速度: ${(totalXDistance / (totalTime / 1000)).toFixed(2)}px/s`);
    
    // 保存轨迹到文件
    saveTrackToFile(actualTrack);
    
    // 如果提供了轨迹记录回调，调用它
    if (trackRecorder && actualTrack.length > 0) {
      trackRecorder(actualTrack);
    }
    
    return true;
  } catch (error) {
    console.error('滑动操作失败:', error);
    return false;
  }
}

/**
 * 移动到滑块位置
 */
async function moveToSlider(page: Page, startPosition: { x: number, y: number }) {
  // 不是直接定位到滑块中心，而是先移动到附近，然后再精确定位 - 更真实
  
  // 先随机移动到滑块附近
  const approachX = startPosition.x - 15 + Math.random() * 30;
  const approachY = startPosition.y - 10 + Math.random() * 20;
  await page.mouse.move(approachX, approachY, { steps: 8 + Math.floor(Math.random() * 5) });
  await page.waitForTimeout(50 + Math.random() * 150);
  
  // 然后移动到滑块区域，但有轻微偏移
  const closeX = startPosition.x - 5 + Math.random() * 10;
  const closeY = startPosition.y - 3 + Math.random() * 6;
  await page.mouse.move(closeX, closeY, { steps: 3 + Math.floor(Math.random() * 3) });
  await page.waitForTimeout(30 + Math.random() * 100);
  
  // 最后精确移动到滑块位置
  await page.mouse.move(startPosition.x, startPosition.y, { steps: 2 });
}

/**
 * 生成延迟阶段的轨迹点
 */
function generateDelayPoints(
  currentX: number,
  currentY: number,
  currentTime: number,
  delayDuration: number
): {x: number, y: number, t: number}[] {
  const delayPoints = [];
  
  // 初始思考延迟
  delayPoints.push({
    x: currentX,
    y: currentY,
    t: currentTime + delayDuration
  });
  
  // 可能的微小移动（手指紧张抖动）
  if (Math.random() < 0.4) {
    const jitterCount = 1 + Math.floor(Math.random() * 2);
    let jitterTime = currentTime;
    
    for (let i = 0; i < jitterCount; i++) {
      jitterTime += 50 + Math.random() * 150;
      delayPoints.push({
        x: currentX + (Math.random() * 2 - 1),
        y: currentY + (Math.random() * 2 - 1),
        t: jitterTime
      });
    }
    
    // 回到原位置
    delayPoints.push({
      x: currentX,
      y: currentY,
      t: jitterTime + 30 + Math.random() * 70
    });
  }
  
  return delayPoints;
}

/**
 * 生成基于Sigmoid函数的加速或减速曲线
 */
function generateSigmoidCurve(
  startX: number,
  startY: number,
  distance: number,
  baseTime: number,
  type: 'accelerate' | 'decelerate',
  speedFactor: number
): {x: number, y: number, t: number}[] {
  const points: {x: number, y: number, t: number}[] = [];
  
  // 定义sigmoid函数参数
  const L = distance; // 最大位移
  const beta = 0.8 + Math.random() * 0.4; // 曲线陡度随机化
  
  // 时间间隔根据速度因子调整
  const timeSpan = type === 'accelerate' 
    ? (800 + Math.random() * 400) / speedFactor 
    : (600 + Math.random() * 400) / speedFactor;
  
  // sigmoid函数起止点调整
  const tStart = type === 'accelerate' ? 0 : 5;
  const tEnd = type === 'accelerate' ? 5 : 10;
  
  // 生成轨迹点
  const pointCount = 25 + Math.floor(Math.random() * 15);
  const step = (tEnd - tStart) / pointCount;
  
  // 随机添加一个停顿点（只在加速阶段）
  let hasPause = type === 'accelerate' && Math.random() < 0.3;
  let pauseIndex = hasPause ? Math.floor(pointCount * (0.3 + Math.random() * 0.4)) : -1;
  let pauseDuration = hasPause ? 100 + Math.random() * 200 : 0;
  
  let cumulativeTime = 0;
  
  for (let i = 0; i <= pointCount; i++) {
    const t = tStart + step * i;
    
    // sigmoid函数: L / (1 + e^(-beta*(t-mid)))
    // 对于加速: t从0到5，对应函数上升段
    // 对于减速: t从5到10，对应函数上升后的平缓段
    const sigmoid = L / (1 + Math.exp(-beta * (t - 5)));
    
    // 计算实际x位移
    const x = startX + sigmoid;
    
    // 添加Y轴波动
    const waveAmplitude = Math.min(3, distance * 0.02); // Y波动幅度与距离相关
    const yOffset = (Math.random() * 2 - 1) * waveAmplitude;
    const y = startY + yOffset;
    
    // 计算时间
    const pointTimeShare = timeSpan / pointCount;
    const timeVariation = pointTimeShare * 0.3; // 30%的时间随机变化
    let pointDuration = pointTimeShare + (Math.random() * 2 - 1) * timeVariation;
    
    // 添加暂停时间（如果是暂停点）
    if (i === pauseIndex) {
      pointDuration += pauseDuration;
    }
    
    cumulativeTime += pointDuration;
    
    // 添加轨迹点
    points.push({
      x: x,
      y: y,
      t: baseTime + cumulativeTime
    });
  }
  
  return points;
}

/**
 * 模拟手抖动，实现精细调整
 */
function simulateHandTremor(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  lastTime: number,
  adjustCount: number
): {x: number, y: number, t: number}[] {
  const tremorPoints: {x: number, y: number, t: number}[] = [];
  let time = lastTime;
  
  // 计算到目标的距离
  const remainingDistance = targetX - currentX;
  
  // 如果已经接近目标，减少调整次数
  const actualCount = Math.abs(remainingDistance) < 5 
    ? Math.min(2, adjustCount) 
    : adjustCount;
  
  // 生成抖动点
  for (let i = 0; i < actualCount; i++) {
    const ratio = (i + 1) / actualCount;
    
    // 逐渐接近目标x
    const nextX = currentX + remainingDistance * ratio;
    
    // 添加随机抖动
    const tremor = i === actualCount - 1 
      ? 0.5 // 最后一步抖动更小
      : 1.5 + Math.random() * 1.5;
    
    // 生成抖动轨迹
    const trembleFactor = Math.sin(i * Math.PI) * tremor;
    const x = nextX + trembleFactor;
    
    // Y轴也有轻微抖动
    const y = targetY + (Math.random() * 2 - 1) * Math.min(1.5, tremor);
    
    // 时间间隔
    time += 40 + Math.random() * 120;
    
    tremorPoints.push({
      x,
      y,
      t: time
    });
    
    // 最后一个点后可能有微小暂停
    if (i === actualCount - 1 && Math.random() < 0.5) {
      time += 50 + Math.random() * 100;
      tremorPoints.push({
        x: x + (Math.random() * 0.6 - 0.3),
        y: y + (Math.random() * 0.6 - 0.3),
        t: time
      });
    }
  }
  
  return tremorPoints;
}

/**
 * 执行轨迹移动
 */
async function executeTrack(
  page: Page,
  plannedTrack: {x: number, y: number, t: number}[],
  startTime: number,
  actualTrack: {x: number, y: number, t: number}[]
) {
  const moveStart = Date.now();
  
  // 打印轨迹规划
  console.log(`--- 规划的轨迹点 (${plannedTrack.length}个) ---`);
  console.log(JSON.stringify(plannedTrack.map(p => ({
    x: Math.round(p.x), 
    y: Math.round(p.y), 
    t: Math.round(p.t)
  }))));
  
  // 执行轨迹移动
  for (let i = 0; i < plannedTrack.length; i++) {
    const point = plannedTrack[i];
    const elapsed = Date.now() - moveStart;
    const targetTime = point.t;
    
    // 等待到指定时间点
    if (elapsed < targetTime) {
      await page.waitForTimeout(targetTime - elapsed);
    }
    
    // 移动到当前点
    await page.mouse.move(point.x, point.y);
    
    // 记录实际点
    actualTrack.push({
      x: Math.round(point.x),
      y: Math.round(point.y),
      t: Date.now() - startTime
    });
  }
}

/**
 * 释放滑块
 */
async function releaseSlider(
  page: Page,
  endPosition: { x: number, y: number },
  startPosition: { x: number, y: number }
) {
  // 到达终点后可能有的行为类型
  const endBehaviorType = Math.random();
  
  if (endBehaviorType < 0.6) {
    // 60%的概率：达到终点后短暂停留再松开
    const endingDelay = 100 + Math.random() * 400;
    await page.waitForTimeout(endingDelay);
  } else if (endBehaviorType < 0.9) {
    // 30%的概率：到达后做小范围调整再松开
    const adjustX = endPosition.x + (Math.random() * 3 - 1.5);
    const adjustY = startPosition.y + (Math.random() * 3 - 1.5);
    await page.mouse.move(adjustX, adjustY);
    await page.waitForTimeout(50 + Math.random() * 150);
    
    // 最后回到准确位置
    if (Math.random() < 0.5) {
      await page.mouse.move(endPosition.x, startPosition.y);
      await page.waitForTimeout(30 + Math.random() * 70);
    }
  } else {
    // 10%的概率：滑过了再回来
    const overX = endPosition.x + 3 + Math.random() * 5;
    await page.mouse.move(overX, startPosition.y);
    await page.waitForTimeout(50 + Math.random() * 100);
    await page.mouse.move(endPosition.x, startPosition.y);
    await page.waitForTimeout(30 + Math.random() * 70);
  }
  
  // 松开鼠标
  await page.mouse.up();
  
  // 释放鼠标后的行为
  if (Math.random() < 0.7) {
    // 70%的概率会移开鼠标
    await page.waitForTimeout(50 + Math.random() * 300);
    
    // 移开距离和方向有较大随机性
    const moveAwayX = endPosition.x + (Math.random() < 0.7 ? 1 : -1) * (10 + Math.random() * 100);
    const moveAwayY = startPosition.y + (Math.random() * 160 - 80);
    await page.mouse.move(moveAwayX, moveAwayY, { steps: 3 + Math.floor(Math.random() * 4) });
  }
}

/**
 * 保存轨迹数据到文件
 */
function saveTrackToFile(track: {x: number, y: number, t: number}[], prefix: string = 'auto') {
  try {
    const dir = path.join(__dirname, '../tracks');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const trackPath = path.join(dir, `${prefix}-track-${new Date().getTime()}.json`);
    fs.writeFileSync(trackPath, JSON.stringify(track, null, 2));
    console.log(`轨迹数据已保存到文件: ${trackPath}`);
    
    // 额外保存一个简化版本，便于后续分析
    const simplifiedTrack = track.map((p: {x: number, y: number, t: number}) => ({
      x: p.x,
      y: p.y,
      t: p.t
    }));
    const simplifiedPath = path.join(dir, `${prefix}-simplified-${new Date().getTime()}.json`);
    fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedTrack));
  } catch (e: any) {
    console.error(`保存轨迹数据失败: ${e.message}`);
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
          
          console.log(`⚠️ 检测到验证失败的网络请求: ${url}`);
          receivedFailRequest = true;
          clearTimeout(timeout);
          page.removeListener('request', onRequest);
          resolve(false);
        }
        
        // 检查是否包含成功相关关键词
        if (url.includes('verifySuccess') || 
            url.includes('successReport')) {
          
          console.log(`✅ 检测到验证成功的网络请求: ${url}`);
          clearTimeout(timeout);
          page.removeListener('request', onRequest);
          resolve(true);
        }
      };
      
      page.on('request', onRequest);
    });
    
    // 1. 先检查网络请求，等待2秒
    const networkResult = await Promise.race([
      requestPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ]);
    
    // 如果网络请求明确表示失败，直接返回失败
    if (networkResult === false) {
      console.log('❌ 网络请求表明验证失败');
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
        isSuccess = await frame.locator(selector).isVisible({ timeout: 500 });
        if (isSuccess) {
          console.log(`找到成功选择器: ${selector}`);
          
          // 即使找到成功选择器，如果收到失败请求，仍然判定为失败
          if (receivedFailRequest) {
            console.log('⚠️ 虽然页面显示成功，但网络请求表明失败，判定为失败');
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
          isFailed = await frame.locator(selector).isVisible({ timeout: 500 });
          if (isFailed) {
            console.log(`找到失败选择器: ${selector}`);
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
          console.log(`在页面内容中发现成功文本: "${text}"`);
          
          // 即使页面内容显示成功，如果收到失败请求，仍然判定为失败
          if (receivedFailRequest) {
            console.log('⚠️ 虽然页面内容显示成功，但网络请求表明失败，判定为失败');
            return false;
          }
          
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
    
    // 如果网络请求表明成功，则返回成功
    if (networkResult === true) {
      return true;
    }
    
    // 默认返回未确定，此时认为失败，需要重试
    console.log('⚠️ 无法确定验证结果，将视为失败并重试');
    return false;
  } catch (e) {
    console.error('检查验证结果时出错:', e);
    return false;
  }
}

/**
 * 保存成功轨迹特征用于自我学习优化
 */
function saveSuccessTrackFeatures(track: {x: number, y: number, t: number}[]) {
  try {
    if (track.length < 5) return; // 轨迹太短，不具有学习价值
    
    // 计算轨迹特征
    const features = {
      timestamp: new Date().toISOString(),
      totalPoints: track.length,
      totalTime: track[track.length-1].t - track[0].t,
      totalDistance: track[track.length-1].x - track[0].x,
      averageSpeed: (track[track.length-1].x - track[0].x) / ((track[track.length-1].t - track[0].t) / 1000),
      
      // 计算Y轴波动
      yVariation: {
        max: Math.max(...track.map(p => p.y)),
        min: Math.min(...track.map(p => p.y)),
        range: 0,
        std: 0
      },
      
      // 计算速度分布
      speedDistribution: [] as number[],
      
      // 计算加速度分布
      accelerationDistribution: [] as number[],
      
      // 停顿特征
      pauses: 0,
      pauseDurations: [] as number[],
      
      // 微小回退特征
      backwardsCount: 0
    };
    
    // 计算Y轴范围
    features.yVariation.range = features.yVariation.max - features.yVariation.min;
    
    // 计算Y轴标准差
    const yMean = track.reduce((sum, p) => sum + p.y, 0) / track.length;
    features.yVariation.std = Math.sqrt(
      track.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0) / track.length
    );
    
    // 计算速度分布和停顿特征
    let pauseStart = -1;
    let isPausing = false;
    
    for (let i = 1; i < track.length; i++) {
      const dt = track[i].t - track[i-1].t;
      const dx = track[i].x - track[i-1].x;
      
      // 计算瞬时速度 (px/s)
      const speed = dt > 0 ? (dx / (dt / 1000)) : 0;
      features.speedDistribution.push(Math.round(speed));
      
      // 检测停顿 (速度接近0且时间间隔大)
      if (Math.abs(speed) < 3 && dt > 100) {
        if (!isPausing) {
          pauseStart = track[i-1].t;
          isPausing = true;
        }
      } else if (isPausing) {
        // 停顿结束
        isPausing = false;
        const pauseDuration = track[i].t - pauseStart;
        if (pauseDuration > 50) {
          features.pauses++;
          features.pauseDurations.push(pauseDuration);
        }
      }
      
      // 检测微小回退
      if (dx < -0.5) {
        features.backwardsCount++;
      }
      
      // 计算加速度 (如果有足够点)
      if (i > 1) {
        const prevDt = track[i-1].t - track[i-2].t;
        const prevDx = track[i-1].x - track[i-2].x;
        
        const prevSpeed = prevDt > 0 ? (prevDx / (prevDt / 1000)) : 0;
        const acceleration = dt > 0 ? ((speed - prevSpeed) / (dt / 1000)) : 0;
        
        features.accelerationDistribution.push(Math.round(acceleration));
      }
    }
    
    // 保存特征到文件
    const dir = path.join(__dirname, '../track-features');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const featuresPath = path.join(dir, `success-features-${new Date().getTime()}.json`);
    fs.writeFileSync(featuresPath, JSON.stringify(features, null, 2));
    console.log(`成功轨迹特征已保存: ${featuresPath}`);
    
  } catch (e: any) {
    console.error(`保存成功轨迹特征失败: ${e.message}`);
  }
}

// 执行登录
loginTaobao().catch(error => {
  console.error('程序运行出错:', error);
  process.exit(1);
}); 