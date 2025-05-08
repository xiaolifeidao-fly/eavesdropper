// require('module-alias/register');
import { app, BrowserWindow, protocol, Menu, MenuItem } from 'electron';
const path = require('path');
import * as dotenv from 'dotenv';
dotenv.config({path: path.join(__dirname, '.env')}); // 加载 .env 文件中的环境变量
import { mainWindow, setMainWindow } from './windows';

import { checkForUpdates, setupAutoUpdater, enableUpdateInDev } from './update/update';
import log from 'electron-log';
import { registerRpc } from './register/rpc';
import { init } from './store';
import Store from 'electron-store';
import { initPlatform } from '@src/door/engine';
import { validateTest } from '@src/validator/image.validator.test';
import { onResponse, syncPrice } from '@src/door/mb/sku/mb.publish.on';


log.info("app load")
async function createDefaultWindow() {
  try {
    const store = new Store();
    init(store);
    const mainWindow = await createWindow('main', process.env.WEBVIEW_URL + "/sku/task" || "");
    checkUpdate(mainWindow);
    setMainWindow(mainWindow);
    
  } catch (e) {
    log.error("createDefaultWindow error", e);
  }
}
 
export async function createWindow(windowId : string, url : string) {
  const windowInstance = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webviewTag: true, // 启用 webview 标签
      // devTools: true,
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
  // windowInstance.webContents.openDevTools();
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

// 添加开发环境调试菜单
function createDebugMenu(mainWindow: BrowserWindow) {
  // const menu = Menu.getApplicationMenu() || Menu.buildFromTemplate([]);
  
  // const debugSubmenu = new MenuItem({
  //   label: '调试',
  //   submenu: [
  //     {
  //       label: '检查更新',
  //       click: () => {
  //         testUpdateCheck();
  //       }
  //     },
  //     {
  //       label: '模拟更新可用',
  //       click: () => {
  //         // 模拟发现更新的对话框
  //         mainWindow.webContents.send('update-info', {
  //           version: '1.2.0',
  //           notes: '这是一个测试更新\n- 测试功能1\n- 测试功能2',
  //           name: '测试版本',
  //           forceUpdate: false,
  //           updateType: 'normal'
  //         });
  //       }
  //     },
  //     { type: 'separator' },
  //     {
  //       label: '应用信息',
  //       click: () => {
  //         log.info('应用版本:', app.getVersion());
  //         log.info('更新URL:', process.env.UPDATE_URL || 'http://101.43.28.195/updates/');
  //         log.info('是否打包:', app.isPackaged);
  //       }
  //     }
  //   ]
  // });
  
  // menu.append(debugSubmenu);
  // Menu.setApplicationMenu(menu);
}

function checkUpdate(mainWindow: BrowserWindow){
  log.info("checkUpdate: ", mainWindow);

  // 添加开发环境调试菜单
  if (!app.isPackaged) {
    // createDebugMenu(mainWindow);
    
    // 在开发环境中启用更新
    enableUpdateInDev();
    
    log.info("已在开发环境中启用更新检查");
  }

  // 设置自动更新
  setupAutoUpdater(mainWindow);

  // 立即检查一次更新
  log.info("应用启动: 立即检查更新...");
  setTimeout(() => {
    checkForUpdates();
  }, 200); // 延迟2秒，确保窗口已完全加载
  
  // 每隔一段时间自动检查更新
  // setInterval(async () => {
  //   // 调用上方的函数
  //   await checkForUpdates()
  // }, 60 * 1000) // 60秒检查一次更新
}


export const start = () => {
    app.on('ready', async ()=> {
      try {
        registerRpc();
        registerFileProtocol();

        await createDefaultWindow();
      } catch (e) {
        log.error("ready createDefaultWindow error", e);
      }
    });

    app.on('window-all-closed', () => {
      try {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      } catch (e) {
        log.error("window-all-closed error", e);
      }
    });
    
    app.on('activate', async () => {
      try {
        if (mainWindow === null) {
          await createDefaultWindow();
        }
      } catch (e) {
        log.error("activate createDefaultWindow error", e);
      }
    });
}



