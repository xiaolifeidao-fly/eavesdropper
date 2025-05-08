import { LabelValue } from '@model/base/base';

export enum ShopStatus {
  Effective = "effective",
  LosEffective = "loseEffective",
}

export class Shop {
  constructor(public id: number, public name: string, public address: string) {
    this.id = id
    this.name = name
    this.address = address
  }
}

export class ShopPageReq {
  constructor(
    public page: number,
    public size: number,
    public account?: string
  ) {
    this.page = page
    this.size = size
    this.account = account
  }
}

export class ShopPageResp {
  constructor(
    public id: number,
    public userId: number,
    public resourceId: number,
    public account: string,
    public name: string,
    public remark: string,
    public createdAt: string,
    public updatedAt: string,
    public status: LabelValue,
  ) {
    this.id = id
    this.userId = userId
    this.resourceId = resourceId
    this.account = account
    this.name = name
    this.remark = remark
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.status = status
  }
}

export class ShopInfoResp {
  constructor(
    public id: number,
    public userId: number,
    public resourceId: number,
    public account: string,
    public name: string,
    public remark: string,
    public updatedAt: string,
    public status: string,
    public expirationDate: string,
  ) {
    this.id = id
    this.userId = userId
    this.resourceId = resourceId
    this.account = account
    this.name = name
    this.remark = remark
    this.updatedAt = updatedAt
    this.status = status
    this.expirationDate = expirationDate
  }
}

export class SyncShopReq {
  constructor(
    public resourceId: number,
    public account: string,
    public name: string,
    public shopId: number,
    public status: string,
  ) {
    this.resourceId = resourceId
    this.account = account
    this.name = name
    this.shopId = shopId
    this.status = status
  }
}
