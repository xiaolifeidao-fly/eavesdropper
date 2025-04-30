import { DoorSkuDTO, SalesSku } from "@model/door/sku";
import { PriceRangeConfig } from "@model/sku/skuTask";
import log from "electron-log";

export function isNeedCombine(components : { [key: string]: any }) : boolean {
    const attributes = components.sku?.props?.attributes;
    if(!attributes){
        return false;
    }
    for(const attribute in attributes){
        if(attribute == "skuCombineContent"){
            const skuCombineContent = attributes[attribute];
            const required = skuCombineContent.required;
            if(required){
                return true;
            }
            return false;
        }
    }
    return false;
}

export function isNeedSellPointCollection(components : { [key: string]: any }) : boolean {
    const attributes = components.sku?.props?.attributes;
    if(!attributes){
        return false;
    }
    for(const attribute in attributes){
        if(attribute == "sellPointCollection"){
            const sellPointCollection = attributes[attribute];
            const defaultDataSource = sellPointCollection.config.defaultDataSource;
            if(defaultDataSource && defaultDataSource.length > 0){
                return true;
            }
            return false;
        }
    }
    return false;
}

export function buildDefaultCombineContent() : { [key: string]: any } {
    return {
            "products": [
                {
                    "title": "海玉小馍片(麻辣味) 108g*1袋",
                    "imageUrl": "//img.alicdn.com/imgextra/i3/6000000001951/O1CN01lS5cba1QHbZZzDvit_!!6000000001951-2-remus.png",
                    "spuId": 5965803316,
                    "spuDetailUrl": "https://spu.taobao.com/product/spuDetail.htm?spuId=5965803316&providerId=8&hasWrapper=1&readonly=true",
                    "id": 1000503671620404,
                    "barcode": "6928590200041",
                    "primaryKey": "barcode:6928590200041",
                    "props": [
                        {
                            "propKey": "品牌",
                            "propValue": "HAIYU FOOD/海玉"
                        },
                        {
                            "propKey": "品名",
                            "propValue": "海玉小馍片(麻辣味)"
                        }
                    ],
                    "count": 1
                }
            ]
        };
}

export class SaleProBuilder {

    private priceRate : PriceRangeConfig[] | undefined;
    private isNeedCombine : boolean;
    private isNeedSellPointCollection : boolean;

    constructor(priceRate : PriceRangeConfig[] | undefined, isNeedCombine : boolean = false, isNeedSellPointCollection : boolean = false ){
        this.priceRate = priceRate;
        this.isNeedCombine = isNeedCombine;
        this.isNeedSellPointCollection = isNeedSellPointCollection;
    }

    

