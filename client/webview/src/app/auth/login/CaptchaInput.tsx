'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, message } from 'antd';
import Image from 'next/image';

import { getLoginCaptcha } from '@api/auth/auth.api';

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
  const { captchaId, captchaImg } = await getLoginCaptcha();
  return {
    id: captchaId,
    image: captchaImg.substring('data:image/png;base64,'.length),
  };
}

export default function CaptchaInput({ value = {}, onChange }: CaptchaInputProps) {

  const [isLoading, setIsLoading] = useState(true);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const [captchaId, setCaptchaId] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');
  const [captchaValue, setCaptchaValue] = useState<string>('');

  const setCaptchaInfo = (data: any) => {
    const { id, image } = data;

    setIsLoading(false);
    setCaptchaId(id);
    setImageData(image);
    triggerChange({ captchaId: id }); // 更新唯一标识
  }

  useEffect(() => {
    if (imageData) {
      setIsLoading(false); // 当有图片数据时，表示加载完成
    }
  }, [imageData]);

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
    const now = Date.now();
    if (now - lastClickTime < 3 * 60 * 1000) { // 设置3分钟间隔
      message.warning('操作过于频繁，请稍后重试。');
      return;
    }
    setLastClickTime(now);

    getCaptcha().then((data: any) => {
      setCaptchaInfo(data);
    })
  };

  return (
    <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '75%', paddingRight: '5px' }}>
        <Input
          placeholder='请输入验证码'
          onChange={onChangeInput}
          style={{ width: '100%', padding: '6.5px 11px', verticalAlign: 'middle' }} />
      </div>
      <div style={{ width: '25%', display: 'flex' }}>
        {isLoading ?
          (
            <Button
              style={{ width: '100%' }}
              onClick={onClickImage}
            >
              加载验证码
            </Button>
          ) : (
            <Image
              style={{ verticalAlign: 'middle', width: '100%' }}
              src={imageData ? `data:image/png;base64,${imageData}` : '/bg.svg'}
              width={100}
              height={35}
              alt="captcha"
              onClick={onClickImage}
            />
          )
        }
      </div>
    </span>
  );
}

