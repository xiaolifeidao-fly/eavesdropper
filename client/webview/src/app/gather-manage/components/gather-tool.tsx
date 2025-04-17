import React, { useState, useEffect } from 'react'
import type { Key } from 'react'
import { message } from 'antd'

import { ProList } from '@ant-design/pro-components'
import GaterToolInfo, { GatherInfo } from './gater-tool-info'
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku'
import SkuViewInfo, { SkuViewInfoI } from './gather-tool-sku-view-info'
import { DoorSkuDTO } from '@model/door/sku'
import { PDD } from '@enums/source'
interface GatherToolProps {
  hideModal: () => void
  onSuccess?: () => void
  data?: any
}

interface ProductItem {
  id: number
  title: string
  shortTitle: string
  price: number
  sales: number
  favorite: boolean
}

const GatherTool = (props: GatherToolProps) => {
  const { hideModal, onSuccess, data } = props
  const [containerHeight, setContainerHeight] = useState(0)

  const [dataSource, setDataSource] = useState<ProductItem[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])
  const [viewedProducts, setViewedProducts] = useState<Set<number>>(new Set())
  const [gaterInfo, setGaterInfo] = useState<GatherInfo | null>(null)
  const [skuViewInfo, setSkuViewInfo] = useState<SkuViewInfoI | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => {
      setSelectedRowKeys(keys)
      updateExportButtonState()
    }
  }

  useEffect(() => {
    // 计算容器高度为整个视口高度
    setContainerHeight(window.innerHeight)

    // 监听窗口大小变化
    const handleResize = () => {
      setContainerHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    initGatherInfo()
    // createDataSource()

    // openPxx
    openPxx()

    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const initGatherInfo = () => {
    setGaterInfo(data)
  }

  // 打开PXX
  const openPxx = async () => {
    try {
      const monitor = new MonitorPxxSkuApi()
      await monitor.monitorSku()

      // 监听PXX采集商品消息
      monitor.onGatherSkuMessage((doorSkuDTO: DoorSkuDTO) => {
        gatherDoorSkuHandler(PDD, doorSkuDTO)
      })
    } catch (error: any) {
      message.error('打开PXX失败', error)
    }
  }

  const gatherDoorSkuHandler = (source: string, doorSkuDTO: DoorSkuDTO) => {
    // 将pxx当前查看的商品展示到当前展示商品信息列表
    const skuViewInfo: SkuViewInfoI = {
      source: source,
      skuId: doorSkuDTO.baseInfo.itemId,
      skuName: doorSkuDTO.baseInfo.title,
      skuPrice: doorSkuDTO.doorSkuSaleInfo.price,
      skuSales: doorSkuDTO.doorSkuSaleInfo.saleNum,
      favorite: false
    }

    setSkuViewInfo(skuViewInfo)
  }

  const createDataSource = () => {
    const newDataSource: ProductItem[] = []
    for (let i = 0; i < 100; i++) {
      newDataSource.push({
        id: i,
        title: `商品 ${i + 1} 的详细描述信息，这里展示了商品的完整描述内容。`,
        shortTitle: `商品 ${i + 1}`,
        price: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
        sales: Math.floor(Math.random() * 10000),
        favorite: false
      })
    }
    setDataSource(newDataSource)
  }

  // 更新导出按钮状态
  const updateExportButtonState = () => {
    const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement | null
    if (exportBtn) {
      exportBtn.disabled = selectedRowKeys.length === 0
    }
  }

  // 更新已查看商品
  const updateViewedProducts = (id: number) => {
    if (!viewedProducts.has(id)) {
      const newViewedProducts = new Set(viewedProducts)
      newViewedProducts.add(id)
      setViewedProducts(newViewedProducts)

      // 更新已查看数量
      // setGaterInfo((prev: GatherInfo) => ({
      //   ...prev,
      //   size: newViewedProducts.size
      // }))
    }
  }

  // 切换收藏状态
  const toggleFavorite = () => {
    // 更新当前商品的收藏状态
    if (!skuViewInfo) {
      return
    }
    setSkuViewInfo((prev: SkuViewInfoI | null) => {
      if (!prev) {
        return null
      }
      return {
        ...prev,
        favorite: !prev.favorite
      }
    })

    // 更新数据源中的商品收藏状态
    // const updatedDataSource = dataSource.map((item) => {
    //   if (item.id === skuViewInfo.skuId) {
    //     return { ...item, favorite: !skuViewInfo.favorite }
    //   }
    //   return item
    // })
    // setDataSource(updatedDataSource)
  }

  // 导出选中商品
  const handleExport = () => {
    if (selectedRowKeys.length > 0) {
      const selectedItems = dataSource.filter((item) => selectedRowKeys.includes(item.id)).map((item) => item.shortTitle)
      alert('将导出以下商品:\n' + selectedItems.join('\n'))
    }
  }

  // 展开行时记录为已查看
  const handleExpandedRowsChange = (keys: readonly Key[]) => {
    setExpandedRowKeys(keys)
  }

  const calculateScrollableHeight = () => {
    // 减去其他组件的高度来计算可滚动区域的高度
    // 基本信息区域 + 当前商品区域 + 操作栏 + 边距等
    const infoSectionHeight = 180 // 基本信息区域高度
    const currentProductHeight = 150 // 当前查看商品区域高度
    const actionBarHeight = 40 // 操作栏高度
    const paddingAndMargins = 45 // 边距和其他空间

    return containerHeight - (infoSectionHeight + currentProductHeight + actionBarHeight + paddingAndMargins)
  }

  return (
    <div
      style={{
        height: `${containerHeight}px`,
        width: '100%',
        background: 'white',
        padding: '12px 12px 8px',
        overflow: 'hidden'
      }}>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button
          onClick={() => {
            onSuccess && onSuccess()
            hideModal()
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: '#999',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
          ✕
        </button>
      </div>

      <GaterToolInfo gaterInfo={gaterInfo} />
      <SkuViewInfo
        skuViewInfo={skuViewInfo}
        onFavorite={toggleFavorite}
      />

      <div
        className='action-bar'
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 8
        }}>
        <button
          id='exportBtn'
          className='export-btn'
          disabled={selectedRowKeys.length === 0}
          onClick={handleExport}
          style={{
            backgroundColor: selectedRowKeys.length === 0 ? '#d9d9d9' : '#1890ff',
            color: 'white',
            border: 'none',
            padding: '4px 10px',
            borderRadius: 4,
            cursor: selectedRowKeys.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13
          }}>
          导出选中商品
        </button>
      </div>

      <div
        id='scrollableDiv'
        style={{
          height: `${calculateScrollableHeight()}px`,
          overflow: 'auto'
        }}>
        <ProList
          rowKey='id'
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: handleExpandedRowsChange
          }}
          dataSource={dataSource}
          rowSelection={rowSelection}
          metas={{
            title: {
              render: (_, record: ProductItem) => (
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
                  {record.shortTitle}
                </div>
              )
            },
            description: {
              render: (_, record: ProductItem) => {
                return (
                  <>
                    <div
                      className='product-price'
                      style={{
                        color: '#f5222d',
                        fontWeight: 'bold',
                        fontSize: 12,
                        marginTop: 2,
                        display: expandedRowKeys.includes(record.id) ? 'block' : 'none'
                      }}>
                      ¥{record.price.toFixed(2)}
                    </div>
                    <div
                      className='product-sales'
                      style={{
                        fontSize: 12,
                        color: '#666',
                        marginTop: 1,
                        display: expandedRowKeys.includes(record.id) ? 'block' : 'none'
                      }}>
                      销量: {record.sales}
                    </div>
                    <div
                      className='product-description'
                      style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        fontSize: 12,
                        display: expandedRowKeys.includes(record.id) ? 'block' : 'none',
                        marginTop: 4,
                        padding: 4,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 4,
                        wordBreak: 'break-all',
                        maxHeight: 80,
                        overflowY: 'auto',
                        lineHeight: 1.3
                      }}>
                      {record.title}
                    </div>
                  </>
                )
              }
            },
            actions: {
              render: (_, record: ProductItem) => {
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
                        // 更新商品收藏状态
                        const updatedDataSource = dataSource.map((item) => {
                          if (item.id === record.id) {
                            return { ...item, favorite: !item.favorite }
                          }
                          return item
                        })
                        setDataSource(updatedDataSource)

                        // 如果是当前查看的商品，同步更新
                        // if (record.id === skuViewInfo?.skuId) {
                        //   setSkuViewInfo((prev: SkuViewInfo | null) => {
                        //     if (!prev) {
                        //       return null
                        //     }
                        //     return {
                        //       ...prev,
                        //       favorite: !record.favorite
                        //     }
                        //   })
                        // }
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
                        updateViewedProducts(record.id)
                        alert(`已复制商品链接: ${record.shortTitle}`)
                      }}>
                      复制
                    </a>
                  </div>
                )
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default GatherTool
