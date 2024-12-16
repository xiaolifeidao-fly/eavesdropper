'use client';
import React, { useEffect, useRef } from 'react';
import { Avatar, message } from 'antd';
import {
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import type { FormInstance } from '@ant-design/pro-components';

import { updateAuthUserInfo as updateAuthUserInfoApi } from '@api/auth/auth.api';
import { UpdateAuthUserReq } from '@model/auth/auth';

interface UserProfileProps {
  nickname: string;
  mobile: string;
}

const UserProfile: React.FC<UserProfileProps> = (props) => {

  const formRef = useRef<FormInstance<UserProfileProps>>();

  useEffect(() => {
    formRef.current?.setFieldsValue({
      nickname: props.nickname,
      mobile: props.mobile,
    });
  }, [props]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Avatar style={{ color: '#fff', backgroundColor: '#000', width: '100px', height: '100px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {'katana'}
        </div>
      </Avatar>
      <ProForm
        formRef={formRef}
        grid={true}
        layout='vertical'
        submitter={{
          render: (_, dom) => <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{dom}</div>,
          searchConfig: {
            submitText: '保存',
          },
          resetButtonProps: {
            style: {
              display: 'none', // 隐藏重置按钮
            },
          },
        }}
        onFinish={async (values) => {

          const req = new UpdateAuthUserReq(values.nickname, values.mobile);
          const result = await updateAuthUserInfoApi(req);

          if (result) {
            message.success('更新个人信息成功');
          }
          return true;
        }}
      >
        <ProForm.Group style={{ width: '100%' }}>
          <ProFormText rules={[{ required: true, message: '请输入昵称' }]} name="nickname" label="昵称" placeholder="请输入昵称" />
          <ProFormText rules={[{ required: true, message: '请输入手机号' }]} name="mobile" label="手机号" placeholder="请输入手机号" disabled />
        </ProForm.Group>
      </ProForm>
    </div>
  );
};

export default UserProfile; 