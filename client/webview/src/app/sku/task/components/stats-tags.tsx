import React from 'react'
import { Tag } from 'antd'

interface StatsRecord {
  count: number
  successCount: number
  failedCount: number
  cancelCount: number
  existenceCount: number
}

interface StatsTagsProps {
  record: StatsRecord
  tagWidth?: number | string
  gap?: number | string
}

const StatsTags: React.FC<StatsTagsProps> = ({ record, tagWidth = 40, gap = 8 }) => {
  const statsItems = [
    { label: '总计', key: 'count', color: 'blue' },
    { label: '新成功', key: 'successCount', color: 'green' },
    { label: '失败', key: 'failedCount', color: 'red' },
    { label: '未执行', key: 'cancelCount', color: 'orange' },
    { label: '已存在', key: 'existenceCount', color: 'gold' }
  ]

  return (
    <div style={{ display: 'flex', gap: `${gap}px`, justifyContent: 'center' }}>
      {statsItems.map((item) => (
        <div
          key={item.key}
          style={{ textAlign: 'center' }}>
          {item.label}:{' '}
          <Tag
            color={item.color}
            style={{ width: tagWidth, textAlign: 'center' }}>
            {record[item.key as keyof StatsRecord]}
          </Tag>
        </div>
      ))}
    </div>
  )
}

export default StatsTags
