import  log  from "electron-log";

abstract class AbsSkuProp {

    proKey : string


    constructor(){
        this.proKey = this.getPropKey();
    }

    abstract getPropKey(): string;

    checkPropValue(draftData : any){
        const propValue = draftData[this.proKey];
        if(propValue == undefined){
            return false;
        }
        if(typeof propValue == "string"){
            if(propValue.length == 0){
                return false;
            }
            return true;
        }
        if(this.propValueCheck(this.proKey, propValue, draftData)){
            log.info("checkPropValue propValue is ", propValue);
            return true;
        }
        return false;
    }

    propValueCheck(proKey : string, propValue : any, draftData : any){
        return true;
    }

    abstract fillPropValue(draftData : any, value : any): void;

}

export class QualificationSkuPropConfig extends AbsSkuProp{

    getPropKey(): string {
        return "qualification";
    }

    propValueCheck(proKey : string, propValue : any, draftData : any){
        const qualification = draftData.qualification;
        if(qualification && qualification.length > 0){
            const firstQualificationValue = qualification[0]?.value;
            if(firstQualificationValue && firstQualificationValue.length > 0){
                return true;
            }
        }
        return false;
    }

    fillPropValue(draftData : any, value : any){
        draftData.qualification = [
            {
                "key": "org_auth_indu_cer_code",
                "type": "text",
                "value": value
            }
        ];
    }

}

const skuPropMap : {[key : string] : AbsSkuProp} = {
    "qualification" : new QualificationSkuPropConfig()
}


export function checkPropValue(draftData : any, commonData : any){
    const components = commonData.data.components;
    const baseCard = components?.['base-card'];
    if(!baseCard){
        log.info("checkPropValue baseCard is null ");
        return true;
    }
    const subItems = baseCard?.props?.subItems;
    if(subItems && subItems.length > 0){
        const requiredKeys = subItems[0].requiredKeys;
        log.info("checkPropValue requiredKeys is ", requiredKeys);
        if(!requiredKeys){
            return true;
        }
        for(const requiredKey of requiredKeys){ 
            const skuProConfig = skuPropMap[requiredKey];
            if(!skuProConfig){
                continue;
            }
            const checkResult = skuProConfig.checkPropValue(draftData);
            if(!checkResult){
                return false;
            }
        }
        return true;
    }
    return true;
}


