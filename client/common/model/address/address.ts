

export class Address {
    id: number|undefined;
    countryCode: string;
    provinceCode: string;
    cityCode: string;
    cityName: string;
    keywords: string;

    constructor(id: number|undefined, countryCode: string, provinceCode: string, cityCode: string, cityName: string, keywords: string) {
        this.id = id;
        this.countryCode = countryCode;
        this.provinceCode = provinceCode;
        this.cityCode = cityCode;
        this.cityName = cityName;
        this.keywords = keywords;
    }
}

export class AddressTemplate {
    id: number|undefined;
    resourceId: number;
    addressId: number;
    templateId: string;

    constructor(id: number|undefined, resourceId: number, addressId: number, templateId: string) {
        this.id = id;
        this.resourceId = resourceId;
        this.addressId = addressId;
        this.templateId = templateId;
    }
}