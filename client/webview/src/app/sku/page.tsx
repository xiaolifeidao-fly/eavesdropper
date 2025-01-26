'use client'
import { useRef, useState } from 'react';
import { Button, message, Tag } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import useRefreshPage from '@/components/RefreshPage';
import { getSkuPage as getSkuPageApi } from '@api/sku/sku.api';
import type { SkuPageResp } from '@model/sku/sku';
import { SkuPushStepsForm } from './components';

type DataType = {
  id: number;
  sourceAccount: string;
  shopName: string;
  skuName: string;
  publishTime: string;
  publishStatus: number;
  url: string;
}

const baseColumns: ProColumns<DataType>[] = [
  {
    title: '所属资源账号',
    dataIndex: 'sourceAccount',
    search: false,
    key: 'sourceAccount',
    align: 'center',
    width: 150,
  },
  {
    title: '店铺名称',
    dataIndex: 'shopName',
    key : "shopName",
    align: 'center',
  },
  {
    title: '商品名称',
    dataIndex: 'skuName',
    key : "skuName",
    align: 'center',
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    key : "publishTime",
    search: false,
    align: 'center',
    width: 200,
  },
  {
    title: '发布状态',
    dataIndex: 'publishStatus',
    key : "publishStatus",
    search: false,
    align: 'center',
    width: 80,
    render: (_, record) => {
      return record.publishStatus === 0 ? <Tag color="volcano">未发布</Tag> : <Tag color="green">已发布</Tag>
    }
  },
]

function skuPageRespConvertDataType(resp: SkuPageResp[]): DataType[] {
  const data: DataType[] = []
  for (const item of resp) {

    let status = 0;
    if (item.status === 'success') {
      status = 1;
    } else if (item.status === 'error') {
      status = 0;
    }

    data.push({
      id: item.id,
      sourceAccount: item.resourceAccount,
      shopName: item.shopName,
      skuName: item.skuName,
      publishTime: item.publishTime,
      publishStatus: status,
      url: item.url,
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
        <Button key="edit" type="link" style={{ paddingRight: 0 }} onClick={() => { window.open(record.url, '_blank'); }}>浏览源商品</Button>,
        <Button key="copy" onClick={async () => { await navigator.clipboard.writeText(record.url || '') }}>
          复制链接
        </Button>
        // <Button key="delete" type="link" danger style={{ paddingLeft: 0 }} onClick={async () => {
        //   message.success('删除成功');
        //   refreshPage(actionRef, true, 1);
        // }}>删除</Button>,
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
              const { data: list, pageInfo } = await getSkuPageApi({
                ...params,
                current: params.current ?? 1,
                pageSize: params.pageSize ?? 10,
              })
              const data = skuPageRespConvertDataType(list);
              return {
                data: data,
                success: true,
                total: pageInfo.total,
              };
            }}
            pagination={{
              pageSize: 10,
            }}
          />

          {/* 发布商品 */}
          <SkuPushStepsForm visible={visible} setVisible={setVisible} onClose={() => {
            refreshPage(actionRef, false);
          }} />
        </div>
      </main>
    </Layout>
  );
}