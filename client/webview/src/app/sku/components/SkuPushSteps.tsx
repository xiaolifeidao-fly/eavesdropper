'use client';
import React, { useState } from 'react';
import { StepsForm } from '@ant-design/pro-components';
import { Modal, message, Button, Form, Select } from 'antd';

import ImportSku from './SkuLinkUpload';
import type { LinkInfo } from './SkuLinkUpload';
import SkuPushProgress from './SkuPushProgress';
import type { SkuUrl } from './SkuPushProgress';
import SukPushConfirm from './SkuPushConfirm';
import type { PublishResult } from './SkuPushConfirm';
import { StoreApi } from '@eleapi/store/store';

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
  onClose: () => void;
}

const SkuPushStepsForm: React.FC<PushSkuStepsFormProps> = (props) => {

  const [sourceAccount, setSourceAccount] = useState<number>(0);
  const [pushSkuFlag, setPushSkuFlag] = useState(false);
  const [current, setCurrent] = useState(0);
  const [uploadUrlList, setUploadUrlList] = useState<LinkInfo[]>([]); // 链接列表
  const [urls, setUrls] = useState<SkuUrl[]>([]);
  const [onPublishFinish, setOnPublishFinish] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult>();
  const [taskId, setTaskId] = useState<number>(0);

  const store = new StoreApi();

  const onCancel = () => {
    if (taskId > 0) {
      store.removeItem(`task_${taskId}`);
    }
    props.setVisible(false);
    setCurrent(0);
    setUploadUrlList([]);
    setPushSkuFlag(false);
    setUrls([]);
    setOnPublishFinish(false);
    setPublishResult(undefined);
    props.onClose(); // 关闭弹窗
  }

  return (
    <>
      <StepsForm
        current={current}
        onCurrentChange={(current) => {
          setCurrent(current);
        }}
        submitter={{
          render: (props) => {
            const step = props.step;
            const buttons = [];
            const buttonNextText = step === 2 ? "确认发布" : "下一步";
            buttons.push(<Button key={`cancel-${step}`} onClick={() => { onCancel() }}>取消</Button>);
            buttons.push(<Button type="primary" key={`submit-${step}`} onClick={() => props.onSubmit?.()} disabled={step === 1 && !onPublishFinish}>{buttonNextText}</Button>);
            return buttons;
          }
        }}
        containerStyle={{ width: '100%' }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="发布商品"
              width={2000}
              onCancel={onCancel}
              open={props.visible}
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
            if (sourceAccount === 0) {
              message.error('请选择资源账号');
              return false;
            }

            if (uploadUrlList.length === 0) {
              message.error('请先导入链接');
              return false;
            }

            if (pushSkuFlag) {
              return true;
            }

            const urls: SkuUrl[] = uploadUrlList.map(item => { return { url: item.url } });
            setUrls(urls);
            setPushSkuFlag(true);
            return true;
          }}
        >
          <Select
            placeholder="请选择资源账号"
            options={[{ label: '资源账号1', value: 1 }, { label: '资源账号2', value: 2 }]}
            onChange={(value) => setSourceAccount(value)}
            style={{ width: '100%', margin: 0, padding: 0 }}
          />
          <ImportSku uploadUrlList={uploadUrlList} setUploadUrlList={setUploadUrlList} />
        </StepsForm.StepForm>

        {/* 第二步： 发布进度 */}
        <StepsForm.StepForm
          name="progress"
          title="发布进度"
          style={{ height: '400px' }}
          onFinish={async () => {
            return true;
          }}
        >
          <SkuPushProgress
            publishResourceId={sourceAccount}
            urls={urls}
            onPublishFinish={setOnPublishFinish}
            setPublishResult={setPublishResult}
            setTaskId={setTaskId}
          />
        </StepsForm.StepForm>

        {/* 第三步： 发布确认 */}
        <StepsForm.StepForm
          name="time"
          title="发布确认"
          onFinish={async () => {
            onCancel(); // 关闭弹窗
            message.success('发布完成');
            return false;
          }}
        >
          <SukPushConfirm {...publishResult} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default SkuPushStepsForm;