import { getDoorCatProps, getDoorCatPropsByAI, saveDoorCatProp } from "@api/door/door.api";
import { DoorSkuCatProp } from "@model/door/door";
import { DoorSkuDTO } from "@model/door/sku";
import log  from "electron-log";

const excludeCatProp = ["p-20000"];

const aiFillCategoryCode = ["p-20000-226407184"]

export class AiFillSupport {
    private skuSource : string;

    constructor(skuSource : string){
        this.skuSource = skuSource;
    }

    buildNewDataSource(label : string, dataSource : { [key : string] : any }[]){
        const newDataSource : { [key : string] : any }[] = [];
        for(const item of dataSource){
            newDataSource.push({
                "code" : item.value,
                "correct_value" : item.text
            });
        }
        return {
            "label" : label,
            "data" : newDataSource
        };
    }

    buildFixCatPropAndInputParams(draftData : { [key : string] : any }, commonData : { [key : string] : any }){
        const catPropDataSource = commonData.data.models.catProp.dataSource;
        const fixInputParams : {[key : string] : any} = {};
        const fixCatProp : {[key : string] : any} = {};
        const draftCatProp = draftData.catProp;
        for(const catProp of catPropDataSource){
            const propKey = catProp.name;
            if(excludeCatProp.includes(propKey)){
                continue;
            }
            const draftCatPropValue = draftCatProp[propKey];
            if(draftCatPropValue){
                const dataSource = catProp.dataSource;
                if(!dataSource){
                    continue;
                }
                let checkResult = this.checkCatProp(draftCatPropValue, dataSource);
                if(checkResult){
                    continue;
                }
                fixCatProp[propKey] = this.buildNewDataSource(catProp.label, dataSource);
                continue;
            }
            if(catProp.required) {
                log.info("fixCatProp is required ", catProp);
                const dataSource = catProp.dataSource;
                if(dataSource){
                    fixCatProp[propKey] = this.buildNewDataSource(catProp.label, dataSource);
                }
                const uiType = catProp.uiType;
                if(uiType == 'input' || aiFillCategoryCode.includes(catProp.name)){
                    fixInputParams[catProp.name] = catProp.label;
                }
            }
        }
        log.info("fixInputParams is", fixInputParams);
        log.info("fixCatProp is", fixCatProp);
        return {
            fixInputParams,
            fixCatProp
        }

    }

    checkCatProp(draftCatPropValue : { [key : string] : any }, dataSource : { [key : string] : any }[]){
        for(const item of dataSource){
            if(item.value == draftCatPropValue.value){
                return true;
            }
        }
        return false;
    }

    async getDoorSkuCatProps(fixInputParams : {[key : string] : any}, fixCatProp : {[key : string] : any}, itemId : string){
        if(Object.keys(fixInputParams).length == 0 && Object.keys(fixCatProp).length == 0){
            return [];
        }
        return await getDoorCatProps(this.skuSource, itemId);
    }


