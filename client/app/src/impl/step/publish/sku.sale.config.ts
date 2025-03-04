import { DoorSkuDTO, DoorSkuSaleInfoDTO, SalesAttr, SalesAttrValue, SalesSku } from "@model/door/sku"
import log from "electron-log";
import { pid, resourceUsage } from "process";
export class SkuSaleConfig {

    imageFlag : boolean
    uiType : string
    allowInput : boolean
    handlerInput : Function
    buildDefaultSaleAttr : Function

    constructor(imageFlag : boolean, uiType : string, allowInput : boolean, handlerInput : Function, buildDefaultSaleAttr : Function) {
        this.imageFlag = imageFlag
        this.uiType = uiType
        this.allowInput = allowInput
        this.handlerInput = handlerInput
        this.buildDefaultSaleAttr = buildDefaultSaleAttr
    }

    public toSaleValue(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) : SaleConvertValue {
        return this.handlerInput(salesAttrValues, subItem)
    }

    public buildSaleProp(saleAttr : SalesAttr, subItem : { [key: string]: any }) {
        const salesAttrMap: { [key: string]: SalesAttr } = {};
        const pidKey = subItem.name;
        saleAttr.oldPid = saleAttr.pid;
        saleAttr.pid = pidKey.split("-")[1];
        salesAttrMap[pidKey] = saleAttr;
        return {saleAttr : saleAttr, pidKey : pidKey};
    }

    public buildSalesAttr(subItem : { [key: string]: any }) {
        return this.buildDefaultSaleAttr(subItem);
    }

}

