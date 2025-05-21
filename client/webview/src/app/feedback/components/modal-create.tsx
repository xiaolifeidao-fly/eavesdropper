import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select, Upload, message, Space } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'

import { getFeedbackTypeEnums, AddFeedback } from '@api/feedback/feedback.api'

const { TextArea } = Input

interface ModalCreateProps {
  hideModal: () => void
  onSuccess?: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ModalCreate = ({ hideModal, onSuccess }: ModalCreateProps) => {
  const [form] = Form.useForm()
  const [titleCount, setTitleCount] = useState(0)
  const [fileList, setFileList] = useState<any[]>([])
  const [typeEnums, setTypeEnums] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isUploadLimit, setIsUploadLimit] = useState(false);

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

  // 文件大小校验
  const beforeUpload = (file: File) => {
    if (fileList && fileList.length >= 4) {
      message.error("文件上传数量已上限")
      return Upload.LIST_IGNORE
    }

    if (file.size > MAX_FILE_SIZE) {
      message.error(`${file.name} 超过10MB，无法上传！`)
      return Upload.LIST_IGNORE
    }

    if (fileList.length === 3) {
      setIsUploadLimit(true)
    }
    return true
  }

  const onFinish = async (values: any) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('feedbackType', values.feedbackType)
      formData.append('content', values.content)
      if (values.contactInfo) {
        formData.append('contactInfo', values.contactInfo)
      }

      // 添加文件到 FormData
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj)
        }
      })

      const addFeedbackRes = await AddFeedback(formData)
      if (addFeedbackRes) {
        message.success('反馈提交成功')
        form.resetFields()
        setFileList([])
        setTitleCount(0)
        onSuccess?.()
        hideModal()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      message.error(`反馈提交失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
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
              beforeUpload={beforeUpload}
              disabled={isUploadLimit}
              style={{ borderRadius: 4 }}>
              <p className='ant-upload-drag-icon'>
                <InboxOutlined style={{ color: '#1890ff' }} />
              </p>
              <p className='ant-upload-text'>点击或拖拽上传图片/视频</p>
              <p
                className='ant-upload-hint'
                style={{ fontSize: 12, color: '#7f8c8d' }}>
                支持JPG、PNG图片或MP4视频，单个文件不超过10MB，总数不能超过4个。
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
              loading={loading}
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
