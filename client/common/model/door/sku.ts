
import { Type } from 'class-transformer';


export class DoorSkuBaseInfoDTO {
    itemId: string;
    skuType: string;
    mainImages: string[];
    title: string;
    guideTitle: string;
    categoryAttr: string;
    procurementLocation: string;

    constructor(itemId: string, skuType: string, mainImages: string[], title: string, guideTitle: string, categoryAttr: string, procurementLocation: string) {
        this.itemId = itemId;
        this.skuType = skuType;
        this.mainImages = mainImages;
        this.title = title;
        this.guideTitle = guideTitle;
        this.categoryAttr = categoryAttr;
        this.procurementLocation = procurementLocation;
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

    constructor(text: string, value: string) {
        this.text = text;
        this.value = value;
    }
}

export class SalesAttr {
    label: string;
    @Type(() => SalesAttrValue)
    values: SalesAttrValue[];

    constructor(label: string, values: SalesAttrValue[]) {
        this.label = label;
        this.values = values;
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
    dispatchTimeframe: string;
    pickupMode: string;
    regionalRestrictions: string;
    postSaleSupport: string;

    constructor(dispatchTimeframe: string, pickupMode: string, regionalRestrictions: string, postSaleSupport: string) {
        this.dispatchTimeframe = dispatchTimeframe;
        this.pickupMode = pickupMode;
        this.regionalRestrictions = regionalRestrictions;
        this.postSaleSupport = postSaleSupport;
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
    @Type(() => DoorSkuBaseInfoDTO)
    baseInfo: DoorSkuBaseInfoDTO;
    @Type(() => DoorSkuSaleInfoDTO)
    doorSkuSaleInfo: DoorSkuSaleInfoDTO;
    @Type(() => DoorSkuLogisticsInfoDTO)
    doorSkuLogisticsInfo: DoorSkuLogisticsInfoDTO;
    @Type(() => DoorSkuImageInfoDTO)
    doorSkuImageInfo: DoorSkuImageInfoDTO;

    constructor(baseInfo: DoorSkuBaseInfoDTO, doorSkuSaleInfo: DoorSkuSaleInfoDTO, doorSkuLogisticsInfo: DoorSkuLogisticsInfoDTO, doorSkuImageInfo: DoorSkuImageInfoDTO) {
        this.baseInfo = baseInfo;
        this.doorSkuSaleInfo = doorSkuSaleInfo;
        this.doorSkuLogisticsInfo = doorSkuLogisticsInfo;
        this.doorSkuImageInfo = doorSkuImageInfo;
    }
}