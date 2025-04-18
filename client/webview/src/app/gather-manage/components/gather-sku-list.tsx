import React from 'react'
import type { Key } from 'react'
import { ProList } from '@ant-design/pro-components'
import { Empty } from 'antd'
import { SkuViewInfoI } from './gather-tool-sku-view-info'

interface GatherSkuListProps {
  dataSource: SkuViewInfoI[]
  setGatherViewSkuList: React.Dispatch<React.SetStateAction<SkuViewInfoI[]>>
  expandedRowKeys: readonly Key[]
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<readonly Key[]>>
  selectedRowKeys: Key[]
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<Key[]>>
  updateExportButtonState: () => void
  updateViewedProducts: (skuId: string) => void
  containerHeight: number
  onItemFavoriteChange?: (skuId: string, favorite: boolean) => void
}

/**
 * 采集商品列表组件
 */
const GatherSkuList: React.FC<GatherSkuListProps> = ({
  dataSource,
  setGatherViewSkuList,
  expandedRowKeys,
  setExpandedRowKeys,
  selectedRowKeys,
  setSelectedRowKeys,
  updateExportButtonState,
  updateViewedProducts,
  containerHeight,
  onItemFavoriteChange,
}) => {

  // 计算滚动区域高度
  const calculateScrollableHeight = () => {
    // 减去其他组件的高度来计算可滚动区域的高度
    // 基本信息区域 + 当前商品区域 + Tab 组件 + 操作栏 + 边距等
    const infoSectionHeight = 180 // 基本信息区域高度
    const currentProductHeight = 150 // 当前查看商品区域高度
    const tabHeight = 40 // Tab组件高度
    const actionBarHeight = 40 // 操作栏高度
    const paddingAndMargins = 45 // 边距和其他空间

    return containerHeight - (infoSectionHeight + currentProductHeight + tabHeight + actionBarHeight + paddingAndMargins)
  }

  // 展开行时记录为已查看
  const handleExpandedRowsChange = (keys: readonly Key[]) => {
    setExpandedRowKeys(keys)
  }

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => {
      setSelectedRowKeys(keys)
      updateExportButtonState()
    }
  }

  // 更新商品收藏状态
  const handleFavoriteChange = (record: SkuViewInfoI) => {
    // 更新列表数据
    const updatedDataSource = dataSource.map((item) => {
      if (item.skuId === record.skuId) {
        return { ...item, favorite: !item.favorite }
      }
      return item
    })
    
    // 更新列表数据
    setGatherViewSkuList(updatedDataSource)
    
    // 通知父组件收藏状态变化，父组件可能需要更新当前查看商品的状态
    if (onItemFavoriteChange) {
      onItemFavoriteChange(record.skuId, !record.favorite)
    }
  }

  // 渲染空状态
  const renderEmpty = () => {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#999', fontSize: 14 }}>
            没有符合条件的商品
          </span>
        }
        style={{ marginTop: 50 }}
      />
    )
  }

  return (
    <div
      id='scrollableDiv'
      style={{
        height: `${calculateScrollableHeight()}px`,
        overflow: 'auto'
      }}>
      {dataSource.length > 0 ? (
        <ProList
          rowKey='skuId'
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: handleExpandedRowsChange
          }}
          dataSource={dataSource}
          rowSelection={rowSelection}
          metas={{
            title: {
              render: (_, record: SkuViewInfoI) => (
                <div
                  className='product-title'
                  style={{
                    fontWeight: 500,
                    marginBottom: 2,
                    cursor: 'pointer',
                    color: '#1890ff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {record.skuName}
                </div>
              )
            },
            description: {
              render: (_, record: SkuViewInfoI) => {
                return (
                  <>
                    <div
                      className='product-price'
                      style={{
                        color: '#f5222d',
                        fontWeight: 'bold',
                        fontSize: 12,
                        marginTop: 2,
                        display: expandedRowKeys.includes(record.skuId) ? 'block' : 'none'
                      }}>
                      ¥{record.skuPrice}
                    </div>
                    <div
                      className='product-sales'
                      style={{
                        fontSize: 12,
                        color: '#666',
                        marginTop: 1,
                        display: expandedRowKeys.includes(record.skuId) ? 'block' : 'none'
                      }}>
                      销量: {record.skuSales}
                    </div>
                    <div
                      className='product-description'
                      style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        fontSize: 12,
                        display: expandedRowKeys.includes(record.skuId) ? 'block' : 'none',
                        marginTop: 4,
                        padding: 4,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 4,
                        wordBreak: 'break-all',
                        maxHeight: 80,
                        overflowY: 'auto',
                        lineHeight: 1.3
                      }}>
                      {record.skuName}
                    </div>
                  </>
                )
              }
            },
            actions: {
              render: (_, record: SkuViewInfoI) => {
                return (
                  <div
                    className='product-actions'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                    <button
                      className={`item-favorite-btn ${record.favorite ? 'favorited' : ''}`}
                      onClick={() => {
                        handleFavoriteChange(record)
                      }}
                      style={{
                        color: '#ff4d4f',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                      <svg
                        viewBox='64 64 896 896'
                        aria-hidden='true'
                        style={{
                          width: 14,
                          height: 14,
                          fill: record.favorite ? '#ff4d4f' : '#d9d9d9'
                        }}>
                        <path d='M923 283.6a260.04 260.04 0 00-56.9-82.8 264.4 264.4 0 00-84-55.5A265.34 265.34 0 00679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 00-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3.1-35.3-7-69.6-20.9-101.9z'></path>
                      </svg>
                    </button>
                    <a
                      href='javascript:void(0);'
                      className='copy-link'
                      style={{
                        color: '#1890ff',
                        fontSize: 12
                      }}
                      onClick={() => {
                        updateViewedProducts(record.skuId)
                        alert(`已复制商品链接: ${record.skuName}`)
                      }}>
                      复制
                    </a>
                  </div>
                )
              }
            }
          }}
        />
      ) : renderEmpty()}
    </div>
  )
}

export default GatherSkuList
