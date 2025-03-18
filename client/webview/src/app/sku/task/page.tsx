'use client'
import { useEffect, useRef, useState } from 'react';
import { Tag } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import useRefreshPage from '@/components/RefreshPage'
import { getSkuTaskPage as getSkuTaskPageApi } from '@api/sku/skuTask.api';
import { getResourceSourceList } from '@api/resource/resource.api';
import { transformArrayToObject } from '@utils/convert'

export default function SkuTaskManage() {

  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);

  const { refreshPage } = useRefreshPage();

  const [sourceMap, setSourceMap] = useState<Record<string, any>>();

  useEffect(() => {
    getResourceSourceList().then(resp => {
      const result = transformArrayToObject(resp)
      setSourceMap(result)
    })
  }, [])

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
      key: 'id',
      align: 'center'
    },
    {
      title: '总数',
      search: false,
      key: 'count',
      align: 'center',
      dataIndex: 'count',
    },
    {
      title: '来源',
      key: 'source',
      align: 'center',
      valueType: 'select',
      valueEnum: sourceMap,
      render: (_, record) => {
        return (
          <Tag color={record.sourceLableValue.color}>
            {record.sourceLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '发布账号',
      key: 'account',
      align: 'center',
      dataIndex: 'resourceAccount'
    },
    {
      title: '状态',
      search: false,
      key: 'status',
      align: 'center',
      render: (_, record) => {
        return (
          <Tag color={record.statusLableValue.color}>
            {record.statusLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '创建人',
      search: false,
      key: 'createdBy',
      align: 'center',
      dataIndex: 'createdBy',
    },
    {
      title: '创建时间',
      search: false,
      key: 'createdAt',
      align: 'center',
      dataIndex: 'createdAt',
    },
  ]

  return (
    <Layout curActive='/sku/task'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable
            rowKey="id"
            headerTitle="商品任务管理"
            columns={columns}
            actionRef={actionRef}
            options={false}
            toolBarRender={() => [
            ]}
            request={async (params) => {
              const { data: list, pageInfo } = await getSkuTaskPageApi({
                ...params,
                current: params.current ?? 1,
                pageSize: params.pageSize ?? 10,
              })
              return {
                data: list,
                success: true,
                total: pageInfo.total,
              };
            }}
            pagination={{
              pageSize: 10,
            }}
          />
        </div>
      </main>
    </Layout>
  );
}