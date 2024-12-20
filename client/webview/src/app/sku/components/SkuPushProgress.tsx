'use client'
import React, { useState, useEffect } from 'react';
import { Progress, Table, Button, Tag } from 'antd';
import type { TableColumnsType } from 'antd';

import type { LinkInfo } from './SkuLinkUpload';

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

interface SkuPushProgressProps {
  uploadUrlList: LinkInfo[];
}

const SkuPushProgress: React.FC<SkuPushProgressProps> = (props) => {

  const [data, setData] = useState<SkuPushInfo[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [pushProgress, setPushProgress] = useState(0);

  useEffect(() => {
    if (props.uploadUrlList.length === 0) {
      return;
    }

    for (let i = 0; i < props.uploadUrlList.length; i++) {
      console.log(i, props.uploadUrlList[i]);
    }
    
  }, [pushCount]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ margin: '5px 0' }}>正在发布商品,请稍等...</p>
        <p style={{ margin: '5px 0' }}>已处理：{pushCount}/{props.uploadUrlList.length}</p>
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