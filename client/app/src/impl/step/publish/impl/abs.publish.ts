import axios from "axios";
import { StepUnit } from "../../step.unit";
import log from "electron-log"
import { Page } from "playwright";
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { DoorEntity } from "@src/door/entity";
import { PriceRangeConfig } from "@model/sku/skuTask";
import { getSkuDraft } from "@api/sku/sku.draft";

export async function elementIsExist(page: Page, selector: string){
    return page.evaluate((selectorKey) => {
        //@ts-ignore
        const doc = document.querySelectorAll(selectorKey);
        if(!doc || doc.length == 0){
            return false;
        }
        return true;
    }, selector);
}

function handlerPeriod(dataSource: { [key: string]: any }[], catValue: string){
    const first = dataSource[0];
    if(!first){
        return undefined;
    }
    const text = first.text;
    if(text.includes("天") && catValue.includes("天")){
        for(const data of dataSource){
            if(data.text == catValue){
                return {
                    value: data.value,
                    text: data.text
                }
            }
        }
        return undefined;
    }
    if(text.includes("月") && catValue.includes("月")){
        for(const data of dataSource){
            if(data.text == catValue){
                return {
                    value: data.value,
                    text: data.text
                }
            }
        }
        return undefined;
    }
    return undefined;
}

const specialCatProHandler: { [key: string]: (dataSource: { [key: string]: any }[], catValue: string) => any } = {
    "保质期": handlerPeriod
}


export async function confirmProtocol(page: Page) {
    try {
        const elementSelector = ".next-dialog-btn";
        await page.waitForTimeout(1000);
        const protocolButtonElement = await elementIsExist(page, elementSelector);
        if(!protocolButtonElement){
            log.info("protocolButton not found");
            return;
        }
        const protocolButton = await page.locator(elementSelector);
        await protocolButton.first().click();
    } catch (e) {
        log.error("confirmProtocol error", e);
    }

}

export abstract class AbsPublishStep extends StepUnit{

    public async updateDraftData(catId: string, draftId: string, header: { [key: string]: any }, startTraceId: string, draftData: {}) {
        try{
            const url = "https://item.upload.taobao.com/sell/draftOp/update.json?catId=" + catId;
            const data = {
                "id": draftId,
                "dbDraftId": draftId,
                "jsonBody": JSON.stringify(draftData),
                "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
            };
            const res = await axios.post(url, data, {
                headers: header
            })
            if (!res.data || (typeof (res.data) == 'string' && res.data == '')) {
                log.info("updateDraftData res is empty", res.data);
                return false;
            }
            if (!res.data.success) {
                log.info("updateDraftData res is not success ");
                return false;
            }
            log.info("updateDraftData res is success ");
            return true;
        }catch(e){
            log.error("updateDraftData error ", e);
            return false;
        }
    }

    public async getCommonData(page: Page) {
        // 获取window对象中 json 数据 
        const commonData = await page.evaluate(() => {
            return {
                // @ts-ignore
                data: window.Json,
                // @ts-ignore
                userAgent: navigator.userAgent,
                // @ts-ignore
                csrfToken: window.csrfToken.tokenValue
            };
        });
        return commonData;
    }

    isNumber(str: string){
        return !isNaN(Number(str));
    }

    public async fillCategoryList(skuItemDTO: DoorSkuDTO, draftData: { [key: string]: any }, commonData: { [key: string]: any }, requestHeader : { [key: string]: any }, catId: string, startTraceId: string) {
        const excludeList = [""];
        const skuItems = skuItemDTO.baseInfo.skuItems;
        const newCatProp = draftData.catProp;
        const catProps = commonData.data.models.catProp.dataSource;
        for (const skuItem of skuItems) {
            const catProp = this.getCatPro(skuItem, catProps);
            if (!catProp) {
                continue;
            }
            const key = catProp.name;
            if (excludeList.includes(key)) {
                delete newCatProp[key];
                continue;
            }
            const uiType = catProp.uiType;
            const value = skuItem.text;
            if(uiType == "taoSirProp"){
                const targetValue = value[0];
                if(this.isNumber(targetValue)){
                    newCatProp[key] = parseInt(targetValue);
                }else{
                    newCatProp[key] = value[0];
                }
                log.info("taoSirProp is ", newCatProp[key]);
                continue;
            }
            if (key in newCatProp) {
                const newCatValue = newCatProp[key];
                if (!("dataSource" in catProp)) {
                    if (!newCatValue || newCatValue.length == 0) {
                        newCatProp[key] = value[0];
                        continue;
                    }
                }
                if (newCatValue && newCatValue.length > 0) {
                    continue;
                }
            }
            if (!("dataSource" in catProp)) {
                newCatProp[key] = value[0];
                continue;
            }
            //特殊处理
            if(catProp.label in specialCatProHandler){
                const newValues = specialCatProHandler[catProp.label](catProp.dataSource, value[0]);
                if(newValues){
                    newCatProp[key] = newValues;
                    continue;
                }
                continue;
            }
            const dataSource = catProp.dataSource;
            const switchValues = await this.switchCatPropValue(key, dataSource, value, requestHeader, catId, startTraceId, skuItemDTO);
            newCatProp[key] = switchValues
        }
        let brand = newCatProp['p-20000'];
        brand = await this.checkAndUpdateBrand(brand, skuItemDTO, requestHeader, catId, startTraceId);
        newCatProp['p-20000'] = brand;
        draftData.catProp = newCatProp;
    }

