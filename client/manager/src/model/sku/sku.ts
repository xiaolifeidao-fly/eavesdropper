export class SkuTaskStepLogResp {
  id: number
  skuTaskStepId: number
  content: string

  constructor(id: number, skuTaskStepId: number, content: string) {
    this.id = id
    this.skuTaskStepId = skuTaskStepId
    this.content = content
  }
}
