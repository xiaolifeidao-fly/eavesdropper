import React, { useState, useEffect } from 'react'
import type { Key } from 'react'
import { Tag, Space, Progress } from 'antd'
import { ProList } from '@ant-design/pro-components'

interface GatherToolProps {
  hideModal: () => void
  onSuccess?: () => void
}

// 定义接口类型
interface GatherInfo {
  batchNo: string
  name: string
  source: string
  createdAt: string
  total: number
  size: number
}

interface SkuViewInfo {
  skuId: string | number
  skuName: string
  skuPrice: number
  skuSales: number
  favorite: boolean
}

interface ProductItem {
  id: number
  title: string
  shortTitle: string
  price: number
  sales: number
  favorite: boolean
}

const GaterToolInfo = ({ gaterInfo }: { gaterInfo: GatherInfo }) => {
  const { batchNo, name, source, createdAt, total, size } = gaterInfo

  return (
    <div
      className='info-section'
      style={{
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#fafafa',
        borderRadius: 4,
        border: '1px solid #f0f0f0',
        fontSize: 13
      }}>
      <div
        className='batch-number'
        style={{
          textAlign: 'center',
          marginBottom: 8,
          fontSize: 15,
          fontWeight: 500,
          color: '#1890ff',
          paddingBottom: 6,
          borderBottom: '1px dashed #e8e8e8'
        }}>
        批次号：PXX-20250416-001
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集批次：</span>
        <span>{name}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集来源：</span>
        <span>{source}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集时间：</span>
        <span>{createdAt}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>本次采集数量：</span>
        <span>{total}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>已查看数量：</span>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold',
            padding: '1px 6px',
            borderRadius: 10,
            fontSize: 12
          }}>
          {size}
        </span>
      </div>
    </div>
  )
}

const SkuViewInfo = ({ skuViewInfo, onFavorite, onViewDetail }: { skuViewInfo: SkuViewInfo, onFavorite: () => void, onViewDetail: () => void }) => {
  return (
    <div
      className='current-product'
      style={{
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#e6f7ff',
        borderRadius: 4,
        border: '1px solid #91d5ff',
        fontSize: 13
      }}>
      <div
        className='current-product-header'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
          fontWeight: 500
        }}>
        <span>当前查看的商品</span>
      </div>
      <div
        className='current-product-title'
        style={{
          color: '#1890ff',
          fontSize: 14,
          marginBottom: 4,
          wordBreak: 'break-all',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
        {skuViewInfo.skuName}
      </div>
      <div
        className='current-product-price'
        style={{
          color: '#f5222d',
          fontWeight: 'bold',
          marginBottom: 4
        }}>
        ¥{skuViewInfo.skuPrice.toFixed(2)}
      </div>
      <div>
        销量: <span>{skuViewInfo.skuSales}</span>
      </div>
      <div
        className='current-product-actions'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6
        }}>
        <button
          className={`favorite-btn ${skuViewInfo.favorite ? 'favorited' : ''}`}
          onClick={onFavorite}
          style={{
            backgroundColor: skuViewInfo.favorite ? '#722ed1' : '#ff4d4f',
            color: 'white',
            border: 'none',
            padding: '3px 6px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center'
          }}>
          <svg
            viewBox='64 64 896 896'
            width='14'
            height='14'
            fill='currentColor'
            aria-hidden='true'
            style={{ marginRight: 3 }}>
            <path d='M923 283.6a260.04 260.04 0 00-56.9-82.8 264.4 264.4 0 00-84-55.5A265.34 265.34 0 00679.7 125c-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5a258.44 258.44 0 00-56.9 82.8c-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3.1-35.3-7-69.6-20.9-101.9z'></path>
          </svg>
          {skuViewInfo.favorite ? '已收藏' : '收藏'}
        </button>
        <button
          className='view-btn'
          onClick={onViewDetail}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '3px 6px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12
          }}>
          查看详情
        </button>
      </div>
    </div>
  )
}

