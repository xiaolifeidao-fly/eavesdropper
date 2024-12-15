'use client'
import { useRef, useState } from 'react';
import { Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/Layout';
import styles from './index.module.less';

type DataType = {
  id: number;
  nickname: string;
  mobile: string;
  lastLoginTime: string;
}

const columns: ProColumns<DataType>[] = [
  {
    title: '用户名',
    dataIndex: 'nickname',
    search: false,
    align: 'center',
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    align: 'center',
  },
  {
    title: '最后登录时间',
    dataIndex: 'lastLoginTime',
    search: false,
    align: 'center',
  },
  {
    title: '操作',
    key: 'option',
    valueType: 'option',
    align: 'center',
    width: 100,
    render: (_, record) => [
      <Button key="edit" type="link" style={{ paddingRight: 0 }} disabled>编辑</Button>,
      <Button key="delete" type="link" style={{ paddingLeft: 0 }} disabled>删除</Button>,
    ],
  }
]

export default function UserManage() {

  const actionRef = useRef<ActionType>();

  return (
    <Layout curActive='/auth/user'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable<DataType>
            rowKey="id"
            headerTitle="用户管理"
            columns={columns}
            actionRef={actionRef}
            options={false}
            toolBarRender={() => [
              <Button key="export" disabled>
                导出数据
                <DownOutlined />
              </Button>,
            ]}
            request={async (params) => {
              console.log(params);
              return {
                data: [{
                  id: 1,
                  nickname: '张三',
                  mobile: '13800138000',
                  lastLoginTime: '2024-01-01 10:00:00',
                }],
                success: true,
              };
            }}
            pagination={{
              pageSize: 10,
              onChange: (page) => console.log(page),
            }}
          />
        </div>
      </main>
    </Layout>
  );
}