import { SkuFile, SkuFileDetail } from "@model/sku/sku.file";
import { instance, getDataList } from "@utils/axios";

export const getSkuFiles = (skuId : number) => {
    return getDataList(SkuFileDetail, `/sku/file/get?skuId=${skuId}`);
}

export const saveSkuFile = (skuFile : SkuFile) => {
    return instance.post(`/sku/file/save`, skuFile);
}