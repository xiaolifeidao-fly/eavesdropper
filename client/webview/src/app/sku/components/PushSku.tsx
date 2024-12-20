import React from 'react';
import {
  StepsForm,
} from '@ant-design/pro-components';
import { Modal, message } from 'antd';

import ImportSku from './ImportSku';
import PushProgress from './PushProgress';
import PushConfirm from './PushConfirm';

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

const PushSkuStepsForm: React.FC<PushSkuStepsFormProps> = ({ visible, setVisible }) => {

  return (
    <>
      <StepsForm
        onFinish={async (values) => {
          console.log(values);
          await waitTime(1000);
          setVisible(false);
          message.success('提交成功');
        }}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
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
            await waitTime(2000);
            return true;
          }}
        >
          <ImportSku />
        </StepsForm.StepForm>

        {/* 第二步： 发布进度 */}
        <StepsForm.StepForm
          name="progress"
          title="发布进度"
          style={{ height: '400px' }}
        >
          <PushProgress />
        </StepsForm.StepForm>

        {/* 第三步： 发布确认 */}
        <StepsForm.StepForm name="time" title="发布确认">
          <PushConfirm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default PushSkuStepsForm;