const GatherTool = (props: GatherToolProps) => {
  const { hideModal, onSuccess } = props
  const [containerHeight, setContainerHeight] = useState(0)

  const [dataSource, setDataSource] = useState<ProductItem[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])
  const [viewedProducts, setViewedProducts] = useState<Set<number>>(new Set())
  const [gaterInfo, setGaterInfo] = useState<GatherInfo>({
    batchNo: 'PXX-20250416-001',
    name: 'pxx手机采集',
    source: 'pxx',
    createdAt: '2025-04-16 10:00',
    total: 100,
    size: 0
  })

  const [skuViewInfo, setSkuViewInfo] = useState<SkuViewInfo>({
    skuId: '123456',
    skuName: '华为 Mate 60 Pro 旗舰手机 12+512GB 砚黑色',
    skuPrice: 6999.00,
    skuSales: 5280,
    favorite: false
  })

  useEffect(() => {
    // 计算容器高度为整个视口高度
    setContainerHeight(window.innerHeight)
    
    // 监听窗口大小变化
    const handleResize = () => {
      setContainerHeight(window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    createDataSource()
    
    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
    
    // 设置初始查看商品为第一个商品
    if (newDataSource.length > 0) {
      updateCurrentProduct(newDataSource[0])
    }
  }

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => {
      setSelectedRowKeys(keys)
      updateExportButtonState()
    }
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
      setGaterInfo((prev: GatherInfo) => ({
        ...prev,
        size: newViewedProducts.size
      }))
    }
  }

  // 更新当前浏览商品
  const updateCurrentProduct = (product: ProductItem) => {
    setSkuViewInfo({
      skuId: product.id,
      skuName: product.title,
      skuPrice: product.price,
      skuSales: product.sales,
      favorite: product.favorite
    })
    
    // 更新已查看商品
    updateViewedProducts(product.id)
  }

  // 切换收藏状态
  const toggleFavorite = () => {
    // 更新当前商品的收藏状态
    setSkuViewInfo((prev: SkuViewInfo) => ({
      ...prev,
      favorite: !prev.favorite
    }))
    
    // 更新数据源中的商品收藏状态
    const updatedDataSource = dataSource.map(item => {
      if (item.id === skuViewInfo.skuId) {
        return { ...item, favorite: !skuViewInfo.favorite }
      }
      return item
    })
    setDataSource(updatedDataSource)
  }

  // 查看详情
  const handleViewDetail = () => {
    alert(`查看商品详情: ${skuViewInfo.skuName}`)
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

    // 找出新展开的行，并标记为已查看
    if (keys.length > expandedRowKeys.length) {
      const newExpandedKey = keys.find((key) => !expandedRowKeys.includes(key))
      if (newExpandedKey !== undefined) {
        const product = dataSource.find(item => item.id === newExpandedKey)
        if (product) {
          updateCurrentProduct(product)
        }
      }
    }
  }

  const calculateScrollableHeight = () => {
    // 减去其他组件的高度来计算可滚动区域的高度
    // 基本信息区域 + 当前商品区域 + 操作栏 + 边距等
    const infoSectionHeight = 180; // 基本信息区域高度
    const currentProductHeight = 150; // 当前查看商品区域高度
    const actionBarHeight = 40; // 操作栏高度
    const paddingAndMargins = 45; // 边距和其他空间
    
    return containerHeight - (infoSectionHeight + currentProductHeight + actionBarHeight + paddingAndMargins);
  }

  return (
    <div style={{
      height: `${containerHeight}px`,
      width: '100%',
      background: 'white',
      padding: '12px 12px 8px',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button 
          onClick={hideModal}
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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
      </div>
      
      <GaterToolInfo gaterInfo={gaterInfo} />
      <SkuViewInfo
        skuViewInfo={skuViewInfo}
        onFavorite={toggleFavorite}
        onViewDetail={handleViewDetail}
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
                  }}
                  onClick={() => updateCurrentProduct(record)}>
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
                        const updatedDataSource = dataSource.map(item => {
                          if (item.id === record.id) {
                            return { ...item, favorite: !item.favorite }
                          }
                          return item
                        })
                        setDataSource(updatedDataSource)
                        
                        // 如果是当前查看的商品，同步更新
                        if (record.id === skuViewInfo.skuId) {
                          setSkuViewInfo((prev: SkuViewInfo) => ({
                            ...prev,
                            favorite: !record.favorite
                          }))
                        }
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
