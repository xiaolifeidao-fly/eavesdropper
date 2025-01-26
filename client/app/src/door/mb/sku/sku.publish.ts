import { MbShopDetailMonitorChain, MbSkuPublishDraffMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbEngine } from "../mb.engine";
import { Page } from "playwright";
import { DoorEngine } from "@src/door/engine";
import { DoorEntity } from "@src/door/entity";
import axios from "axios";
import { DoorSkuDTO, SalesAttr, SkuItem } from "@model/door/sku";
import { SkuFile, SkuFileDetail } from "@model/sku/sku.file";
import { getSkuDraft, activeSkuDraft, expireSkuDraft } from "@api/sku/sku.draft";


function handlerPeriod(dataSource: { [key: string]: any }[], catValue: string){
    const first = dataSource[0];
    if(!first){
        return undefined;
    }
    const text = first.text;
    const numbers = text.match(/\d+/g); // 提取所有数字
    
    if(text.includes("天") && catValue.includes("天")){
        for(const data of dataSource){
            if(data.text == catValue){
                return {
                    value: data.value,
                    text: data.text
                }
            }
        }
        return undefined;
    }
    if(text.includes("月") && catValue.includes("月")){
        for(const data of dataSource){
            if(data.text == catValue){
                return {
                    value: data.value,
                    text: data.text
                }
            }
        }
        return undefined;
    }
    return undefined;
}

const specialCatProHandler: { [key: string]: (dataSource: { [key: string]: any }[], catValue: string) => any } = {
    "保质期": handlerPeriod
}


// 代理设置

function splitArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        let end = i + size;
        if(end > array.length){
            end = array.length;
        }
        result.push(array.slice(i, end));
    }
    return result;
}

async function doAction(page: Page, ...doActionParams: any[]) {
    await page.waitForTimeout(1000);
    await confirmProtocol(page);
    const imageFileList = doActionParams[0];
    const skuDraftId = doActionParams[1];
    if (!skuDraftId) {
        if(imageFileList.length <= 20){
            await fillDetailImage(page, imageFileList);
        }else{
            const splitImageFileList = splitArray(imageFileList, 20);
            for(const imageFileList of splitImageFileList){
                await fillDetailImage(page, imageFileList);
            }
        }
    }
    await clickSaveDraf(page);
}

//协议
async function confirmProtocol(page: Page) {
    try {
        await page.waitForTimeout(1000);
        const protocolButtonElement = await page.evaluate(() => {
            //@ts-ignore
            const doc = document.querySelectorAll(".next-dialog-btn");
            if(!doc || doc.length == 0){
                return false;
            }
            return true;
        });
        if(!protocolButtonElement){
            console.log("protocolButton not found");
            return;
        }
        const protocolButton = await page.locator(".next-dialog-btn");
        await protocolButton.first().click();
    } catch (e) {
        console.log("confirmProtocol error", e);
    }
}

async function fillDetailImage(page: Page, imageFileList: SkuFileDetail[]) {
    if (imageFileList.length == 0) {
        return false;
    }
    // 获取详情图
    const detailImages = imageFileList.filter(file => file.fileName?.includes("detail"));
    const detailImageButton = page.locator(".buttonText--EU7NI").first();
    if (!detailImageButton) {
        console.log("detailImageButton not found");
        return false;
    }
    await detailImageButton.click();
    await page.waitForTimeout(2000);
    const imageFrame = await getFrame(page, "app/crs-qn/sucai-selector-ng/index");
    if (!imageFrame) {
        console.log("imageFrame not found");
        return false;
    }
    const imageSearchInput = await imageFrame.locator(".next-search-input input").first();
    if (!imageSearchInput) {
        console.log("imageSearchInput not found");
        return false;
    }
    console.log("imageSearchInput ", await imageSearchInput.getAttribute("role"))
    const detailImage = detailImages[0];
    const fileName = detailImage.fileName;
    if (!fileName) {
        console.log("fileName not found");
        return false;
    }
    const requestPromise = page.waitForResponse(response =>
        response.request().url().includes("mtop.taobao.picturecenter.console.file.query"),
        { timeout: 10000 }
    );

    const imageName = fileName.substring(0, fileName.lastIndexOf("_"));
    console.log("imageName ", imageName);
    await imageSearchInput.fill(imageName);
    const imageSearchButton = await imageFrame.locator(".next-input-inner.next-after i").first();
    if (!imageSearchButton) {
        console.log("imageSearchButton not found");
        return false;
    }
    await imageSearchButton.click();
    const result = await requestPromise.catch(() => null);
    if(!result){
        console.log("search result error")
        return false;
    }
    await page.waitForTimeout(1000);
    console.log("search click success")
    detailImages.sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
    const imageCheckboxs = await imageFrame.locator(".PicList_pic_background__pGTdV").all();
    if (!imageCheckboxs) {
        console.log("imageCheckboxs not found");
        return false;
    }
    for (const detailImage of detailImages) {
        for (const imageCheckbox of imageCheckboxs) {
            const checkBox = await imageCheckbox.locator("input").first();
            const fileId = await checkBox.getAttribute("value");
            if (fileId == String(detailImage.itemFileId)) {
                await imageCheckbox.hover({ force: true });
                await page.waitForTimeout(10);
                await checkBox.click();
            }
        }
    }
    const imageConfirmButton = await imageFrame.locator(".Footer_selectOk__nEl3N").first();
    if (!imageConfirmButton) {
        console.log("imageConfirmButton not found");
        return false;
    }
    await imageConfirmButton.click();
    await page.waitForTimeout(3000);
    return true;
}


