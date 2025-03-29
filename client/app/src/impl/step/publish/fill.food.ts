
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { SkuFileDetail } from "@model/sku/sku.file";
import axios from "axios";
import log from "electron-log";

abstract class FoodHandler { 

    key : string;   

    constructor(key : string){
        this.key = key;
    }

    isValidate(){
        return true;
    }

    needFill(draftData : { [key : string] : any }): boolean {
        return !this.isNotNull(draftData);
    }

    isNotNull(draftData : { [key : string] : any }){
        const value =  draftData[this.key];
        if(value && value.length > 0){
            return true;
        }
        return false;
    }

    doFill(catPro : { [key : string] : any }, draftData : { [key : string] : any }, skuItem : SkuItem): void {
        draftData[this.key] = skuItem.text[0];
    }

    againFill(catPro : { [key : string] : any }, draftData : { [key : string] : any }, skuItem : SkuItem[]): void {
    }

    getUnit(foodPeriod : string){
        if(foodPeriod.includes("天")){
            return "天";
        }
        if(foodPeriod.includes("月")){
            return "月";
        }
        if(foodPeriod.includes("年")){
            return "年";
        }
        return "天";
    }

}


/**
 * 食品添加剂
 */
class FoodAdditiveHandler extends FoodHandler {

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "详情见包装";
    }

}

/**
 * 食品存储
 */
class FoodPlanStorageHandler extends FoodHandler {

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "详情见包装";
    }
}

/**
 * 食品生产许可证
 */
class FoodPrdLicenseHandler extends FoodHandler {


   againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
       if(draftData[this.key]){
          return;
       }
       draftData[this.key] = randomFetchFootPrdLicense();
   }

}

/**
 * 食品生产编码
 */
class FoodDesignCodeHandler extends FoodHandler {


}

/**
 * 厂名
 */
class FoodFactoryNameHandler extends FoodHandler {

    isValidate(){
        return false;
    }

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "详情见包装";
    }
}



/**
 * 食品生产商地址
 */
class FoodFactorySiteHandler extends FoodHandler {
    isValidate(){
        return false;
    }

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "详情见包装";
    }

}

class FoodFactoryContactHandler extends FoodHandler {

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "无";
    }

}

class FoodMixHandler extends FoodHandler {

    againFill(catPro: { [key: string]: any; }, draftData: { [key: string]: any; }, skuItem: SkuItem[]): void {
        draftData[this.key] = "详情见包装";
    }
}

/**
 * 保质期
 */
class FoodPeriodHandler extends FoodHandler {



    needFill(draftData: { [key: string]: any; }): boolean {
        return true;
    }

    doFill(catPro : { [key : string] : any }, draftData : { [key : string] : any }, skuItem : SkuItem): void {
        const foodPeriod = skuItem.text[0];
        let targetUnit = catPro.props?.unit;
        const foodPeriodNum = parseInt(foodPeriod.match(/\d+/g)?.[0] || "0");
        const sourceUnit = this.getUnit(foodPeriod);
        const convertNum = this.convertToNum(foodPeriodNum, sourceUnit, targetUnit);
        draftData[this.key] = `${convertNum}`;
    }

    convertToNum(unitNum : number, sourceUnit : string, targetUnit : string){
        if(sourceUnit == "天"){
            if(targetUnit == "天"){
                return unitNum;
            }
            if(targetUnit == "月"){
                return unitNum / 30;
            }
            if(targetUnit == "年"){
                return unitNum / 365;
            }
        }
        if(sourceUnit == "月"){
            if(targetUnit == "天"){
                return unitNum * 30;
            }
            if(targetUnit == "月"){
                return unitNum;
            }
            if(targetUnit == "年"){
                return unitNum / 12;
            }
        }
        if(sourceUnit == "年"){
            if(targetUnit == "天"){
                return unitNum * 365;
            }
            if(targetUnit == "月"){
                return unitNum * 12;
            }
            if(targetUnit == "年"){
                return unitNum;
            }
        }
        return unitNum;
    }
}

/**
 * 生产日期
 */
class FoodProduceDateHandler extends FoodHandler {

    needFill(draftData : { [key : string] : any }): boolean {
        return true;
    }

    doFill(catPro : { [key : string] : any }, draftData : { [key : string] : any }, skuItem : SkuItem): void {  
        const foodProduceDate = skuItem.text[0];
        if(foodProduceDate.includes("至")){
            return super.doFill(catPro, draftData, skuItem);
        }
        const endDate = new Date().toISOString().split("T")[0];
        draftData[this.key] = `${foodProduceDate},${endDate}`;
    }

