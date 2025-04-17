import React, { useState, useEffect } from 'react'
import type { Key } from 'react'
import { Tag, Space, Progress } from 'antd'
import { ProList } from '@ant-design/pro-components'

interface GatherToolProps {
  hideModal: () => void
  onSuccess?: () => void
}

const GatherTool = (props: GatherToolProps) => {
  const { hideModal, onSuccess } = props

  const [dataSource, setDataSource] = useState<any[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])

  useEffect(() => {
    createDataSource()
  }, [])

  const createDataSource = () => {
    const dataSource = []
    for (let i = 0; i < 100; i++) {
      dataSource.push({
        id: i,
        title: '我是一个商品标题',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg'
      })
    }
    setDataSource(dataSource)
  }

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => setSelectedRowKeys(keys)
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div>
          采集标题：<span>pxx手机采集</span>
        </div>
        <div>
          采集来源：<span>pxx</span>
        </div>
        <div>
          采集时间：<span>2025-04-16 10:00:00</span>
        </div>
      </div>
      <div
        id='scrollableDiv'
        style={{
          height: 500,
          overflow: 'auto'
        }}>
        <ProList
          rowKey='id'
          expandable={{ expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys }}
          dataSource={dataSource}
          rowSelection={rowSelection}
          metas={{
            title: {},
            description: {
              render: (_, record: any) => {
                // 获取从dataSource中获取的商品描述
                return record.title
              }
            },
            actions: {
              render: () => {
                return <a key='invite'>复制链接</a>
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default GatherTool
