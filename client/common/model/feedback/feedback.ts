import { Attachment } from './attachment'
import { Process } from './process'

export const FeedbackStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  RESOLVED: 'Resolved',
}

export class FeedbackPageReq {
  constructor(public current: number, public pageSize: number, public status?: string) {
    this.current = current
    this.pageSize = pageSize
    this.status = status
  }
}

export class FeedbackPage {
  constructor(
    public id: number,
    public userId: number,
    public title: string,
    public feedbackType: string,
    public feedbackTypeLabel: string,
    public createdAt: string,
    public status: string,
    public statusLabel: string
  ) {
    this.id = id
    this.userId = userId
    this.title = title
    this.feedbackType = feedbackType
    this.feedbackTypeLabel = feedbackTypeLabel
    this.createdAt = createdAt
    this.status = status
    this.statusLabel = statusLabel
  }
}

export class AddFeedbackReq {
  constructor(
    public title: string,
    public feedbackType: string,
    public content: string,
    public contactInfo?: string,
    public files?: File[]
  ) {
    this.title = title
    this.feedbackType = feedbackType
    this.content = content
    this.contactInfo = contactInfo
    this.files = files
  }
}

export class FeedbackInfo {
  constructor(
    public id: number,
    public userId: number,
    public feedbackType: string,
    public feedbackTypeLabel: string,
    public title: string,
    public content: string,
    public status: string,
    public statusLabel: string,
    public contactInfo: string,
    public createdAt: string,
    public attachments: Attachment[],
    public processes: Process[]
  ) {
    this.id = id
    this.userId = userId
    this.feedbackType = feedbackType
    this.feedbackTypeLabel = feedbackTypeLabel
    this.title = title
    this.content = content
    this.status = status
    this.statusLabel = statusLabel
    this.contactInfo = contactInfo
    this.createdAt = createdAt
    this.attachments = attachments
    this.processes = processes
  }
}
