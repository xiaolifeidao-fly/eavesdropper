import log from "electron-log"
import { SkuFileDetail } from "@model/sku/sku.file";
import { DoorSkuDTO, SalesAttr, SkuItem } from "@model/door/sku";
import { SkuBuildDraftStep } from "./build.or.save.draft";
import { RebuildSalePro } from "../sku.sale.config";
import { checkPropValue } from "../sku.prop.config";
import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { parseSku } from "@api/door/door.api";
import { TB } from "@enums/source";



export class PddSkuBuildDraftStep extends SkuBuildDraftStep{


    override async fillSellInfo(commonData: { data: any }, skuItem: DoorSkuDTO, draftData: { price: string, quantity: string, sku: { [key: string]: any }[], saleProp: { [key: string]: { [key: string]: any }[] } }) {
        const minPrice = await this.getPrice(Number(skuItem.doorSkuSaleInfo.price));
        draftData.price = minPrice;
        draftData.quantity = skuItem.doorSkuSaleInfo.quantity;
        const salePropSubItems = commonData.data.components.saleProp.props.subItems;
        // log.info("fillSellInfo start ", salePropSubItems);
        const rebuildSalePro = new RebuildSalePro(skuItem.baseInfo.itemId);
        const saleMappers = await rebuildSalePro.fixAndAssign(skuItem.doorSkuSaleInfo, salePropSubItems, Number(minPrice));
        for(let saleMapper of saleMappers){
            // log.info("saleMapper is ", JSON.stringify(saleMapper.saleAttr));
        }
        const saleProps = rebuildSalePro.buildSaleProp(saleMappers, skuItem.doorSkuSaleInfo);
        draftData.saleProp = saleProps;
        // log.info("saleProps is ", JSON.stringify(saleProps));

        // log.info("saleProps sku is ", JSON.stringify(skuItem.doorSkuSaleInfo.salesSkus));

        await this.fillSellSku(skuItem, draftData);
    }

    async fixSaleProp(commonData: { data: any }, skuItem: DoorSkuDTO) {

    }

    getPublishUrl(skuDraftId: string | undefined, itemId: string) {
        if (!skuDraftId) {
            if(itemId && itemId.length > 0){
                return "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
            }
            const category = this.getParams("tbCategory");
            const url = "https://item.upload.taobao.com/sell/v2/publish.htm?catId=" + category.categoryId;
            return url;
        }
        return "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + skuDraftId;
    }

    async fillPropExt(commonData: { [key: string]: any; }, skuItem: DoorSkuDTO, draftData: { [key: string]: any; }): Promise<void> {
        await super.fillPropExt(commonData, skuItem, draftData)
    }

    async mergeTbSku(skuItem : DoorSkuDTO, draftData : { [key: string]: any }, commonData : { [key: string]: any }){
        // const checkResult = checkPropValue(draftData, commonData);
        // log.info("mergeTbSku checkResult is ", checkResult);
        // if(checkResult){
        //     return true;
        // }
        // // const resourceId = this.getParams("resourceId");
        // const resourceId = 22;
        // const skuApi = new MbSkuApiImpl();
        // const url = "https://item.taobao.com/item.htm?id=" + skuItem.itemId;
        // const tbSkuItemDTO = await skuApi.getSkuInfo(resourceId, url);
        // if(!tbSkuItemDTO || !tbSkuItemDTO.code){
        //     return false;
        // }
        // const tbData = tbSkuItemDTO.data;
        // const tbSkuItem = await parseSku(TB, tbData);
        // if(!tbSkuItem){
        //     return false;
        // }
        // const tbSkuItems = tbSkuItem.baseInfo.skuItems;
        // const pddSkuItems = skuItem.baseInfo.skuItems;
        // const needPushTbSkuItems = [];
        // for(let tbSkuItem of tbSkuItems){
        //     if(this.needPushTbSku(pddSkuItems, tbSkuItem)){
        //         needPushTbSkuItems.push(tbSkuItem);
        //     }
        // }
        // for(let tbSkuItem of needPushTbSkuItems){
        //     pddSkuItems.push(tbSkuItem);
        // }
        // log.info("mergeSkuProp pddSkuItems is ", JSON.stringify(pddSkuItems));
        return true;
    }

