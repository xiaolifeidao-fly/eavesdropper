import { autoUpdater } from 'electron-updater'
import { UpdateInfo } from 'builder-util-runtime'
import log from 'electron-log'
import { BrowserWindow, dialog, ipcMain, app } from 'electron'

let updateFlag = false // 防止重复检查
let isUpdateAvailable = false // 标志是否发现新版本
let isDownloading = false // 标志是否正在下载
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
  
  console.info('已在开发环境中启用更新检查功能');
  
  // 强制设置更新URL（如果package.json中的配置失效）
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://101.43.28.195/updates/'
  });

  // 开发环境中拦截downloadUpdate调用，避免实际下载
  // @ts-ignore - 我们知道这里类型不匹配，但这是开发环境下的模拟代码
  const originalDownloadUpdate = autoUpdater.downloadUpdate;
  // @ts-ignore - 忽略类型错误，因为这只是开发环境下的模拟
  autoUpdater.downloadUpdate = function(...args) {
    console.log('开发环境：拦截下载更新操作，不实际下载安装包');
    if (isDev) {
      // 模拟下载进度
      simulateDownloadProgress(this);
      return Promise.resolve([]);
    }
    return originalDownloadUpdate.apply(this, args);
  };
  
  return autoUpdater;
}

// 模拟下载进度
// @ts-ignore - 忽略updater参数类型，实际上它是AutoUpdater实例
function simulateDownloadProgress(updater: any) {
  let percent = 0;
  const interval = setInterval(() => {
    percent += 10;
    if (percent <= 100) {
      updater.emit('download-progress', { percent });
      console.log(`模拟下载进度: ${percent}%`);
    } else {
      clearInterval(interval);
      console.log('模拟下载完成');
      updater.emit('update-downloaded', {
        version: '1.2.0',
        releaseNotes: '这是模拟的更新内容\n- 测试功能1\n- 测试功能2'
      });
    }
  }, 500);
}

// 手动触发更新检查的函数（可通过调试菜单调用）
export function testUpdateCheck() {
  console.info('手动触发更新检查...');
  checkForUpdates();
}

// 自动更新检查
export async function checkForUpdates() {
  if (updateFlag || isUpdateAvailable) {
    console.info('正在进行更新检查或已有新版本，不重复检查。')
    return
  }

  updateFlag = true // 锁定更新检查

  try {
    console.info('开始检查更新...')
    const result = await autoUpdater.checkForUpdates()
    console.info(result)
  } catch (error) {
    console.info('更新检查失败:', error)
  } finally {
    updateFlag = false // 解除更新锁
  }
}


export function setupAutoUpdater(win: BrowserWindow) {
  // 监听更新事件
  autoUpdater.on('checking-for-update', () => {
    console.info('正在检查更新...');
  });

  // autoUpdater.on('update-available', () => {
  //   console.info('发现新版本...');
  //   isUpdateAvailable = true; // 标志新版本已找到

  //   // 弹出确认对话框
  //   win.webContents.send('update-confirm', '发现新版本，是否立即下载更新？');
  // });

  // 修改update-available事件处理
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.info('发现新版本...', info.version);
    isUpdateAvailable = true;
    
    // 读取版本信息
    const newVersion = info.version;
    const releaseNotes = info.releaseNotes || '';
    const releaseName = info.releaseName || '新版本';
    
    // 读取自定义字段(注意：这些字段在TypeScript类型中不存在，需要类型断言)
    const updateInfo = info as any;
    const forceUpdate = updateInfo.forceUpdate === true;
    const updateType = updateInfo.updateType || 'normal';
    
    // 向前端发送更新信息
    win.webContents.send('update-info', {
      version: newVersion,
      notes: releaseNotes,
      name: releaseName,
      forceUpdate: forceUpdate,
      updateType: updateType
    });
    
    // 根据更新类型决定行为
    if (forceUpdate) {
      // 强制更新：显示无法关闭的对话框，并自动开始下载
      dialog.showMessageBox(win, {
        type: 'warning',
        title: '强制更新',
        message: `发现新版本(${newVersion})，需要立即更新`,
        detail: typeof releaseNotes === 'string' ? releaseNotes : '包含重要更新，必须更新才能继续使用',
        buttons: ['开始更新'],
        cancelId: -1, // 防止用户关闭对话框
      }).then(() => {
        autoUpdater.downloadUpdate();
      });
    } else {
      // 可选更新：显示可关闭的对话框，让用户选择
      dialog.showMessageBox(win, {
        type: 'info',
        title: '发现新版本',
        message: `${releaseName} (${newVersion}) 可供更新`,
        detail: typeof releaseNotes === 'string' ? releaseNotes : '是否立即更新？',
        buttons: ['稍后再说', '立即更新'],
        cancelId: 0,
      }).then(({response}) => {
        if (response === 1) {
          autoUpdater.downloadUpdate();
        }
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.info('当前已经是最新版本.');
  });

  autoUpdater.on('error', (error: any) => {
    log.error('更新出错:', error);
    
    // 在开发环境中，当出现错误时提供更多信息
    if (isDev) {
      console.log('这是开发环境。更新错误可能是因为DMG/EXE文件格式不兼容。');
      console.log('您可以通过"调试"菜单中的"模拟更新可用"来测试更新流程UI。');
    }
    
    updateFlag = false; // 解除更新锁
    isDownloading = false;
  });

  autoUpdater.on('download-progress', (progressObj: any) => {
    const percent = Math.round(progressObj.percent);
    console.info(`下载进度: ${percent}%`);
    win.webContents.send('update-log', `下载进度: ${percent}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    console.info('下载完成，准备安装...');
    // 提示用户安装更新
    showUpdateDialog(win);
  });
}


// 创建弹窗提示
function showUpdateDialog(win: BrowserWindow) {
  dialog.showMessageBox(win, {
    type: 'info',
    title: '更新可用',
    message: '发现新版本，需要立即更新！',
    buttons: ['立即更新'],
  }).then(result => {
    if (result.response === 0) {
      if (isDev) {
        console.log('开发环境：模拟退出并安装');
        dialog.showMessageBox(win, {
          type: 'info',
          title: '开发环境',
          message: '在开发环境中，不会真正执行安装。这里只是模拟流程。',
          buttons: ['确定']
        });
      } else {
        // 用户点击 "立即更新" 按钮，执行更新
        autoUpdater.quitAndInstall();
      }
    }
  });
}

function confirmUpdateDownload(userConfirmed: boolean) {
  if (!isUpdateAvailable || isDownloading) {
    console.info('无可用更新或下载已开始，无法进行此操作。');
    return;
  }

  if (userConfirmed) {
    console.info('用户确认下载更新...');
    isDownloading = true;
    autoUpdater.downloadUpdate(); // 开始下载更新
  } else {
    console.info('用户取消了更新下载。');
  }
}

// 示例：监听前端用户确认事件
ipcMain.on('user-update-confirm', (event, userConfirmed) => {
  confirmUpdateDownload(userConfirmed);
});