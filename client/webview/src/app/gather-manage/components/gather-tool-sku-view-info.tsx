import React from 'react'
import { message } from 'antd'
import { MonitorPxxSkuApi } from '@eleapi/door/sku/pxx.sku'

import { PDD, TB } from "@enums/source";

const PDD_URL = "https://mobile.yangkeduo.com/goods1.html?goods_id=";

interface SkuViewInfoI {
  id: number
  source: string
  skuId: string
  skuName: string
  skuPrice: string
  skuSales: string
  favorite: boolean
}

const SkuViewInfo = ({ skuViewInfo, onFavorite }: { skuViewInfo: SkuViewInfoI | null; onFavorite: (id: number, isFavorite: boolean) => void }) => {
  if (!skuViewInfo) {
    return null
  }

  // 查看详情
  const onViewDetail = async () => {
    if (skuViewInfo.source === PDD) {
      try {
        // 创建一个API实例来检查本地文件是否存在
        const monitor = new MonitorPxxSkuApi()
        
        // 调用后端API查询本地HTML文件是否存在
        // 这里假设后端有一个checkLocalHtmlExists方法，如果没有的话需要在后端添加
        const localFileExists = await monitor.checkLocalHtmlExists(PDD, skuViewInfo.skuId)
        
        if (localFileExists) {
          // 如果本地文件存在，打开本地文件
          // 由于需要通过后端打开文件，可能需要新增一个openLocalFile方法
          await monitor.openLocalHtmlFile(PDD, skuViewInfo.skuId)
        } else {
          // 如果本地文件不存在，使用在线链接
          window.open(`${PDD_URL}${skuViewInfo.skuId}`, '_blank')
        }
      } catch (error) {
        console.error('Error checking local HTML file:', error)
        // 出错时回退到使用在线链接
        window.open(`${PDD_URL}${skuViewInfo.skuId}`, '_blank')
      }
    } else {
      message.error(`暂未支持查看${skuViewInfo.source}商品详情`)
    }
  }

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
        ¥{skuViewInfo.skuPrice}
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
          onClick={() => onFavorite(skuViewInfo.id, !skuViewInfo.favorite)}
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

export default SkuViewInfo
export type { SkuViewInfoI }
