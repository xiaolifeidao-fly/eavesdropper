'use client'
import { Button, Form, Input, Segmented, type FormProps } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { login } from '@api/auth/auth.api'
import { encryptRSA } from '@utils/auth'
import styles from './index.module.less';
import CaptchaInput from './CaptchaInput';

type FieldType = {
  username?: string;
  password?: string;
  captcha?: string;
};

const mode = ['登录', '注册'];

export default function Home() {
  const [curMode, setCurMode] = useState(mode[0]);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish: FormProps<FieldType>["onFinish"] = (values: any) => {
    console.log('onFinish', values);

    // 登录
    if (curMode === mode[0]) {
      const { username, password } = values;

      // 加密密码
      const encodedPassword = encryptRSA(password);

      login({
        username,
        password: encodedPassword,
        captcha: values.captcha,
        captchaId: values.captchaId
      }).then(res => {
        // login logic
        // router.push('/dashboard');
      })

      return
    }

    // 注册
    if (curMode === mode[1]) {
      console.log('registerApi', values);
    }
  };

  // 登录表单
  const LoginForm = () => (
    <>
      <Form.Item<FieldType>
        name="username"
        rules={[
          {
            required: true,
            message: '请输入账号',
          },
        ]}
      >
        <Input placeholder='请输入账号' size='large' variant="filled" />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password size='large' placeholder='请输入密码' variant="filled" />
      </Form.Item>

      <Form.Item<FieldType>
        name="captcha"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <CaptchaInput />
      </Form.Item>

      <Form.Item wrapperCol={{ span: 24 }}>
        <Button type="primary" htmlType="submit" block size='large'>
          登录
        </Button>
      </Form.Item>
    </>
  );


  // 注册表单
  const RegisterForm = () => (
    <>
      <Form.Item<FieldType>
        name="username"
        rules={[
          {
            required: true,
            message: '请输入账号',
          },
        ]}
      >
        <Input placeholder='请输入账号' size='large' variant="filled" />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password size='large' placeholder='请输入密码' variant="filled" />
      </Form.Item>

      <Form.Item wrapperCol={{ span: 24 }}>
        <Button type="primary" htmlType="submit" block size='large'>
          注册
        </Button>
      </Form.Item>
    </>
  );


  return (
    <main className={styles.loginWrap}>
      {/* 左侧banner */}
      <div className={styles.leftBanner}>
        <div className={styles.banner}>
          <Image src="/logo_bg.svg" alt="" width={500} height={500} />
        </div>
      </div>

      {/* 右侧内容 */}
      <div className={styles.content}>
        <div className={styles.innerContent}>
          <h1>欢迎登录 TaoTao 中后台管理系统</h1>
          <Segmented<string>
            options={mode.map(item => ({ label: item, value: item, disabled: item === mode[1] }))} // 注册按钮禁用
            size="large"
            onChange={(value) => {
              setCurMode(value);
              form.resetFields();
            }}
          />
          <Form
            name="basic"
            className={styles.form}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 420 }}
            form={form}
            onFinish={onFinish}
            initialValues={{
              email: 'dooring@next.com',
              pwd: 'dooring.vip'
            }}
            autoComplete="off"
          >
            {curMode === mode[0] ? <LoginForm /> : <RegisterForm />}
          </Form>
        </div>
      </div>
    </main>
  );
}
