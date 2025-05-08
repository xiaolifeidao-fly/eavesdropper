import { InstallerExtApi } from "@eleapi/installer.ext.api";
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import log from 'electron-log';
import { app } from "electron";
import { updateWindow } from "@src/kernel/windows";
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { get, set } from '@utils/store/electron';
import http from 'http';
import https from 'https';
import { IncomingMessage } from 'http';
import { createWriteStream } from 'fs';
import extract from 'extract-zip';
import { execSync } from 'child_process';
import { InvokeType, Protocols } from "@eleapi/base";
import { initPlatform } from "@src/door/engine";
export class InstallerExtImpl extends InstallerExtApi {
  private isDownloading = false;


  constructor() {
    super();
  }

  sendMessage(key: string, ...args: any) {
    updateWindow?.webContents.send(key, ...args);
  }

  //立即更新
  @InvokeType(Protocols.INVOKE)
  async update() {
    try {
      this.isDownloading = true;
      await this.installChrome();
    } catch (error) {
      this.isDownloading = false;
      this.send('onMonitorUpdateDownloadedError', error);
      throw error;
    }
  }

  //立即退出应用
  @InvokeType(Protocols.INVOKE)
  async cancelUpdate() {
    try {
      this.isDownloading = false;
      updateWindow?.close();
      app.quit();
    } catch (error) {
      this.send('onMonitorUpdateDownloadedError', error);
      throw error;
    }
  }

  //立即退出应用
  @InvokeType(Protocols.INVOKE)
  async finsihInstall() {
    try {
      log.info(`Finishing update`);
      this.isDownloading = false;
      updateWindow?.close();
    } catch (error) {
      this.send('onMonitorUpdateDownloadedError', error);
      throw error;
    }
  }

  async setDefaultChromePath(path: string, headerless: boolean) {
    log.info(`Setting default Chrome path: ${path}`);
    set("defaultChromePath_" + (headerless ? "headless" : "browser"), path);
  }

  getDefaultChromePath(headerless: boolean) {
    return get("defaultChromePath_" + (headerless ? "headless" : "browser"));
  }

  static async needUpdateChrome() {
    const chromeVersion = process.env.CHROME_VERSION || '1169';

    // 确定操作系统和对应的文件名
    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    // 创建userdata目录路径
    const userDataDir = path.join(app.getPath('userData'), 'chrome', chromeVersion);
    const browserAppName = isWindows ? 'chrome.exe' : 'Chromium.app';

    // 获取Chrome可执行文件路径
    const browserDirName = isWindows ? path.join(`chromium-${chromeVersion}`, "chrome-win", browserAppName) : path.join(`chromium-${chromeVersion}`, 'chrome-mac', browserAppName);
    const browserPath = path.join(userDataDir, browserDirName);
    log.info(`browserPath: ${browserPath}`);
    if (!fs.existsSync(browserPath)) {
      return true;
    }

    log.info('Chrome is up to date, no update needed');
    return false;
  }

  async installChrome(): Promise<string> {
    // 获取版本信息
    const chromeVersion = process.env.CHROME_VERSION || '1169';
    log.info(`Installing Chrome version ${chromeVersion}`);

    // 确定操作系统和对应的文件名
    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    // 构建文件名
    let zipFilename;
    if (isWindows) {
      zipFilename = 'chrome-win64.zip';
    } else if (isMac) {
      zipFilename = 'chrome-mac.zip';
    } else {
      throw new Error('Unsupported operating system');
    }

    // 创建userdata目录路径
    const userDataDir = path.join(app.getPath('userData'), 'chrome', chromeVersion);

    // 确保目录存在
    fs.mkdirSync(userDataDir, { recursive: true });

    // 下载URL
    const downloadUrl = `http://101.43.28.195/updates/chrome/${chromeVersion}/${zipFilename}`;

    // 下载路径
    const downloadPath = path.join(app.getPath('temp'), zipFilename);

    // 定义期望的目录结构
    const browserPrefix = `chromium-${chromeVersion}`;
    const headlessPrefix = `chromium_headless_shell-${chromeVersion}`;

    const chromeDirName = isWindows ? 'chrome-win' : 'chrome-mac';

    const browserDir = path.join(userDataDir, browserPrefix);
    const headlessDir = path.join(userDataDir, headlessPrefix);

    const browserExists = fs.existsSync(path.join(browserDir, chromeDirName));
    const headlessExists = fs.existsSync(path.join(headlessDir, chromeDirName));

    let downloadProgress = (browserExists && headlessExists) ? 1.0 : 0;

    // 更新进度
    const updateProgress = (progress: number) => {
      downloadProgress = progress / 100;
      this.send('onMonitorDownloadProgress', progress.toFixed(2));
      log.info(`Download progress: ${progress.toFixed(2)}%`);
    };

    // 初始显示进度
    updateProgress(downloadProgress * 100);

    // 只有当任一文件夹不存在时才下载和解压
    if (!browserExists || !headlessExists) {
      log.info(`Downloading Chrome from ${downloadUrl}`);

      // 下载文件
      await this.downloadFile(downloadUrl, downloadPath, updateProgress);

      log.info(`Extracting to ${userDataDir}`);

      // 解压文件
      await extract(downloadPath, { dir: userDataDir });
      // 清理下载的文件
      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }

      // 在 macOS 上设置权限
      if (isMac) {
        try {
          if (fs.existsSync(path.join(browserDir, chromeDirName))) {
            // 设置 chrome-mac 目录中的可执行文件权限
            const chromiumAppPath = path.join(browserDir, chromeDirName, 'Chromium.app');
            log.info(`Setting permissions for ${chromiumAppPath}`);

            // 确保整个目录有足够的权限
            execSync(`chmod -R +x "${chromiumAppPath}"`);

            // 特别强调 MacOS 目录下的可执行文件
            if (fs.existsSync(`${chromiumAppPath}/Contents/MacOS`)) {
              execSync(`chmod 755 "${chromiumAppPath}/Contents/MacOS/"*`);
              log.info(`Set executable permissions for ${chromiumAppPath}/Contents/MacOS/*`);
            }
          }

          if (fs.existsSync(path.join(headlessDir, chromeDirName))) {
            // 设置 headless-shell 目录中的可执行文件权限
            const headlessShellPath = path.join(headlessDir, chromeDirName, 'headless_shell');
            if (fs.existsSync(headlessShellPath)) {
              execSync(`chmod +x "${headlessShellPath}"`);
              log.info(`Set executable permissions for ${headlessShellPath}`);
            }
          }
        } catch (error) {
          log.error('Failed to set executable permissions:', error);
        }
      }
    } else {
      log.info(`Both Chrome browser and headless shell already exist, skipping download`);
      this.send('onMonitorUpdateDownloaded');
    }

