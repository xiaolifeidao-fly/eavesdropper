'use client'
import React, { useState, useEffect } from 'react';
import { Progress, Table, Button, Tag } from 'antd';
import type { TableColumnsType } from 'antd';

import { MbSkuApi } from '@eleapi/door/sku/mb.sku';
import { SkuPublishStatitic } from "@model/sku/sku";

interface SkuPushInfo {
  name: string;
  url: string;
  status: number;
  detail: string;
}

const columns: TableColumnsType<SkuPushInfo> = [
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (_, record) => {
      const color = record.status === 1 ? 'green' : 'red';
      const text = record.status === 1 ? '成功' : '失败';
      return <Tag color={color}>
        {text}
      </Tag>
    }
  },
  {
    title: '详情',
    dataIndex: 'detail',
    key: 'detail',
    align: 'center',
  },
];

export interface SkuUrl {
  url: string;
}

interface SkuPushProgressProps {
  publishResourceId: number;
  urls: SkuUrl[];
}

const SkuPushProgress: React.FC<SkuPushProgressProps> = (props) => {

  const [data, setData] = useState<SkuPushInfo[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [pushProgress, setPushProgress] = useState(0);

  const onPublishSkuMessage = (skuId: number, skuStatus: string, statistic: SkuPublishStatitic) => {
    console.log("skuId: ", skuId, "skuStatus: ", skuStatus, "statistic: ", statistic);
  };

  const mbSkuApi = new MbSkuApi(onPublishSkuMessage);

  // mbSkuApi.onPublishSkuMessage(onPublishSkuMessage);

  useEffect(() => {
    if (props.urls.length === 0) {
      console.log("uploadUrlList is empty");
      return;
    }
    
    mbSkuApi.batchPublishSkus(props.publishResourceId, props.urls.map(item => item.url)).then(task => {
      console.log(task);
    });
    
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.urls]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ margin: '5px 0' }}>正在发布商品,请稍等...</p>
        <p style={{ margin: '5px 0' }}>已处理：{pushCount}/{props.urls.length}</p>
        <Progress percent={pushProgress} />
        <div style={{ height: 250, overflow: 'auto' }}>
          <Table<SkuPushInfo>
            columns={columns}
            dataSource={data}
            pagination={false}
            style={{ width: '100%' }}
            scroll={{ y: 250 }}
          />
        </div>
      </div>
    </>
  )
}

export default SkuPushProgress;