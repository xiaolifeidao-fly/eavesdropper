'use client';
import React, { useState } from 'react';
import { StepsForm } from '@ant-design/pro-components';
import { Modal, message, Button, Form, Select } from 'antd';

import ImportSku from './SkuLinkUpload';
import type { LinkInfo } from './SkuLinkUpload';
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

  const [sourceAccount, setSourceAccount] = useState('');
  const [pushSkuFlag, setPushSkuFlag] = useState(false);
  const [current, setCurrent] = useState(0);
  const [uploadUrlList, setUploadUrlList] = useState<LinkInfo[]>([]); // 链接列表

  const onCancel = () => {
    setVisible(false);
    setCurrent(0);
    setUploadUrlList([]);
    setPushSkuFlag(false);
  }

  return (
    <>
      <StepsForm
        current={current}
        onCurrentChange={(current) => {
          setCurrent(current);
        }}
        onFinish={async (values) => {
          console.log(values);
          await waitTime(1000);
          setVisible(false);
          message.success('提交成功');
          return true;
        }}
        submitter={{
          render: (props) => {
            const step = props.step;

            if (step === 2) { // 第三步
              return [
                <Button key={`cancel-${step}`} onClick={onCancel}>
                  取消
                </Button>,
                <Button type="primary" key={`submit-${step}`} onClick={() => props.onSubmit?.()}>
                  确认发布
                </Button>
              ];
            }

            return [
              <Button key={`cancel-${step}`} onClick={onCancel}>
                取消
              </Button>,
              <Button
                type="primary"
                key={`submit-${step}`}
                onClick={() => props.onSubmit?.()}
              >
                下一步
              </Button>
            ];
          }
        }}
        containerStyle={{ width: '100%' }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="发布商品"
              width={2000}
              onCancel={onCancel}
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
            if (uploadUrlList.length === 0) {
              message.error('请先导入链接');
              return false;
            }

            if (pushSkuFlag) {
              return true;
            }

            // 调用推送接口 TODO

            setPushSkuFlag(true);
            return true;
          }}
        >
          <Select
            placeholder="请选择资源账号"
            options={[{ label: '资源账号1', value: '1' }, { label: '资源账号2', value: '2' }]}
            onChange={setSourceAccount}
            style={{ width: '100%' }}
          />
          <ImportSku uploadUrlList={uploadUrlList} setUploadUrlList={setUploadUrlList} />
        </StepsForm.StepForm>

        {/* 第二步： 发布进度 */}
        <StepsForm.StepForm
          name="progress"
          title="发布进度"
          style={{ height: '400px' }}
          onFinish={async () => {
            console.log('发布进度');
            return true;
          }}
        >
          <SkuPushProgress uploadUrlList={uploadUrlList} />
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