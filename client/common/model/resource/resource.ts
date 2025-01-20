import { LabelValue } from '@model/base/base';

export class ResourceResp {
  constructor(
    public id: number,
    public userId: number,
    public account: string,
    public source: string,
    public tag: string,
    public remark: string,
    public createdAt: string,
    public updatedAt: string,
    public createdBy: number,
    public updatedBy: number,
  ) {
    this.id = id
    this.userId = userId
    this.account = account
    this.source = source
    this.tag = tag
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.remark = remark
    this.createdBy = createdBy
    this.updatedBy = updatedBy
  }
}

export class AddResourceReq {
  constructor(
    public source: string,
    public tag: string,
    public remark: string,
  ) {
    this.source = source
    this.tag = tag
    this.remark = remark
  }
}

export class UpdateResourceReq {
  constructor(
    public tag: string,
    public remark: string,
  ) {
    this.tag = tag
    this.remark = remark
  }
}

export class ResourcePageReq {
  constructor(
    public current: number,
    public pageSize: number,
    public account?: string,
    public source?: string,
  ) {
    this.account = account
    this.source = source
    this.current = current
    this.pageSize = pageSize
  }
}

export class ResourcePageResp {
  constructor(
    public id: number,
    public userId: number,
    public account: string,
    public source: LabelValue,
    public tag: LabelValue,
    public createdAt: string,
    public updatedAt: string,
    public remark: string,
  ) {
    this.id = id
    this.userId = userId
    this.account = account
    this.source = source
    this.tag = tag
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.remark = remark
  }
}
