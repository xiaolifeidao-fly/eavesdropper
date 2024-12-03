'use client';
import React, { useEffect, useState } from 'react';
import { Layout, Button, Menu, theme, Avatar, Dropdown, ConfigProvider, Badge, Popover, type MenuProps } from 'antd';
import getNavList from './menu';
import { useRouter } from 'next/navigation';
import {
    BellOutlined,
    MoonOutlined,
    SunOutlined,
    TransactionOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined

} from '@ant-design/icons';

import { getThemeBg } from '@/utils';
import './index_module.css';
import Link from 'next/link';
const { Header, Content, Footer, Sider } = Layout;

interface IProps {
    children: React.ReactNode,
}


const WindowLayout: React.FC<IProps> = ({ children}) => {
  const {
    token: { borderRadiusLG, colorTextBase, colorWarningText },
  } = theme.useToken();

  const router = useRouter();
  const navList = getNavList();

  const [curTheme, setCurTheme] = useState<boolean>(false);
  const toggleTheme = () => {
        setCurTheme(prev => !prev);
  }

  const handleSelect = (row: {key: string}) => {
    router.push(row.key)
  }

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const navigateBack = async () => {
    // @ts-ignore
    await window.windowsAPI.navigateBack();
  }

  const navigateForward = async () => {
    // @ts-ignore
    await window.windowsAPI.navigateForward();

  }

  const openAiWindow = async ()=>{
    //@ts-ignore
    await window.windowsAPI.openTargetWindow(`/ai`,`ai`, true,true);
  }

  useEffect(() => {
    window.addEventListener('beforeunload', (event) => {
      // 在这里处理刷新事件
      console.log('页面即将被卸载（刷新、关闭标签页或窗口）');
      //@ts-ignore
      window.sessionAPI.sessionFlush();
      return;
    });
  },[]);


  return (
    <ConfigProvider
        theme={{
        algorithm: curTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
    >
        <Layout style={{minHeight: "100vh"}}>
                <Header style={{ padding: 0, ...getThemeBg(curTheme), display: 'flex' }}>
                    <div style={{textAlign:"left", marginLeft : "30px", padding : "10px 10px"}}> 
                        <Button onClick={navigateBack} className="group" style={{margin : "10px 10px"}}>
                            前进
                        </Button>
                        <Button onClick={navigateForward}  className="group">
                            后退
                        </Button>
                    </div>
                    <div className="rightControl">
                        <span style={{margin : "10px 10px"}}>
                        <Button onClick={openAiWindow}>ai工具</Button>
                        </span>
                        <span className="msg" style={{margin : "10px 10px"}}>
                            <Badge dot>
                                <BellOutlined />
                            </Badge>
                        </span>
                    </div>
                </Header>
                <Content>
                { children }
                </Content>
        </Layout>
    </ConfigProvider>
  );
};

export default WindowLayout;