async function getFrame(page: Page, frameName: string) {
    const frame = await page.mainFrame();
    for (const child of frame.childFrames()) {
        if (child.url().includes(frameName)) {
            return child;
        }
    }
    return undefined;
}

export async function getSkuDraftIdFromDB(resourceId: number, skuItemId: string) {
    const skuDraft = await getSkuDraft(resourceId, skuItemId);
    if (!skuDraft) {
        return undefined;
    }
    if (skuDraft.status == "active") {
        return skuDraft.skuDraftId;
    }
    return undefined;
}

function getPublishUrl(skuDraftId: string | undefined, itemId: string) {
    if (!skuDraftId) {
        return "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
    }
    return "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + skuDraftId;
}

export async function publishFromTb(imageFileList: SkuFileDetail[], skuItem: DoorSkuDTO, resourceId: number, itemId: string) {
    const mbEngine = new MbEngine(resourceId);
    try {
        const page = await mbEngine.init();
        if (!page) {
            return false;
        }
        // 发布商品url
        const skuDraftId = await getSkuDraftIdFromDB(resourceId, itemId);
        const url = getPublishUrl(skuDraftId, itemId);
        const result = await mbEngine.openWaitMonitor(page, url, new MbSkuPublishDraffMonitor(), {}, doAction, imageFileList, skuDraftId);
        if (!result) {
            return false;
        }
        const publishResult = await publishSkuByDoor(imageFileList, resourceId, skuDraftId, skuItem, result, page);
        if (publishResult) {
            await expireSkuDraft(resourceId, itemId);
        }
        return publishResult;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        // await mbEngine.closePage();
    }
}

async function getCategoryInfo(categoryCode: string, result: DoorEntity<any>, catId: string, startTraceId: string, itemId: string, categoryKeyword: string) {
    const requestHeader = result.getHeaderData();
    requestHeader['content-type'] = "application/x-www-form-urlencoded";
    requestHeader['origin'] = "https://item.upload.taobao.com";
    requestHeader['referer'] = "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
    const requestData = {
        keyword: categoryKeyword,
        pid: categoryCode,
        queryType: "query",
        globalExtendInfo: JSON.stringify({
            startTraceId: startTraceId
        })
    }
    const response = await axios.post("https://item.upload.taobao.com/sell/v2/asyncOpt.htm?optType=taobaoBrandQuery&queryType=query&catId=" + catId, requestData, {
        headers: requestHeader,
    });
    const data = response.data;
    if (!data.success || !data.data.success) {
        return undefined;
    }
    const dataSource = data.data.dataSource;
    if (!dataSource || dataSource.length == 0) {
        return undefined;
    }
    return dataSource[0];
}

function getStartTraceId(commonData: { data: any }) {
    try {
        const startTraceId = commonData.data.components.fakeCredit.props.icmp.global.value.frontDataLog.traceId;
        return startTraceId;
    } catch (e) {
        return undefined;
    }
}


