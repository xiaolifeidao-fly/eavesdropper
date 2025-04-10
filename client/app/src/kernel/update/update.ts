import { autoUpdater } from 'electron-updater'
import { UpdateInfo, ReleaseNoteInfo } from 'builder-util-runtime'
import log from 'electron-log'
import { BrowserWindow, dialog, ipcMain, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { setUpdateWindow } from '../windows'

let updateFlag = false // 防止重复检查
let isUpdateAvailable = false // 标志是否发现新版本
let isDev = !app.isPackaged // 是否为开发环境

// 在开发环境中启用更新检查
export function enableUpdateInDev() {
  // 绕过开发环境限制
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    }
  });
  
  // 启用详细日志
  autoUpdater.logger = log;
  // @ts-ignore - electron-log的类型定义可能与实际使用不匹配
  autoUpdater.logger.transports.file.level = 'debug';
  
  log.info('已在开发环境中启用更新检查功能');
  
  // 强制设置更新URL（如果package.json中的配置失效）
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://101.43.28.195/updates/'
  });
  
  return autoUpdater;
}

// 自动更新检查
export async function checkForUpdates() {
  if (updateFlag || isUpdateAvailable) {
    log.info('正在进行更新检查或已有新版本，不重复检查。')
    return
  }

  updateFlag = true // 锁定更新检查

  try {
    log.info('开始检查更新...')
    const result = await autoUpdater.checkForUpdates()
    log.info(result)
  } catch (error) {
    log.info('更新检查失败:', error)
  } finally {
    updateFlag = false // 解除更新锁
  }
}

// 检查并创建更新目录
function ensureUpdateDirectory() {
  const updateDir = path.join(app.getPath('userData'), 'updater');
  if (!fs.existsSync(updateDir)) {
    fs.mkdirSync(updateDir, { recursive: true });
  }
  return updateDir;
}

export function setupAutoUpdater(win: BrowserWindow) {
  // 确保更新目录存在
  ensureUpdateDirectory();
  
  // 设置更新配置
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoDownload = false; // 不自动下载，等待用户确认
  autoUpdater.allowPrerelease = true;
  
  // 设置管理员权限
  autoUpdater.requestHeaders = {
    'User-Agent': 'Electron'
  };
  
  // 设置更新目录权限
  if (process.platform === 'win32') {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: process.env.UPDATE_URL || 'http://101.43.28.195/updates/',
      channel: 'latest',
      useMultipleRangeRequest: false
    });
  }

  // 监听更新事件
  autoUpdater.on('checking-for-update', () => {
    log.info('正在检查更新...');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('发现新版本...', info.version);
    isUpdateAvailable = true;
    
    // 读取版本信息
    const newVersion = info.version;
    const releaseNotes = info.releaseNotes || '';
    const releaseName = info.releaseName || '新版本';
    
    // 读取自定义字段
    const updateInfo = info as any;
    const forceUpdate = updateInfo.forceUpdate === true;
    const updateType = updateInfo.updateType || 'normal';

    // 打开更新页面
    const updateWindow = new BrowserWindow({
      width: 800,
      height: 600,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        webviewTag: true, // 启用 webview 标签
        // devTools: true,
        webSecurity: false,
        nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
      }
    });

    // 加载更新页面，并传递版本信息
    const notesText = typeof releaseNotes === 'string' 
      ? releaseNotes 
      : Array.isArray(releaseNotes) 
        ? releaseNotes.map(note => typeof note === 'string' ? note : note.note).join('\n')
        : '';
    setUpdateWindow(updateWindow);
    const updateUrl = `${process.env.UPDATE_WEBVIEW_URL}?version=${newVersion}&releaseNotes=${encodeURIComponent(notesText)}&releaseName=${encodeURIComponent(releaseName)}&forceUpdate=${forceUpdate}&updateType=${updateType}`
    updateWindow.loadURL(updateUrl);
    updateWindow.on('closed', () => {
       app.quit();
    });

  });

  autoUpdater.on('update-not-available', () => {
    log.info('当前已经是最新版本.');
  });

  autoUpdater.on('error', (error: any) => {
    log.error('更新出错:', error);
    
    // 在开发环境中，当出现错误时提供更多信息
    if (isDev) {
      log.info('这是开发环境。更新错误可能是因为DMG/EXE文件格式不兼容。');
      log.info('您可以通过"调试"菜单中的"模拟更新可用"来测试更新流程UI。');
    }
    
    updateFlag = false; // 解除更新锁
  });
}

// 示例：监听前端用户确认事件
ipcMain.on('user-update-confirm', (event, userConfirmed) => {
  if (userConfirmed) {
    autoUpdater.downloadUpdate();
  }
});