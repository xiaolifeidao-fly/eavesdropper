'use client';
import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import Layout from '@/components/layout';
import UserProfile from './UserProfile';
import UserPassword from './UserPasswrod';
import { useAuth } from '@/context/AuthContext';
import { UserInfo } from '@/context/AuthContext';

export default function UserCenter() {

  const { user } = useAuth();

  const items = (user: UserInfo | null) => {
    if (!user) {
      return [];
    }

    return [
      {
        key: 'user-info',
        label: '用户信息',
        children: <UserProfile nickname={user.nickname} mobile={user.mobile} />,
      },
      {
        key: 'user-password',
        label: '修改密码',
        children: <UserPassword />,
      }
    ];
  };

  return (
    <Layout curActive='/auth/center'>
      <Tabs defaultActiveKey="user-info" items={items(user)} />
    </Layout>
  );
}