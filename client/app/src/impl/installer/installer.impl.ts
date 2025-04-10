import { InstallerApi } from "@eleapi/installer.api";
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import log from 'electron-log';
import { app } from "electron";
import { updateWindow } from "@src/kernel/windows";

export class InstallerImpl extends InstallerApi {
  private isDownloading = false;


  constructor() {
    super();
    this.setupAutoUpdater();
  }

  sendMessage(key : string, ...args: any){
    updateWindow?.webContents.send(key, ...args);
    log.info(`sendMessage: ${key}`, args);
  }

  private setupAutoUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on('download-progress', (progressObj: any) => {
      const percent = Math.round(progressObj.percent);
      log.info(`下载进度: ${percent}%`);
      this.send('onMonitorDownloadProgress', percent);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('下载完成，准备安装...');
      this.send('onMonitorUpdateDownloaded', {
        version: info.version,
        releaseNotes: info.releaseNotes
      });
    });

    autoUpdater.on('error', (error: any) => {
      log.error('更新出错:', error);
      this.send('onMonitorUpdateDownloadedError', error);
    });

  }

  //立即更新
  async update() {
    try {
      this.isDownloading = true;
      await autoUpdater.downloadUpdate();
    } catch (error) {
      this.isDownloading = false;
      this.send('onMonitorUpdateDownloadedError', error);
      throw error;
    }
  }

  //立即退出应用
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

  //立即安装
  async install() {
    try {
      autoUpdater.quitAndInstall();
    } catch (error) {
      this.send('onMonitorUpdateDownloadedError', error);
      throw error;
    }
  }
}
