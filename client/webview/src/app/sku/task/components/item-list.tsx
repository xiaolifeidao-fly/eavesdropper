'use client'
import { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd'
import { ColumnsType } from 'antd/es/table';

import { getSkuTaskItemByTaskId } from '@api/sku/sku-task-item'

interface SkuTaskItemListProp {
  taskId: number
}

function copyToClipboard(inputText: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = inputText
    textarea.style.position = 'fixed' // 避免滚动到底部
    document.body.appendChild(textarea)
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        resolve()
      } else {
        reject(new Error('无法复制文本'))
      }
    } catch (err) {
      reject(err)
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

const SkuTaskItemList = (props: SkuTaskItemListProp) => {

  const [itemList, setItemList] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getSkuTaskItemByTaskId(props.taskId).then(resp => {
      setItemList(resp)
    }).finally(() => {
      setLoading(false)
    })
  }, [props.taskId])

  const columns: ColumnsType = [
    {
      title: '商品ID',
      dataIndex: 'sourceSkuId',
      align: 'center',
      key: 'sourceSkuId',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      align: 'center',
      key: 'name'
    },
    {
      title: '状态',
      align: 'center',
      key: 'status',
      render: (_, record) => {
        return (
          <Tag color={record.statusLableValue.color}>
            {record.statusLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '来源',
      align: 'center',
      key: 'source',
      render: (_, record) => {
        return (
          <Tag color={record.sourceLableValue.color}>
            {record.sourceLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      align: 'center',
      key: 'createdAt'
    },
    {
      title: '操作',
      align: 'center',
      key: 'operate',
      render: (_, record) => {
        return (
          <div style={{ display: 'flex', gap: '4px' }}> {/* 设置间距为 4px */}
            <Button
              type="link"
              style={{ display: 'inline-block', paddingRight: '4px' }} // 缩小右边距
              onClick={async () => {
                try {
                  await copyToClipboard(record.url || '')
                  message.success('复制成功')
                } catch (error) {
                  console.error(error)
                  message.error('复制失败')
                }
              }} // 查看操作
            >
              复制上家链接
            </Button>
            <Button
              type="link"
              disabled={!record.newSkuUrl}
              style={{ display: 'inline-block', paddingLeft: '4px' }} // 绿色按钮
              onClick={async () => {
                try {
                  await copyToClipboard(record.newSkuUrl || '')
                  message.success('复制成功')
                } catch (error) {
                  console.error(error)
                  message.error('复制失败')
                }
              }} // 查看操作
            >
              复制当前商品链接
            </Button>
          </div>
        )
      }
    }
  ]

  return <>
    <Table rowKey="id" columns={columns} dataSource={itemList} loading={loading}/>
  </>
}

export {
  SkuTaskItemList
}