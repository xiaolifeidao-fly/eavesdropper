'use client'
import { useRef, useState } from 'react';
import { Button, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import { userPage as userPageApi, deleteUser as deleteUserApi } from '@api/auth/user.api';
import useRefreshPage from '@/components/RefreshPage';


type DataType = {
  id: number;
  nickname: string;
  mobile: string;
  lastLoginAt: string;
  updatedAt: string;
}

const baseColumns: ProColumns<DataType>[] = [
  {
    title: '用户名',
    dataIndex: 'nickname',
    search: false,
    key : "nickname",
    align: 'center',
    width: 150,
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key : "mobile",
    align: 'center',
  },
  {
    title: '最后登录时间',
    dataIndex: 'lastLoginAt',
    key : "lastLoginAt",
    search: false,
    align: 'center',
    width: 200,
  },
]

export default function UserManage() {

  const actionRef = useRef<ActionType>();

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
        <Button key="edit" type="link" style={{ paddingRight: 0 }} disabled>编辑</Button>,
        <Button key="delete" type="link" style={{ paddingLeft: 0 }} onClick={async () => {
          const resp = await deleteUserApi(record.id);
          if (resp) {
            message.success('删除成功');
            refreshPage(actionRef, true, 1);
          }
        }}>删除</Button>,
      ],
    }
  ]

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
              const { data, pageInfo } = await userPageApi({
                ...params,
                current: params.current ?? 1,
                pageSize: params.pageSize ?? 10,
              })
              return {
                data: data,
                success: true,
                total: pageInfo.total,
              };
            }}
            pagination={{
              pageSize: 4,
            }}
          />
        </div>
      </main>
    </Layout>
  );
}