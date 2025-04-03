import { MbEngine } from "@src/door/mb/mb.engine";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";
import { AbsPublishStep, confirmProtocol } from "./abs.publish";
import { activeSkuDraft, getSkuDraft } from "@api/sku/sku.draft";
import { MbSkuPublishDraffMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { Page } from "playwright-core";
import log from "electron-log"
import { SkuFileDetail } from "@model/sku/sku.file";
import { DoorEntity } from "@src/door/entity";
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { PriceRangeConfig } from "@model/sku/skuTask";
import { getAddress, getOrSaveTemplateId } from "@src/door/mb/logistics/logistics";
import { getUrlParameter } from "@utils/url.util";
import { FoodSupport } from "../fill.food";
import { AiFillSupport } from "../ai.fill";
import { isNeedCombine, isNeedSellPointCollection, SaleProBuilder } from "../sku.sale.build";
import { getAddressByKeywords } from "@api/address/address";
import { getAndSortImage } from "../image.support";

async function doAction(page: Page, ...doActionParams: any[]) {
    await page.waitForTimeout(1000);
    await confirmProtocol(page);
    await clickSaveDraf(page);
}

async function clickSaveDraf(page: Page) {
    // 保存草稿
    await page.locator(".sell-draft-save-btn button").click();
}

const filterProCode = ["shippingArea","departurePlace"]

export class SkuBuildDraftStep extends AbsPublishStep{

    async doStep(): Promise<StepResult> {
        const resourceId = this.getParams("resourceId");
        const skuItem = this.getParams("skuItem");
        const imageFileList = this.getParams("imageFileList");
        const mbEngine = new MbEngine(resourceId);
        try {
            const page = await mbEngine.init();
            if (!page) {
                return new StepResult(false, "打开发布页面失败") ;
            }
            const itemId = skuItem.baseInfo.itemId;
            const tbItemId = skuItem.itemId;
            let skuDraftId = await this.getSkuDraftIdFromDB(resourceId, itemId);
            let url = this.getPublishUrl(skuDraftId, tbItemId);
            log.info("publish url is ", url);
            const result = await mbEngine.openWaitMonitor(page, url, new MbSkuPublishDraffMonitor(), {}, doAction, imageFileList, skuDraftId);
            if (!result) {
                return new StepResult(false, "添加草稿失败") ;
            }
            skuDraftId = this.getSkuDraftIdFromData(skuDraftId, result);

            const draftData = await this.buildDraftData(imageFileList, resourceId, skuDraftId, skuItem, result, page);
            if(!draftData.draftData){
                if(skuDraftId){
                    await this.releaseDraftData(skuDraftId, resourceId);
                }
                return new StepResult(false, draftData.message) ;
            }
            return new StepResult(true, "添加草稿成功", [
                new StepResponse("draftData", draftData.draftData.draftData),
                new StepResponse("catId", draftData.draftData.catId),
                new StepResponse("draftId", draftData.draftData.draftId),
                new StepResponse("startTraceId", draftData.draftData.startTraceId),
                new StepResponse("itemId", draftData.draftData.itemId),
                new StepResponse("page", page, false)
            ], result.getHeaderData());
        } catch (error) {
            log.error(error);
            return new StepResult(false, "添加草稿失败") ;
        }
    }

    fixSkuSaleImages(imageFileList: SkuFileDetail[], skuItem: DoorSkuDTO){

    }
    
    async buildDraftData(imageFileList: SkuFileDetail[], resourceId: number, skuDraftId: string | undefined, skuItem: DoorSkuDTO, result: DoorEntity<any>, page: Page) {
        if (!skuDraftId) {
            log.error("newSkuDraftId not found ", skuDraftId);
            return {
                draftData : undefined,
                message : "newSkuDraftId not found"
            };
        }
        await this.activeDraft(resourceId, skuItem.baseInfo.itemId, skuDraftId);
        await page.waitForLoadState('load');
        let commonData = await this.getCommonData(page);
        if (!commonData) {
            log.info("commonData not found ", commonData);
            return {
                draftData : undefined,
                message : "commonData not found"
            };
        }
        const startTraceId = this.getStartTraceId(commonData);
        log.info("startTraceId is  ", startTraceId);
        if (!startTraceId) {
            log.info("startTraceId not found ", startTraceId);
            return {
                draftData : undefined,
                message : "startTraceId not found"
            };
        }
        const catId = this.getCatIdFromUrl(result);
        if (!catId) {
            log.info("catId not found ", catId);
            return {
                draftData : undefined,
                message : "catId not found"
            };
        }
        const draftData = JSON.parse(result.requestBody.jsonBody);
        const mergeResult = await this.mergeTbSku(skuItem, draftData, commonData);
        if(!mergeResult){
            return {
                draftData : undefined,
                message : "合并TB属性失败"
            };
        }
        this.fixSkuSaleImages(imageFileList, skuItem);
        this.fillStartTime(draftData);
        await this.fixSaleProp(commonData, skuItem);
        await this.fillTiltle(skuItem, draftData);
        await this.fillCategoryList(skuItem, draftData, commonData, result.getHeaderData(), catId, startTraceId);
        await this.fillPropExt(commonData, skuItem, draftData);
        const mainImages = getAndSortImage(imageFileList, "main");
        await this.fillMainImage(mainImages, draftData);
        await this.fillSellInfo(commonData, skuItem, draftData);
        await this.fillLogisticsMode(resourceId, skuItem, draftData, commonData);
        await this.fillShippingArea(commonData, skuItem, draftData);
        const aiFillSupport = new AiFillSupport(this.getParams("skuSource"));
        await aiFillSupport.checkCatPropAndFix(draftData, skuItem, commonData);
        const detailImages = getAndSortImage(imageFileList, "detail");
        const imageDetailResult = this.fillImageDetail(draftData, detailImages);
        if(!imageDetailResult){
            return {
                draftData : undefined,
                message : "fillImageDetail failed"
            };
        }
        const foodSupport = new FoodSupport();
        const foodResult = await foodSupport.doFill(commonData.data.components, skuItem.baseInfo.skuItems, draftData, catId, startTraceId, result.getHeaderData(),mainImages);
        const updateResult = await this.updateDraftData(catId, skuDraftId, result.getHeaderData(), startTraceId, draftData);
        if(!updateResult){
            return {
                draftData : undefined,
                message : "updateDraftData failed"
            };
        }
        if(!foodResult){
            return {
                draftData : undefined,
                message : foodSupport.fillMessage
            };
        }
        return {
            draftData : {
                catId: catId,
                draftId: skuDraftId,
                startTraceId: startTraceId,
                draftData: draftData,
                itemId: skuItem.baseInfo.itemId,
            },
            message : "buildDraftData success"
        }
    }

    async fillShippingArea(commonData : { [key: string]: any }, skuItem : DoorSkuDTO, draftData : { [key: string]: any }){
        const shippingArea = commonData.data.components.shippingArea;
        if(!shippingArea){
            return;
        }
        const address = await getAddress(skuItem);
        log.info("fillShippingArea address ", address);
        if(address){
            draftData.shippingArea = {
                "type": "1",
                "warehouseType": "1",
                "value": {
                    "text": address.cityName,
                    "value": address.cityCode
                }
            }
            return;
        }
        draftData.shippingArea = {
            "type": "1",
            "warehouseType": "1",
            "value": {
            }
        }
    }



    fillStartTime(draftData: { [key: string]: any }) {
        draftData.startTime = {
            "type": 2,
            "shelfTime": null
        };
    }

    async mergeTbSku(skuItem : DoorSkuDTO, draftData : { [key: string]: any }, commonData : { [key: string]: any }){
        return true;
    }

    public isRollBack(): boolean {
        return true;
    }

    getLogisticsList(commonData : { [key: string]: any }){
        const subItems = commonData.data.components?.tbExtractWay?.props?.subItems;
        if(!subItems || subItems.length == 0){
            return [];
        }
        for(const subItem of subItems){
            if(subItem.name == "template"){
                return subItem.dataSource;
            }
        }
        return [];
    }

    async fillLogisticsMode(resourceId : number, skuItemDTO : DoorSkuDTO, draftData: { [key: string]: any }, commonData : { [key: string]: any }) {
        const logisticsList = this.getLogisticsList(commonData);
        const templateId = await getOrSaveTemplateId(resourceId, skuItemDTO, logisticsList);
        draftData.tbExtractWay = {
            "template": templateId,
            "value": [
                "2"
            ]
        };
        draftData.deliveryTimeType = {
            "value": "0"
        };
    }

    fillImageDetail(draftData: { [key: string]: any }, detailImages: SkuFileDetail[]) {
        const groupImage: { [key: string]: any }[] = [];
        let groupId = new Date().getTime();
        for(const imageFile of detailImages){
            groupId = groupId + 1;
            const componentId = groupId+1;
            const pix = imageFile.pix;
            if(!pix){
                return false;
            }
            const pixArray = pix.split("x");
            const width = pixArray[0];
            const height = pixArray[1];
            const imageJson = {
                "type": "group",
                "hide": false,
                "bizCode": 0,
                "propertyPanelVisible": true,
                "level": 1,
                "boxStyle": {
                  "background-color": "#ffffff",
                  "width": 620,
                  "height": 889
                },
                "position": "middle",
                "groupName": "模块",
                "scenario": "wde",
                "components": [
                  {
                    "type": "component",
                    "level": 2,
                    "sellerEditable": true,
                    "boxStyle": {
                      "rotate": 0,
                      "z-index": 0,
                      "top": 0,
                      "left": 0,
                      "width": 620,
                      "height": 889,
                      "background-image": imageFile.fileUrl
                    },
                    "componentName": "图片组件",
                    "clipType": "rect",
                    "imgStyle": {
                      "top": 0,
                      "left": 0,
                      "width": 620,
                      "height": 889
                    },
                    "picMeta": {
                      "width": width,
                      "height": height,
                      "size": imageFile.fileSize,
                      "id": Number(imageFile.itemFileId)
                    },
                    "isEdit": false,
                    "componentType": "pic",
                    "componentId": "component" + componentId,
                    "groupId": "group" + groupId,
                    "selected": false
                  }
                ],
                "groupId": "group" + groupId,
                "id": "group" + groupId,
                "bizName": "图文模块"
            }
            groupImage.push(imageJson);
        }
        const detailJson = {
            "groups": groupImage,
            "sellergroups": []
        }
        const templateContent = JSON.stringify(detailJson);
        draftData.descRepublicOfSell.descPageCommitParam.templateContent = templateContent;
        return true;
    }

    async fillSellInfo(commonData: { data: any }, skuItem: DoorSkuDTO, draftData: { price: string, quantity: string, sku: { [key: string]: any }[], saleProp: { [key: string]: { [key: string]: any }[] } }) {
        const priceRate : PriceRangeConfig[] | undefined = this.getParams("priceRate");
        const components = commonData.data.components;
        const saleProBuilder = new SaleProBuilder(priceRate, isNeedCombine(components), isNeedSellPointCollection(components));
        draftData.price = await saleProBuilder.getPrice(Number(skuItem.doorSkuSaleInfo.price));
        draftData.quantity = skuItem.doorSkuSaleInfo.quantity;
        await this.fillSellProp(commonData, skuItem, draftData);
        await saleProBuilder.fillSellSku(skuItem, draftData);
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
                if (salesAttrs.hasImage == 'true') {
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
    

    async fillMainImage(mainImages: SkuFileDetail[], draftData: { mainImagesGroup: { images: { url: string, pix: string }[] } }) {
        const mainImageList: { url: string, pix: string }[] = [];
        for (const file of mainImages) {
            let url = file.fileUrl;
            if (!url) {
                url = "";
            }
            mainImageList.push({
                url: url,
                pix: "800x800",
            })
        }
        draftData.mainImagesGroup = {
            images: mainImageList
        }
    }
    
    async fillPropExt(commendItem: { [key: string]: any }, skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
        const fields = commendItem.data.models.__fields__;
        const commonData = commendItem.data;
        const componentsData = commonData.components;
        for(const field in fields){
            const props = this.getProps(componentsData, field);
            if(!props || props.length == 0){
                continue;
            }
            if(filterProCode.includes(field)){
                continue;
            }
            const value = this.getPropValue(props, skuItem);
            if(value){
                draftData[field] = value;
            }
        }
    }

    getCerNo(value : string){
        if(value.startsWith("http")){
            const urlParams = getUrlParameter(value);
            return urlParams.get("q");
        }
        return value;
    }

    getPropLabelAndPropKey(props: { [key: string]: any }){
        const items = props.dataSource?.requiredModule?.items;
        if(items && items.length > 0){
            const item = items[0];
            let label = item.label;
            const propKey = item.name;
            if(propKey == "org_auth_indu_cer_code"){
                label = "商品资质";
            }
            if(label){
                return {
                    fieldLabel: label,
                    propKey: propKey
                };
            }
        }
        const fieldLabel = props.label;
        return {
            fieldLabel: fieldLabel,
            propKey: props.name
        };
    }

    getPropValue(props: { [key: string]: any }, skuItem: DoorSkuDTO) {
        const fieldType = props.uiType;
        let {fieldLabel, propKey} = this.getPropLabelAndPropKey(props);
        const skuItems = skuItem.baseInfo.skuItems;
        for(const skuItem of skuItems){
            const skuItemValue = skuItem.value;
            if(skuItemValue && fieldLabel && (skuItemValue.includes(fieldLabel) || fieldLabel.includes(skuItemValue))){
                const text = skuItem.text;
                if(!text){
                    return undefined;
                }
                if(text.length == 1){
                    if(fieldType == "input"){
                        return text[0];
                    }
                    if(fieldType == "number"){
                        const numbers = text[0].match(/\d+/g); // 提取所有数字
                        if(numbers && numbers.length > 0){
                            return Number(numbers[0]);
                        }
                    }
                    if(fieldType == "rangePicker"){
                        const value = text[0];
                        if(!value.includes("至")){
                            continue;
                        }
                        const range = value.split("至");
                        if(range.length == 2){
                            const startDate = this.convertDateFormat(range[0]);
                            const endDate = this.convertDateFormat(range[1]);
                            return startDate + "," + endDate;
                        }
                    }
                    if(fieldType == "qualification"){
                        let value = text[0];
                        if(value.startsWith("https")){
                            propKey = "org_auth_indu_cer_code";
                        }
                        const cerNo = this.getCerNo(value);
                        log.info("qualification key is ", propKey, " value is ", cerNo);
                         return [
                            {
                                "key": propKey,
                                "type": "text",
                                "value": cerNo
                            }
                        ]
                    }
                    return text[0];
                }
                return text;
            }
        }
        if(!props.required){
            return undefined;
        }
        if(props.uiType == "multiDiscountPromotion"){
            const value = props.value;
            if(!value){
                return undefined;
            }
            value.enable = true;
            return value;
        }
        return this.getSkuPropFromDefault(props)
    }

    getSkuPropFromDefault(props: { [key: string]: any }){
        const defaultProps : { [key: string]: any } = {"barcode": "0000000000000"};
        if (props.name in defaultProps){
            return defaultProps[props.name];
        }
        return undefined;
    } 

    convertDateFormat(str: string) {
        // 正则表达式提取出 "YYYY年MM月DD日" 这样的日期
        const match = str.match(/(\d{4})年(\d{2})月(\d{2})日/);
        if (match) {
          const [, year, month, day] = match;
          return `${year}-${month}-${day}`; // 返回 "YYYY-MM-DD" 格式
        }
        return null; // 如果没有匹配到日期，返回 null
    }

    

    getProps(componentsData: { [key: string]: any }, field: string){
        if (!(field in componentsData)){
            for(const key in componentsData){
                const fieldData = componentsData[key];
                const props = fieldData.props;
                if(!props || props.length == 0){
                    continue;
                }
                return props;
    
            }
            return undefined;
        }
        const fieldData = componentsData[field];
        return fieldData.props;
    }
    


    async fillTiltle(skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
        const title = skuItem.baseInfo.title;
        draftData.title = title;
    }

    async fixSaleProp(commonData: { data: any }, skuItem: DoorSkuDTO) {
        const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;
        const salePropSubItems = commonData.data.components.saleProp.props.subItems;
         for (let key in salesAttrs) {
            const salesAttr = salesAttrs[key];
            if (!salesAttr) {
                continue;
            }
            log.info("fixSaleProp key is ", key);
            const salesAttrValues = salesAttr.values;
            if (!(key in salePropSubItems)) {
                continue;
            }
            const salePropSubItem = salePropSubItems[key];
            if ('subItems' in salePropSubItem) {
                salesAttr.isSaleAddValues = true;
            }
            for (let salesAttrValue of salesAttrValues) {
                salesAttrValue.value = this.getFixValue(salePropSubItem, salesAttrValue.value);
            }
        }
        const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
        for(let saleSku of salesSkus) {
            const salePropPath = saleSku.salePropPath;
            const saleProps = salePropPath.split(";");
            const salePropKey = [];
            for (const saleProp of saleProps) {
                const salePropIds = saleProp.split(":");
                const key = "p-" + salePropIds[0];
                const salePropSubItem = salePropSubItems[key];
                const newValue = this.getFixValue(salePropSubItem, salePropIds[1]);
                salePropKey.push(salePropIds[0] + ":" + newValue);
            }
            saleSku.salePropPath = salePropKey.join(";");
        }
    }
    
    getFixValue(salePropSubItem: { [key: string]: any }, value: string) {
        if(!salePropSubItem){
            return String(-Number(value));
        }
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

    getStartTraceId(commonData: { data: any }) {
        try {
            const startTraceId = commonData.data.components.fakeCredit.props.icmp.global.value.frontDataLog.traceId;
            return startTraceId;
        } catch (e) {
            return undefined;
        }
    }

    getSkuDraftIdFromData(skuItemId: string | undefined, result: DoorEntity<any>) {
        if (skuItemId) {
            return skuItemId;
        }
        if(!result.data){
            return undefined;
        }
        if(!result.data.dbDraftId){
            return undefined;
        }
        return String(result.data.dbDraftId);
    }

    getCatIdFromUrl(result: DoorEntity<any>) {
        const catId = this.getParams("catId");
        if(catId){
            return catId;
        }
        const requestUrl = result.getUrl();
        const urlObj = new URL(requestUrl);
        const urlParams = new URLSearchParams(urlObj.search);
        return urlParams.get("catId");
    }
    

    getPublishUrl(skuDraftId: string | undefined, itemId: string) {
        if (!skuDraftId) {
            return "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
        }
        return "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + skuDraftId;
    }

    async activeDraft(resourceId: number, skuItemId: string, skuDraftId: string) {
        await activeSkuDraft({
            id: undefined,
            status: "ACTIVE",
            resourceId: resourceId,
            skuItemId: skuItemId,
            skuDraftId: skuDraftId
        });
    }

}