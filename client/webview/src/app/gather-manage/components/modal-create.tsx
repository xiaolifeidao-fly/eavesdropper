import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Space, Select, message } from 'antd'

import { addGatherBatch } from '@api/gather/gather-batch.api'
import { getResourceSourceList } from '@api/resource/resource.api';

interface ModalCreateProps {
  hideModal: () => void
  onSuccess?: () => void
}

interface FromInfo {
  name: string
  source: string
}

const ModalCreate = (props: ModalCreateProps) => {
  const [form] = Form.useForm<FromInfo>()
  const { hideModal, onSuccess } = props

  const [sourceList, setSourceList] = useState<any[]>([])

  useEffect(() => {
    getResourceSourceList().then(resp => {
      const sourceList = resp.map((item: any) => ({
        label: item.label,
        value: item.value
      }))
      setSourceList(sourceList)
    })
  }, [])

  // 提交表单
  const onFinish = async(values: FromInfo) => {
    const result = await addGatherBatch({
      name: values.name,
      source: values.source
    })

    if (!result) {
      message.error('采集失败')
      return
    }

    onSuccess && onSuccess()
    hideModal()
  }

  return (
    <Form
      form={form}
      labelCol={{ span: 4 }} // 标签宽度
      wrapperCol={{ span: 20 }} // 内容宽度
      onFinish={onFinish}>
      <Form.Item
        label='采集批次'
        name='name'
        rules={[{ required: true, message: '请输入采集批次' }]}>
        <Input placeholder='请输入采集批次' />
      </Form.Item>
      <Form.Item
        label='采集来源'
        name='source'
        rules={[{ required: true, message: '请选择采集来源' }]}>
        <Select
          options={sourceList}
          placeholder='请选择采集来源'
        />
      </Form.Item>
      <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
        <Space>
          <Button
            type='default'
            onClick={hideModal}>
            取消
          </Button>
          <Button
            type='primary'
            htmlType='submit'>
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default ModalCreate