function getSkuDraftIdFromData(skuItemId: string | undefined, result: DoorEntity<any>) {
    if (skuItemId) {
        return skuItemId;
    }
    return String(result.data.dbDraftId);
}
async function activeDraft(resourceId: number, skuItemId: string, skuDraftId: string) {
    await activeSkuDraft({
        id: undefined,
        status: "ACTIVE",
        resourceId: resourceId,
        skuItemId: skuItemId,
        skuDraftId: skuDraftId
    });
}

async function publishSkuByDoor(imageFileList: SkuFileDetail[], resourceId: number, skuDraftId: string | undefined, skuItem: DoorSkuDTO, result: DoorEntity<any>, page: Page) {
    const newSkuDraftId = getSkuDraftIdFromData(skuDraftId, result);
    if (!newSkuDraftId) {
        console.log("newSkuDraftId not found ", newSkuDraftId);
        return false;
    }
    await activeDraft(resourceId, skuItem.baseInfo.itemId, newSkuDraftId);
    const commonData = await getCommonData(page);
    if (!commonData) {
        console.log("commonData not found ", commonData);
    }
    const csrfToken = commonData.csrfToken;
    if (!csrfToken) {
        console.log("csrfToken not found ", csrfToken);
        return false;
    }
    const startTraceId = getStartTraceId(commonData);
    if (!startTraceId) {
        console.log("startTraceId not found ", startTraceId);
        return false;
    }
    const catId = getCatIdFromUrl(result);
    if (!catId) {
        console.log("catId not found ", catId);
        return false;
    }
    const draftData = JSON.parse(result.requestBody.jsonBody);
    fixSaleProp(commonData, skuItem);
    await fillTiltle(skuItem, draftData);
    await fillCategoryList(skuItem, draftData, commonData, result, catId, startTraceId);
    await fillPropExt(commonData, skuItem, draftData);
    await fillMainImage(imageFileList, draftData);
    await fillSellInfo(commonData, skuItem, draftData);
    const updateResult = await updateDraftData(catId, newSkuDraftId, result, startTraceId, draftData);
    if (!updateResult) {
        console.log("updateDraftData failed ", updateResult);
        return false;
    }
    const publishResult = await clickPublishButton(page, newSkuDraftId);
    if (!publishResult) {
        console.log("clickPublishButton failed ", publishResult);
        return false;
    }
    console.log("publishResult success ");
    const deleteResult = await deleteDraft(result, catId, newSkuDraftId, startTraceId);
    if (!deleteResult) {
        console.log("deleteDraft failed ", deleteResult);
        return false;
    }
    return true;
}

function getCatIdFromUrl(result: DoorEntity<any>) {
    const requestUrl = result.getUrl();
    const urlObj = new URL(requestUrl);
    const urlParams = new URLSearchParams(urlObj.search);
    return urlParams.get("catId");
}

async function deleteDraft(result: DoorEntity<any>, catId: string, draftId: string, startTraceId: string) {
    const requestHeader = result.getHeaderData();
    const url = "https://item.upload.taobao.com/sell/draftOp/delete.json?catId=" + catId + "&dbDraftId=" + draftId;
    const data = {
        "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
    };

    const res = await axios.post(url, data, {
        headers: requestHeader
    })
    if (!res.data || (typeof (res.data) == 'string' && res.data == '')) {
        console.log("delete draft res is empty", res.data);
        return false;
    }
    if (!res.data.success) {
        console.log("delete draft res is not success ", res.data);
        return false;
    }
    return true;
}


function getCatPro(skuItem: SkuItem, catProps: any) {
    const value = skuItem.text;
    if (!value || value.length == 0) {
        return undefined;
    }
    for (const catProp of catProps) {
        const lable = catProp.label;
        if (lable == skuItem.value) {
            return catProp;
        }
    }
    return undefined;
}

async function switchCatPropValue(proKey: string, dataSource: { [key: string]: any }[], value: string[], result: DoorEntity<any>, catId: string, startTraceId: string, skuItem: DoorSkuDTO) {
    // const newValues: { value: string, text: string }[] = [];
    let newValues: any = {};
    for (const catValue of value) {
        let hasFound = false;
        for (const data of dataSource) {
            if (data.text == catValue) {
                hasFound = true;
                newValues = {
                    value: data.value,
                    text: data.text
                }
            }
        }
        if (!hasFound) {
            const categoryInfo = await getCategoryInfo(proKey, result, catId, startTraceId, skuItem.baseInfo.itemId, catValue);
            if (categoryInfo) {
                newValues = {
                    value: categoryInfo.value,
                    text: categoryInfo.text
                };
            }else{
                newValues = {
                    value: -1,
                    text: catValue
                };
            }
        
        }
    }
    return newValues;
}