    // 获取最终的可执行文件路径
    const browserAppName = isWindows ? 'chrome.exe' : 'Chromium.app';
    const headlessAppName = isWindows ? 'headless_shell.exe' : 'headless_shell';

    let browserPath = path.join(browserDir, chromeDirName, browserAppName);
    const headlessPath = path.join(headlessDir, chromeDirName, headlessAppName);
    if (isMac) {
      browserPath = path.join(browserPath, "Contents", "MacOS", "Chromium");
    }
    // 验证路径和执行权限
    log.info(`Verifying browser path: ${browserPath}`);
    log.info(`Verifying headless path: ${headlessPath}`);

    // 检查文件是否存在并有执行权限
    if (!fs.existsSync(browserPath)) {
      // 搜索目录结构以找到实际位置
      log.error(`Browser not found at expected path: ${browserPath}`);
      log.info(`Contents of ${userDataDir}:`, fs.readdirSync(userDataDir));

      if (fs.existsSync(browserDir)) {
        log.info(`Contents of ${browserDir}:`, fs.readdirSync(browserDir));

        const potentialBrowserDir = path.join(browserDir, chromeDirName);
        if (fs.existsSync(potentialBrowserDir)) {
          log.info(`Contents of ${potentialBrowserDir}:`, fs.readdirSync(potentialBrowserDir));
        }
      }

      throw new Error(`Chrome browser executable not found at ${browserPath} after installation`);
    }

    if (!fs.existsSync(headlessPath)) {
      log.error(`Headless shell not found at expected path: ${headlessPath}`);

      if (fs.existsSync(headlessDir)) {
        log.info(`Contents of ${headlessDir}:`, fs.readdirSync(headlessDir));

        const potentialHeadlessDir = path.join(headlessDir, chromeDirName);
        if (fs.existsSync(potentialHeadlessDir)) {
          log.info(`Contents of ${potentialHeadlessDir}:`, fs.readdirSync(potentialHeadlessDir));
        }
      }

      throw new Error(`Chrome headless executable not found at ${headlessPath} after installation`);
    }

    // 设置Chrome路径 - 普通浏览器 headless=false
    await this.setDefaultChromePath(browserPath, false);
    // 设置headless Chrome路径 headless=true
    await this.setDefaultChromePath(headlessPath, true);

    log.info(`Chrome installation completed: browser at ${browserPath}`);
    log.info(`Chrome headless shell at ${headlessPath}`);
    initPlatform();
    this.send('onMonitorUpdateDownloaded');
    return browserPath;
  }

  private downloadFile(
    url: string,
    destPath: string,
    progressCallback?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(destPath);

      // 根据URL协议选择http或https模块
      const requestModule = url.startsWith('https:') ? https : http;

      requestModule.get(url, (response: IncomingMessage) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedSize = 0;
        let lastLoggedPercent = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;

          if (totalSize && progressCallback) {
            const percent = (downloadedSize / totalSize) * 100;

            // 只在进度变化超过1%时调用回调，避免过多日志
            if (percent - lastLoggedPercent >= 1 || percent >= 100) {
              progressCallback(percent);
              lastLoggedPercent = percent;
            }
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        // 确保在出错时删除可能部分下载的文件
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(err);
      });
    });
  }
}
