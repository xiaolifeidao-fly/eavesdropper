import React from 'react';
import { Result } from 'antd';

const PushConfirm: React.FC = () => {

  const count = 100;
  const resultStatus = Math.random() > 0.5 ? 'success' : 'warning';
  const subTitle = resultStatus === 'success' ? `共发布${count}个商品，成功${count}个` : `共发布${count}个商品，成功${count - 1}个，失败${1}个`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Result
        status={resultStatus}
        title={resultStatus === 'success' ? '发布成功' : '商品发布预处理完成（部分失败）'}
        subTitle={subTitle}
      />
    </div>
  )
}

export default PushConfirm;