'use client';
import React, { useState } from 'react';
import { Layout, message, Menu, theme, Avatar, Dropdown, ConfigProvider, Badge, Popover, type MenuProps, Spin, Button } from 'antd';
import getNavList from '@/components/layout/menu';
import { useRouter } from 'next/navigation';
import './index_module.css';
import { getThemeBg } from '@/utils';


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


  const [curTheme, setCurTheme] = useState<boolean>(false);

  const toggleTheme = () => {
    setCurTheme(prev => !prev);
  }


  const handleUserCenter = () => {
    router.push('/auth/center');
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" onClick={handleUserCenter}>
          个人中心
        </a>
      ),
    }
  ];

  const handleSelect = (row: { key: string }) => {
    router.push(row.key)
  }

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const openPxx = async () => {
    // try{
    //   setPxxLoading(true);
    //   const monitor = new MonitorPxxSkuApi();
    //   await monitor.monitorSku();
    // } catch(error : any){
    //   message.error("打开PXX失败", error);
    // } finally {
    //   setPxxLoading(false);
    // }
  }

  const [pxxLoading, setPxxLoading] = useState(false);

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
          <span className={"logo"} style={getThemeBg(curTheme)}>鲲鹏上传-管理端</span>
          <Menu
            theme={curTheme ? "dark" : "light"}
            mode="inline"
            inlineCollapsed={collapsed}
            defaultSelectedKeys={["dashboard"]}
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
                    {'admin'}
                  </Avatar>
                </Dropdown>
              </span>
            </div>
          </Header>
          <Content style={{ margin: '10px 10px 0' }}>
            <div
              style={{
                ...getThemeBg(curTheme),
                borderRadius: borderRadiusLG,
                height: '100%',
              }}
            >
              {children}
            </div>
          </Content>
          {/* <Footer style={{ textAlign: 'center' }}>
          </Footer> */}
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default CommonLayout;