export class GatherBatch {
  constructor(
    public id: number,
    public userId: number,
    public batchNo: string,
    public name: string,
    public source: string,
    public createdAt: string,
    public createdBy: number,
    public updatedAt: string,
    public updatedBy: number
  ) {
    this.id = id
    this.userId = userId
    this.batchNo = batchNo
    this.name = name
    this.source = source
    this.createdAt = createdAt
    this.createdBy = createdBy
    this.updatedAt = updatedAt
    this.updatedBy = updatedBy
  }
}

export class GatherBatchCreateReq {
  constructor(public name: string, public source: string) {
    this.name = name
    this.source = source
  }
}

export class GatherBatchPageReq {
  constructor(public page: number, public pageSize: number, public createdAtStart?: string, public createdAtEnd?: string) {
    this.page = page
    this.pageSize = pageSize
    this.createdAtStart = createdAtStart
    this.createdAtEnd = createdAtEnd
  }
}

export class GatherBatchPage {
  constructor(
    public id: number,
    public userId: number,
    public batchNo: string,
    public name: string,
    public source: string,
    public createdAt: string
  ) {
    this.id = id
    this.userId = userId
    this.batchNo = batchNo
    this.name = name
    this.source = source
    this.createdAt = createdAt
  }
}