    async fixInputByAI(draftData : { [key : string] : any }, skuItem : DoorSkuDTO, params : { [key : string] : any }){
        if(Object.keys(params).length == 0){
            return;
        }
        const properties : {[key : string] : any}[] = [];
        for(const key in params){
            properties.push({
                "label" : params[key],
                "code" : key
            })
        }
        const requestAiParams =
            {
            "sence_name" : "fill_category",
            "params" : {
                "title" : skuItem.baseInfo.title,
                "properties" : properties
            }
        }
        const aiResult : any[] = await getDoorCatPropsByAI(requestAiParams);
        if(aiResult && aiResult.length > 0){
            const doorCatProps : DoorSkuCatProp[] = [];
            for(const aiProp of aiResult){
                let aiValue = aiProp.value;
                if(typeof aiValue != "string"){
                    aiValue = JSON.stringify(aiValue);
                }
                draftData.catProp[aiProp.code] = aiProp.value;

                doorCatProps.push({
                    "id" : undefined,
                    "source" : this.skuSource,
                    "itemKey" : skuItem.baseInfo.itemId,
                    "propKey" : aiProp.code,
                    "propValue" : aiValue
                })
            }
            await saveDoorCatProp(doorCatProps);
        }
    }

    
    async checkCatPropAndFix(draftData : { [key : string] : any }, skuItem : DoorSkuDTO, commonData : { [key : string] : any }){
        const {fixInputParams, fixCatProp} = this.buildFixCatPropAndInputParams(draftData, commonData);
        const doorSkuCatProps = await this.getDoorSkuCatProps(fixInputParams, fixCatProp, skuItem.baseInfo.itemId);
        if(Object.keys(fixInputParams).length > 0){
            for(const doorSkuCatProp of doorSkuCatProps){
                const propKey = doorSkuCatProp.propKey;
                draftData.catProp[propKey] = doorSkuCatProp.propValue;
                if(propKey in fixInputParams){
                    delete fixInputParams[propKey];
                }
            }
            await this.fixInputByAI(draftData, skuItem, fixInputParams);
        }
        if(Object.keys(fixCatProp).length > 0){
            for(const doorSkuCatProp of doorSkuCatProps){
                const propKey = doorSkuCatProp.propKey;
                draftData.catProp[propKey] = doorSkuCatProp.propValue;
                if(propKey in fixCatProp ){
                    delete fixCatProp[propKey];
                }
            }
            for(const propKey of excludeCatProp){
                if(propKey in fixCatProp){
                    delete fixCatProp[propKey];
                }
            }
            await this.fixDataSourceByAI(draftData, skuItem.baseInfo.itemId, fixCatProp);
        }
    }

    buildTargetData(draftValue : any){
        if(draftValue == undefined){
            return {
                "value" : "",
            };
        }
        if(Array.isArray(draftValue)){
            for(const item of draftValue){
                if(this.isValidJson(item)){
                    return {
                        "value" : item.text,
                    };
                }
            }
        }
        if(this.isValidJson(draftValue)){
            return {
                "value" : draftValue.text,
            };
        }
        return {
            "value" : draftValue,
        };
    }

    isValidJson(json : string){
        try {
            JSON.parse(JSON.stringify(json));
            return true; // 是有效的 JSON
        } catch (e) {
            return false; // 不是有效的 JSON
        }
    }

    async fixDataSourceByAI(draftData : { [key : string] : any }, itemId : string, fixCatProp : {[key : string] : any}){
        if(Object.keys(fixCatProp).length == 0){
            return;
        }
        const draftCatProp = draftData.catProp;
        const requestAiParams : {[key : string] : any}[] = [];

        for(const propKey in fixCatProp){
            const catProp = fixCatProp[propKey];
            const draftValue = draftCatProp[propKey];
            requestAiParams.push({
                "label" : catProp.label,
                "pid" : propKey,
                "ori_data" : catProp.data,
                "target_data" : this.buildTargetData(draftValue)
            })
        }
        const params ={
            "sence_name" : "switch_value",
            "params" : {
                "data" : requestAiParams
            }
        }
        log.info("fixDataSourceByAI requestAiParams is", JSON.stringify(params));
        const aiResult : any[] = await getDoorCatPropsByAI(params);
        if(aiResult && aiResult.length > 0){
            const doorCatProps : DoorSkuCatProp[] = [];

            for(const aiProp of aiResult){
                const propKey = aiProp.pid;
                const aiPropValue = aiProp.target_data;
                const aiDraftValue = {
                    "value" : aiPropValue.code,
                    "text" : aiPropValue.value
                }
                draftData.catProp[propKey] = aiDraftValue;
                doorCatProps.push({
                    "id" : undefined,
                    "source" : this.skuSource,
                    "itemKey" : itemId,
                    "propKey" : propKey,
                    "propValue" : JSON.stringify(aiDraftValue)
                })
            }
            await saveDoorCatProp(doorCatProps);
        }
    }
}
