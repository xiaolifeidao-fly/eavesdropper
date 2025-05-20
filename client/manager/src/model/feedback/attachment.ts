export class AddAttachmentReq {
  constructor(public data: Uint8Array, public fileName: string, public fileType: string, public fileSize: number) {
    this.data = data
    this.fileName = fileName
    this.fileType = fileType
    this.fileSize = fileSize
  }
}

export class Attachment {
  constructor(
    public id: number,
    public feedbackId: number,
    public fileName: string,
    public fileType: string,
    public fileSize: number,
    public fileUrl: string
  ) {
    this.id = id
    this.feedbackId = feedbackId
    this.fileName = fileName
    this.fileType = fileType
    this.fileSize = fileSize
    this.fileUrl = fileUrl
  }
}