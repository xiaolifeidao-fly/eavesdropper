'use client';
import React, { useRef } from 'react';
import { message } from 'antd';
import {
  ProForm,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { useRouter } from 'next/navigation';

import { modifyAuthUserPassword as modifyAuthUserPasswordApi } from '@api/auth/auth.api';
import { ModifyAuthUserPasswordReq } from '@model/auth/auth';
import { encryptRSA } from '@utils/auth';
import { useAuth } from '@/context/AuthContext';

interface UserPasswordProps {
  oldPassword: string;
  newPassword: string;
}

const UserPassword: React.FC = () => {

  const formRef = useRef<ProFormInstance<UserPasswordProps>>();

  const { clearUserLogin } = useAuth();
  const router = useRouter();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <ProForm
        formRef={formRef}
        grid={true}
        layout='vertical'
        submitter={{
          render: (_, dom) => <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{dom}</div>,
          searchConfig: {
            submitText: '保存',
          },
        }}
        onFinish={async (values) => {

          const oldPassword = encryptRSA(values.oldPassword);
          const newPassword = encryptRSA(values.newPassword);

          const req = new ModifyAuthUserPasswordReq(oldPassword, newPassword);
          const result = await modifyAuthUserPasswordApi(req);
          if (result) {
            message.success('更新密码成功');
            clearUserLogin();
            router.push('/auth/login');
          }
          return true;
        }}
      >
        <ProForm.Group style={{ width: '100%' }}>
          <ProFormText.Password rules={[{ required: true, message: '请输入旧密码' }]} name="oldPassword" label="旧密码" placeholder="请输入旧密码" />
          <ProFormText.Password rules={[{ required: true, message: '请输入新密码' }, {
            validator: (_, value) => {
              if (value === formRef.current?.getFieldValue('oldPassword')) {
                return Promise.reject(new Error('新旧密码不能相同'));
              }
              return Promise.resolve();
            }
          }]} name="newPassword" label="新密码" placeholder="请输入新密码" />
        </ProForm.Group>
      </ProForm>
    </div>
  );
};

export default UserPassword; 