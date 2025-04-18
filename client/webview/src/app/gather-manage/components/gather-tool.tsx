import React, { useState, useEffect } from 'react'
import type { Key } from 'react'
import { message } from 'antd'

import GaterToolInfo, { GatherInfo } from './gather-tool-info'
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku'
import SkuViewInfo, { SkuViewInfoI } from './gather-tool-sku-view-info'
import { DoorSkuDTO } from '@model/door/sku'
import { PDD } from '@enums/source'
import GatherSkuList from './gather-sku-list'

interface GatherToolProps {
  hideModal: () => void
  onSuccess?: () => void
  data?: any
}

const GatherTool = (props: GatherToolProps) => {
  const { hideModal, onSuccess, data } = props
  const [containerHeight, setContainerHeight] = useState(0)

  const [gatherViewSkuList, setGatherViewSkuList] = useState<SkuViewInfoI[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])
  const [viewedProducts, setViewedProducts] = useState<Set<string>>(new Set())
  const [gaterInfo, setGaterInfo] = useState<GatherInfo | null>(null)
  const [skuViewInfo, setSkuViewInfo] = useState<SkuViewInfoI | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

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

  const initGatherInfo = () => {
    setGaterInfo(data)
  }

  // 打开PXX
  const openPxx = async () => {
    try {
      const monitor = new MonitorPxxSkuApi()
      await monitor.monitorSku()

      // 监听PXX采集商品消息
      monitor.onGatherSkuMessage((doorSkuDTO: DoorSkuDTO | null) => {
        gatherDoorSkuHandler(PDD, doorSkuDTO)
      })
    } catch (error: any) {
      message.error('打开PXX失败', error)
    }
  }

  // 采集商品消息处理
  const gatherDoorSkuHandler = (source: string, doorSkuDTO: DoorSkuDTO | null) => {
    if (!doorSkuDTO) {
      setSkuViewInfo(null)
      return
    }
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

    // 使用函数式更新来处理状态，确保访问最新的状态
    setGatherViewSkuList((prevList) => {
      // 在函数内部检查是否已存在
      const isExist = prevList.some((item) => item.skuId === skuViewInfo.skuId)
      
      if (!isExist) {
        // 不存在，添加到列表
        addGatherViewSkuListViewTotal()
        return [skuViewInfo, ...prevList]
      }
      // 已存在，返回原列表
      return prevList
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
  }

  // 导出选中商品
  const handleExport = () => {
    if (selectedRowKeys.length > 0) {
      alert('导出商品')
    }
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

      {/* 采集商品列表 */}
      <GatherSkuList 
        dataSource={gatherViewSkuList}
        setGatherViewSkuList={setGatherViewSkuList}
        expandedRowKeys={expandedRowKeys}
        setExpandedRowKeys={setExpandedRowKeys}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        updateExportButtonState={updateExportButtonState}
        updateViewedProducts={updateViewedProducts}
        containerHeight={containerHeight}
      />
    </div>
  )
}

export default GatherTool
