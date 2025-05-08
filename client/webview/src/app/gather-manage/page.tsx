'use client'
import React, { useRef, useState, useEffect } from 'react'
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components'
import { Button, message } from 'antd'

import styles from './index.module.less'
import OpenModal from './components/open-modal'
import Layout from '@/components/layout'
import { getGatherBatchPage, getGatherBatchFavoriteSkuList } from '@api/gather/gather-batch.api'
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku'
import { PDD, PDD_URL } from '@enums/source'
import SkuPushStepsForm from '../sku/components/SkuPushSteps'

export default function GatherManage() {
  const actionRef = useRef<ActionType>() // 表格操作
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState({})
  const [visible, setVisible] = useState(false)
  const [taskId, setTaskId] = useState<number | undefined>(undefined)
  const [operationType, setOperationType] = useState('')
  const [urls, setUrls] = useState<string[]>([])
  const [source, setSource] = useState<string>('');


  useEffect(() => {
    const monitor = new MonitorPxxSkuApi();
    monitor.onGatherToolClosed(() => {
      onSuccess();
    });
  }, []);


  const columns: ProColumns<any>[] = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      search: false,
      key: 'batchNo',
      align: 'center'
    },
    {
      title: '采集备注',
      dataIndex: 'name',
      search: false,
      key: 'name',
      align: 'center'
    },
    {
      title: '采集来源',
      dataIndex: 'source',
      search: false,
      key: 'source',
      align: 'center'
    },
    {
      title: '采集账号',
      dataIndex: 'account',
      search: false,
      key: 'account',
      align: 'center'
    },
    {
      title: '采集统计',
      dataIndex: 'statistics',
      search: false,
      key: 'statistics',
      align: 'center',
      render: (_, record) => {
        const { total, favoriteTotal } = record
        const totalText = total >= 0 ? `采集总数: ${total}` : ''
        const successText = favoriteTotal >= 0 ? ` 收藏数: ${favoriteTotal}` : ''
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
            createdAtStart: value[0],
            createdAtEnd: value[1]
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
              onClick={() => openModal('update', record)} // 修改操作
              style={{ display: 'inline-block', paddingRight: '2px' }} // 缩小右边距
            >
              修改
            </Button>
            <Button
              type='link'
              onClick={() => openGatherTool(record)} // 查看操作
              style={{ display: 'inline-block', paddingLeft: '2px', paddingRight: '2px' }} // 缩小右边距
            >
              开始采集
            </Button>
            <Button
              type='link'
              onClick={() => publishGatherSku(record)} // 导出操作
              style={{ display: 'inline-block', paddingLeft: '2px' }}>
              发布商品
            </Button>
          </div>
        )
      }
    }
  ] // 表格列

  // 打开采集工具
  const openGatherTool = (record: any) => {
    if (record.source !== PDD) {
      message.error('暂不支持除PDD外的其他商品来源')
      return
    }

    if (!record.resourceId || record.resourceId === 0) {
      message.error('请先选择采集资源账号,可在修改操作中选择')
      return
    }

    const monitor = new MonitorPxxSkuApi()
    monitor.openGatherTool(record.resourceId, record.id);
  }

  // 发布商品
  const publishGatherSku = async (record: any) => {
    // 查询采集批次收藏商品
    const res = await getGatherBatchFavoriteSkuList(record.id)

    if (!res || res.length === 0) {
      message.error('请先采集商品,在发布商品')
      return
    }

    const urls = res.map((item: any) => {
      const url = `${PDD_URL}${item.skuId}`
      return url
    })

    setUrls(urls)
    setSource(record.source)
    setVisible(true)
    setTaskId(undefined)
    setOperationType('push')
  }

  // 获取数据源
  const getDataSource = async (params?: any) => {
    const res = await getGatherBatchPage(params)
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
        创建采集批次
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
              onSuccess: onSuccess
            }}
          />

          {/* 发布商品 */}
          {visible && (
            <SkuPushStepsForm
              visible={visible}
              setVisible={setVisible}
              taskId={taskId}
              setTaskId={setTaskId}
              operationType={operationType}
              setOperationType={setOperationType}
              onClose={() => {

              }}
              urls={urls}
              source={source}
            />
          )}
        </div>
      </main>
    </Layout>
  )
}
