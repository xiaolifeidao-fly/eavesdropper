// const { app, BrowserWindow,ipcMain,protocol} = require('electron');
import { app, BrowserWindow, CallbackResponse, ipcMain,OnBeforeRequestListenerDetails,protocol, session } from 'electron';
import * as fs from 'fs';
const path = require('path');
import * as dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件中的环境变量
import { mainWindow, setMainWindow } from './windows';

import log from 'electron-log';
import { registerRpc } from './register/rpc';


log.info("app load")
async function createDefaultWindow() {
  // const url = `${getClientBaseUrl()}/clip`;
  const mainWindow = await createWindow('main', 'http://localhost:8081/shop');
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
}


