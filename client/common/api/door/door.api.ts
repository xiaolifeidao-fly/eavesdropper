import { DoorSkuDTO } from "@model/door/sku";
import { ActionCommand, DoorCategory, DoorRecord, DoorSkuCatProp, SearchSkuRecord } from "@model/door/door"
import { getData, getDataList,instance } from "@utils/axios"
import { plainToClass } from "class-transformer";


export const getDoorList = async (version: string, doorType: string) : Promise<ActionCommand[]> => {
    const params = {
        version : version,
        doorType : doorType
    }
    return await getDataList(ActionCommand, "/doors/list", { params});
}


export const getDoorRecord = async (doorKey: string, itemKey: string, itemType: string) : Promise<DoorRecord|null> => {
    const params = {
        doorKey : doorKey,
        itemKey : itemKey,
        type : itemType
    }
    return await getData(DoorRecord, "/doors/get", params);
}

export const parseSku = async (source: string, params: {}) : Promise<DoorSkuDTO|null> => {
    const jsonResult = await instance.post(`/doors/sku/parse/${source}`, params);
    const result = plainToClass(DoorSkuDTO, jsonResult);
    return result;
}



export const saveDoorRecord = async (doorRecord: DoorRecord) : Promise<DoorRecord> => {
    return await instance.post("/doors/save", doorRecord);
}


export const saveSearchSkuRecord = async (searchSkuRecord: SearchSkuRecord) : Promise<SearchSkuRecord> => {
    return await instance.post("/doors/sku/search/save", searchSkuRecord);
}

export const searchSkuRecord = async (searchType: string, pddSkuId: string) : Promise<SearchSkuRecord|null> => {
    const params = {
        searchType : searchType,
        pddSkuId : pddSkuId
    }
    return await getData(SearchSkuRecord, "/doors/sku/search", params);
}

export const saveDoorCatProp = async (doorSkuCatProp: DoorSkuCatProp[]) : Promise<any> => {
    return await instance.post("/doors/cat/prop/save", doorSkuCatProp);
}

export const getDoorCatProps = async (source: string, itemKey: string) : Promise<DoorSkuCatProp[]> => {
    const params = {
        source : source,
        itemKey : itemKey
    }
    const result = await getDataList(DoorSkuCatProp, "/doors/cat/prop/get", params);
    for(const item of result){
        if(item.propValue.indexOf("{") > -1){
            try{
                item.propValue = JSON.parse(item.propValue);
            }catch(e){
                //ignore
            }
        }
    }
    return result;
}

export const getDoorCatPropsByAI = async (params: {[key : string] : any}) : Promise<any[]> => {
    return await instance.post("/doors/cat/prop/ai", params);
}


export const getDoorCategoryByPddCatId = async (pddCatId: string) : Promise<DoorCategory|null> => {
    const params = {
        pddCatId : String(pddCatId)
    }
    return await getData(DoorCategory, "/doors/category/get", params);
}

export const saveDoorCategory = async (doorCategory: DoorCategory) : Promise<DoorCategory|undefined> => {
    if(doorCategory.pddCatId == undefined || doorCategory.pddCatId == ""){
        return undefined;

    }
    return await instance.post("/doors/category/save", doorCategory);
}