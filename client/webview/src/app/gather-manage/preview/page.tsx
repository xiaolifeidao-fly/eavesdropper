'use client'
import { Spin } from 'antd'
import React, { useRef, useState, useEffect } from 'react'

export default function GatherManage() {

  return (
    <div>
      <Spin spinning={true} tip="加载中..."> </Spin>
    </div>
  )
}
