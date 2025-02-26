import { DoorSkuDTO } from "@model/door/sku";
import { ActionCommand, DoorRecord, SearchSkuRecord } from "@model/door/door"
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

export const parseSku = async (params: {}) : Promise<DoorSkuDTO|null> => {
    const jsonResult = await instance.post("/doors/sku/parse", params);
    const result = plainToClass(DoorSkuDTO, jsonResult);
    return result;
}



export const saveDoorRecord = async (doorRecord: DoorRecord) : Promise<DoorRecord> => {
    return await instance.post("/doors/save", doorRecord);
}


export const saveSearchSkuRecord = async (searchSkuRecord: SearchSkuRecord) : Promise<SearchSkuRecord> => {
    return await instance.post("/doors/sku/search/save", searchSkuRecord);
}

export const searchSkuRecord = async (searchType: string, title: string) : Promise<SearchSkuRecord> => {
    return await instance.get("/doors/sku/search", { params: { searchType, title } });
}


  