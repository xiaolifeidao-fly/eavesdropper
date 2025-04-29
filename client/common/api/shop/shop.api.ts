import { plainToClass } from 'class-transformer'
import { getDataList, instance } from '@utils/axios'

import { BasePageResp } from '@model/base/base'
import { ShopPageReq, ShopPageResp, SyncShopReq, ShopInfoResp } from '@model/shop/shop'

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

// 同步店铺
export const syncShop = async (id: number, req: SyncShopReq) => {
    const result = await instance.post(`/shop/${id}/sync`, req)
    return plainToClass(String, result)
}

export const getShopList = async () => {
    return getDataList(ShopInfoResp, "/shop/list")
}

// 绑定激活码
export const bindShopAuthCode = async (shopId: number, authCode: string) => {
    const result = await instance.post(`/shop/${shopId}/bindAuthCode`, { token: authCode })
    return plainToClass(String, result)
}
