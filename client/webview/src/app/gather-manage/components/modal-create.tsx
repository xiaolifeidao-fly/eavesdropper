import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Space, Select, message } from 'antd'

import { addGatherBatch, updateGatherBatch } from '@api/gather/gather-batch.api'
import { getResourceSourceList, getAllResourceList } from '@api/resource/resource.api'
import { PDD } from '@enums/source'

interface ModalCreateProps {
  data?: any
  hideModal: () => void
  onSuccess?: () => void
}

interface FromInfo {
  name: string
  source: string
  resourceId: number
}

const ModalCreate = (props: ModalCreateProps) => {
  const [form] = Form.useForm<FromInfo>()
  const { hideModal, onSuccess, data } = props

  const [sourceList, setSourceList] = useState<any[]>([])
  const [resourceList, setResourceList] = useState<any[]>([])
  const [isUpdate, setIsUpdate] = useState(false)

  useEffect(() => {
    if (data) {
      setIsUpdate(true)
      form.setFieldsValue({
        name: data.name,
        source: data.source,
        resourceId: data.resourceId && data.resourceId !== 0 ? data.resourceId : undefined
      })
    }

    getResourceSourceList().then((resp) => {
      const sourceList = resp.map((item: any) => ({
        label: item.label,
        value: item.value,
        disabled: item.value !== PDD
      }))
      setSourceList(sourceList)
    })

    getAllResourceList().then((resp) => {
      const resourceList: any[] = []
      resp.forEach((item) => {
        if (item.source !== PDD) {
          return
        }

        resourceList.push({
          label: item.account,
          value: item.id
        })
      })
      setResourceList(resourceList)
    })
  }, [])

  // 提交表单
  const onFinish = async (values: FromInfo) => {
    const req = {
      name: values.name,
      source: values.source,
      resourceId: values.resourceId
    }

    let result
    if (isUpdate) {
      result = await updateGatherBatch(data.id, req)
    } else {
      result = await addGatherBatch(req)
    }

    if (!result) {
      message.error('创建或者更新采集批次失败')
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
        label='采集备注'
        name='name'>
        <Input placeholder='请输入采集任务备注' />
      </Form.Item>
      <Form.Item
        label='采集来源'
        name='source'
        rules={[{ required: true, message: '请选择采集来源' }]}>
        <Select
          disabled={isUpdate}
          options={sourceList}
          placeholder='请选择采集来源'
        />
      </Form.Item>
      <Form.Item
        label='采集账号'
        name='resourceId'
        rules={[{ required: true, message: '请选择采集账号' }]}>
        <Select
          options={resourceList}
          placeholder='请选择采集账号'
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
