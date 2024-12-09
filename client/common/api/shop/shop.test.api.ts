import { getDataList, getPage, instance } from "@util/axios"
import { Shop } from "@model/shop/shop.test"



export const getData = async () =>{
    // const result = await getPage(Shop, "shop/test/page", {});
    return {total : 100, data : []};
}
