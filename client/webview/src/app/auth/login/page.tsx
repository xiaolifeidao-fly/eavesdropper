'use client'
import { Button, Form, Input, Segmented, type FormProps, message } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import styles from './index.module.less';
import CaptchaInput from './CaptchaInput';
import { useAuth } from '@/context/AuthContext';
import { StoreApi } from '@eleapi/store/store';

type FieldType = {
  nickname?: string;
  mobile?: string;
  password?: string;
  captcha?: string;
};

const mode = ['登录', '注册'];

export default function Home() {
  const [curMode, setCurMode] = useState(mode[0]);
  const { login, register, loginToken } = useAuth();
  const hasCheckedAuth = useRef(false);

  const [form] = Form.useForm();
  const router = useRouter();

  const [browserPath, setBrowserPath] = useState("");

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    if (loginToken) {
      router.push("/dashboard");
    }
    const storeApi = new StoreApi();
    storeApi.getItem("browserPath").then((value) => {
      setBrowserPath(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
    // 登录
    if (curMode === mode[0]) {
      const { mobile, password } = values;

      const loginReq = {
        mobile: mobile,
        password: password,
        captcha: values.captcha.captchaValue,
        captchaId: values.captcha.captchaId
      }
      await login(loginReq)

      message.success("登录成功");
      router.push("/dashboard");
      return
    }

    // 注册
    if (curMode === mode[1]) {

      const { nickname, mobile, password } = values;

      const registerReq = {
        nickname,
        mobile,
        password: password,
        captcha: values.captcha.captchaValue,
        captchaId: values.captcha.captchaId
      }

      await register(registerReq);
      setCurMode(mode[0]);
      message.success("注册成功");
    }
  };

  // 登录表单
  const LoginForm = () => (

    <>
      <Form.Item<FieldType>
        name="mobile"
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
        ]}
      >
        <Input placeholder='请输入手机号' size='large' variant="filled" />
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
        name="nickname"
        rules={[
          {
            required: true,
            message: '请输入昵称',
          },
        ]}
      >
        <Input placeholder='请输入昵称' size='large' variant="filled" />
      </Form.Item>

      <Form.Item<FieldType>
        name="mobile"
        rules={[
          {
            required: true,
            message: '请输入手机号',
          },
        ]}
      >
        <Input placeholder='请输入手机号' size='large' variant="filled" />
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
          {/* <div>
          <Input value={browserPath} placeholder="请输入浏览器路径" onChange={(e) => setBrowserPath(e.target.value)} ></Input>
          <Button onClick={() => {
              const storeApi = new StoreApi();
              storeApi.setItem("browserPath", browserPath);
              message.success("保存成功");
            }}>保存</Button>
          </div> */}
          <div>

          <Segmented<string>
            options={mode.map(item => ({ label: item, value: item }))} // 注册按钮禁用
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
      </div>
    </main>
  );
}