async function fillCategoryList(skuItemDTO: DoorSkuDTO, draftData: { [key: string]: any }, commonData: { [key: string]: any }, result: DoorEntity<any>, catId: string, startTraceId: string) {
    const excludeList = [""];
    const skuItems = skuItemDTO.baseInfo.skuItems;
    const newCatProp = draftData.catProp;
    const catProps = commonData.data.models.catProp.dataSource;
    for (const skuItem of skuItems) {
        const catProp = getCatPro(skuItem, catProps);
        if (!catProp) {
            continue;
        }
        const key = catProp.name;
        if (excludeList.includes(key)) {
            delete newCatProp[key];
            continue;
        }
        const value = skuItem.text;
        if (key in newCatProp) {
            const newCatValue = newCatProp[key];
            if (!("dataSource" in catProp)) {
                if (!newCatValue || newCatValue.length == 0) {
                    newCatProp[key] = value[0];
                    continue;
                }
            }
            if (newCatValue && newCatValue.length > 0) {
                continue;
            }
        }
        console.log("catProp is ", catProp);
        if (!("dataSource" in catProp)) {
            newCatProp[key] = value[0];
            console.log("dataSource not found in catProp is ", newCatProp[key]);
            continue;
        }
        //特殊处理
        if(catProp.label in specialCatProHandler){
            const newValues = specialCatProHandler[catProp.label](catProp.dataSource, value[0]);
            if(newValues){
                newCatProp[key] = newValues;
                continue;
            }
            continue;
        }
        const dataSource = catProp.dataSource;
        const switchValues = await switchCatPropValue(key, dataSource, value, result, catId, startTraceId, skuItemDTO);
        newCatProp[key] = switchValues
    }
    draftData.catProp = newCatProp;
}

function getSkuPropFromDefault(props: { [key: string]: any }){
    const defaultProps : { [key: string]: any } = {"barcode": "0000000000000"};
    if (props.name in defaultProps){
        return defaultProps[props.name];
    }
    return undefined;
}   

function getAndSortImage(imageFileList: SkuFileDetail[], type: string) {
    // 获取主图 并排序
    const mainImages = imageFileList.filter(file => file.fileName?.includes(type));
    mainImages.sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
    return mainImages;
}

async function fillMainImage(imageFileList: SkuFileDetail[], draftData: { mainImagesGroup: { images: { url: string, pix: string }[] } }) {
    const mainImages = getAndSortImage(imageFileList, "main");
    const mainImageList: { url: string, pix: string }[] = [];
    for (const file of mainImages) {
        let url = file.fileUrl;
        if (!url) {
            url = "";
        }
        mainImageList.push({
            url: url,
            pix: "800x800",
        })
    }
    draftData.mainImagesGroup = {
        images: mainImageList
    }
}

