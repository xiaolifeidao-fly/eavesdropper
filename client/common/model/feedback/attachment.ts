export class AddAttachmentReq {
  constructor(public data: Uint8Array, public fileName: string, public fileType: string, public fileSize: number) {
    this.data = data
    this.fileName = fileName
    this.fileType = fileType
    this.fileSize = fileSize
  }
}
