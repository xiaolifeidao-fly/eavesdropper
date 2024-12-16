'use client';
import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import Layout from '@/components/Layout';
import UserInfo from './UserInfo';
import UserPassword from './UserPasswrod';
const items: TabsProps['items'] = [
  {
    key: 'user-info',
    label: '用户信息',
    children: <UserInfo />,
  },
  {
    key: 'user-password',
    label: '修改密码',
    children: <UserPassword />,
  }
];

export default function UserCenter() {
  return (
    <Layout curActive='/auth/center'>
      <Tabs defaultActiveKey="user-info" items={items} />
    </Layout>
  );
}