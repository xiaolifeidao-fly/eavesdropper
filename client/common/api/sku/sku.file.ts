import { SkuFile } from "@model/sku/sku.file";
import { getData, instance } from "@utils/axios";

export const getSkuFile = (skuId : number) => {
    return getData(SkuFile, `/sku/file/get?skuId=${skuId}`);
}

export const saveSkuFile = (skuFile : SkuFile) => {
    return instance.post(`/sku/file/save`, skuFile);
}