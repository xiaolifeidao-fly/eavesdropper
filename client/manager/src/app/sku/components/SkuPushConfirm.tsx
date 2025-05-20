'use client'
import React from 'react';
import { Result } from 'antd';

export interface PublishResult {
  count?: number;
  successCount?: number;
  errorCount?: number;
}

const SukPushConfirm: React.FC<PublishResult> = (props) => {

  const count = props?.count || 0;
  const successCount = props?.successCount || 0;
  const errorCount = props?.errorCount || 0;

  const resultStatus = errorCount > 0 ? 'error' : 'success';
  const subTitle = resultStatus === 'success' ? `共发布${count}个商品，成功${successCount}个` : `共发布${count}个商品，成功${successCount}个，失败${errorCount}个`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Result
        key="skuPushConfirm"
        status={resultStatus}
        title={resultStatus === 'success' ? '发布成功' : '商品发布预处理完成（部分失败）'}
        subTitle={subTitle}
      />
    </div>
  )
}

export default SukPushConfirm;