function getSkuProType(commonData: { data: any }, skuItem: DoorSkuDTO) {
    try {
        const salePropSubItems = commonData.data.components.saleProp.props.subItems;
        const saleProp = skuItem.doorSkuSaleInfo.salesAttr;
        for (const key in saleProp) {
            const salePropItem = saleProp[key];
            if (!salePropItem) {
                continue;
            }
            const pid = "p-" + salePropItem.pid;
            if (!(pid in salePropSubItems)) {
                continue;
            }
            const salePropSubItem = salePropSubItems[pid];
            const subItems = salePropSubItem.subItems;
            if (!subItems || subItems.length == 0) {
                continue;
            }
            const firstSubItem = subItems[0];

            const selectSubItem = choseSubItem(subItems, salePropItem);
            if (selectSubItem) {
                const nameKey = selectSubItem.name;
                const dataSources = selectSubItem.dataSource;
                for (const dataSource of dataSources) {
                    if (dataSource.subName == nameKey) {
                        return {
                            nameKey: firstSubItem.name,
                            value: dataSource
                        }
                    }
                }
            }
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
}

function getRealValue(dataSource: { [key: string]: any }[], value: string) {
    for (const data of dataSource) {
        for(const key in data) {
            const subItemValues = data[key];
            if (!subItemValues || !Array.isArray(subItemValues)) {
                continue;
            }
            for (const subItemValue of subItemValues) {
                if (value == subItemValue.value) {
                    return value;
                }
            }
        }
    }
    return String(-Number(value));
}

function getFixValue(salePropSubItem: { [key: string]: any }, value: string) {
    const subItems = salePropSubItem.subItems;
    if (!subItems || subItems.length == 0) {
        if ('dataSource' in salePropSubItem) {
            const dataSource = salePropSubItem.dataSource;
            return getRealValue(dataSource, value);
        }
        return value;
    }
    for (const subItem of subItems) {
        const dataSource = subItem.dataSource;
        if (dataSource.length == 0) {
            continue;
        }
        return getRealValue(dataSource, value);
    }
    return value;
}

function fixSaleProp(commonData: { data: any }, skuItem: DoorSkuDTO) {
    const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;
    const salePropSubItems = commonData.data.components.saleProp.props.subItems;
     for (let key in salesAttrs) {
        const salesAttr = salesAttrs[key];
        if (!salesAttr) {
            continue;
        }
        console.log("fixSaleProp key is ", key);
        const salesAttrValues = salesAttr.values;
        if (!(key in salePropSubItems)) {
            continue;
        }
        const salePropSubItem = salePropSubItems[key];
        if ('subItems' in salePropSubItem) {
            salesAttr.isSaleAddValues = true;
        }
        for (let salesAttrValue of salesAttrValues) {
            salesAttrValue.value = getFixValue(salePropSubItem, salesAttrValue.value);
        }
    }
    const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
    for(let saleSku of salesSkus) {
        const salePropPath = saleSku.salePropPath;
        const saleProps = salePropPath.split(";");
        const salePropKey = [];
        for (const saleProp of saleProps) {
            const salePropIds = saleProp.split(":");
            const key = "p-" + salePropIds[0];
            const salePropSubItem = salePropSubItems[key];
            const newValue = getFixValue(salePropSubItem, salePropIds[1]);
            salePropKey.push(salePropIds[0] + ":" + newValue);
        }
        saleSku.salePropPath = salePropKey.join(";");
    }
}

function choseSubItem(subItems: { [key: string]: any }[], salesAttr: SalesAttr) {
    for (const subItem of subItems) {
        for (const key in subItem.dataSource) {
            const subItemValues = subItem[key];
            console.log("subItemValues ", subItemValues);
            if (!subItemValues || !Array.isArray(subItemValues)) {
                continue;
            }
            for (const subItemValue of subItemValues) {
                const values = salesAttr.values;
                for (const value of values) {
                    if (value.value == subItemValue.value) {
                        return subItem;
                    }
                }
            }
        }
    }
    return undefined;

}

async function fillSellProp(commonData: { data: any }, skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
    const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;
    const salePropInfo: { [key: string]: any } = {};
    for (let key in salesAttrs) {
        const salesAttr = salesAttrs[key];
        if (!salesAttr) {
            continue;
        }
        const salePros: { [key: string]: any }[] = [];
        const salesAttrValues = salesAttr.values;
        for (let salesAttrValue of salesAttrValues) {
            const salePro: { [key: string]: any } = {
                value: salesAttrValue.value,
                text: salesAttrValue.text,
            }
            if (salesAttr.hasImage == 'true') {
                salePro['pix'] = "800x871";
                salePro['img'] = salesAttrValue.image;
            }
            salePros.push(salePro);
        }
        const salePropValue: { [key: string]: any } = {
            value: salePros
        }
        if(salesAttr.isSaleAddValues){
            salePropInfo[key] = salePropValue;
        } else {
            salePropInfo[key] = salePros;
        }
    }
    draftData.saleProp = salePropInfo;
}

async function fillTiltle(skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
    const title = skuItem.baseInfo.title;
    draftData.title = title;
}

function buildSalePros(sellPropPath: string, skuItem: DoorSkuDTO) {
    const saleItems: { [key: string]: any }[] = [];
    const saleProps = sellPropPath.split(";")
    for (const saleProp of saleProps) {
        const salePropIds = saleProp.split(":");
        const saleParentId = salePropIds[0];
        const salePropId = salePropIds[1];
        const saleItem = buildSaleItem(saleParentId, salePropId, skuItem);
        if (saleItem) {
            saleItems.push(saleItem);
        }
    }
    return saleItems;
}

function buildSalePropKey(salePropPath: string) {
    const saleProps = salePropPath.split(";");
    const salePropKey = [];
    for (const saleProp of saleProps) {
        const salePropIds = saleProp.split(":");
        salePropKey.push(salePropIds[0] + "-" + salePropIds[1]);
    }
    return salePropKey.join("_");
}

function buildSaleItem(saleParentId: string, salePropId: string, skuItem: DoorSkuDTO) {
    const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr["p-" + saleParentId];
    const saleProps = salesAttrs.values;
    const saleItem: { [key: string]: any } = {};
    for (const saleProp of saleProps) {
        if (saleProp.value == salePropId) {
            saleItem["name"] = "p-" + saleParentId;
            saleItem["value"] = salePropId;
            saleItem["text"] = saleProp.text;
            if (salesAttrs.hasImage == 'true') {
                saleItem["pix"] = "800x871";
                saleItem["img"] = saleProp.image;
            }
            saleItem["label"] = salesAttrs.label;
            return saleItem;
        }
    }
    return undefined;
}

async function fillSellSku(skuItem: DoorSkuDTO, draftData: { price: string, quantity: string, sku: { [key: string]: any }[] }) {
    const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
    const skuList: { [key: string]: any }[] = [];
    let quantity = 0;
    let minPrice = 0;
    for (const sale of salesSkus) {
        quantity += Number(sale.quantity);

        if (minPrice == 0 || Number(sale.price) < minPrice) {
            minPrice = Number(sale.price);
        }
        skuList.push({
            cspuId: 0,
            skuPrice: sale.price,
            skuBatchInventory: null,
            action: { selected: true },
            skuId: null,
            skuStatus: 1,
            skuStock: Number(sale.quantity),
            skuQuality: { value: "mainSku", text: "单品", prefilled: true, prefilledText: { bottom: "<span style='color:#ff6600'>请确认分类</span>" } },
            skuDetail: [],
            skuCustomize: {
                "text": "否",
                "value": 0
            },
            disabled: false,
            props: buildSalePros(sale.salePropPath, skuItem),
            salePropKey: buildSalePropKey(sale.salePropPath),
            errorInfo: {},
            skuSpecification: null,
            skuTitle: null
        })
    }
    if (minPrice > 0) {
        draftData.price = minPrice.toString();
    }
    if (quantity > 0) {
        draftData.quantity = quantity.toString();
    }
    draftData.sku = skuList;

}

async function fillSellInfo(commonData: { data: any }, skuItem: DoorSkuDTO, draftData: { price: string, quantity: string, sku: { [key: string]: any }[], saleProp: { [key: string]: { [key: string]: any }[] } }) {
    draftData.price = skuItem.doorSkuSaleInfo.price;
    draftData.quantity = skuItem.doorSkuSaleInfo.quantity;
    await fillSellProp(commonData, skuItem, draftData);
    await fillSellSku(skuItem, draftData);
}

async function updateDraftData(catId: string, draftId: string, result: DoorEntity<any>, startTraceId: string, draftData: {}) {
    const requestHeader = result.getHeaderData();
    const url = "https://item.upload.taobao.com/sell/draftOp/update.json?catId=" + catId;
    const data = {
        "id": draftId,
        "dbDraftId": draftId,
        "jsonBody": JSON.stringify(draftData),
        "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
    };

    const res = await axios.post(url, data, {
        headers: requestHeader
    })
    if (!res.data || (typeof (res.data) == 'string' && res.data == '')) {
        console.log("res is empty", res.data);
        return false;
    }
    if (!res.data.success) {
        console.log("res is not success ", res.data);
        return false;
    }
    console.log("draftData is ", JSON.stringify(draftData));
    return true;
}

function convertDateFormat(str: string) {
    // 正则表达式提取出 "YYYY年MM月DD日" 这样的日期
    const match = str.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month}-${day}`; // 返回 "YYYY-MM-DD" 格式
    }
    return null; // 如果没有匹配到日期，返回 null
}

function getPropValue(props: { [key: string]: any }, skuItem: DoorSkuDTO) {
    const fieldLabel = props.label;
    const fieldType = props.uiType;
    const skuItems = skuItem.baseInfo.skuItems;
    for(const skuItem of skuItems){
        const skuItemValue = skuItem.value;
        if(skuItemValue && fieldLabel && (skuItemValue.includes(fieldLabel) || fieldLabel.includes(skuItemValue))){
            const text = skuItem.text;
            if(!text){
                return undefined;
            }
            if(text.length == 1){
                if(fieldType == "input"){
                    return text[0];
                }
                if(fieldType == "number"){
                    const numbers = text[0].match(/\d+/g); // 提取所有数字
                    if(numbers && numbers.length > 0){
                        return Number(numbers[0]);
                    }
                }
                if(fieldType == "rangePicker"){
                    const range = text[0].split("至");
                    if(range.length == 2){
                        const startDate = convertDateFormat(range[0]);
                        const endDate = convertDateFormat(range[1]);
                        return startDate + "," + endDate;
                    }
                }
                return text[0];
            }
            return text;
        }
    }
    if(!props.required){
        return undefined;
    }
    if(props.uiType == "multiDiscountPromotion"){
        const value = props.value;
        if(!value){
            return undefined;
        }
        value.enable = true;
        return value;
    }
    return getSkuPropFromDefault(props)
}
function getProps(componentsData: { [key: string]: any }, field: string){
    if (!(field in componentsData)){
        for(const key in componentsData){
            const fieldData = componentsData[key];
            const props = fieldData.props;
            if(!props || props.length == 0){
                continue;
            }
            return props;

        }
        return undefined;
    }
    const fieldData = componentsData[field];
    return fieldData.props;
}

function fillPropExt(commendItem: { [key: string]: any }, skuItem: DoorSkuDTO, draftData: { [key: string]: any }) {
    const fields = commendItem.data.models.__fields__;
    const commonData = commendItem.data;
    const componentsData = commonData.components;
    for(const field in fields){
        const props = getProps(componentsData, field);
        if(!props || props.length == 0){
            continue;
        }
        const value = getPropValue(props, skuItem);
        if(value){
            draftData[field] = value;
        }
    }
}

async function fillMultiDiscountPromotion(page: Page) {
    await page.waitForTimeout(1000);
    const multiDiscountPromotionElement = await page.evaluate(() => {
        //@ts-ignore
        const doc = document.querySelectorAll(".sell-component-multi-discount-promotion .next-checkbox-input");
        if(!doc || doc.length == 0){
            return false;
        }
        return true;
    });
    if(!multiDiscountPromotionElement){
        console.log("multiDiscountPromotionElement not found");
        return;
    }
    const multiDiscountPromotion = page.locator(".sell-component-multi-discount-promotion .next-checkbox-input");
    await multiDiscountPromotion.waitFor({timeout:2000});
    if(multiDiscountPromotion){
        await multiDiscountPromotion.first().click();
        const input = page.locator(".sell-component-multi-discount-promotion .next-input-group-auto-width input").first();
        await input.fill("9.5");
        await page.waitForTimeout(100);
    }
}

async function clickPublishButton(page: Page, draftId: string) {
    const url = "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId;
    await page.goto(url);
    await page.waitForTimeout(1000);
    try{
        await fillMultiDiscountPromotion(page);
    }catch(e){
        console.log("multiDiscountPromotion error", e);
    }
    try {
        await confirmProtocol(page);
    } catch (e) {
        console.log("confirmProtocol error", e);
    }
    await page.waitForTimeout(1000);
    const requestPromise = page.waitForResponse(response =>
        response.request().url().includes("sell/v2/submit.htm"),
        { timeout: 10000 }
    );
    const publishButton = await page.locator("button[_id='button-submit']").first();
    await publishButton.click();
    const response = await requestPromise.catch(e => {
        return null;
    });
    if(response){
        try{
            const responseData = await response.json();
            console.log("responseData is ", responseData);
            const type = responseData.models?.globalMessage?.type;
            if(!type){
                console.log("publish is error by ", responseData);
                return false;
            }
            if(type == "error"){
                console.log("publish is error by ", responseData);
                return false;
            }
            if(type == "success"){
                return true;
            }
            return false;
        }catch(e){
            console.log("response json error", e);
            return false;
        }
    }
    return false;
}


async function getCommonData(page: Page) {
    // 获取window对象中 json 数据 
    const commonData = await page.evaluate(() => {
        return {
            // @ts-ignore
            data: window.Json,
            // @ts-ignore
            userAgent: navigator.userAgent,
            // @ts-ignore
            csrfToken: window.csrfToken.tokenValue
        };
    });
    console.log("commonData.userAgent is ", commonData.userAgent);
    return commonData;
}

async function clickSaveDraf(page: Page) {
    // 保存草稿
    await page.locator(".sell-draft-save-btn button").click();
}
