'use client'
import React, { useEffect, useState } from 'react';
import { Card, Progress, Button, message, Modal } from 'antd';
import { InstallerExtApi } from '@eleapi/installer.ext.api';
import styles from './page.module.css';


export default function InstallerPage() {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);

  const handleProgress = async (percent: number) => {
    setProgress(Number(percent));
  };

  const handleDownloadComplete = async (event: any) => {
    setIsDownloading(false);
    setIsDownloadComplete(true);
  };

  const showErrorMessage = (error : string) => {
    message.error(error);
  }

  useEffect(() => {
    // Listen for update progress
    const searchParams = new URLSearchParams(window.location.search);
    const version = searchParams.get('version');
    const releaseNotes = searchParams.get('releaseNotes');
    
    const installerApi = new InstallerExtApi();
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
      const installerApi = new InstallerExtApi();
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
            const installerApi = new InstallerExtApi();
            await installerApi.cancelUpdate();
            setIsDownloading(false);
            setProgress(0);
        } catch (error) {
        message.error('取消更新失败: ' + error);
        }
        }
    });
  };

  const finishInstall = async () => {
    try {
    const installerApi = new InstallerExtApi();
      await installerApi.finsihInstall();
    } catch (error) {
      message.error('安装失败: ' + error);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="软件更新" className={styles.card}>
          <div className={styles.updateInfo}>
            <p>有新组件更新，请先更新,更新完成之后关掉此窗口即可.</p>
          </div>
        
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
              onClick={finishInstall}
            >
              完成
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
