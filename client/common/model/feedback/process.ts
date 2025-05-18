
export class Process {
  constructor(
    public id: number,
    public feedbackId: number,
    public userId: number,
    public result: string,
  ) {
    this.id = id
    this.feedbackId = feedbackId
    this.userId = userId
    this.result = result
  }
}