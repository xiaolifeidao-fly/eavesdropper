import { app, BrowserWindow,protocol, dialog, autoUpdater } from 'electron';

const path = require('path');
import * as dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件中的环境变量
import { mainWindow, setMainWindow } from './windows';

// import log from 'electron-log';
import { registerRpc } from './register/rpc';
import { init } from './store';

require('module-alias/register');

// log.info("app load")
async function createDefaultWindow() {
  init();
  const mainWindow = await createWindow('main', process.env.WEBVIEW_URL || "");
  setMainWindow(mainWindow);
}
 
export async function createWindow(windowId : string, url : string) {
  const windowInstance = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webviewTag: true, // 启用 webview 标签
      webSecurity: false,
      nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
    }
  });

  // 设置和获取数据示例
  //@ts-ignore
  // store.set('userPreferences', "ddd");
    //@ts-ignore
  // console.log(store.get('userPreferences'));
  // 加载NestJS服务
  windowInstance.loadURL(url); // 假设NestJS服务运行在本地3000端口

  // 打开开发者工具
  windowInstance.webContents.openDevTools();
  //@ts-ignore
  windowInstance.webContents.windowId = windowId;
  return windowInstance;
}

function registerFileProtocol(){
  protocol.registerFileProtocol('localfile', (request, callback) => {
    const url = request.url.replace(/^localfile:\/\//, '');
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      console.error('ERROR: registering local file protocol', error);
    }
  });
}

// 自动更新检查
function checkForUpdates() {

  // 检查新版本
  autoUpdater.checkForUpdates()

  // 监听更新事件
  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
  })

  autoUpdater.on('update-available', () => {
    console.log('发现新版本...')
  })

  autoUpdater.on('update-not-available', () => {
    console.log('当前已经是最新版本.')
  })

  autoUpdater.on('error', (error) => {
    console.error('更新出错:', error)
  })

  autoUpdater.on('update-downloaded', (_) => {
    console.log('下载完成，准备安装...')
    // 下载完成后进行弹窗提示(也可以直接调用autoUpdater.quitAndInstall()进行更新)
    showUpdateDialog()
  })
}

// 创建弹窗提示
function showUpdateDialog() {
  if (!mainWindow) {
    return;
  }

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '更新可用',
    message: '发现新版本，需要立即更新！',
    buttons: ['立即更新'],
  }).then(result => {
    if (result.response === 0) {
      // 用户点击 "立即更新" 按钮，执行更新
      autoUpdater.quitAndInstall();
    }
  });
}

export const start = () => {
  
    app.on('ready', async ()=> {
      registerRpc();
      registerFileProtocol();
      await createDefaultWindow();
      // registerSessionInterceptor('targetWindow', session.defaultSession);
    });
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    app.on('activate', async () => {
      if (mainWindow === null) {
        await createDefaultWindow();
      }
    });

  // 每隔一段时间自动检查更新
  setInterval(() => {
  	// 调用上方的函数
    checkForUpdates()
  }, 10 * 1000) // 10秒检查一次更新
}


