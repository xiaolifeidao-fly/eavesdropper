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
    public updatedAt: string
  ) {
    this.id = id
    this.userId = userId
    this.resourceId = resourceId
    this.account = account
    this.name = name
    this.remark = remark
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}

export class SyncShopReq {
  constructor(
    public resourceId: number,
    public account: string,
    public name: string,
    public shopId: number
  ) {
    this.resourceId = resourceId
    this.account = account
    this.name = name
    this.shopId = shopId
  }
}
