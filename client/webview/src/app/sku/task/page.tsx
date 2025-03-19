'use client'
import { useEffect, useRef, useState } from 'react';
import { Tag, Button, message, Space } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import useRefreshPage from '@/components/RefreshPage'
import { getSkuTaskPage as getSkuTaskPageApi } from '@api/sku/skuTask.api';
import { getResourceSourceList } from '@api/resource/resource.api';
import { transformArrayToObject } from '@utils/convert'
import { SkuTaskStatus } from '@model/sku/skuTask'

export default function SkuTaskManage() {

  const actionRef = useRef<ActionType>();
  const { refreshPage } = useRefreshPage();

  const [sourceMap, setSourceMap] = useState<Record<string, any>>();
  const [polling, setPolling] = useState<number>(2000); // 表格轮询间隔

  useEffect(() => {
    getResourceSourceList().then(resp => {
      const result = transformArrayToObject(resp)
      setSourceMap(result)
    })
  }, [])

  // 查看任务
  const handleView = (taskId: number) => {
    message.success(`查看任务: ${taskId}`)
  }

  // 停止任务
  const handleStop = (taskId: number) => {
    message.success(`停止任务: ${taskId}`)
  }

  // 重新发布
  const handleRepublish = (taksId: number) => {
    message.success(`重新发布: ${taksId}`)
  }

  const columns: ProColumns[] = [
    {
      title: '发布批次',
      dataIndex: 'id',
      search: false,
      key: 'id',
      align: 'center'
    },
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      search: false,
      key: 'shopName',
      align: 'center'
    },
    {
      title: '时间',
      search: false,
      key: 'createdAt',
      align: 'center',
      dataIndex: 'createdAt',
    },
    {
      title: '发布来源',
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
      title: '发布统计',
      search: false,
      key: 'count',
      align: 'center',
      render: (_, record) => {
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              总计: <Tag color={'blue'} style={{ width: '40px', textAlign: 'center' }}>{record.count}</Tag>
            </div>
            <div style={{ textAlign: 'center' }}>
              新成功: <Tag color={'green'} style={{ width: '40px', textAlign: 'center' }}>{record.successCount}</Tag>
            </div>
            <div style={{ textAlign: 'center' }}>
              失败: <Tag color={'red'} style={{ width: '40px', textAlign: 'center' }}>{record.failedCount}</Tag>
            </div>
            <div style={{ textAlign: 'center' }}>
              已取消: <Tag color={'orange'} style={{ width: '40px', textAlign: 'center' }}>{record.cancelCount}</Tag>
            </div>
            <div style={{ textAlign: 'center' }}>
              已存在: <Tag color={'gold'} style={{ width: '40px', textAlign: 'center' }}>{record.existenceCount}</Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: '操作',
      search: false,
      align: 'center',
      render: (_, record) => {
        return (
          <div style={{ display: 'flex', gap: '4px' }}> {/* 设置间距为 4px */}
            <Button
              type="link"
              onClick={() => handleView(record.id)} // 查看操作
              style={{ display: 'inline-block', paddingRight: '4px' }} // 缩小右边距
            >
              查看
            </Button>
            {record.status === SkuTaskStatus.RUNNING ? ( // 如果状态是 running，显示停止按钮
              <Button
                type="link"
                onClick={() => handleStop(record.id)} // 停止操作
                style={{ color: '#ff4d4f', display: 'inline-block', paddingLeft: '4px' }} // 绿色按钮
              >
                停止发布
              </Button>
            ) : ( // 否则显示重新发布按钮
              <Button
                type="link"
                onClick={() => handleRepublish(record.id)} // 重新发布操作
                style={{ color: '#52c41a', display: 'inline-block', paddingLeft: '4px' }} // 绿色按钮
              >
                重新发布
              </Button>
            )}
          </div>
        )
      }
    }
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
            polling={polling}
            pagination={{
              pageSize: 10,
            }}
          />
        </div>
      </main>
    </Layout>
  );
}