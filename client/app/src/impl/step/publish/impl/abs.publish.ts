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

    async getPrice(price : number){
        const priceRate : PriceRangeConfig[] | undefined = this.getParams("priceRate");
        if(!priceRate || priceRate.length == 0){
            return String(price);
        }
        // 找到适合当前价格的区间配置
        const config = priceRate.find((config) => price >= config.minPrice && price <= config.maxPrice);
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
                newCatProp[key] = parseInt(value[0]);
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
        if(!('p-20000' in newCatProp)){
            newCatProp['p-20000'] = await this.getDefaultCatPropValueByPinPai("p-20000", requestHeader, catId, startTraceId, skuItemDTO.itemId);
        }
        draftData.catProp = newCatProp;
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

    async getDefaultCatPropValueByPinPai(pid: string, requestHeader : { [key: string]: any }, catId: string, startTraceId: string, itemId: string){
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
        let newValues: any = {};
        for (const catValue of value) {
            let hasFound = false;
            for (const data of dataSource) {
                if (data.text == catValue) {
                    hasFound = true;
                    newValues = {
                        value: data.value,
                        text: data.text
                    }
                }
            }
            if (!hasFound) {
                const categoryInfo = await this.getCategoryInfo(proKey, requestHeader, catId, startTraceId, skuItem.itemId, catValue);
                if (categoryInfo) {
                    newValues = {
                        value: categoryInfo.value,
                        text: categoryInfo.text
                    };
                }else{
                    newValues = {
                        value: -1,
                        text: catValue
                    };
                }
            
            }
        }
        return newValues;
    }
}