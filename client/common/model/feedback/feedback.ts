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
      public statusLabel: string,
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