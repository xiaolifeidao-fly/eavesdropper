'use client'
import React, { useEffect, useState } from 'react';
import { Card, Progress, Button, message, Modal } from 'antd';
import { InstallerApi } from '@eleapi/installer.api';
import styles from './page.module.css';


export default function InstallerPage() {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    releaseNotes: string;
  } | null>(null);

  const handleProgress = async (percent: number) => {
    setProgress(Number(percent));
  };

  const handleDownloadComplete = async (event: any) => {
    setIsDownloading(false);
    setIsDownloadComplete(true);
    setUpdateInfo({
      version: event.version,
      releaseNotes: event.releaseNotes
    });
  };

  const showErrorMessage = (error : string) => {
    message.error(error);
  }

  useEffect(() => {
    // Listen for update progress
    const searchParams = new URLSearchParams(window.location.search);
    const version = searchParams.get('version');
    const releaseNotes = searchParams.get('releaseNotes');
    setUpdateInfo({
      version: version || '',
      releaseNotes: releaseNotes || ''
    });
    
    const installerApi = new InstallerApi();
    installerApi.onMonitorDownloadProgress(handleProgress);
    installerApi.onMonitorUpdateDownloaded(handleDownloadComplete);
    installerApi.onMonitorUpdateDownloadedError(showErrorMessage);

    return () => {
      // Cleanup is handled by the API itself
    };
  }, []);

  const handleUpdate = async () => {
    try {
      setIsDownloading(true);
      const installerApi = new InstallerApi();
      await installerApi.update();
    } catch (error) {
      message.error('更新失败: ' + error);
      setIsDownloading(false);
    }
  };

  const handleCancel = async () => {
    //添加确认框
    const confirm = Modal.confirm({
        title: '确认',
        content: '确定要退出吗？',
        onOk: async () => {
  
        try {
            const installerApi = new InstallerApi();
            await installerApi.cancelUpdate();
            setIsDownloading(false);
            setProgress(0);
        } catch (error) {
        message.error('取消更新失败: ' + error);
        }
        }
    });
  };

  const handleInstall = async () => {
    try {
    const installerApi = new InstallerApi();
      await installerApi.install();
    } catch (error) {
      message.error('安装失败: ' + error);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="软件更新" className={styles.card}>
        {updateInfo && (
          <div className={styles.updateInfo}>
            <h3>版本 {updateInfo.version}</h3>
            <p>{updateInfo.releaseNotes}</p>
          </div>
        )}
        
        <Progress 
          percent={progress} 
          status={isDownloading ? 'active' : 'normal'}
          className={styles.progress}
        />

        <div className={styles.actions}>
          {!isDownloadComplete ? (
            <>
              <Button 
                type="primary" 
                onClick={handleUpdate}
                loading={isDownloading}
                disabled={isDownloading}
              >
                立即更新
              </Button>
              {isDownloading && (
                <Button 
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  退出
                </Button>
              )}
            </>
          ) : (
            <Button 
              type="primary" 
              onClick={handleInstall}
            >
              立即安装
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
