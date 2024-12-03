'use client';
import { Button, Form, FormProps, Input, Modal, Space, Spin, Table, TableProps, Tag, theme } from 'antd';
import { useRouter } from 'next/navigation';
import AvaForm from './AvaForm';
import Layout from '@/components/layout';
import { useEffect, useState } from 'react';
import { getData } from '@api/shop/shop.test.api';
import { Shop } from '@model/shop/shop.test';

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
            openEditModal(record.id, record.name)
          }} >编辑</Button>
          <Button icon={<UploadOutlined/>} size="small" onClick={()=>{
            openUploadModal(record.id);
          }} >上传</Button>
          <Button icon={<ScissorOutlined/>} size="small" onClick={()=>openClipWindow(record.id)} 
          >剪辑</Button>
          <Button icon={<ScheduleOutlined/>} size="small" onClick={()=>{
            openClipAutoTaskWindow(record.id);
          }} >自动化</Button>

          <Button icon={<ExportOutlined/>} size="small" onClick={()=>{
            openExportModal(record.id);
          }} >导出</Button>
        </Space>
      ),
    },
  ];

  const openClipWindow = async (materialId : number)=>{
    //@ts-ignore
    const reuslt = await window.windowsAPI.openTargetWindow(`/clip/${materialId}/edit`);
  }

  const openClipAutoTaskWindow = async (materialId : number)=>{
    //@ts-ignore
    const reuslt = await window.windowsAPI.openTargetWindow(`/clip/${materialId}/task`, `auto_task_window_${materialId}`, ['GPT'],true, true);
  }
  const openUploadModal = (materialId : number) =>{
    setCurrentMaterialId(materialId);
    setUploadModalOpen(true);
  }

  const cancelUploadModal =() =>{
    setCurrentMaterialId(undefined);
    setUploadModalOpen(false);
  }

  const cancelExportModal =() =>{
    setCurrentMaterialId(undefined);
    setExportModalOpen(false);
  }

  const [segmentList, setSegmentList] = useState<[][]>([]);
  const sliceNum = 4;
  const exportInit = async(materialId : number) =>{
    const segmentList :any= await getData();
    if(segmentList == undefined || segmentList.length == 0){
        setSegmentList([]);
        return;
    }
    const groupedItems = [];
    for (let i = 0; i < segmentList.length; i += sliceNum) {
        groupedItems.push(segmentList.slice(i, i + sliceNum));
    }
    setSegmentList(groupedItems);
  }

  const openExportModal =(materialId : number) =>{
    exportInit(materialId);
    setCurrentMaterialId(materialId);
    setExportModalOpen(true);
  }

  const openEditModal = (materialId : number | undefined, name : string| undefined) =>{
    setCurrentMaterialId(materialId);
    setModalOpen(true);
    form.setFieldValue('name',name);
  }


  const cancelEditModal =() =>{
    setCurrentMaterialId(undefined);
    setModalOpen(false);
  }

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

  useEffect(()=>{
       handlePageChange(initPageInfo.pageIndex, initPageInfo.pageSize);
  },[]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalOpenLoading, setModalOpenLoading] = useState<boolean>(false);

  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);


  const [currentMaterialId, setCurrentMaterialId] = useState<number>();

  type FieldType = {
    name?: string;
  };
  const [form] = Form.useForm();

  const saveMaterial = async () => {
    try {
      // 验证并获取字段值
      const values = await form.validateFields(['name']);
      setModalOpenLoading(true);
      cancelEditModal();
      await handlePageChange(currentPageIndex, initPageInfo.pageSize);
    }finally{
      setModalOpenLoading(false);
    }
  };
  
  return (
    <Layout curActive='/clip'>
        <main >
            <div >
               {/* <AvaForm /> */}
                <div style={listStyle}>
                    <h3>我的商品 <Button onClick={() =>openEditModal(undefined,undefined)}>添加</Button></h3>
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
    </Layout>
    
  );
}
