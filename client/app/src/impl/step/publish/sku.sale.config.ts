import { createSkuMappers } from "@api/sku/sku.api";
import { DoorSkuDTO, DoorSkuSaleInfoDTO, SalesAttr, SalesAttrValue, SalesSku } from "@model/door/sku"
import { SkuMapper } from "@model/sku/sku";
import log from "electron-log";
import { pid, resourceUsage } from "process";
export class SkuSaleConfig {

    uiType : string
    allowInput : boolean
    handlerInput : Function
    buildDefaultSaleAttr : Function

    constructor(uiType : string, allowInput : boolean, handlerInput : Function, buildDefaultSaleAttr : Function) {
        this.uiType = uiType
        this.allowInput = allowInput
        this.handlerInput = handlerInput
        this.buildDefaultSaleAttr = buildDefaultSaleAttr
    }

    public toSaleValue(showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) : SaleConvertValue {
        return this.handlerInput(showUploadImage, salesAttrValues, subItem)
    }

    public buildSaleProp(saleAttr : SalesAttr, subItem : { [key: string]: any }) {
        const salesAttrMap: { [key: string]: SalesAttr } = {};
        const pidKey = subItem.name;
        saleAttr.oldPid = saleAttr.pid;
        saleAttr.pid = pidKey.split("-")[1];
        salesAttrMap[pidKey] = saleAttr;
        return {saleAttr : saleAttr, pidKey : pidKey};
    }

    public buildSalesAttr(subItem : { [key: string]: any }) : SalesAttr {
        return this.buildDefaultSaleAttr(subItem);
    }

}

