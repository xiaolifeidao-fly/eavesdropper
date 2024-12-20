'use client'
import { useRef, useState } from 'react';
import { Button, message, Tag } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import useRefreshPage from '@/components/RefreshPage';
import { SkuPushStepsForm } from './components';

type DataType = {
  id: number;
  sourceAccount: string;
  shopName: string;
  skuName: string;
  publishTime: string;
  publishStatus: number;
}

const baseColumns: ProColumns<DataType>[] = [
  {
    title: '所属资源账号',
    dataIndex: 'sourceAccount',
    search: false,
    align: 'center',
    width: 150,
  },
  {
    title: '店铺名称',
    dataIndex: 'shopName',
    align: 'center',
  },
  {
    title: '商品名称',
    dataIndex: 'skuName',
    align: 'center',
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    search: false,
    align: 'center',
    width: 200,
  },
  {
    title: '发布状态',
    dataIndex: 'publishStatus',
    search: false,
    align: 'center',
    width: 80,
    render: (_, record) => {
      return record.publishStatus === 0 ? <Tag color="volcano">未发布</Tag> : <Tag color="green">已发布</Tag>
    }
  },
]

const getSkuList = async () => {
  // mock 数据
  const data = []
  for (let i = 0; i < 100; i++) {
    data.push({
      id: i,
      sourceAccount: '123456',
      shopName: '店铺1',
      skuName: '商品' + i,
      publishTime: '2024-01-01 00:00:00',
      publishStatus: 0,
    })
  }
  return data
}

export default function SkuManage() {

  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);

  const { refreshPage } = useRefreshPage();

  const columns: ProColumns<DataType>[] = [
    ...baseColumns,
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      align: 'center',
      width: 150,
      render: (_, record) => [
        <Button key="edit" type="link" style={{ paddingRight: 0 }}>发布</Button>,
        <Button key="delete" type="link" danger style={{ paddingLeft: 0 }} onClick={async () => {
          message.success('删除成功');
          refreshPage(actionRef, true, 1);
        }}>删除</Button>,
      ],
    }
  ]

  return (
    <Layout curActive='/sku'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable<DataType>
            rowKey="id"
            headerTitle="商品管理"
            columns={columns}
            actionRef={actionRef}
            options={false}
            toolBarRender={() => [
              <Button key="export" onClick={() => {
                setVisible(true);
              }}>
                发布商品
              </Button>,
            ]}
            request={async (params) => {
              console.log(params);
              const data = await getSkuList();
              return {
                data: data,
                success: true,
                total: data.length,
              };
            }}
            pagination={{
              pageSize: 10,
            }}
          />

          {/* 发布商品 */}
          <SkuPushStepsForm visible={visible} setVisible={setVisible} />
        </div>
      </main>
    </Layout>
  );
}