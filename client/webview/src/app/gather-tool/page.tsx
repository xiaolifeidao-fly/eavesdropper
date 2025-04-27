'use client'
import React from 'react'
import styles from './index.module.less'
import GatherTool from '../gather-manage/components/gather-tool'

export default function GatherToolPage() {
  return (
    <main className={styles.userWrap}>
      <div className={styles.content}>
        <GatherTool />
      </div>
    </main>
  )
}
