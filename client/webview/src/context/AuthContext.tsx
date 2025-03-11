"use client"
import dynamic from "next/dynamic";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

import { LoginReq, RegisterReq } from '@model/auth/auth';
import { login as loginApi, register as registerApi, getLoginUserInfo as getLoginUserInfoApi, logout as logoutApi } from '@api/auth/auth.api'
import { encryptRSA } from '@utils/auth'
import { instance } from '@utils/axios'
import { getItem, removeItem, setItem } from "@utils/store/web";

export type UserInfo = {
  id: number,
  nickname: string,
  mobile: string,
  loginAt: string
}

interface AuthContextType {
  loginToken: string | null;
  user: UserInfo | null;
  login: (loginReq: LoginReq) => Promise<void>;
  register: (registerReq: RegisterReq) => Promise<void>;
  logout: () => Promise<void>;
  clearUserLogin: () => void;
}

const REQUEST_HEADER_TOKEN = 'Authorization'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loginToken, setLoginToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    getItem(REQUEST_HEADER_TOKEN).then((value: string) => {
      if (value) {
        setLoginToken(value);
        fetchUserInfo();
      } else {
        if (window.location.pathname !== "/auth/login") {
          // message.error("请先登录");
        }
        router.push("/auth/login");
        return;
      }
    })

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.error("未捕获的 Promise 错误:", event.reason);
      message.error(event.reason?.message || "发生未知错误");

      // 统一存储错误信息
      // useErrorStore.getState().setError(event.reason?.message || "发生未知错误");
    };

    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, [router])

  // 获取登录用户信息
  const fetchUserInfo = async () => {
    const resp = await getLoginUserInfoApi();
    if (!resp) {
      await removeItem(REQUEST_HEADER_TOKEN)
      setLoginToken(null);
      setUser(null);
      // 跳转到登录页
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    setUser(resp);
  }

  // login 逻辑
  const login = async (loginReq: LoginReq) => {
    // 加密密码
    const encodedPassword = encryptRSA(loginReq.password);
    loginReq.password = encodedPassword;
    const { accessToken } = await loginApi(loginReq);
    setLoginToken(accessToken);
    await setItem(REQUEST_HEADER_TOKEN, accessToken); // 存储到本地

    // 修改请求头
    instance.defaults.headers[REQUEST_HEADER_TOKEN] = accessToken;
  }

  // register 注册逻辑
  const register = async (registerReq: RegisterReq) => {

    // 加密密码
    const encodedPassword = encryptRSA(registerReq.password);
    registerReq.password = encodedPassword;

    await registerApi(registerReq);
  }

  // logout 退出登录逻辑
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error(error);
    }

    console.log("logout.....");
    clearUserLogin();
  }

  // 清除用户登录信息
  const clearUserLogin = async () => {
    console.log("clearUserLogin.....");
    await removeItem(REQUEST_HEADER_TOKEN)
    setLoginToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ loginToken, user, login, register, logout, clearUserLogin }}>
    {children}
  </AuthContext.Provider>
}

const AuthProviderWrapper = dynamic(() => Promise.resolve(AuthProvider), {
  ssr: false,
});

export { AuthProviderWrapper as AuthProvider };

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};