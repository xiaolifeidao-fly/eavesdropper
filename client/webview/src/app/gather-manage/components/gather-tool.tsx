import React, { useState, useEffect } from 'react'
import type { Key } from 'react'
import { message, Tabs } from 'antd'

import GaterToolInfo, { GatherInfo } from './gather-tool-info'
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku'
import SkuViewInfo, { SkuViewInfoI } from './gather-tool-sku-view-info'
import { DoorSkuDTO } from '@model/door/sku'
import { PDD } from '@enums/source'
import GatherSkuList from './gather-sku-list'
import { GatherSku } from '@model/gather/gather-sku'
import { getGatherBatchSkuList } from '@api/gather/gather-batch.api'
import { favoriteGatherSku } from '@api/gather/gather-sku.api'

interface GatherToolProps {
  hideModal: () => void
  onSuccess?: () => void
  data?: any
}

const GatherTool = (props: GatherToolProps) => {
  const { hideModal, onSuccess, data } = props
  const { id } = data
  const [containerHeight, setContainerHeight] = useState(0)

  const [gatherViewSkuList, setGatherViewSkuList] = useState<SkuViewInfoI[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])
  const [viewedProducts, setViewedProducts] = useState<Set<string>>(new Set())
  const [gaterInfo, setGaterInfo] = useState<GatherInfo | null>(null)
  const [skuViewInfo, setSkuViewInfo] = useState<SkuViewInfoI | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [activeTabKey, setActiveTabKey] = useState<string>('all')

  useEffect(() => {
    // 计算容器高度为整个视口高度
    setContainerHeight(window.innerHeight)

    // 监听窗口大小变化
    const handleResize = () => {
      setContainerHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    initGatherInfo()

    // 打开PXX
    openPxx()

    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initGatherInfo = async () => {
    setGaterInfo(data)
    // 获取采集批次商品列表
    const gatherSkuList = await getGatherBatchSkuList(id)
    const skuViewInfoList: SkuViewInfoI[] = gatherSkuList.map((item) => {
      return {
        id: item.id,
        source: item.source,
        skuId: item.skuId,
        skuName: item.name,
        skuPrice: item.price,
        skuSales: item.sales,
        favorite: item.favorite
      }
    })
    setGatherViewSkuList(skuViewInfoList)
  }

  // 打开PXX
  const openPxx = async () => {
    try {
      const monitor = new MonitorPxxSkuApi()
      if (!id) {
        message.error('打开PXX失败，请先选择采集批次')
        return
      }

      await monitor.monitorSku(id)
      // 监听PXX采集商品消息
      monitor.onGatherSkuMessage((gatherSku: GatherSku) => {
        gatherDoorSkuHandler(PDD, gatherSku)
      })
    } catch (error: any) {
      message.error('打开PXX失败', error)
    }
  }

  // 采集商品消息处理
  const gatherDoorSkuHandler = (source: string, gatherSku: GatherSku) => {
    // 将pxx当前查看的商品展示到当前展示商品信息列表
    const skuViewInfo: SkuViewInfoI = {
      id: gatherSku.id,
      source: source,
      skuId: gatherSku.skuId,
      skuName: gatherSku.name,
      skuPrice: gatherSku.price,
      skuSales: gatherSku.sales,
      favorite: gatherSku.favorite
    }
    setSkuViewInfo(skuViewInfo)

    // 使用函数式更新来处理状态，确保访问最新的状态
    setGatherViewSkuList((prevList) => {
      // 在函数内部检查是否已存在
      const isExist = prevList.some((item) => item.skuId === skuViewInfo.skuId)

      if (!isExist) {
        // 不存在，添加到列表
        addGatherViewSkuListViewTotal()
        return [skuViewInfo, ...prevList]
      } else {
        // 已存在将数据放置到列表的开头
        return [skuViewInfo, ...prevList.filter((item) => item.skuId !== skuViewInfo.skuId)]
      }
    })
  }

  // 修改采集批次查看数量
  const addGatherViewSkuListViewTotal = (num: number = 1) => {
    setGaterInfo((prev: GatherInfo | null) => {
      if (!prev) {
        return null
      }
      return {
        ...prev,
        viewTotal: prev.viewTotal + num
      }
    })
  }

  // 更新导出按钮状态
  const updateExportButtonState = () => {
    const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement | null
    if (exportBtn) {
      exportBtn.disabled = selectedRowKeys.length === 0
    }
  }

  // 更新已查看商品
  const updateViewedProducts = (skuId: string) => {
    if (!viewedProducts.has(skuId)) {
      const newViewedProducts = new Set(viewedProducts)
      newViewedProducts.add(skuId)
      setViewedProducts(newViewedProducts)
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (id: number, isFavorite: boolean) => {
    // 更新当前商品的收藏状态
    if (!skuViewInfo) {
      return
    }

    // 更新当前商品的收藏状态
    await favoriteGatherSku(id, isFavorite)

    // 更新当前查看商品的收藏状态
    setSkuViewInfo((prev: SkuViewInfoI | null) => {
      if (!prev) {
        return null
      }
      return {
        ...prev,
        favorite: !prev.favorite
      }
    })

    // 同步更新商品列表中的收藏状态
    setGatherViewSkuList((prevList) => {
      return prevList.map((item) => {
        if (item.skuId === skuViewInfo.skuId) {
          return {
            ...item,
            favorite: !item.favorite
          }
        }
        return item
      })
    })
  }

  // 导出选中商品
  const handleExport = () => {
    if (selectedRowKeys.length > 0) {
      alert('导出商品')
    }
  }

  // 获取收藏的商品列表
  const getFavoriteSkuList = () => {
    return gatherViewSkuList.filter((item) => item.favorite)
  }

  // Tab项变化时触发
  const handleTabChange = (key: string) => {
    setActiveTabKey(key)
    // 切换Tab时清除已选择的项
    setSelectedRowKeys([])
  }

  // 获取Tab下的数据源
  const getTabDataSource = () => {
    if (activeTabKey === 'favorite') {
      return getFavoriteSkuList()
    }
    return gatherViewSkuList
  }

  // 商品收藏状态变化回调
  const handleItemFavoriteChange = (skuId: string, favorite: boolean) => {
    // 如果当前查看的商品就是被收藏/取消收藏的商品，更新当前查看商品的状态
    if (skuViewInfo && skuViewInfo.skuId === skuId) {
      setSkuViewInfo({
        ...skuViewInfo,
        favorite: favorite
      })
    }
  }

  const items = [
    {
      key: 'all',
      label: `全部商品 (${gatherViewSkuList.length})`
    },
    {
      key: 'favorite',
      label: `收藏商品 (${getFavoriteSkuList().length})`
    }
  ]

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

      {/* 采集批次信息 */}
      <GaterToolInfo gaterInfo={gaterInfo} />

      {/* 当前查看商品信息 */}
      <SkuViewInfo
        skuViewInfo={skuViewInfo}
        onFavorite={toggleFavorite}
      />

      {/* 操作栏 */}
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

      {/* Tab分类显示 */}
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        items={items}
        style={{ marginBottom: 8 }}
      />

      {/* 采集商品列表 */}
      <GatherSkuList
        dataSource={getTabDataSource()}
        setGatherViewSkuList={setGatherViewSkuList}
        expandedRowKeys={expandedRowKeys}
        setExpandedRowKeys={setExpandedRowKeys}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        updateExportButtonState={updateExportButtonState}
        updateViewedProducts={updateViewedProducts}
        containerHeight={containerHeight}
        onItemFavoriteChange={handleItemFavoriteChange}
      />
    </div>
  )
}

export default GatherTool
