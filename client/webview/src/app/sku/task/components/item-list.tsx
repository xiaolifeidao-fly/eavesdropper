'use client'
import { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Spin, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table';

import { getSkuTaskItemByTaskId } from '@api/sku/sku-task-item'
import { MbSkuApi } from '@eleapi/door/sku/mb.sku';

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
  const [openDraftLoading, setOpenDraftLoading] = useState<boolean>(false)
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
      dataIndex: 'title',
      align: 'center',
      key: 'title'
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
      title: '失败原因',
      dataIndex: 'remark',
      align: 'center',
      key: 'remark',
      render: (_, record) => {
        const remark = record.remark || '--'
        if (remark.length > 10) {
          return (
            <Tooltip title={remark}>
              <Tag>
                {remark.slice(0, 10)}...
              </Tag>
            </Tooltip>
          )
        }
        return (
          <Tag>
            {remark}
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
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}> {/* 设置间距为 4px */}
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
            {record.newSkuUrl && (
              <Button
                type="link"
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
            )}
            {record.status !== 'success' && (
              <Button
                type="link"
                style={{ display: 'inline-block', paddingLeft: '4px' }}
                onClick={async () => {
                  try{
                    console.log("openDraft", record.resourceId, record.sourceSkuId);
                    setOpenDraftLoading(true)
                    const skuApi = new MbSkuApi();
                    const result = await skuApi.openDraft(record.resourceId, record.sourceSkuId);
                    if(result.status != "success"){
                        message.error(result.message);
                    } 
                  }catch(error){
                    console.error(error)
                    message.error('打开草稿失败')
                  }finally{
                    setOpenDraftLoading(false)
                  }
                }}
              >
                打开草稿
              </Button>
            )}  
          </div>
        )
      }
    }
  ]

  return <>
    <Spin spinning={openDraftLoading}> 
      <Table rowKey="id" columns={columns} dataSource={itemList} loading={loading}/>
    </Spin>
  </>
}

export {
  SkuTaskItemList
}