import React from 'react'
import { Form, Input, Button, Space, Select } from 'antd'

interface ModalCreateProps {
  hideModal: () => void
  onSuccess?: () => void
  openModal?: (type: string, data?: any) => void
}

interface FromInfo {
  title: string
}

const ModalCreate = (props: ModalCreateProps) => {
  const [form] = Form.useForm<FromInfo>()
  const { hideModal, onSuccess, openModal } = props

  // 提交表单
  const onFinish = (values: FromInfo) => {
    console.log(values)
    onSuccess && onSuccess()
    hideModal()
    openModal && openModal('gatherTool')
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
          options={[
            { label: '采集来源1', value: '1' },
            { label: '采集来源2', value: '2' }
          ]}
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
            开始采集
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default ModalCreate
