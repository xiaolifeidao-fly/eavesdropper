import { getData, instance } from "@utils/axios";
import { SkuDraft } from "@model/sku/sku.draft";

export const getSkuDraft = async (resourceId: number, skuItemId: string) => {
    return await getData(SkuDraft, `/sku/draft/get?resourceId=${resourceId}&skuItemId=${skuItemId}`);
}

export const activeSkuDraft = async (skuDraft: SkuDraft) => {
    return await instance.post(`/sku/draft/active`, skuDraft);
}

export const expireSkuDraft = async (resourceId: number, skuItemId: string) => {
    return await instance.get(`/sku/draft/expire?resourceId=${resourceId}&skuItemId=${skuItemId}`);
}