const saleConfigMap : { [key: string]: SkuSaleConfig } = {
    "newColorSelect": new SkuSaleConfig(true, "newColorSelect",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerImage(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "checkboxSaleProps": new SkuSaleConfig(false, "checkboxSaleProps",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerCheckbox(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "sizeSaleProps": new SkuSaleConfig(false, "sizeSaleProps",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerSize(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "comboboxSaleProps": new SkuSaleConfig(true, "comboboxSaleProps",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerImage(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "newMeasurement": new SkuSaleConfig(false, "newMeasurement",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerNewMeasurement(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return new SalesAttr(subItem.label, [], "", "", "", subItem.name);
    }),
    "checkbox" : new SkuSaleConfig(false, "checkbox",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerCheckbox(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "input" : new SkuSaleConfig(false, "input",true, (salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerInput(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return new SalesAttr(subItem.label, [], "", "", "", subItem.name);
    })
}

function buildDefaultByDataSourceList(subItem : { [key: string]: any }) {
    let saleProp : SalesAttrValue[] = [];
    const dataSource = subItem.dataSource;
    if(dataSource && dataSource.length > 0){
        const dataSourceFirst = dataSource[0];
        saleProp.push(new SalesAttrValue(dataSourceFirst.text, dataSourceFirst.value,"",""))
    }
    return new SalesAttr(subItem.label, saleProp, "false", "", "", subItem.name.split("-")[1]);
}

export class SaleConvertValue {

    saleProp : any
    pidKey : string
    pid : string

    constructor(saleProp : any, pidKey : string) {
        this.saleProp = saleProp
        this.pidKey = pidKey
        this.pid = this.buildPid(pidKey)
    }

    buildPid(pidKey : string) {
        return pidKey.split("-")[1]
    }
}

function handlerInput(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) {
    const saleProp = salesAttrValues.map(item => {
        return item.value
    })
    return new SaleConvertValue(saleProp, subItem.name);
}

function handlerNewMeasurement(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) {
    return new SaleConvertValue([], subItem.name);
}

function handlerCheckbox(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) {
    let saleProp : {[key: string]: any}[] = [];
    const dataSource = subItem.dataSource;
    if(dataSource && dataSource.length > 0){
        saleProp = [dataSource[0]]
    }
    return new SaleConvertValue(saleProp, subItem.name);
}

function handlerImage(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) {
    const saleProp = salesAttrValues.map(item => {
        return {
            "img": item.image,
            "text": item.text,
            "value": item.value,
            "pix": "800x800"
        }
    })
    return new SaleConvertValue(saleProp, subItem.name)
}

function handlerSize(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) {
    const values = salesAttrValues.map(item => {
        return {
            "text": item.text,
            "value": item.value,
        }
    })
    const saleProp = {
        "value": values
    }
    return new SaleConvertValue(saleProp, subItem.name)
}


export class SaleMapper { 

   
   saleAttr : SalesAttr|undefined
   subItem : { [key: string]: any }
   pid : string
   salePid : string|null
   hadAssign : boolean
   mergeSourcePids : string[] = []

   constructor(saleAttr : SalesAttr | undefined, subItem : { [key: string]: any }, salePid : string|null, hadAssign : boolean = false) {
        this.saleAttr = saleAttr;
        this.subItem = subItem;
        this.pid = this.subItem.name.split("-")[1];
        this.salePid = salePid;
        this.hadAssign = hadAssign;
   }
}

export class RebuildSalePro{
    skuPropMap : {[key : string]:any} = {}

    constructor(){
        this.skuPropMap = {}
    }


    putSkuMap(oriMap : string, nowMap : any){
        this.skuPropMap[oriMap] = nowMap;
    }

    matchSaleMapper(salesAttrs : { [key: string]: SalesAttr }, subItem: { [key: string]: any }) {
        for(const key in salesAttrs){
            const saleAttr = salesAttrs[key];
            if(!saleAttr){
                continue;
            }
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig.allowInput){
                //TODO 给一个默认的saleAttr 对应是不能手动输入,给出默认值
                if(subItem.required){
                    const saleAttr = saleConfig.buildDefaultSaleAttr(subItem);
                    return new SaleMapper(saleAttr, subItem, null, true);
                }
                return undefined;
            }
            const label = subItem.label;
            const pddLable = saleAttr.label;
            if(pddLable == label || label.includes(pddLable) || pddLable.includes(label)){
                const saleProp = saleConfig.buildSaleProp(saleAttr, subItem);
                return new SaleMapper(saleProp.saleAttr, subItem, saleProp.saleAttr.oldPid, true);
            }
        }
        return undefined;
    }
    
    getAllowAssignSaleMappers(saleMappers : SaleMapper[]) {
        const allowSaleMappers : SaleMapper[] = [];
        for(const saleMapper of saleMappers){
            if(saleMapper.hadAssign){
                continue;
            }
            const uiType = saleMapper.subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                continue;
            }
            if(saleConfig.allowInput && saleConfig.imageFlag){
                allowSaleMappers.push(saleMapper);
            }
        }

        if(allowSaleMappers.length == 0){
            for(const saleMapper of saleMappers){
                if(saleMapper.hadAssign){
                    continue;
                }
                const uiType = saleMapper.subItem.uiType;
                const saleConfig = saleConfigMap[uiType];
                if(!saleConfig){
                    continue;
                }
                if(saleConfig.allowInput){
                    allowSaleMappers.push(saleMapper);
                }
            }
        }
        if(allowSaleMappers.length == 0){
            for(const saleMapper of saleMappers){
                const uiType = saleMapper.subItem.uiType;
                const saleConfig = saleConfigMap[uiType];
                if(!saleConfig){
                    continue;
                }
                if(saleConfig.allowInput){
                    allowSaleMappers.push(saleMapper);
                }
            }
        }
        return allowSaleMappers;
    }
    
    
    fillSale(doorSkuSaleInfo : DoorSkuSaleInfoDTO, saleMappers : SaleMapper[]) {
        this.fillSaleAttrs(doorSkuSaleInfo, saleMappers);
        this.fillSaleSku(doorSkuSaleInfo, saleMappers);
    }
    
    fillSaleAttrs(doorSkuSaleInfo : DoorSkuSaleInfoDTO, saleMappers : SaleMapper[]) {
        const saleAttrs : { [key: string]: SalesAttr } = {};
        for(const saleMapper of saleMappers){
            const saleAttr = saleMapper.saleAttr;
            if(!saleAttr){
                continue;
            }
            saleAttrs[saleMapper.subItem.name] = saleAttr;
        }
        doorSkuSaleInfo.salesAttr = saleAttrs;
    }
    
    fillSaleSku(doorSkuSaleInfo : DoorSkuSaleInfoDTO, saleMappers : SaleMapper[]) {
        const saleSkus : SalesSku[] = doorSkuSaleInfo.salesSkus;
        log.info("fillSaleSku skuPropMap ", this.skuPropMap);
        for(const saleSku of saleSkus){
           const salePropPath = saleSku.salePropPath;
           const newSalePropPath = this.getNewSalePropPath(salePropPath, saleMappers);
           saleSku.salePropPath = newSalePropPath;
        }
    }
    
    getNewSalePropPath(salePropPaths : string, saleMappers : SaleMapper[]) {
        const newSalePropPathArr : string[] = [];
        const matchResult = this.matchSalePropPath(salePropPaths);
        if(matchResult){
            newSalePropPathArr.push(matchResult);
        }
        const newSalePropPath = newSalePropPathArr.join(";");
        return this.appendTbPrivateSaleSkuProp(newSalePropPath, saleMappers);
    }

    matchSalePropPath(salePropPath : string) {
        for(const key in this.skuPropMap){
            const keys = key.split(":");
            const value = this.skuPropMap[key];
            let matchResult = true;
            for(const keyValue of keys){
               if(!salePropPath.includes(keyValue)){
                  matchResult = false;
               }
            }
            if(matchResult){
                return value;
            }
        }
        return undefined;
    }
    
    appendTbPrivateSaleSkuProp(salePropPath : string, saleMappers : SaleMapper[]) {
        let newSalePropPath = salePropPath;
        for(const saleMapper of saleMappers){
            if(!saleMapper.salePid){
                const saleAttr = saleMapper.saleAttr;
                const values = saleAttr?.values;
                if(values && values.length > 0){
                    newSalePropPath = newSalePropPath + ";" + saleMapper.pid + ":" + -values[0].value;
                }
            }
        }
        return newSalePropPath;
    }
    
    
    getUnAssignSaleAttrs(saleMappers : SaleMapper[], saleAttrs : { [key: string]: SalesAttr }) {
        const unAssignSaleAttrs : SalesAttr[] = [];
        for(const key in saleAttrs){
            const saleAttr = saleAttrs[key];
            if(!saleAttr){
                continue;
            }
            let isAssign = false;
            for(const saleMapper of saleMappers){
                if(saleMapper.hadAssign){
                    //说明已经分配过了
                    if(saleAttr.oldPid == saleMapper.salePid){
                        isAssign = true;
                        break;
                    }
                }
            }
            if(!isAssign){
                unAssignSaleAttrs.push(saleAttr);
            }
        }
        return unAssignSaleAttrs;
    }
    
    fixAndAssign(doorSkuSaleInfo : DoorSkuSaleInfoDTO, subItems : { [key: string]: any }) {
        const salesAttrs = doorSkuSaleInfo.salesAttr;
        const saleMappers : SaleMapper[] = [];
        for(const key in subItems){
            const subItem = subItems[key];
            if(!subItem){
                continue;
            }
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                log.warn(`${uiType} 未找到对应的 saleConfig`);
                continue;
            }
            const saleMapper = this.matchSaleMapper(salesAttrs, subItem);
            if(saleMapper){
                saleMappers.push(saleMapper);
            }else{
                saleMappers.push(new SaleMapper(undefined, subItem, null, false));
            }
        }
        const allowAssignSaleMappers = this.getAllowAssignSaleMappers(saleMappers);
        if(allowAssignSaleMappers.length == 0){
            log.warn(`未找到能分配的 subItem`);
            return [];
        }
        const unAssignSaleAttrs = this.getUnAssignSaleAttrs(saleMappers, salesAttrs);
        const needMergeSaleAttrs : SalesAttr[] = [];
        let needMegerSaleMapper = undefined;
        for(let i = 0; i < unAssignSaleAttrs.length; i++){
            const unAssignSaleAttr = unAssignSaleAttrs[i];
            if(this.allowMerge(allowAssignSaleMappers, unAssignSaleAttrs.length, i)){
                //暂存进行merge，从此时的i至 最后一层进行合并
                needMergeSaleAttrs.push(unAssignSaleAttr);
                if(!needMegerSaleMapper){
                    needMegerSaleMapper = allowAssignSaleMappers[i];
                }
                continue;
            }
            unAssignSaleAttr.oldPid = unAssignSaleAttr.pid;
            const saleMapper = allowAssignSaleMappers[i];
            unAssignSaleAttr.pid = saleMapper.subItem.name.split("-")[1];
            saleMapper.hadAssign = true;
            saleMapper.saleAttr = unAssignSaleAttr;
            saleMapper.salePid = unAssignSaleAttr.oldPid;
        }
        if(needMergeSaleAttrs.length > 0 && needMegerSaleMapper){
           this.mergeSaleProp(needMergeSaleAttrs, needMegerSaleMapper);
        }
        // 将tb 已经分配的 且不是merge的的pid和value进行映射
        for(const saleMapper of saleMappers){
            if(saleMapper.salePid && saleMapper.mergeSourcePids.length == 0){
                const saleAttr = saleMapper.saleAttr;
                const values = saleAttr?.values;
                if(values && values.length > 0){
                    for(const value of values){
                        const newValue = "-" + value.value;
                        this.putSkuMap(saleMapper.salePid + ":" + value.value, saleMapper.pid + ":" + newValue);
                        value.value = newValue;
                    }
                }
            }
        }
        this.fillSale(doorSkuSaleInfo, saleMappers);
        return saleMappers;
    }
    
    allowMerge(allowAssignSaleMappers : SaleMapper[], unAssignSize : number, unAssignIndex : number) {
        if(allowAssignSaleMappers.length == 1){
            if(allowAssignSaleMappers[0].hadAssign){
                return true;
            }
        }
        if(allowAssignSaleMappers.length < unAssignSize && unAssignIndex + 1 >= allowAssignSaleMappers.length){
            return true;    
        }
        return false;
    }

    containsSaleProp(saleSkus : SalesSku[], salePropPath : string) {
        for(const saleSku of saleSkus){
            if(saleSku.salePropPath.includes(salePropPath)){
                return true;
            }
        }
        return false;
    }
    
    buildSaleProp(saleMappers : SaleMapper[], doorSkuSaleInfo : DoorSkuSaleInfoDTO) {
        const saleProp : {[key: string]: any} = {};
        const salesSkus = doorSkuSaleInfo.salesSkus;
        for(const saleMapper of saleMappers){
            const subItem = saleMapper.subItem;
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                log.warn(`${uiType} 未找到对应的 saleConfig`);
                continue;
            }
            const values = saleMapper.saleAttr?.values || [];
            const newValue : SalesAttrValue[] = [];
            for(const value of values){
                const salePropPath = saleMapper.pid + ":" + value.value;
                if(this.containsSaleProp(salesSkus, salePropPath)){
                    newValue.push(value);
                }
            }
            const saleValue = saleConfig.toSaleValue(newValue, subItem);
            saleProp[saleValue.pidKey] = saleValue.saleProp;
        }
        return saleProp;
    }
    
    sortMergeSaleAttr(salesAttrs : SalesAttr[], saleMapper : SaleMapper) {
        if(saleMapper.hadAssign && saleMapper.saleAttr){
            for(let i = 0; i < salesAttrs.length; i++){
                if(salesAttrs[i].pid == saleMapper.saleAttr.pid){
                     const saleAttr = salesAttrs[i];
                     salesAttrs[i] = salesAttrs[0];
                     salesAttrs[0] = saleAttr;
                }
            }
            return salesAttrs;
        }
    
        let maxLenthIndex : number = -1;
        for(let i = 0; i < salesAttrs.length; i++){
            const saleAttr = salesAttrs[i];
            if(saleAttr.hasImage){
                if(maxLenthIndex == -1 || (salesAttrs[maxLenthIndex].values.length < saleAttr.values.length)){
                    maxLenthIndex = i;
                }
            }
        }
        if(maxLenthIndex != -1){
            const saleAttr = salesAttrs[maxLenthIndex];
            salesAttrs[maxLenthIndex] = salesAttrs[0];
            salesAttrs[0] = saleAttr;
            return salesAttrs;
        }
        for(let i = 0; i < salesAttrs.length; i++){
            const saleAttr = salesAttrs[i];
            if(maxLenthIndex == -1 || (salesAttrs[maxLenthIndex].values.length < saleAttr.values.length)){
                maxLenthIndex = i;
            }
        }
        const saleAttr = salesAttrs[maxLenthIndex];
        salesAttrs[maxLenthIndex] = salesAttrs[0];
        salesAttrs[0] = saleAttr;
        return salesAttrs;
    }
    
    mergeSaleProp(salesAttrs : SalesAttr[], saleMapper : SaleMapper) {
        if(!saleMapper){
            log.warn("未找到需要合并的 saleMapper");
            return undefined;
        }
        log.info("nedd merge saleMapper is ", saleMapper);
        salesAttrs = this.sortMergeSaleAttr(salesAttrs, saleMapper);
        log.info("salesAttrs is need merge ", salesAttrs);
        // Create a new merged values array
        let mergedValues: SalesAttrValue[] = [];
        
        if (salesAttrs.length > 0) {
            if (salesAttrs.length === 1) {
                // If only one attribute, use its values directly
                mergedValues = [salesAttrs[0].values[0]];
            } else {
                // For multiple attributes, create combinations
                mergedValues = this.createCombinations(salesAttrs, saleMapper.pid);
            }
        }
        const mergeSaleAttr = salesAttrs[0];
        // Update the mapper with merged values
        if (mergeSaleAttr) {
            mergeSaleAttr.values = mergedValues;
            mergeSaleAttr.oldPid = mergeSaleAttr.pid;
            mergeSaleAttr.pid = saleMapper.subItem.name.split("-")[1];
            
            // Track all source PIDs that were merged
            for (const saleAttr of salesAttrs) {
                saleMapper.mergeSourcePids.push(saleAttr.pid);
            }
            saleMapper.hadAssign = true;
            saleMapper.saleAttr = mergeSaleAttr;
            saleMapper.salePid = mergeSaleAttr.oldPid;
        }
        return saleMapper;
    }
    
    /**
     * Creates all possible combinations of values from multiple SalesAttr objects
     * Each combination will have text that combines the text from each attribute's values
     * but will preserve the original value and image from the first attribute's values
     */
    createCombinations(salesAttrs: SalesAttr[], newPid : string) {
        if (salesAttrs.length === 0) return [];
        
        // Start with the first attribute's values
        const firstSaleAttr = salesAttrs[0];
        let combinations: SalesAttrValue[] = [...firstSaleAttr.values.map(v => {
            return v;
        })];
        const tempSaleSkuMapper : {[key : string]: any} = {};
        // For each additional attribute, create combinations with existing ones
        let index = 0;
        for (let i = 1; i < salesAttrs.length; i++) {
            const currentAttr = salesAttrs[i];
            const newCombinations: SalesAttrValue[] = [];
            let pid = currentAttr.oldPid;
            if(!pid){
                pid = currentAttr.pid;
            }
            // For each existing combination
            for (const combo of combinations) {
                // For each value in the current attribute
                for (const value of currentAttr.values) {
                    // Create a new combination
                    const newCombo = {...combo};
                    newCombo.text = `${combo.text} + ${value.text}`;
                    const tempValue = `${combo.value}:${value.value}`;
                    if(!tempSaleSkuMapper[tempValue]){
                        newCombo.value = tempValue;
                        tempSaleSkuMapper[tempValue] = {pid : newPid,  newValue : "-" + index}
                        index++;
                        // this.putSkuMap(salePropPath, `${newPid}:${newCombo.value}`)
                    }
                    // We keep the value and image from the first attribute for simplicity
                    // You might want to adjust this logic based on your requirements
                    newCombinations.push(newCombo);
                    index++;
                }
            }
            combinations = newCombinations;
        }
        for(const combo of combinations){
            const salePropPath = combo.value;
            const tempValue = tempSaleSkuMapper[salePropPath]
            if(tempValue){
                combo.value = tempValue.newValue;
            }
            this.putSkuMap(salePropPath, `${newPid}:${combo.value}`)
        }
        log.info("createCombinations is ", combinations);
        log.info("createCombinations skuPropMap is ", this.skuPropMap);
        return combinations;
    }

}

class SaleSkuMapper{

    value : string
    pid : string
    salePropPath : string

    constructor(value : string, pid : string, salePropPath : string) {
        this.value = value;
        this.pid = pid;
        this.salePropPath = salePropPath;
    }

    getSalePropPath() {
        return this.salePropPath;
    }
}



