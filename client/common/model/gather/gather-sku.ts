export class GatherSku {
  constructor(
    public id: number,
    public batchId: number,
    public name: string,
    public source: string,
    public sales: string,
    public price: string,
    public skuId: string,
    public favorite: boolean,
    public createdAt: string,
    public createdBy: number,
    public updatedAt: string,
    public updatedBy: number
  ) {
    this.id = id
    this.batchId = batchId
    this.name = name
    this.source = source
    this.sales = sales
    this.price = price
    this.skuId = skuId
    this.favorite = favorite
    this.createdAt = createdAt
    this.createdBy = createdBy
    this.updatedAt = updatedAt
    this.updatedBy = updatedBy
  }
}

export class GatherSkuCreateReq {
  constructor(
    public batchId: number,
    public name: string,
    public source: string,
    public sales: string,
    public price: string,
    public skuId: string,
    public favorite: boolean
  ) {
    this.batchId = batchId
    this.name = name
    this.source = source
    this.sales = sales
    this.price = price
    this.skuId = skuId
    this.favorite = favorite
  }
}
