'use client';
import { Button, Form, FormProps, Input, Modal, Space, Spin, Table, TableProps, Tag, theme } from 'antd';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout/index';
import { useEffect, useState } from 'react';
import { getData } from '@api/shop/shop.api';
import { Shop } from '@model/shop/shop';
import { MbSkuApi } from '@eleapi/door/sku/mb.sku';

import { EditOutlined, ExportOutlined, ScheduleOutlined, ScissorOutlined, UploadOutlined } from '@ant-design/icons';
import { MbLoginApi } from '@eleapi/door/login/mb.login';
import { MbShopApi } from '@eleapi/door/shop/mb.shop';
import { MbUserApi } from '@eleapi/door/user/user';

export default function Clip() {
  const { token } = theme.useToken();

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12
  };

  const [loading, setLoading] = useState<boolean>(false);
  
  const initPageInfo = {
    pageSize: 10,
    pageIndex: 1,
    total:0
  };

  const [pageInfo, setPageInfo] = useState(initPageInfo);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);

  const [data, setData] = useState<Shop[]>([]);

  const columns: TableProps<Shop>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      // render: (text) => <a>{text}</a>,
      fixed: 'left',
      width: 100
    },
    {
      title: '操作时间',
      key: 'operate_time',
      dataIndex: 'operate_time'
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <>
          {
             <Tag>{status}</Tag>
          }
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined/>} size="small" onClick={()=>{

            // openEditModal(record.id, record.name)
          }} >编辑</Button>
        </Space>
      ),
    },
  ];



  const handlePageChange = async (pageIndex : number, pageSize : number) => {
    try{
      setLoading(true);
      setCurrentPageIndex(pageIndex);
      const pageData = await getData();
      setPageInfo({
        ...pageInfo,
        pageIndex: pageIndex || 1,
        total : pageData.total
      });
      setData(pageData.data);
    }finally{
      setLoading(false);
    }
     
  };

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  useEffect(()=>{
       handlePageChange(initPageInfo.pageIndex, initPageInfo.pageSize);
  },[]);

  async function getShopInfo(){
    const shopApi = new MbShopApi();
    const result = await shopApi.findMbShopInfo(1);
    console.log("window.shopApi " , result )
  }


  async function getUserInfo(){
    const userApi = new MbUserApi();
    const result = await userApi.getUserInfo(1);
    console.log("window.userApi " , result )
  }

  async function getSkuInfo(){
    const shopApi = new MbSkuApi();
    const result = await shopApi.findMbSkuInfo("https://item.taobao.com/item.htm?id=862817545814&time=1734319603010");
    console.log("window.skuApi " , result )
  }

  async function login(){
    const mbLoginApi = new MbLoginApi();
    const result = await mbLoginApi.login("https://login.taobao.com/member/login.jhtml");
    console.log("window.shopApi1 " , result);
  }


  type FieldType = {
    name?: string;
  };
  const [form] = Form.useForm();

  
  return (
    <Layout curActive='/clip'>
        <main >
            <div >
                <Button onClick={login}>登录</Button>
                <Button onClick={getUserInfo}>获取用户信息</Button>
                <Button onClick={getShopInfo}>获取店铺信息</Button>
                <Button onClick={getSkuInfo}>获取商品信息</Button>
                <div style={listStyle}>
                      <Table 
                          columns={columns} 
                          rowKey="id"
                          dataSource={data} 
                          loading={loading}
                          pagination={{
                            ...pageInfo,
                            onChange: handlePageChange,
                            current:currentPageIndex,
                            showQuickJumper: true,
                            size: "small",
                            showTotal: (total) => `共${total}条`,
                          }}
                          scroll={{ x: 1000 }} />
                </div>
            </div>
        </main>

        <Modal open={false} onCancel={()=>{}}>
           <AvaForm/>
        </Modal>
    </Layout>
    
  );
}