    againFill(catPro : { [key : string] : any }, draftData : { [key : string] : any }, skuItems : SkuItem[]): void {
        const date = new Date().toISOString().split("T")[0];
        draftData[this.key] = `${date},${date}`;
    }

    // 根据startDate 和 时间间隔 计算出endDate, 时间单位:天/月
    getEndDate(startDate : string, foodPeriod : string, unit : string){
        const startTime = new Date(startDate);
        const foodPeriodNum = parseInt(foodPeriod.match(/\d+/g)?.[0] || "0");

        if(unit == "天"){
            const endDate = new Date(startTime.getTime() + foodPeriodNum * 24 * 60 * 60 * 1000);
            return endDate.toISOString().split("T")[0];;
        }
        if(unit == "月"){
            const endDate = new Date(startTime.getTime() + foodPeriodNum * 30 * 24 * 60 * 60 * 1000);
            return endDate.toISOString().split("T")[0];;
        }
        const endDate = new Date(startTime.getTime() + foodPeriodNum * 365 * 24 * 60 * 60 * 1000);
        return endDate.toISOString().split("T")[0];
    }

    getFoodPeriod(skuItems : SkuItem[]){
        const foodPeriod = skuItems.find(item => item.value == "保质期");
        if(!foodPeriod){
            return undefined;
        }
        return foodPeriod.text[0];
    }

    getFoodProduceDate(skuItems : SkuItem[]){
        const foodProduceDate = skuItems.find(item => item.value == "生产日期");
        if(!foodProduceDate){
            return undefined;
        }
        return foodProduceDate.text[0];
    }
}





const foodHandlers : FoodHandler[] = [
  new FoodAdditiveHandler("foodAdditive"),
  new FoodPlanStorageHandler("foodPlanStorage"),
  new FoodPrdLicenseHandler("foodPrdLicense"),
  new FoodDesignCodeHandler("foodDesignCode"),
  new FoodFactoryNameHandler("foodFactoryName"),
  new FoodFactorySiteHandler("foodFactorySite"),
  new FoodPeriodHandler("foodPeriod"),
  new FoodProduceDateHandler("foodProduceDate"),
  new FoodFactoryContactHandler("foodFactoryContact"),
  new FoodMixHandler("foodMix"),
]

const footPrdLicenses = ["SC10341147101351", "SC10432062101169","SC11334160230808","SC10644512106525","SC10634160212611","SC10435058302205"];

function randomFetchFootPrdLicense(){
    return footPrdLicenses[Math.floor(Math.random() * footPrdLicenses.length)];
}


export class FoodSupport { 

    fillResult : boolean;
    fillMessage : string;

    constructor(fillResult : boolean = true, fillMessage : string = "食品类:"){
        this.fillResult = fillResult;
        this.fillMessage = fillMessage;
    }

    async doFill(components : { [key : string] : any }, skuItems : SkuItem[], draftData : { [key : string] : any }, catId : string, startTraceId : string, requestHeaders : { [key : string] : any }, mainImages : SkuFileDetail[]){
        if(!this.isFood(components)){
            return true;
        }
        this.fill(components, skuItems, draftData);
        this.againCheckAndFill(components, skuItems, draftData);
        this.checkResult(components, draftData);
        await this.fillFoodFactory(components, catId, startTraceId, requestHeaders, draftData);
        this.fillFootImages(components, draftData, mainImages);
        return this.fillResult;
    }

    fillFootImages(components : { [key : string] : any }, draftData : { [key : string] : any }, mainImages : SkuFileDetail[]){
        const foodImages = draftData["foodImages"];
        if(!components.foodImages){
            return;
        }
        if(foodImages){
            return;
        }
        const frontImage = mainImages[0];
        const backgroundImage = mainImages[1];
        draftData["foodImages"] = [
            {
                "url": "",
                "thumbUrl": ""
            },
            {
                "url": "",
                "thumbUrl": ""
            },
            {
                "id": frontImage.fileId,
                "url": frontImage.fileUrl,
                "name": frontImage.fileName,
                "size": frontImage.fileSize,
                "pix": "800x800",
                "folderId": "0"
            },
            {
                "id": backgroundImage.fileId,
                "url": backgroundImage.fileUrl,
                "name": backgroundImage.fileName,
                "size": backgroundImage.fileSize,
                "pix": "800x800",
                "folderId": "0"
            }
        ]
    }

