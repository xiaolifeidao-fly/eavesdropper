import { ActionCommand } from "@model/door/door"
import { getDataList } from "@utils/axios"


// 用户分页
export const getDoorList = async (version: string, doorType: string) : Promise<ActionCommand[]> => {
    const params = {
        version : version,
        doorType : doorType
    }
    return await getDataList(ActionCommand, "api/doors/list", { params});
  }
  