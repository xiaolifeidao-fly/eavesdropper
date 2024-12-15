'use client';
import React, { useState } from 'react';
import { Layout, message, Menu, theme, Avatar, Dropdown, ConfigProvider, Badge, Popover, type MenuProps } from 'antd';
import getNavList from '@/components/Layout/menu';
import { useRouter } from 'next/navigation';
import { getThemeBg } from '@utils/index';
import './index_module.css';

import { useAuth } from '@/context/AuthContext';

const { Header, Content, Footer, Sider } = Layout;

interface IProps {
  children: React.ReactNode,
  curActive: string,
  defaultOpen?: string[]
}

const CommonLayout: React.FC<IProps> = ({ children, curActive, defaultOpen = ['/'] }) => {
  const {
    token: { borderRadiusLG, colorTextBase, colorWarningText },
  } = theme.useToken();

  const router = useRouter();
  const navList = getNavList();

  const { user, logout } = useAuth();

  const [curTheme, setCurTheme] = useState<boolean>(false);

  const toggleTheme = () => {
    setCurTheme(prev => !prev);
  }

  const handleLogout = async () => {
    await logout();
    message.success('退出登录成功');
    router.push('/auth/login');
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" onClick={handleLogout}>
          退出登录
        </a>
      ),
    },
  ];

  const handleSelect = (row: { key: string }) => {
    router.push(row.key)
  }

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: curTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          theme={curTheme ? "dark" : "light"}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <span className={"logo"} style={getThemeBg(curTheme)}>淘宝客</span>
          <Menu
            theme={curTheme ? "dark" : "light"}
            mode="inline"
            inlineCollapsed={collapsed}
            defaultSelectedKeys={[curActive]}
            items={navList}
            defaultOpenKeys={defaultOpen}
            onSelect={handleSelect}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, ...getThemeBg(curTheme), display: 'flex' }}>
            <div className="rightControl">
              <span className="avatar" >
              </span>
              <span className="msg" >
                <Dropdown menu={{ items }} placement="bottomLeft" arrow>
                  <Avatar style={{ color: '#fff', backgroundColor: colorTextBase }}>
                    {user?.nickname}
                  </Avatar>
                </Dropdown>
              </span>
            </div>
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            <div
              style={{
                padding: 24,
                minHeight: 520,
                ...getThemeBg(curTheme),
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default CommonLayout;