
import { Type } from 'class-transformer';


export class SkuItem {
    value: string;
    text: string[];

    constructor(value: string, text: string[]) {
        this.value = value;
        this.text = text;
    }
}


export class DoorSkuBaseInfoDTO {
    itemId: string;
    skuType: string;
    mainImages: string[];
    title: string;
    guideTitle: string;
    categoryAttr: string;
    procurementLocation: string;

    @Type(() => SkuItem)
    skuItems: SkuItem[];

    constructor(itemId: string, skuType: string, mainImages: string[], title: string, guideTitle: string, categoryAttr: string, procurementLocation: string, skuItems: SkuItem[]) {
        this.itemId = itemId;
        this.skuType = skuType;
        this.mainImages = mainImages;
        this.title = title;
        this.guideTitle = guideTitle;
        this.categoryAttr = categoryAttr;
        this.procurementLocation = procurementLocation;
        this.skuItems = skuItems;
    }
}


export class ShelfTimeDTO {
    type: number;
    shelfTime: number;

    constructor(type: number, shelfTime: number) {
        this.type = type;
        this.shelfTime = shelfTime;
    }
}


export class SalesAttrValue {
    text: string;
    value: string;
    image: string;
    sortOrder: string;

    constructor(text: string, value: string, image: string, sortOrder: string) {
        this.text = text;
        this.value = value;
        this.image = image;
        this.sortOrder = sortOrder;
    }
}

export class SalesAttr {
    hasImage: string;
    comboProperty: string;
    packPro : string;
    label: string;
    pid : string;
    isSaleAddValues: boolean = false;
    @Type(() => SalesAttrValue)
    values: SalesAttrValue[];
    oldPid: string|null = null  ;

    constructor(label: string, values: SalesAttrValue[], hasImage: string, comboProperty: string, packPro: string, pid: string, oldPid: string|null = null) {
        this.label = label;
        this.values = values;
        this.hasImage = hasImage;
        this.comboProperty = comboProperty;
        this.packPro = packPro;
        this.pid = pid;
        this.oldPid = oldPid;
    }
}

export class SalesSku {
    salePropPath: string;
    price: string;
    quantity: string;

    constructor(salePropPath: string, price: string, quantity: string) {
        this.salePropPath = salePropPath;
        this.price = price;
        this.quantity = quantity;
    }
}

export class DoorSkuSaleInfoDTO {
    @Type(() => SalesAttr)
    salesAttr: { [key: string]: SalesAttr };
    salesSkus: SalesSku[];
    price: string;
    quantity: string;
    purchaseTips: string;
    outerId: string;
    barcode: string;
    subStock: string;
    shelfTime: ShelfTimeDTO;

    constructor(salesAttr: { [key: string]: SalesAttr }, salesSkus: SalesSku[], price: string, quantity: string, purchaseTips: string, outerId: string, barcode: string, subStock: string, shelfTime: ShelfTimeDTO) {
        this.salesAttr = salesAttr;
        this.salesSkus = salesSkus;
        this.price = price;
        this.quantity = quantity;
        this.purchaseTips = purchaseTips;
        this.outerId = outerId;
        this.barcode = barcode;
        this.subStock = subStock;
        this.shelfTime = shelfTime;
    }
}


export class DoorSkuLogisticsInfoDTO {

    deliveryFromAddr: string;
    isFreeShipping: boolean;

    constructor(deliveryFromAddr: string, isFreeShipping: boolean) {
        this.deliveryFromAddr = deliveryFromAddr;
        this.isFreeShipping = isFreeShipping;
    }
}


export class DoorSkuImageInfoInfoDTO {
    type: string;
    content: string;

    constructor(type: string, content: string) {
        this.type = type;
        this.content = content;
    }
}

export class DoorSkuImageInfoDTO {
    images: string[];
    videos: string[];
    longImages: string[];
    @Type(() => DoorSkuImageInfoInfoDTO)
    doorSkuImageInfos: DoorSkuImageInfoInfoDTO[];

    constructor(images: string[], videos: string[], longImages: string[], doorSkuImageInfos: DoorSkuImageInfoInfoDTO[]) {
        this.images = images;
        this.videos = videos;
        this.longImages = longImages;
        this.doorSkuImageInfos = doorSkuImageInfos;
    }
}

export class DoorSkuDTO {
    itemId : string;
    @Type(() => DoorSkuBaseInfoDTO)
    baseInfo: DoorSkuBaseInfoDTO;
    @Type(() => DoorSkuSaleInfoDTO)
    doorSkuSaleInfo: DoorSkuSaleInfoDTO;
    @Type(() => DoorSkuLogisticsInfoDTO)
    doorSkuLogisticsInfo: DoorSkuLogisticsInfoDTO;
    @Type(() => DoorSkuImageInfoDTO)
    doorSkuImageInfo: DoorSkuImageInfoDTO;

    constructor(itemId: string, baseInfo: DoorSkuBaseInfoDTO, doorSkuSaleInfo: DoorSkuSaleInfoDTO, doorSkuLogisticsInfo: DoorSkuLogisticsInfoDTO, doorSkuImageInfo: DoorSkuImageInfoDTO) {
        this.itemId = this.getItemId();
        this.baseInfo = baseInfo;
        this.doorSkuSaleInfo = doorSkuSaleInfo;
        this.doorSkuLogisticsInfo = doorSkuLogisticsInfo;
        this.doorSkuImageInfo = doorSkuImageInfo;
    }

    getItemId(){
        return this.baseInfo?.itemId;
    }

    setItemId(itemId: string){
        this.itemId = itemId;
    }
}
