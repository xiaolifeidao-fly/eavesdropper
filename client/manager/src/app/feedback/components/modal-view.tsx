import React, { useState, useEffect } from 'react'
import { Descriptions, Typography, Image, Button, Input, message } from 'antd'

import { getFeedbackInfo, markFeedbackProcessing, resolvedFeedback, userIsAdmin } from '@/api/feedback/feedback.api'
import { FeedbackInfo, FeedbackStatus } from '@/model/feedback/feedback'

const { Title, Paragraph } = Typography
const { TextArea } = Input

interface ModalCreateProps {
  data: any
  hideModal: () => void
  onSuccess?: () => void
}

const ModalView = ({ hideModal, onSuccess, data }: ModalCreateProps) => {
  const [isAdmin, setIsAdmin] = useState<Boolean>(false)
  const [result, setResult] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackInfo>()

  useEffect(() => {
    userIsAdmin().then((res) => {
      setIsAdmin(res)
      fetchFeedbackInfo()
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFeedbackInfo = async () => {
    const id = data.id
    const feedbackInfo = await getFeedbackInfo(id)
    setFeedback(feedbackInfo)
  }

  const handleSubmit = async () => {
    if (!result.trim()) {
      message.warning('请输入处理结果')
      return
    }

    if (!feedback) {
      message.warning('反馈信息不存在')
      return
    }

    setSubmitting(true)
    await resolvedFeedback(feedback.id, result.trim())
    setSubmitting(false)
    message.success('处理结果已提交')
    onSuccess?.()
    hideModal()
  }

  const handleMarkProcessing = async () => {
    if (!feedback) return

    if (feedback.status !== FeedbackStatus.PENDING) return

    await markFeedbackProcessing(feedback.id)

    // 刷新数据
    await fetchFeedbackInfo()

    message.info('修改成功')
  }

  // 附件预览
  const renderMedia = () => {
    if (!feedback?.attachments || feedback.attachments.length === 0) return null
    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>附件预览</Title>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {feedback.attachments.map((attachment, idx) => {
            if (attachment.fileType.endsWith('video/mp4')) {
              return (
                <video
                  key={idx}
                  width={150}
                  height={150}
                  controls
                  style={{ borderRadius: 4, border: '1px solid #eee', objectFit: 'cover' }}>
                  <source
                    src={attachment.fileUrl}
                    type='video/mp4'
                  />
                  您的浏览器不支持视频播放
                </video>
              )
            }
            return (
              <Image
                key={idx}
                width={150}
                height={150}
                src={attachment.fileUrl}
                style={{ borderRadius: 4, border: '1px solid #eee', objectFit: 'cover' }}
                alt='反馈图片'
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 12, background: '#fff', borderRadius: 8, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title
          level={3}
          style={{ margin: 0 }}>
          {feedback?.title}
        </Title>
      </div>
      <Descriptions
        column={1}
        style={{ marginTop: 16 }}>
        <Descriptions.Item label='反馈状态'>{feedback?.statusLabel}</Descriptions.Item>
        <Descriptions.Item label='反馈类型'>{feedback?.feedbackTypeLabel}</Descriptions.Item>
        <Descriptions.Item label='提交时间'>{feedback?.createdAt}</Descriptions.Item>
        {feedback?.contactInfo && <Descriptions.Item label='联系方式'>{feedback?.contactInfo}</Descriptions.Item>}
      </Descriptions>
      <div style={{ marginTop: 16 }}>
        <Title level={5}>反馈内容</Title>
        <Paragraph>{feedback?.content}</Paragraph>
      </div>
      {renderMedia()}

      <div style={{ marginTop: 24 }}>
        {isAdmin && feedback?.status !== FeedbackStatus.RESOLVED ? (
          <>
            <Title level={5}>处理反馈</Title>
            <TextArea
              rows={4}
              placeholder='请输入处理结果...'
              value={result}
              onChange={(e) => setResult(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                onClick={handleMarkProcessing}
                disabled={feedback?.status !== FeedbackStatus.PENDING}
                type='default'>
                标记为处理中
              </Button>
              <Button
                onClick={handleSubmit}
                type='primary'
                loading={submitting}>
                提交处理结果
              </Button>
              <Button
                onClick={hideModal}
                style={{ marginLeft: 'auto' }}>
                关闭
              </Button>
            </div>
          </>
        ) : (
          <>
            <Title level={5}>处理结果</Title>
            <Paragraph>{feedback?.processes?.[0]?.result}</Paragraph>
            <Button
              onClick={hideModal}
              style={{ marginTop: 12 }}>
              关闭
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default ModalView
