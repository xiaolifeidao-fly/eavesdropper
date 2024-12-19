import { ActionCommand, DoorRecord } from "@model/door/door"
import { getData, getDataList,instance } from "@utils/axios"


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

export const saveDoorRecord = async (doorRecord: DoorRecord) : Promise<DoorRecord> => {
    return await instance.post("/doors/save", doorRecord);
}

  