import { plainToClass } from 'class-transformer'
import { instance } from '@utils/axios'

import { BasePageResp } from '@model/base/base'
import { ShopPageReq, ShopPageResp } from '@model/shop/shop'

// 删除店铺
export const deleteShop = async (id: number) => {
    const result = await instance.delete(`/shop/${id}`)
    return plainToClass(String, result)
}

// 分页获取店铺
export const getShopPage = async (req: ShopPageReq) => {
    const result = await instance.get(`/shop/page`, { params: req })
    return plainToClass(BasePageResp<ShopPageResp>, result)
}
