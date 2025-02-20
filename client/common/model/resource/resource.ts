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
    public startExpirationDate?: string,
    public endExpirationDate?: string,
  ) {
    this.account = account
    this.source = source
    this.current = current
    this.pageSize = pageSize
    this.startExpirationDate = startExpirationDate
    this.endExpirationDate = endExpirationDate
  }
}

export class ResourcePageResp {
  constructor(
    public id: number,
    public userId: number,
    public account: string,
    public nick: string,
    public source: LabelValue,
    public tag: LabelValue,
    public createdAt: string,
    public updatedAt: string,
    public remark: string,
    public expirationDate: string,
    public isExpiration: boolean,
    public status: LabelValue,
  ) {
    this.id = id
    this.userId = userId
    this.account = account
    this.nick = nick
    this.source = source
    this.tag = tag
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.remark = remark
    this.expirationDate = expirationDate
    this.isExpiration = isExpiration
    this.status = status
  }
}

export class BindResourceReq {
  constructor(
    public displayNick: string,
    public nick: string,
    public userNumId: number,
  ) {
    this.displayNick = displayNick
    this.nick = nick
    this.userNumId = userNumId
  }
}
