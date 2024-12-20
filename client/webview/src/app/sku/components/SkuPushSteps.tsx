'use client';
import React, { useState } from 'react';
import {
  StepsForm,
} from '@ant-design/pro-components';
import { Modal, message } from 'antd';

import ImportSku from './SkuLinkUpload';
import type { SkuInfo } from './SkuLinkUpload';
import SkuPushProgress from './SkuPushProgress';
import SukPushConfirm from './SkuPushConfirm';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

interface PushSkuStepsFormProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const SkuPushStepsForm: React.FC<PushSkuStepsFormProps> = ({ visible, setVisible }) => {

  const [uploadUrlList, setUploadUrlList] = useState<SkuInfo[]>([]);

  return (
    <>
      <StepsForm
        onFinish={async (values) => {
          console.log(values);
          await waitTime(1000);
          setVisible(false);
          message.success('提交成功');
        }}
        containerStyle={{ width: '100%' }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="发布商品"
              width={2000}
              onCancel={() => setVisible(false)}
              open={visible}
              footer={submitter}
              destroyOnClose
            >
              {dom}
            </Modal>
          );
        }}
      >
        {/* 第一步： 导入链接 */}
        <StepsForm.StepForm
          name="import"
          title="导入链接"
          style={{ height: '400px' }}
          onFinish={async () => {
            console.log(uploadUrlList);
            return false;
          }}
        >
          <ImportSku uploadUrlList={uploadUrlList} setUploadUrlList={setUploadUrlList} />
        </StepsForm.StepForm>

        {/* 第二步： 发布进度 */}
        <StepsForm.StepForm
          name="progress"
          title="发布进度"
          style={{ height: '400px' }}
        >
          <SkuPushProgress />
        </StepsForm.StepForm>

        {/* 第三步： 发布确认 */}
        <StepsForm.StepForm name="time" title="发布确认">
          <SukPushConfirm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default SkuPushStepsForm;