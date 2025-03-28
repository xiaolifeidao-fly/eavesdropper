import { SkuFileDetail } from "@model/sku/sku.file";

export function getAndSortImage(imageFileList: SkuFileDetail[], type: string) {
    // 获取主图 并排序
    const mainImages = imageFileList.filter(file => file.fileName?.includes(type));
    mainImages.sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
    return mainImages;
}