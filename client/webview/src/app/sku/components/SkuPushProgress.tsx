'use client'
import React, { useState } from 'react';
import { Progress, Table, Button, Tag } from 'antd';
import type { TableColumnsType } from 'antd';

interface SkuPushInfo {
  name: string;
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

const SkuPushProgress: React.FC = () => {

  const [data, setData] = useState<SkuPushInfo[]>([]);

  const addData = () => {
    const status = Math.random() > 0.5 ? 1 : 0;
    setData([...data, { name: '商品' + data.length, status: status, detail: '详情' }]);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ margin: '5px 0' }}>正在发布商品,请稍等...</p>
        <p style={{ margin: '5px 0' }}> 0/100 </p>
        <Button type="primary" onClick={addData}>
          继续发布
        </Button>
        <Progress percent={50} />
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