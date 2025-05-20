'use client'
import React, { useRef, useState, useEffect } from 'react'
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components'
import { Button } from 'antd'

import Layout from '@/components/layout'
import styles from './index.module.less'
import { getFeedbackPage, getFeedbackStatusEnums } from '@/api/feedback/feedback.api'
import OpenModal from './components/open-modal'

export default function FeedbackManage() {
  const actionRef = useRef<ActionType>() // 表格操作
  const [statusEnums, setStatusEnums] = useState<Record<string, any>>()
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState({})

  useEffect(() => {
    initFeedbackTypeEnums()
  }, [])

  const initFeedbackTypeEnums = () => {
    getFeedbackStatusEnums().then((res) => {
      const valueEnums: Record<string, any> = {}
      res.forEach((item) => {
        valueEnums[item.value] = {
          text: item.label
        }
      })
      setStatusEnums(valueEnums)
    })
  }

  const columns: ProColumns<any>[] = [
    {
      title: '反馈标题',
      dataIndex: 'title',
      search: false,
      key: 'title',
      align: 'center'
    },
    {
      title: '反馈类型',
      dataIndex: 'feedbackTypeLabel',
      search: false,
      key: 'feedbackTypeLabel',
      align: 'center'
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      search: false,
      key: 'createdAt',
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'statusLabel',
      search: false,
      key: 'statusLabel',
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInTable: true,
      search: true,
      key: 'status',
      valueType: 'select',
      valueEnum: statusEnums
    },
    {
      title: '提交时间',
      valueType: 'dateTimeRange',
      hideInTable: true,
      width: 200,
      search: {
        transform: (value) => {
          return {
            startCreatedAt: value[0],
            endCreatedAt: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      search: false,
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => {
        return (
          <div>
            <Button
              type='link'
              onClick={() => openModal('view', record)}
              style={{ display: 'inline-block' }}
            >
              查看详情
            </Button>
          </div>
        )
      }
    }
  ] // 表格列

  // 获取数据源
  const getDataSource = async (params?: any) => {
    const res = await getFeedbackPage(params)
    const data = res.data.map((item: any) => {
      return {
        ...item
      }
    })

    return {
      data,
      success: true,
      total: res.pageInfo.total
    }
  }

  // 打开弹窗
  const openModal = (type: string, data?: any) => {
    setModalType(type)
    setModalData(data)
  }

  // 隐藏弹窗
  const hideModal = () => {
    setModalType('')
    setModalData({})
  }

  // 成功回调
  const onSuccess = () => {
    actionRef.current?.reload()
    // getDataSource()
  }

  // toolBarRender
  // const toolBarRender = () => {
  //   return [
  //     <Button
  //       key='add'
  //       type='primary'
  //       onClick={() => openModal('create')}>
  //       添加意见反馈
  //     </Button>
  //   ]
  // }

  return (
    <Layout curActive='/feedback'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable
            rowKey='id'
            headerTitle='反馈列表'
            columns={columns}
            actionRef={actionRef}
            options={false}
            // toolBarRender={toolBarRender}
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

          {/* 弹窗 */}
          <OpenModal
            params={{
              type: modalType,
              data: modalData,
              hideModal: hideModal,
              onSuccess: onSuccess
            }}
          />
        </div>
      </main>
    </Layout>
  )
}
