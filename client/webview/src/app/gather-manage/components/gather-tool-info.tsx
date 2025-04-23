import React from 'react'

interface GatherInfo {
  id: number
  batchNo: string
  name: string
  source: string
  createdAt: string
  gatherTotal: number
  viewTotal: number
  favoriteTotal: number
}

const GaterToolInfo = ({ gaterInfo }: { gaterInfo: GatherInfo | null }) => {
  const { batchNo, name, source, createdAt, gatherTotal, viewTotal } = gaterInfo || {}
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
        批次号：{batchNo}
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集批次：</span>
        <span>{name || ''}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集来源：</span>
        <span>{source || ''}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>采集时间：</span>
        <span>{createdAt || ''}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#666' }}>本次采集数量：</span>
        <span>{gatherTotal || 0}</span>
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
          {viewTotal || 0}
        </span>
      </div>
    </div>
  )
}

export default GaterToolInfo
export type { GatherInfo }