    async checkAndUpdateBrand(brand: { [key: string]: any }, skuItemDTO: DoorSkuDTO, requestHeader : { [key: string]: any }, catId: string, startTraceId: string){
        if(!brand || Object.keys(brand).length == 0){
            return await this.getDefaultCatPropValueByBrand("p-20000", requestHeader, catId, startTraceId, skuItemDTO.itemId);
        }
        const targetBrand = brand.text;
        if(targetBrand.includes("无品牌")){
            return brand;
        }
        const skuItems = skuItemDTO.baseInfo.skuItems;
        for(const skuItem of skuItems){
            const brandLabel = skuItem.value;
            if(brandLabel == "品牌"){
                const brandValue = skuItem.text[0];
                if(brandValue != targetBrand){
                    log.info("source brand is ", brandValue, " target brand is ", targetBrand);
                    return await this.getDefaultCatPropValueByBrand("p-20000", requestHeader, catId, startTraceId, skuItemDTO.itemId);
                }
            }
        }
        return brand;
    }


    


    getCatPro(skuItem: SkuItem, catProps: any) {
        const value = skuItem.text;
        if (!value || value.length == 0) {
            return undefined;
        }
        for (const catProp of catProps) {
            const label = catProp.label;
            if (label == skuItem.value) {
                return catProp;
            }
        }
        return undefined;
    }

    async getCategoryInfo(categoryCode: string, requestHeader : { [key: string]: any }, catId: string, startTraceId: string, itemId: string, categoryKeyword: string) {
        requestHeader['content-type'] = "application/x-www-form-urlencoded";
        requestHeader['origin'] = "https://item.upload.taobao.com";
        requestHeader['referer'] = "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
        const requestData = {
            keyword: categoryKeyword,
            pid: categoryCode,
            queryType: "query",
            globalExtendInfo: JSON.stringify({
                startTraceId: startTraceId
            })
        }
        const response = await axios.post("https://item.upload.taobao.com/sell/v2/asyncOpt.htm?optType=taobaoBrandQuery&queryType=query&catId=" + catId, requestData, {
            headers: requestHeader,
        });
        const data = response.data;
        if (!data.success || !data.data.success) {
            return undefined;
        }
        const dataSource = data.data.dataSource;
        if (!dataSource || dataSource.length == 0) {
            return undefined;
        }
        return dataSource[0];
    }

    async getSkuDraftIdFromDB(resourceId: number, skuItemId: string) {
        const skuDraft = await getSkuDraft(resourceId, skuItemId);
        if (!skuDraft) {
            return undefined;
        }
        if (skuDraft.status == "active") {
            const skuDraftId = skuDraft.skuDraftId;
            if(skuDraftId == 'undefined'){
                return undefined;
            }
            return skuDraftId;
        }
        return undefined;
    }

    async getDefaultCatPropValueByBrand(pid: string, requestHeader : { [key: string]: any }, catId: string, startTraceId: string, itemId: string){
        const result = await this.getCategoryInfo(pid, requestHeader, catId, startTraceId, itemId, "无品牌")
        if(result){
            return { 
                value: result.value,
                text: result.text
            }
        }
        return {
            "text": "无品牌/无注册商标",
            "value": 30025069481
        }
    }

    async switchCatPropValue(proKey: string, dataSource: { [key: string]: any }[], value: string[], requestHeader : { [key: string]: any }, catId: string, startTraceId: string, skuItem: DoorSkuDTO) {
        // const newValues: { value: string, text: string }[] = [];
        for (const catValue of value) {
            for (const data of dataSource) {
                if (data.text == catValue) {
                    return {
                        value: data.value,
                        text: data.text
                    }
                }
            }
            const categoryInfo = await this.getCategoryInfo(proKey, requestHeader, catId, startTraceId, skuItem.itemId, catValue);
            if (categoryInfo) {
                return {
                    value: categoryInfo.value,
                    text: categoryInfo.text
                };
            }
        }
        return {};
    }
}