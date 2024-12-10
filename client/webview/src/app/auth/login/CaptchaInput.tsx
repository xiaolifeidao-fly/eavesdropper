'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Input, Image } from 'antd';
// import Image from 'next/image';

import { getCaptcha as getCaptchaApi } from './api';

interface CaptchaInputValue {
  captchaId?: string; // 唯一标识
  captchaValue?: string; // 输入值
}

interface CaptchaInputProps {
  value?: CaptchaInputValue;
  onChange?: (value: CaptchaInputValue) => void;
}

// 获取验证码
const getCaptcha = async () => {
  const image = getCaptchaApi();
  return {
    id: '123',
    image: image,
  };
}

export default function CaptchaInput({ value = {}, onChange }: CaptchaInputProps) {

  const [captchaId, setCaptchaId] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');
  const [captchaValue, setCaptchaValue] = useState<string>('');

  const setCaptchaInfo = (data: any) => {
    const { id, image } = data;

    setCaptchaId(id);
    setImageData(image);
    triggerChange({ captchaId: id }); // 更新唯一标识
  }

  useEffect(() => {
    console.log('useEffect');

    getCaptcha().then((data: any) => {
      setCaptchaInfo(data);
    })
  }, []);

  // 触发改变
  const triggerChange = useCallback((changedValue: { captchaId?: string; captchaValue?: string }) => {
    if (onChange) {
      onChange({ captchaId, captchaValue, ...value, ...changedValue });
    }
  }, [onChange, captchaId, captchaValue, value]);

  // 输入框变化
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value || '';
    if (code && code !== '') {
      setCaptchaValue(code);
    }
    triggerChange({ captchaId: captchaId, captchaValue: code });
  }

  // 刷新验证码
  const onClickImage = () => {
    getCaptcha().then((data: any) => {
      setCaptchaInfo(data);
    })
  };

  return (
    <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Input
        placeholder='请输入验证码'
        onChange={onChangeInput}
        style={{ marginRight: 5, padding: '6.5px 11px 6.5px 11px', verticalAlign: 'middle' }} />
      <Image
        style={{ height: '35px', verticalAlign: 'middle', padding: '0px 0px 0px 0px' }}
        src={imageData}
        alt="captcha"
        onClick={onClickImage}
      />
    </span>
  );
}