const saleConfigMap : { [key: string]: SkuSaleConfig } = {
    "newColorSelect": new SkuSaleConfig("newColorSelect",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerImage(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) : SalesAttr => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "checkboxSaleProps": new SkuSaleConfig("checkboxSaleProps",false, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerCheckbox(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "sizeSaleProps": new SkuSaleConfig("sizeSaleProps",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerSize(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "comboboxSaleProps": new SkuSaleConfig("comboboxSaleProps",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerImage(salesAttrValues, subItem, showUploadImage)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByComboboxSaleProps(subItem);
    }),
    // "newMeasurement": new SkuSaleConfig("newMeasurement",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
    //     return handlerNewMeasurement(salesAttrValues, subItem)
    // }, (subItem : { [key: string]: any }) => {
    //     return new SalesAttr(subItem.label, [], "", "", "", subItem.name);
    // }),
    "checkbox" : new SkuSaleConfig("checkbox",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerCheckbox(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return buildDefaultByDataSourceList(subItem);
    }),
    "input" : new SkuSaleConfig("input",true, (showUploadImage : boolean, salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }) => {
        return handlerInput(salesAttrValues, subItem)
    }, (subItem : { [key: string]: any }) => {
        return new SalesAttr(subItem.label, [], "", "", "", subItem.name);
    })
}

function buildDefaultByComboboxSaleProps(subItem : { [key: string]: any }) {
    let saleProp : SalesAttrValue[] = [];
    const label = subItem.label;
    if(label == "尺码"){
        saleProp.push(new SalesAttrValue("其他", "10122","",""))
        return new SalesAttr(subItem.label, saleProp, "false", "", "", subItem.name.split("-")[1]);
    }
    const dataSource = subItem.dataSource;
    if(dataSource && dataSource.length > 0){
        const dataSourceFirst = dataSource[0];
        saleProp.push(new SalesAttrValue(dataSourceFirst.text, dataSourceFirst.value,"",""))
    }
    return new SalesAttr(subItem.label, saleProp, "false", "", "", subItem.name.split("-")[1]);
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

function handlerImage(salesAttrValues : SalesAttrValue[], subItem : { [key: string]: any }, showUploadImage : boolean = true) {
    const saleProp = salesAttrValues.map(item => {
        const value : {[key: string]: any} = {
            "text": item.text,
            "value": item.value,
        }
        if(showUploadImage){
            value.img = item.image;
            value.pix = "800x800";
        }
        return value;
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
   hadImage : boolean
   mergeSourcePids : string[] = []

   constructor(saleAttr : SalesAttr | undefined, subItem : { [key: string]: any }, salePid : string|null, hadAssign : boolean = false, hadImage : boolean = false) {
        this.saleAttr = saleAttr;
        this.subItem = subItem;
        this.pid = this.subItem.name.split("-")[1];
        this.salePid = salePid;
        this.hadAssign = hadAssign;
        this.hadImage = hadImage;
   }
}

export class RebuildSalePro{
    skuPropMap : {[key : string]:any} = {}
    skuProps : {[key : string]:any}
    skuId : string

    constructor(skuId : string){
        this.skuPropMap = {}
        this.skuProps = {}
        this.skuId = skuId
    }

    putSkuMap(oriMap : string, nowMap : any){
        this.skuPropMap[oriMap] = nowMap;
    }

    matchSaleMapper(salesAttrs : { [key: string]: SalesAttr }, subItem: { [key: string]: any }, imageFlag : boolean) {
        for(const key in salesAttrs){
            const saleAttr = salesAttrs[key];
            if(!saleAttr){
                continue;
            }
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            const label = subItem.label;
            const pddLable = saleAttr.label;
            if(pddLable == label || label.includes(pddLable) || pddLable.includes(label)){
                const saleProp = saleConfig.buildSaleProp(saleAttr, subItem);
                return new SaleMapper(saleProp.saleAttr, subItem, saleProp.saleAttr.oldPid, true, imageFlag);
            }
        }
        return undefined;
    }
    
    hadImageByAssignMapper(saleMappers : SaleMapper[]) {
        for(const saleMapper of saleMappers){
            if(saleMapper.hadAssign){
                if(saleMapper.hadImage){
                    return true;
                }
            }
        }
        return false;
    }

    getAllowAssignSaleMappers(saleMappers : SaleMapper[], unAssignSaleAttrs : SalesAttr[]) {
        let allowSaleMappers : SaleMapper[] = [];
        for(const saleMapper of saleMappers){
            if(saleMapper.hadAssign){
                continue;
            }
            const subItem = saleMapper.subItem;
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                continue;
            }
            if(saleConfig.allowInput && !subItem.showUploadImage){
                allowSaleMappers.push(saleMapper);
            }
        }
        if(allowSaleMappers.length >= unAssignSaleAttrs.length){
            //如果大于等于未分配的属性数量，则需要重新分配，因为此时没有选择有图片
            allowSaleMappers = [];
        }
        for(const saleMapper of saleMappers){
            if(saleMapper.hadAssign){
                continue;
            }
            const subItem = saleMapper.subItem;
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                continue;
            }
            if(saleConfig.allowInput && subItem.showUploadImage){
                allowSaleMappers.push(saleMapper);
            }
        }
        if(allowSaleMappers.length > unAssignSaleAttrs.length){
            allowSaleMappers = allowSaleMappers.slice(0, unAssignSaleAttrs.length);
            return allowSaleMappers;
        }
        if(allowSaleMappers.length == 0){
            for(const saleMapper of saleMappers){
                if(!saleMapper.hadAssign){
                    continue;
                }
                const subItem = saleMapper.subItem;
                const uiType = subItem.uiType;
                const saleConfig = saleConfigMap[uiType];
                if(!saleConfig){
                    continue;
                }
                if(saleConfig.allowInput && subItem.showUploadImage){
                    allowSaleMappers.push(saleMapper);
                    return allowSaleMappers;
                }
            }
        }

        return allowSaleMappers;
    }
    
    
    async fillSale(doorSkuSaleInfo : DoorSkuSaleInfoDTO, saleMappers : SaleMapper[]) {
        this.fillSaleAttrs(doorSkuSaleInfo, saleMappers);
        await this.fillSaleSku(doorSkuSaleInfo, saleMappers);
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
    
    async fillSaleSku(doorSkuSaleInfo : DoorSkuSaleInfoDTO, saleMappers : SaleMapper[]) {
        const saleSkus : SalesSku[] = doorSkuSaleInfo.salesSkus;
        const newSaleSkuMap :SalesSku[] = [];
        const skuMappers : SkuMapper[] = [];
        for(const saleSku of saleSkus){
           const salePropPath = saleSku.salePropPath;
           const newSalePropPath = this.getNewSalePropPath(salePropPath, saleMappers);
           if(newSalePropPath && newSalePropPath.length > 0){
                skuMappers.push(new SkuMapper(undefined, this.skuId, salePropPath, newSalePropPath));
                saleSku.salePropPath = newSalePropPath;
                newSaleSkuMap.push(saleSku);
           }
        }
        await createSkuMappers(skuMappers);
        doorSkuSaleInfo.salesSkus = newSaleSkuMap;
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
               if(!salePropPath.includes(":" + keyValue)){
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
                    newSalePropPath = newSalePropPath + ";" + saleMapper.pid + ":" +values[0].value;
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


    async fixAndAssign(doorSkuSaleInfo : DoorSkuSaleInfoDTO, subItems : { [key: string]: any }) {
        const salesAttrs = doorSkuSaleInfo.salesAttr;
        const saleMappers : SaleMapper[] = [];
        let hadImageSaleMapper = false;
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
            if(subItem.showUploadImage){
                hadImageSaleMapper = true;
            }
            const saleMapper = this.matchSaleMapper(salesAttrs, subItem, subItem.showUploadImage);
            if(saleMapper){
                saleMappers.push(saleMapper);
            }
        }
        const unAssignSaleAttrs = this.getUnAssignSaleAttrs(saleMappers, salesAttrs);
        log.info("unAssignSaleAttrs is ", unAssignSaleAttrs);

        //如果saleMappers 中没有包含图片的分类，要重新分配有图片的分类
        const allowAssignSaleMappers = this.getAllowAssignSaleMappers(saleMappers, unAssignSaleAttrs);
        log.info("allowAssignSaleMappers is ", allowAssignSaleMappers);
        if(allowAssignSaleMappers.length == 0){
            log.warn(`未找到能分配的 subItem`);
            return [];
        }
        const needMergeSaleAttrs : SalesAttr[] = [];
        let needMegerSaleMapper = undefined;
        for(let i = 0; i < unAssignSaleAttrs.length; i++){
            const unAssignSaleAttr = unAssignSaleAttrs[i];
            if(this.allowMerge(allowAssignSaleMappers, unAssignSaleAttrs.length, i)){
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
        log.info("needMergeSaleAttrs is ", needMergeSaleAttrs);
        if(needMergeSaleAttrs.length > 0 && needMegerSaleMapper){
           this.mergeSaleProp(needMergeSaleAttrs, needMegerSaleMapper);
        }
        // 将tb 已经分配的 且不是merge的的pid和value进行映射
        for(const saleMapper of saleMappers){
            if(!saleMapper.hadAssign){
                continue;
            }
            const saleAttr = saleMapper.saleAttr;
            const values = saleAttr?.values;
            if(values && values.length > 0){
                for(const value of values){
                    if(value.value.startsWith("-")){
                        continue;
                    }
                    const newValue = "-" + value.value;
                    this.putSkuMap(value.value, saleMapper.pid + ":" + newValue);
                    value.value = newValue;
                }
            }
        }

        for(const key in subItems){
            const subItem = subItems[key];
            if(!subItem){
                continue;
            }
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                continue;
            }
            if(subItem.required){
                if(!this.isAssignRequired(saleMappers, subItem)){
                    const saleValue = saleConfig.buildSalesAttr(subItem);
                    log.info("saleValue is ", saleValue)
                    saleMappers.push(new SaleMapper(saleValue, subItem, null, true, false))
                }
            }
        }
        await this.fillSale(doorSkuSaleInfo, saleMappers);
        return saleMappers;
    }

    isAssignRequired(saleMappers : SaleMapper[], subItem : { [key: string]: any }) {
        for(const saleMapper of saleMappers){
            if(saleMapper.pid == subItem.name.split("-")[1]){
                return true;
            }
        }
        return false;
    }
    
    allowMerge(allowAssignSaleMappers : SaleMapper[], unAssignSize : number, unAssignIndex : number) {
        if(allowAssignSaleMappers.length == 1){
            return true;
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
            log.info("saleMapper is ", JSON.stringify(saleMapper));
            if(!saleMapper.hadAssign){
                continue;
            }
            const subItem = saleMapper.subItem;
            const uiType = subItem.uiType;
            const saleConfig = saleConfigMap[uiType];
            if(!saleConfig){
                log.warn(`${uiType} 未找到对应的 saleConfig`);
                continue;
            }
            // log.info("uiType is ", uiType);
            const values = saleMapper.saleAttr?.values || [];
            const newValue : SalesAttrValue[] = [];
            for(const value of values){
                const salePropPath = saleMapper.pid + ":" + value.value;
                // 去除没有库存的商品
                if(this.containsSaleProp(salesSkus, salePropPath)){
                    newValue.push(value);
                }
                if(!subItem.showUploadImage){
                    value.image = "";
                }
            }
            const saleValue = saleConfig.toSaleValue(subItem.showUploadImage, newValue, subItem);
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
        salesAttrs = this.sortMergeSaleAttr(salesAttrs, saleMapper);
        // Create a new merged values array
        let mergedValues: SalesAttrValue[] = [];
        
        if (salesAttrs.length > 0) {
            if (salesAttrs.length === 1) {
                // If only one attribute, use its values directly
                mergedValues = salesAttrs[0].values;
            } else {
                // For multiple attributes, create combinations
                mergedValues = this.createCombinations(salesAttrs, saleMapper.pid, saleMapper.subItem.maxCustomItems);
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
    createCombinations(salesAttrs: SalesAttr[], newPid : string, maxCustomItems : number) {
        if (salesAttrs.length === 0) return [];
        
        // Start with the first attribute's values
        const firstSaleAttr = salesAttrs[0];
        let combinations: SalesAttrValue[] = [...firstSaleAttr.values.map(v => {
            
            return v;
        })];
        const tempSaleSkuMapper : {[key : string]: any} = {};
        // For each additional attribute, create combinations with existing ones
        let index = 1;
        for (let i = 1; i < salesAttrs.length; i++) {
            const currentAttr = salesAttrs[i];
            const newCombinations: SalesAttrValue[] = [];
            let pid = currentAttr.oldPid;
            if(!pid){
                pid = currentAttr.pid;
            }
            let currentPid = currentAttr.pid;
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
        if(combinations.length > maxCustomItems ){
            combinations = combinations.slice(0, maxCustomItems);
        }
        for(const combo of combinations){
            const salePropPath = combo.value;
            const tempValue = tempSaleSkuMapper[salePropPath]
            if(tempValue){
                combo.value = tempValue.newValue;
            }
            this.putSkuMap(salePropPath, `${newPid}:${combo.value}`)
        }
        return combinations;
    }

}



