import { SkuFile, SkuFileDetail } from "@model/sku/sku.file";
import { instance, getDataList } from "@utils/axios";

export const getSkuFiles = (skuItemId : string) => {
    return getDataList(SkuFileDetail, `/sku/file/get?skuItemId=${skuItemId}`);
}

export const saveSkuFile = (skuFile : SkuFile) => {
    return instance.post(`/sku/file/save`, skuFile);
}