    async buildSkuProp(sale : SalesSku, skuItem: DoorSkuDTO, index : number){
        const skuProp : { [key: string]: any } = {
            cspuId: 0,
            skuPrice: await this.getPrice(Number(sale.price)),
            skuBatchInventory: null,
            action: { selected: true },
            skuId: null,
            skuStatus: 1,
            skuStock: Number(sale.quantity),
            skuQuality: { value: "mainSku", text: "单品", prefilled: true, prefilledText: { bottom: "<span style='color:#ff6600'>请确认分类</span>" } },
            skuDetail: [],
            skuCustomize: {
                "text": "否",
                "value": 0
            },
            disabled: false,
            props: this.buildSalePros(sale.salePropPath, skuItem),
            salePropKey: this.buildSalePropKey(sale.salePropPath),
            errorInfo: {},
            skuSpecification: null,
            skuTitle: null
        };
        if(this.isNeedCombine){
            skuProp.skuCombineContent = buildDefaultCombineContent();
        }
        if(this.isNeedSellPointCollection && index == 0){
            skuProp.sellPointCollection =  {
                "value": 100,
                "text": "店长主推",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>审核中，预计24h出结果</span>"
                }
            }
        }
        return skuProp;
    }

    async fillSellSku(skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
        const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
        const skuList: { [key: string]: any }[] = [];
        let quantity = 0;
        let minPrice = 0;
        for (let index = 0; index < salesSkus.length; index++) {
            const sale = salesSkus[index];
            quantity += Number(sale.quantity);

            if (minPrice == 0 || Number(sale.price) < minPrice) {
                minPrice = Number(sale.price);
            }
            const skuProps = await this.buildSkuProp(sale, skuItem, index);
            skuList.push(skuProps);
        }
        if (minPrice > 0) {
            draftData.price = await this.getActiveMinPrice(skuItem);
        }
        if (quantity > 0) {
            draftData.quantity = quantity.toString();
        }
        draftData.sku = skuList;

    }

    async getActiveMinPrice(skuItem: DoorSkuDTO) {
        const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
        let minPrice = 0;
        for (let index = 0; index < salesSkus.length; index++) {
            const sale = salesSkus[index];
            const quantity = Number(sale.quantity);
            if(quantity <= 0){
                continue;
            }
            if (minPrice == 0 || Number(sale.price) < minPrice) {
                minPrice = Number(sale.price);
            }
        }
        log.info("getActiveMinPrice minPrice is ", minPrice);
        return await this.getPrice(minPrice);
    }

    buildSalePropKey(salePropPath: string) {
        const saleProps = salePropPath.split(";");
        const salePropKey = [];
        for (const saleProp of saleProps) {
            const salePropIds = saleProp.split(":");
            salePropKey.push(salePropIds[0] + "-" + salePropIds[1]);
        }
        return salePropKey.join("_");
    }

    buildSalePros(sellPropPath: string, skuItem: DoorSkuDTO) {
        const saleItems: { [key: string]: any }[] = [];
        const saleProps = sellPropPath.split(";")
        for (const saleProp of saleProps) {
            const salePropIds = saleProp.split(":");
            const saleParentId = salePropIds[0];
            const salePropId = salePropIds[1];
            const saleItem = this.buildSaleItem(saleParentId, salePropId, skuItem);
            if (saleItem) {
                saleItems.push(saleItem);
            }
        }
        return saleItems;
    }

    buildSaleItem(saleParentId: string, salePropId: string, skuItem: DoorSkuDTO) {
        const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr["p-" + saleParentId];
        const saleProps = salesAttrs.values;
        const saleItem: { [key: string]: any } = {};
        for (const saleProp of saleProps) {
            if (saleProp.value == salePropId) {
                saleItem["name"] = "p-" + saleParentId;
                saleItem["value"] = salePropId;
                saleItem["text"] = saleProp.text;
                if (saleProp.image && saleProp.image != "") {
                    saleItem["pix"] = "800x871";
                    saleItem["img"] = saleProp.image;
                }
                saleItem["label"] = salesAttrs.label;
                return saleItem;
            }
        }
        return undefined;
    }


    async getPrice(price : number){
            if(!this.priceRate || this.priceRate.length == 0){
                return String(price);
            }
            // 找到适合当前价格的区间配置
            const config = this.priceRate.find((config) => price >= config.minPrice && price <= config.maxPrice);
            if (!config) {
                return String(price);
            }

            // 计算价格
            let finalPrice = price * config.priceMultiplier + config.fixedAddition;
            // 根据 roundTo 进行舍入
            switch (config.roundTo) {
                case "yuan":
                    finalPrice = Math.round(finalPrice); // 四舍五入到元
                    break;
                case "jiao":
                    finalPrice = Math.round(finalPrice * 10) / 10; // 四舍五入到角
                    break;
                case "fen":
                    finalPrice = Math.round(finalPrice * 100) / 100; // 四舍五入到分
                    break;
                default:
                    // 如果没有指定舍入单位，默认保留两位小数
                    finalPrice = Math.round(finalPrice * 100) / 100;
                    break;
            }
            return String(finalPrice);
    }
}
