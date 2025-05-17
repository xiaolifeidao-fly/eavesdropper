import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select, Upload, message, Space } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'

import { getFeedbackTypeEnums, AddFeedback } from '@api/feedback/feedback.api'
import { AddFeedbackReq } from '@model/feedback/feedback'
import { AddAttachmentReq } from '@model/feedback/attachment'

const { TextArea } = Input

interface ModalCreateProps {
  hideModal: () => void
  onSuccess?: () => void
}

const ModalCreate = ({ hideModal, onSuccess }: ModalCreateProps) => {
  const [form] = Form.useForm()
  const [titleCount, setTitleCount] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [typeEnums, setTypeEnums] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initFeedbackTypeEnums()
  }, [])

  const initFeedbackTypeEnums = () => {
    getFeedbackTypeEnums().then((res) => {
      const valueEnums: any[] = []
      res.forEach((item) => {
        valueEnums.push({
          label: item.label,
          value: item.value
        })
      })
      setTypeEnums(valueEnums)
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleCount(e.target.value.length)
  }

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handleRemove: UploadProps['onRemove'] = (file) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    return true
  }

  const onFinish = async (values: any) => {
    // 打印文件信息
    console.log('上传的文件列表：', fileList.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })))

    const attachments = fileList.map((file) => {
      const data = file.response.data
      const name = file.name
      const type = file.type || ''
      const size = file.size || 0
      return new AddAttachmentReq(data, name, type, size)
      
    })
  
    const addFeedbackReq = new AddFeedbackReq(values.title, values.feedbackType, values.content, values.contactInfo)
    addFeedbackReq.attachments = attachments
    const addFeedbackRes = await AddFeedback(addFeedbackReq)

    if (addFeedbackRes) {
      message.success('感谢您的反馈！我们会尽快处理。')
      form.resetFields()
      setFileList([])
      setTitleCount(0)
      onSuccess && onSuccess()
      hideModal()
    } else {
      message.error('提交失败，请稍后再试。')
    }
  }

  return (
    <Space
      direction='vertical'
      style={{ width: '100%' }}>
      <div
        style={{
          padding: 16,
          width: '100%'
        }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: 24 }}>用户意见反馈</h2>
        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}>
          <Form.Item
            label={
              <span>
                反馈类型 <span style={{ color: '#7f8c8d', fontWeight: 'normal', fontSize: 12 }}>(必选)</span>
              </span>
            }
            name='feedbackType'
            rules={[{ required: true, message: '请选择反馈类型' }]}>
            <Select
              placeholder='请选择反馈类型'
              options={typeEnums}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                反馈标题 <span style={{ color: '#7f8c8d', fontWeight: 'normal', fontSize: 12 }}>(必填)</span>
              </span>
            }
            name='title'
            rules={[
              { required: true, message: '请输入反馈标题' },
              { max: 50, message: '最多50个字符' }
            ]}>
            <Input
              placeholder='请用一句话概括您的反馈'
              maxLength={50}
              onChange={handleTitleChange}
            />
          </Form.Item>
          <div style={{ textAlign: 'right', color: '#7f8c8d', fontSize: 12, marginTop: -16, marginBottom: 8 }}>{titleCount}/50</div>

          <Form.Item
            label={
              <span>
                反馈内容 <span style={{ color: '#7f8c8d', fontWeight: 'normal', fontSize: 12 }}>(必填)</span>
              </span>
            }
            name='content'
            rules={[{ required: true, message: '请输入反馈内容' }]}>
            <TextArea
              rows={5}
              placeholder='请详细描述您的意见或问题...'
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                上传图片/视频 <span style={{ color: '#7f8c8d', fontWeight: 'normal', fontSize: 12 }}>(可选)</span>
              </span>
            }
            name='media'
            valuePropName='attachments'
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}>
            <Upload.Dragger
              name='files'
              multiple
              fileList={fileList}
              onChange={handleUploadChange}
              onRemove={handleRemove}
              accept='image/*,video/*'
              beforeUpload={() => false}
              style={{ borderRadius: 4 }}>
              <p className='ant-upload-drag-icon'>
                <InboxOutlined style={{ color: '#1890ff' }} />
              </p>
              <p className='ant-upload-text'>点击或拖拽上传图片/视频</p>
              <p
                className='ant-upload-hint'
                style={{ fontSize: 12, color: '#7f8c8d' }}>
                支持JPG、PNG图片或MP4视频，单个文件不超过10MB
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label={
              <span>
                联系方式 <span style={{ color: '#7f8c8d', fontWeight: 'normal', fontSize: 12 }}>(可选)</span>
              </span>
            }
            name='contactInfo'>
            <Input placeholder='邮箱/手机号(方便我们回复您)' />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type='primary'
              htmlType='submit'
              style={{ width: '100%', height: 40, fontSize: 16, borderRadius: 4 }}>
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Space>
  )
}

export default ModalCreate
