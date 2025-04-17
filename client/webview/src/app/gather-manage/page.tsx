'use client'
import React, { useRef, useState } from 'react'
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components'
import { Button } from 'antd'

import styles from './index.module.less'
import OpenModal from './components/open-modal'
import Layout from '@/components/layout'

export default function GatherManage() {
  const actionRef = useRef<ActionType>() // 表格操作
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState({})

  // 查看详情
  const handleView = (record: any) => {}

  // 导出链接
  const handleExport = (record: any) => {}

  const columns: ProColumns<any>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      search: false,
      key: 'title',
      align: 'center'
    },
    {
      title: '来源',
      dataIndex: 'source',
      search: false,
      key: 'source',
      align: 'center'
    },
    {
      title: '采集数',
      dataIndex: 'gatherCount',
      search: false,
      key: 'gatherCount',
      align: 'center',
      render: (_, record) => {
        const { total, successTotal } = record
        const totalText = total >= 0 ? `总数: ${total}` : ''
        const successText = successTotal >= 0 ? ` 成功: ${successTotal}` : ''
        return (
          <span>
            {totalText}
            {successText}
          </span>
        )
      }
    },
    {
      title: '采集时间',
      dataIndex: 'createdAt',
      search: false,
      key: 'createdAt',
      align: 'center'
    },
    {
      title: '采集时间',
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1]
          }
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      search: false,
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button
              type='link'
              onClick={() => handleView(record)} // 查看操作
              style={{ display: 'inline-block', paddingRight: '4px' }} // 缩小右边距
            >
              查看详情
            </Button>
            <Button
              type='link'
              onClick={() => handleExport(record)} // 导出操作
              style={{ display: 'inline-block', paddingLeft: '4px' }}>
              导出链接
            </Button>
          </div>
        )
      }
    }
  ] // 表格列

  // 获取数据源
  const getDataSource = async (params?: any) => {
    console.log(params)
    return {
      data: [
        {
          id: 1,
          title: '采集标题',
          source: 'pdd',
          total: 20,
          successTotal: 10,
          createdAt: '2025-04-16 12:00:00'
        }
      ],
      success: true,
      total: 1
    }
  }

  // 隐藏弹窗
  const hideModal = () => {
    setModalType('')
    setModalData({})
  }

  // 成功回调
  const onSuccess = () => {
    getDataSource()
  }

  // 打开弹窗
  const openModal = (type: string, data?: any) => {
    setModalType(type)
    setModalData(data)
  }

  // toolBarRender
  const toolBarRender = () => {
    return [
      <Button
        key='add'
        type='primary'
        onClick={() => openModal('create')}>
        开始采集
      </Button>
    ]
  }

  return (
    <Layout curActive='/gather-manage'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable
            rowKey='id'
            headerTitle='采集管理'
            columns={columns}
            actionRef={actionRef}
            options={false}
            toolBarRender={toolBarRender}
            request={async (params) => {
              const res = await getDataSource(params)
              return {
                data: res.data,
                success: true,
                total: res.total
              }
            }}
            pagination={{
              pageSize: 10
            }}
          />

          <OpenModal
            params={{
              type: modalType,
              data: modalData,
              hideModal: hideModal,
              onSuccess: onSuccess,
              openModal: openModal
            }}
          />
        </div>
      </main>
    </Layout>
  )
}
