import { Address, AddressTemplate } from "@model/address/address";
import { getData, instance } from "@utils/axios";


export const getAddressByKeywordsAndResourceId = (keywords: string, resourceId: number) => {
    return getData(AddressTemplate, '/address/template', {
        keywords,
        resourceId
    });
}

export const saveAddress = (address: Address) => {
    return instance.post('/address/save', address);
}

export const getAddressByKeywords = (keywords: string) => {
    return getData(Address, `/address/${keywords}`);
}

export const saveAddressTemplate = (addressTemplate: AddressTemplate) => {
    return instance.post('/address/template/save', addressTemplate);
}