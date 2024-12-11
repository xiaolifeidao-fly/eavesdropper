import { getDataList, getPage, instance } from "@utils/axios"
import { Shop } from "@model/shop/shop"



export const getData = async () =>{
    // const result = await getPage(Shop, "shop/test/page", {});
    return {total : 100, data : []};
}