    async fillFoodFactory(components : { [key : string] : any }, catId : string, startTraceId : string, headers : { [key : string] : any }, draftData : { [key : string] : any }){
        if(!components.foodPrdLicense){
            return;
        }
        let foodPrdLicense = draftData["foodPrdLicense"];
        if(!foodPrdLicense){
            foodPrdLicense = randomFetchFootPrdLicense();
        }
        const result = await this.getFoodPrdLicense(catId, startTraceId, headers, foodPrdLicense, 1);
        if(!result){
            return;
        }
        draftData["foodPrdLicense"] = result.foodPrdLicense;
        draftData["foodFactoryName"] = result.foodFactoryName;
        draftData["foodFactorySite"] = result.foodFactorySite;
    }

    async getFoodPrdLicense(catId : string, startTraceId : string, headers : { [key : string] : any }, foodPrdLicense : string, retryCount : number): Promise<{foodPrdLicense : string, foodFactoryName : string, foodFactorySite : string} | undefined>{
        if(retryCount > 2){
            this.fillResult = false;
            this.appendMessage("填充食品生产商失败");
            return undefined;
        }
        log.info(foodPrdLicense, " getFoodPrdLicense retryCount ", retryCount);
        const url = "https://item.upload.taobao.com/sell/v2/asyncOpt.htm";
        const data = {
            optType: "foodPrdLicenseType",
            catId: catId,
            foodPrdLicense: foodPrdLicense,
            globalExtendInfo: JSON.stringify({"startTraceId":startTraceId})
        };
        const response = await axios.post(url, data, {headers : headers});
        const result = response.data;
        log.info(foodPrdLicense , " fillFoodFactory result ", result)

        if(result.models){
            const type = result.models.globalMessage?.type;
            if(type && type == "error"){
                foodPrdLicense = randomFetchFootPrdLicense();
                return await this.getFoodPrdLicense(catId, startTraceId, headers, foodPrdLicense, retryCount + 1);
            }
            const formValues = result.models.formValues;
            return {
                foodPrdLicense : foodPrdLicense,
                foodFactoryName : formValues?.foodFactoryName,
                foodFactorySite : formValues?.foodFactorySite
            }
        }else{
            this.fillResult = false;
            this.appendMessage("填充食品生产商失败");
            log.error("fillFoodFactory error ", result);
        }
    }

    fill(components : { [key : string] : any }, skuItems : SkuItem[], draftData : { [key : string] : any }){
        for(const handler of foodHandlers){
            if(!handler.needFill(components)){
                continue;
            }
            const matchResult = this.matchCat(handler.key, components, skuItems);
            if(!matchResult){
                continue;
            }
            const catProp = matchResult.catProp;
            const skuItem = matchResult.skuItem;
            if(!skuItem){
                continue;
            }
            handler.doFill(catProp, draftData, skuItem);
        }
    }

    againCheckAndFill(components : { [key : string] : any }, skuItems : SkuItem[], draftData : { [key : string] : any }){
        for(const handler of foodHandlers){
            const catProp = components[handler.key];
            if(!catProp){
                continue;
            }
            if(!handler.needFill(draftData)){
                continue;
            }
            if(!catProp.props?.required){
                continue;
            }
            handler.againFill(catProp, draftData, skuItems);
        }
    }

    checkResult(components : { [key : string] : any }, draftData : { [key : string] : any }){
        for(const handler of foodHandlers){
            const catProp = components[handler.key];
            if(!catProp){
                continue;
            }
            if(!catProp.props?.required){
                continue;
            }
            if(handler.isNotNull(draftData)){
                continue;
            }
            if(!handler.isValidate()){
                continue;
            }
            this.fillResult = false;
            this.appendMessage(catProp);
        }
    }

    appendMessage(catProp : any){
        const label = catProp.props?.label;
        this.fillMessage += `[${label}] 未能填充;`;
    }

    matchCat(handlerKey : string, components : { [key : string] : any }, skuItems : SkuItem[]){
        const catProp = components[handlerKey];
        if(!catProp){
            return undefined;
        }
        for(const skuItem of skuItems){
            const sourceLable = skuItem.value;
            const targetLable = catProp.props?.label;
            if(sourceLable == targetLable || sourceLable.includes(targetLable) || targetLable.includes(sourceLable)){
                return {catProp, skuItem};
            }
        }
        if(catProp.props?.required){
            return {catProp : catProp, skuItem : undefined};
        }
        return undefined;
    }

    isFood(components : { [key : string] : any }){
        for(const handler of foodHandlers){
            if(handler.key in components){
                return true;
            }
        }
        return false;
    }
}