'use client'
import React, { useEffect } from 'react'
import styles from './index.module.less'
import GatherTool from '../gather-manage/components/gather-tool'

export default function GatherToolPage() {
  useEffect(() => {})

  return (
    <main className={styles.userWrap}>
      <div className={styles.content}>
        <div style={{ width: 500 }}>
          <GatherTool />
        </div>
      </div>
    </main>
  )
}
