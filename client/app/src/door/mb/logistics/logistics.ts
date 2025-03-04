import { DoorSkuDTO } from "@model/door/sku";
import { getAddressByKeywords, getAddressByKeywordsAndResourceId, saveAddressTemplate } from "@api/address/address";
import { MbEngine } from "../mb.engine";
import { Page } from "playwright";
import { MbAddressQueryMonitor } from "@src/door/monitor/mb/address/address";
import axios from "axios";
import { AddressTemplate } from "@model/address/address";
import log from "electron-log";

function getKeywords(keywords : string){
    if(keywords.includes(";")){
        return keywords.split(";")[0];
    }
    if(keywords.includes("；")){
        return keywords.split("；")[0];
    }
    if(keywords.includes("，")){
        return keywords.split("，")[0];
    }
    if(keywords.includes(",")){
        return keywords.split(",")[0];
    }
    return keywords;
}

export async function getOrSaveTemplateId(resourceId: number, skuItem: DoorSkuDTO) {
    const logisticsMode = skuItem.doorSkuLogisticsInfo;
    const keywords = getKeywords(logisticsMode.deliveryFromAddr);
    const address = await getAddressByKeywordsAndResourceId(keywords, resourceId);
    if (address) {
        return address.templateId;
    }
    return saveAddressByPage(resourceId, skuItem);
}

async function doAction(page: Page) {
    const tbToken = page.locator("#form1 input[name='_tb_token_']");
    if(tbToken){
        return await tbToken.getAttribute("value");
    }
    return undefined;
}

async function postAddress(resourceId : number, tbToken: string, skuItem: DoorSkuDTO, headerData: {[ket : string] : any}) {
    headerData['content-type'] = "application/x-www-form-urlencoded";
    const header = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "origin": "https://adpmanager.taobao.com",
        "pragma": "no-cache",
        "bx-v": "2.5.28",
        "priority": "u=1,i",
        "referer": "https://adpmanager.taobao.com/user/template_setting.htm?fromType=fromPublishGpfTaobao&toolAuth=cm-tool-manage",
        "sec-ch-uaa": headerData['sec-ch-ua'],
        "sec-ch-ua-mobile": headerData['sec-ch-ua-mobile'],
        "sec-ch-ua-platform": headerData['sec-ch-ua-platform'],
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": headerData['cookie'],
        "user-agent": headerData['user-agent']
    }
    const keywords = getKeywords(skuItem.doorSkuLogisticsInfo.deliveryFromAddr);
    const address = await getAddressByKeywords(keywords);
    const defaultTemplateId = "64723339970";
    if(!address){
        return defaultTemplateId;
    }
    const addressId = `${address.countryCode},${address.provinceCode},${address.cityCode}`;
    const body = {
        valuation: 0,
        fromType: "fromPublishGpfTaobao",
        templateName: keywords,
        pageVersion: "",
        event_submit_do_save_template: 1,
        addressId: addressId,
        bearFreight: 2,
        unique: "",
        auctionids: "",
        templateId: "",
        action: "user/template_setting_action",
        _tb_token_: tbToken,
        categoryid: "",
        type: "",
        forceSellerPay: "",
        auctionid: "",
        selectedPostageid: "",
        normalTemplate: JSON.stringify({"checkboxGroup":[{"template":{"defaultConfig":[{"name":"startStandard","addonAfter":"{unit}内","value":"1"},{"name":"startFee","addonAfter":"元，","value":""},{"name":"addStandard","label":"每增加","addonAfter":"{unit}，","value":"1"},{"name":"addFee","label":"增加运费","addonAfter":"元","value":""}],"title":"默认运费"},"title":"快递","defaultFee":false,"checked":true,"disabled":false,"value":"-4"},{"template":{"defaultConfig":[{"name":"startStandard","addonAfter":"{unit}内","value":"1"},{"name":"startFee","addonAfter":"元，","value":""},{"name":"addStandard","label":"每增加","addonAfter":"{unit}，","value":"1"},{"name":"addFee","label":"增加运费","addonAfter":"元","value":""}],"title":"默认运费"},"title":"同城配送","defaultFee":false,"checked":false,"disabled":false,"value":"26000"},{"template":{"defaultConfig":[{"name":"startStandard","addonAfter":"{unit}内","value":"1"},{"name":"startFee","addonAfter":"元，","value":""},{"name":"addStandard","label":"每增加","addonAfter":"{unit}，","value":"1"},{"name":"addFee","label":"增加运费","addonAfter":"元","value":""}],"title":"默认运费"},"title":"EMS","defaultFee":false,"checked":false,"disabled":false,"value":"-7"},{"template":{"defaultConfig":[{"name":"startStandard","addonAfter":"{unit}内","value":"1"},{"name":"startFee","addonAfter":"元，","value":""},{"name":"addStandard","label":"每增加","addonAfter":"{unit}，","value":"1"},{"name":"addFee","label":"增加运费","addonAfter":"元","value":""}],"title":"默认运费"},"title":"平邮","defaultFee":false,"checked":false,"disabled":false,"value":"-1"}],"title":"运送方式：","tips":["除指定地区外，其余地区的运费采用“默认运费”"]}),
        promotionTemplate: JSON.stringify({"template":{},"checked":false,"title":"指定条件包邮","value":"0","tips":"<img src='//img.alicdn.com/tps/i1/TB1Sw5KFVXXXXb7XFXX1xhnFFXX-23-12.png'>可选"})
    }
    const response = await axios.post("https://adpmanager.taobao.com/user/template_setting.htm?%2Fuser%2Ftemplate_setting.htm=", body, {
        headers:header
    });
    const data = await response.data;
    if(data.success){
        const templateId = String(data.resultData.templateId);
        await saveAddress(resourceId, address.id, templateId)
        return templateId;
    }
    return defaultTemplateId;
}

async function saveAddress(resourceId : number, addressId : number | undefined, templateId  : string){
    if(!addressId){
        return;
    }
    const addressTemplate = new AddressTemplate(undefined, resourceId, addressId, templateId);
    await saveAddressTemplate(addressTemplate)
}

async function saveAddressByPage(resourceId: number, skuItem: DoorSkuDTO) {
    const engine = new MbEngine(resourceId);
    try {
        const page = await engine.init();
        const monitor = new MbAddressQueryMonitor();
        if(page){
           const tbToken = await engine.openNotWaitMonitor(page, "https://wuliu.taobao.com/user/logis_tools.htm?tabSource=carriageTemplate&fromType=fromPublishGpfTaobao&forceSellerPay=false", monitor, {}, doAction)
           if(!tbToken){
              log.warn("saveAddressByPage tbToken is null");
              return undefined;
           }
           const result = await monitor.waitForAction();
           if(!result || !result.code){
              log.log("saveAddressByPage result is null");
              return undefined;
           }
           const headerData = result.getHeaderData();
           const templateId = await postAddress(resourceId, tbToken, skuItem, headerData);
           return templateId;
        }
    } finally {
        await engine.closePage();
    }
}