    needPushTbSku(pddSkuItems : SkuItem[], tbSkuItem : SkuItem){
        for(let pddSkuItem of pddSkuItems){
            if(tbSkuItem.value == pddSkuItem.value){
                return false;
            }
        }
        return true;
    }

    fixSkuSaleImages(imageFileList: SkuFileDetail[], skuItem: DoorSkuDTO): void {
        const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;

        for (let salesAttr in salesAttrs){
            const salesAttrValue = salesAttrs[salesAttr];
            if(!salesAttrValue){
                continue;
            }
            const hasImage = salesAttrValue.hasImage;
            if(!hasImage){
                continue;
            }
            const values = salesAttrValue.values;
            for(let value of values){
                const imageFileName = value.image;
                if(imageFileName){
                    for(let imageFile of imageFileList){
                        if(imageFile.fileName == imageFileName){
                            value.image = imageFile.fileUrl || "";
                        }
                    }
                }
            }
        }
    }

    async fillSellSku(skuItem: DoorSkuDTO, draftData: { price: string, quantity: string, sku: { [key: string]: any }[] }) {
        const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
        const skuList: { [key: string]: any }[] = [];
        let quantity = 0;
        let minPrice = 0;
        for (const sale of salesSkus) {
            quantity += Number(sale.quantity);
    
            if (minPrice == 0 || Number(sale.price) < minPrice) {
                minPrice = Number(sale.price);
            }
            skuList.push({
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
            })
        }
        if (minPrice > 0) {
            draftData.price = await this.getPrice(minPrice);
        }
        if (quantity > 0) {
            draftData.quantity = quantity.toString();
        }
        draftData.sku = skuList;
    
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
    

    async fillSellProp(commonData: { data: any }, skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
        const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;
        const salePropInfo: { [key: string]: any } = {};
        for (let key in salesAttrs) {
            const salesAttr = salesAttrs[key];
            if (!salesAttr) {
                continue;
            }
            const salePros: { [key: string]: any }[] = [];
            const salesAttrValues = salesAttr.values;
            for (let salesAttrValue of salesAttrValues) {
                const salePro: { [key: string]: any } = {
                    value: salesAttrValue.value,
                    text: salesAttrValue.text,
                }
                if (salesAttr.hasImage == 'true') {
                    salePro['pix'] = "800x871";
                    salePro['img'] = salesAttrValue.image;
                }
                salePros.push(salePro);
            }
            const salePropValue: { [key: string]: any } = {
                value: salePros
            }
            if(salesAttr.isSaleAddValues){
                salePropInfo[key] = salePropValue;
            } else {
                salePropInfo[key] = salePros;
            }
        }
        draftData.saleProp = salePropInfo;
    }

    getTbPid(pddPid: string, salesAttrs: { [key: string]: any }) {
        for (let key in salesAttrs) {
            const salesAttr = salesAttrs[key];
            if (!salesAttr) {
                continue;
            }
            if(salesAttr.oldPid == pddPid){
                console.log("getTbPid salesAttr.pid is ", salesAttr.pid);
                return salesAttr.pid;
            }
        }
        return null;
    }
    
    getFixValue(salePropSubItem: { [key: string]: any }, value: string) {
        const subItems = salePropSubItem.subItems;
        if (!subItems || subItems.length == 0) {
            if ('dataSource' in salePropSubItem) {
                const dataSource = salePropSubItem.dataSource;
                return this.getRealValue(dataSource, value);
            }
            return value;
        }
        for (const subItem of subItems) {
            const dataSource = subItem.dataSource;
            if (dataSource.length == 0) {
                continue;
            }
            return this.getRealValue(dataSource, value);
        }
        return value;
    }

    
    getRealValue(dataSource: { [key: string]: any }[], value: string) {
        for (const data of dataSource) {
            for(const key in data) {
                const subItemValues = data[key];
                if (!subItemValues || !Array.isArray(subItemValues)) {
                    continue;
                }
                for (const subItemValue of subItemValues) {
                    if (value == subItemValue.value) {
                        return value;
                    }
                }
            }
        }
        return String(-Number(value));
    }
   
}