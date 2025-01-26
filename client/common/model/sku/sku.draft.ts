
export class SkuDraft {
    id: number|undefined;
    resourceId: number|undefined;
    skuItemId: string|undefined;
    skuDraftId: string|undefined;
    status: string|undefined;
    
    constructor(id: number|undefined, resourceId: number|undefined, skuItemId: string|undefined, skuDraftId: string|undefined, status: string|undefined) {
        this.id = id;
        this.resourceId = resourceId;
        this.skuItemId = skuItemId;
        this.skuDraftId = skuDraftId;
        this.status = status;
    }
}