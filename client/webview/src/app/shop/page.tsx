'use client';
import { Button, Form, FormProps, Input, Modal, Space, Spin, Table, TableProps, Tag, theme } from 'antd';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { getData } from '@api/shop/shop.test.api';
import { Shop } from '@model/shop/shop';
import { TestApi } from '@eleapi/test';

import { EditOutlined, ExportOutlined, ScheduleOutlined, ScissorOutlined, UploadOutlined } from '@ant-design/icons';

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
       const testApi = new TestApi();
       test();
       handlePageChange(initPageInfo.pageIndex, initPageInfo.pageSize);
  },[]);


  async function test(){
    const testApi = new TestApi();
    const result = await testApi.test("test", 1);
    console.log("window.testApi " , result)

    testApi.onTest((data)=>{
      console.log("onTest data ", data)
    })
  }


  type FieldType = {
    name?: string;
  };
  const [form] = Form.useForm();

  
  return (
    <Layout curActive='/clip'>
        <main >
            <div >
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
