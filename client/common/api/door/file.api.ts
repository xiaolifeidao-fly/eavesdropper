import { DoorFileRecord } from "@model/door/door";
import { getData, instance } from "@utils/axios";

export const getDoorFileRecord = async (source: string, fileId: string, resourceId: number) : Promise<DoorFileRecord|null> => {
    const params = {
        source : source,
        fileId : fileId,
        resourceId : resourceId
    }
    return await getData(DoorFileRecord, "/doors/file/get", params);
}

export const saveDoorFileRecord = async (doorFileRecord: DoorFileRecord) : Promise<DoorFileRecord> => {
    return await instance.post("/doors/file/save", doorFileRecord);
}
    
export const getDoorFileRecordByKey = async (source: string, resourceId : number, fileKey: string) : Promise<DoorFileRecord|null> => {
    return await getData(DoorFileRecord, "/doors/file/getByKey", {source, resourceId, fileKey});
}
