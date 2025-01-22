import { MbShopDetailMonitorChain, MbSkuPublishDraffMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbEngine } from "../mb.engine";
import { Page } from "playwright";
import { DoorEngine } from "@src/door/engine";
import { DoorEntity } from "@src/door/entity";
import axios from "axios";
import { DoorSkuDTO } from "@model/door/sku";
import { SkuFile, SkuFileDetail } from "@model/sku/sku.file";

async function doAction(page : Page){
    await clickSaveDraf(page);
}

async function fillDetailImage(page : Page, imageFileList : SkuFileDetail[]){
    // 获取详情图
    const detailImages = imageFileList.filter(file => file.fileName?.includes("detail"));
    // 排序
    detailImages.sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));

}




export async function publishFromTb(imageFileList : SkuFileDetail[], skuItem : DoorSkuDTO, resourceId: number, itemId: string){
    const mbEngine = new MbEngine(resourceId);
    try {
        const page = await mbEngine.init();
        if(!page){
            return false; 
        }
        // 发布商品url
        const url = "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
        const result = await mbEngine.openWaitMonitor(page, url, new MbSkuPublishDraffMonitor(), {}, doAction);   
        if(!result){
            return false;
        }
        await publishSkuByDoor(imageFileList, skuItem, result, page);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }finally{
        await mbEngine.closePage();
    }
}

async function getCategoryInfo(result : DoorEntity<any>, csrfToken : string, startTraceId : string, itemId : string, categoryKeyword : string){
    const requestUrl = result.getUrl();
    const requestHeader = result.getHeaderData();
    const urlParams = new URLSearchParams(requestUrl);
    const catId = urlParams.get("catId");
    if(!catId){
        return undefined;
    }
    // curl 'https://item.upload.taobao.com/sell/v2/asyncOpt.htm?optType=taobaoBrandQuery&queryType=query&catId=50011165' \
//   -H 'accept: application/json, text/plain, */*' \
//   -H 'accept-language: zh-CN,zh;q=0.9' \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/x-www-form-urlencoded' \
//   -H 'cookie: x-gpf-render-trace-id=21504aab17374479049955813e14c0; miid=8556505062647258024; t=d49fc16ed496d59451e1ea7efb8ab1ab; thw=cn; lgc=%5Cu5DE5%5Cu4F5C%5Cu80052011; cancelledSubSites=empty; dnk=%5Cu5DE5%5Cu4F5C%5Cu80052011; tracknick=%5Cu5DE5%5Cu4F5C%5Cu80052011; havana_lgc2_0=eyJoaWQiOjY5NTYzNzU4OSwic2ciOiJiZmEyZDAxYzAwMWYzNDcwYWU2YmJhNDQ2OTRlYTdiYiIsInNpdGUiOjAsInRva2VuIjoiMVI2akZzVUJtMmlJeUIyV0F3bm56bncifQ; _hvn_lgc_=0; wk_cookie2=19a2a2c126a448b8836968024e8ddb8d; wk_unb=VWZ7qbKwBSHT; sn=; unb=695637589; _l_g_=Ug%3D%3D; sg=199; cookie1=BqVu236ovVcExzB3sc%2FXZFaInb4jpSi22yVvayJVBsw%3D; _bl_uid=2mmmF5Uk3h7b7LrbnnnRl1zd19CU; _tb_token_=5e36e3ab5de3; cookie2=28966a57ed071711a20885ccf0129ba4; cna=9+fhH7RvlyYCAXJc1l4k1XTh; mtop_partitioned_detect=1; _m_h5_tk=ca1593c48446865d89f65920bfc4032b_1737455711202; _m_h5_tk_enc=80e43037b4f84ae65226b9dfc102c8df; _samesite_flag_=true; sgcookie=E1004eUCHFNSEeKygWvR%2FKQHAE2LedkwaoOK35acYclaGSbZ1TY5maYL108QTe%2Bc9vy%2BkJUhgJrOETcKV3RL6knYuF568ZozDgmKQzZ1qKMa9dhvIJUJ6eBEEloCE5oSkU5HuJWIGFqyErPwBBticiBbzw%3D%3D; havana_lgc_exp=1768551792740; uc3=id2=VWZ7qbKwBSHT&nk2=2ivE6HZcVmeV3g%3D%3D&vt3=F8dD2EwGe9novPJbbpQ%3D&lg2=W5iHLLyFOGW7aA%3D%3D; csg=161e260b; cookie17=VWZ7qbKwBSHT; skt=2dad623003be3d0a; existShop=MTczNzQ0Nzc5Mg%3D%3D; uc4=id4=0%40V8exEJquE4vDLBw5ule%2BYtl5Mp0%3D&nk4=0%402BEF%2Fur2ofJiBo4N%2FoMhf0ueL6IR; publishItemObj=Ng%3D%3D; _cc_=VFC%2FuZ9ajQ%3D%3D; _nk_=%5Cu5DE5%5Cu4F5C%5Cu80052011; sdkSilent=1737534192778; havana_sdkSilent=1737534192778; xlly_s=1; XSRF-TOKEN=f707de61-f9a4-404a-9bd4-a93d1541326d; isg=BAoK4c3DWcrpDNWwU5mnGxrMW_as-45VMwlYW5RDtt3oR6oBfIveZVClVbObrAbt; uc1=pas=0&cookie21=UIHiLt3xTwwM1Oej1w%3D%3D&cookie15=U%2BGCWk%2F75gdr5Q%3D%3D&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&existShop=true&cookie14=UoYdWtRGgtvalQ%3D%3D; tfstk=glgSxUOw9v32Kl6mZLd4Cq1JGxzIAvTav6NKsXQP9zUJRWHZhkIz8vkQRA2V8Q4yxyMQhv2z4zePRBM0nMPLyy7LAxD5zvlK8W3QrqoP88JuRXHaRdJw7FloZPapQdztME_TW5PL99y8M-UUORIKwyloZyfcg9KZDbXBkmLgyyHLkoFT1yF8JuUvGWNOeye8vtIY6-eLJve-MSFu_gFR2yevGW2AvyUKprhyTKNBV8lWNVAKdcQXWcyfJw3bMpVnNw_3M4F7VRh-PwQpt7Z7BbeXIsSr9kM7Vq85I7ix1jPSKFbuykiKzr3JHeUxsmk8Gvp1A-nsr2ZZPdsge42nhloWCaMsEWhQ9YTG1-3SOqZo017sGlgxzzmXCNytmX3QDbv1jSoK_4oIUKbLUcGxhluV3NztjxgQXPIy1Ny1mTICGlbQGRRXGMjHE4MMWJxSQLE8i7gwGI6RxuF0GSAXGMj32SVV0IOfeMf..' \
//   -H 'origin: https://item.upload.taobao.com' \
//   -H 'pragma: no-cache' \
//   -H 'priority: u=1, i' \
//   -H 'referer: https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=862817545814' \
//   -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-origin' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
//   -H 'x-requested-with: XMLHttpRequest' \
//   -H 'x-xsrf-token: f707de61-f9a4-404a-9bd4-a93d1541326d' \
//   --data-raw 'keyword=%E6%97%A0%E5%93%81%E7%89%8C&pid=p-20000&queryType=query&globalExtendInfo=%7B%22startTraceId%22%3A%2221504aab17374479049955813e14c0%22%7D'
    //发送http请求
    requestHeader['content-type'] = "application/x-www-form-urlencoded";
    requestHeader['x-xsrf-token'] = csrfToken;
    requestHeader['origin'] = "https://item.upload.taobao.com";
    requestHeader['referer'] = "https://item.upload.taobao.com/sell/v2/publish.htm?commendItem=true&commendItemId=" + itemId;
    const requestData = {
        keyword : categoryKeyword,
        pid : "p-20000",
        queryType : "query",
        globalExtendInfo : JSON.stringify({
            startTraceId : startTraceId
        })
    }
    const response = await axios.post("https://item.upload.taobao.com/sell/v2/asyncOpt.htm?optType=taobaoBrandQuery&queryType=query&catId=" + catId, requestData, {
        headers : requestHeader,
    });
    /**
     * {
    "success": true,
    "data": {
        "success": true,
        "dataSource": [
            {
                "value": 3246379,
                "text": "无品牌"
            },
            {
                "value": 30025069481,
                "text": "无品牌/无注册商标"
            }
        ]
    }
}
     */
    const data = response.data;
    if(!data.success || !data.data.success){
        return undefined;
    }
    const dataSource = data.data.dataSource;
    if(!dataSource || dataSource.length == 0){
        return undefined;
    }
    return dataSource[0];
}

function getStartTraceId(commonData : { data : any }){
    try{
        const globalExtendInfo = commonData.data.subSizeMapping.props.icmp.global.globalExtendInfo;
        return JSON.parse(globalExtendInfo).startTraceId;
    }catch(e){
        return undefined;
    }
}

function getSkuCategoryKeyword(skuItem : DoorSkuDTO){
    return "无品牌"
}   

async function publishSkuByDoor(imageFileList : SkuFileDetail[], skuItem : DoorSkuDTO, result : DoorEntity<any>, page : Page){
    const commonData = await getCommonData(page);
    const csrfToken = commonData.csrfToken;
    const startTraceId = getStartTraceId(commonData);
    const categoryKeyword = getSkuCategoryKeyword(skuItem);
    const categroyInfo = await getCategoryInfo(result, csrfToken, startTraceId, skuItem.baseInfo.itemId, categoryKeyword);
    const draftData = result.data;
    await fillCategoryInfo(categroyInfo, draftData);
    await fillMainImage(imageFileList, draftData);
    await fillSellInfo(skuItem, draftData);
    await updateDraftData(result, csrfToken, startTraceId, draftData);
    await clickPublishButton(page);

}


async function fillCategoryInfo(categroyInfo : {value : number, text : string}, draftData : {catProp : [{[key: string]: { value : number, text : string }}]}){
    const catProp = draftData.catProp;
    const newCatProp : [{[key: string]: { value : number, text : string }}] = [
        {
           ["p-" + categroyInfo.value] : {
            value : categroyInfo.value,
            text : categroyInfo.text
           }
        }
    ];
    for(const item of catProp){
        newCatProp.push(item);
    }
    draftData.catProp = newCatProp;
}

function getAndSortImage(imageFileList : SkuFileDetail[], type : string){
    // 获取主图 并排序
    const mainImages = imageFileList.filter(file => file.fileName?.includes(type));
    mainImages.sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
    return mainImages;
}

async function fillMainImage(imageFileList : SkuFileDetail[], draftData : {mainImagesGroup : {images : {url : string, pix : string, width : string, height : string}[]}}){
    const mainImages = getAndSortImage(imageFileList, "main");
    const mainImageList : {url : string, pix : string, width : string, height : string}[] = [];
    for (const file of mainImages) {
        let url = file.fileUrl?.replace("//", "https://");
        if(!url){
            url = "";
        }
        mainImageList.push({
            url : url,
            pix : "800x800",
            width : "800",
            height : "800"
        })
    }
    draftData.mainImagesGroup = {
        images : mainImageList
    }
    /**
     *  "mainImagesGroup": {
        "images": [
            {
                "url": "//img.alicdn.com/imgextra/i1/695637589/O1CN01bkK3tN25voluyH7Di_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i3/695637589/O1CN01DanQGT25volrl7WVu_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i2/695637589/O1CN013s5TpM25volu5Cz9o_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i1/695637589/O1CN01HwFwrL25voltcUqcD_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i3/695637589/O1CN019fkYuu25voltcTZZb_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            }
        ]
    }
     */
}

async function fillSellProp(skuItem : DoorSkuDTO, draftData : {saleProp : {}}){
    const salesAttr = skuItem.doorSkuSaleInfo.salesAttr;
    const saleProp : {[key : string] : {value : string, pix : string, text : string}[]} = {};
    for(const [key, value] of Object.entries(salesAttr)){
        const salePros : {value : string, pix : string, text : string}[] = [];
        for(const sale of value.values){
            salePros.push({
                value : sale.value,
                pix : "800x871",
                text : sale.text
            })
        }
        saleProp[key] = salePros;
    }
    draftData.saleProp = saleProp;
    /**
     * 
     *  "saleProp": {
        "p-1627207": [
            {
                "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                "value": 4266701,
                "text": "米白色",
                "pix": "800x871"
            }
        ],
        "p-20509": {
            "selectedSizeGroupId": {
                "text": "中国码",
                "value": "27013-men_tops",
                "subName": "sizeGroup_27013-men_tops",
                "sizeGroupType": "men_tops"
            },
            "value": [
                {
                    "value": 28315,
                    "text": "M"
                },
                {
                    "value": 28316,
                    "text": "L"
                },
                {
                    "value": 28317,
                    "text": "XL"
                },
                {
                    "value": 6145171,
                    "text": "2XL"
                },
                {
                    "value": 115781,
                    "text": "3XL"
                }
            ]
        }
    },
     */
}

async function fillSellSku(skuItem : DoorSkuDTO, draftData : {skuList : {cspuId : number, skuPrice : string, skuBatchInventory : string|null, action : {selected : boolean}, skuId : number|null, skuStatus : number, skuStock : number, skuQuality : {value : string, text : string, prefilled : boolean, prefilledText : {bottom : string}}, skuDetail : [], skuCustomize : {value : number}, disabled : boolean, props : {name : string, img : string, value : number, text : string, pix : string, label : string}[], salePropKey : string, errorInfo : {}, skuSpecification : string|null, skuTitle : string|null}[]}){
    const salesSkus = skuItem.doorSkuSaleInfo.salesSkus;
    const skuList : {cspuId : number, skuPrice : string, skuBatchInventory : string|null, action : {selected : boolean}, skuId : number|null, skuStatus : number, skuStock : number, skuQuality : {value : string, text : string, prefilled : boolean, prefilledText : {bottom : string}}, skuDetail : [], skuCustomize : {value : number}, disabled : boolean, props : {name : string, img : string, value : number, text : string, pix : string, label : string}[], salePropKey : string, errorInfo : {}, skuSpecification : string|null, skuTitle : string|null}[] = [];
    for(const sale of salesSkus){
        const sellProp : {name : string, img : string, value : number, text : string, pix : string, label : string}[] = [];
        skuList.push({
            cspuId : 0,
            skuPrice : sale.price,
            skuBatchInventory : null,
            action : {selected : true},
            skuId : null,
            skuStatus : 1,
            skuStock : Number(sale.quantity),
            skuQuality : {value : "mainSku", text : "单品", prefilled : true, prefilledText : {bottom : "<span style='color:#ff6600'>请确认分类</span>"}},
            skuDetail : [],
            skuCustomize : {value : 0},
            disabled : false,
            props : [

            ],
            salePropKey : "",
            errorInfo : {},
            skuSpecification : null,
            skuTitle : null
        })
    }
    /**
     * 

    "sku": [
        {
            "cspuId": 0,
            "skuPrice": "1.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 1,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuDetail": [],
            "skuCustomize": {
                "value": 0
            },
            "disabled": false,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                    "value": 4266701,
                    "text": "米白色",
                    "pix": "800x871",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 28315,
                    "text": "M",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-4266701_20509-28315",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null
        },
        {
            "cspuId": 0,
            "skuPrice": "1.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 1,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuDetail": [],
            "skuCustomize": {
                "value": 0
            },
            "disabled": false,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                    "value": 4266701,
                    "text": "米白色",
                    "pix": "800x871",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 28316,
                    "text": "L",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-4266701_20509-28316",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null
        },
        {
            "cspuId": 0,
            "skuPrice": "1.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 1,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuDetail": [],
            "skuCustomize": {
                "value": 0
            },
            "disabled": false,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                    "value": 4266701,
                    "text": "米白色",
                    "pix": "800x871",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 28317,
                    "text": "XL",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-4266701_20509-28317",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null
        },
        {
            "cspuId": 0,
            "skuPrice": "1.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 1,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuDetail": [],
            "skuCustomize": {
                "value": 0
            },
            "disabled": false,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                    "value": 4266701,
                    "text": "米白色",
                    "pix": "800x871",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 6145171,
                    "text": "2XL",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-4266701_20509-6145171",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null
        },
        {
            "cspuId": 0,
            "skuPrice": "1.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 1,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuDetail": [],
            "skuCustomize": {
                "value": 0
            },
            "disabled": false,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i3/695637589/O1CN017JBruc25volvYyJOI_!!695637589.webp",
                    "value": 4266701,
                    "text": "米白色",
                    "pix": "800x871",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 115781,
                    "text": "3XL",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-4266701_20509-115781",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null
        }
    ],
     */
}

async function fillSellInfo(skuItem : DoorSkuDTO, draftData : {saleProp : {[key : string] : {value : string, pix : string, text : string}[]}, skuList : {cspuId : number, skuPrice : string, skuBatchInventory : string|null, action : {selected : boolean}, skuId : number|null, skuStatus : number, skuStock : number, skuQuality : {value : string, text : string, prefilled : boolean, prefilledText : {bottom : string}}, skuDetail : [], skuCustomize : {value : number}, disabled : boolean, props : {name : string, img : string, value : number, text : string, pix : string, label : string}[], salePropKey : string, errorInfo : {}, skuSpecification : string|null, skuTitle : string|null}[]}){
    await fillSellProp(skuItem, draftData);
    await fillSellSku(skuItem, draftData);
}

async function updateDraftData(result : DoorEntity<any>, csrfToken : string, startTraceId : string, draftData : {}){
    const requestUrl = result.getUrl();
    const requestHeader = result.getHeaderData();
    
    const urlParams = new URLSearchParams(requestUrl);
    const catId = urlParams.get("catId");
    if(!catId){
        return undefined;
    }
    const draftId = result.data.dbDraftId;
    const url = `https://item.upload.taobao.com/sell/draftOp/update.json?catId=${catId}`;
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'bx-v': '2.5.28',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
    }
    requestHeader['x-xsrf-token'] = csrfToken;
    requestHeader['content-type'] ='application/x-www-form-urlencoded',
    requestHeader['origin'] = 'https://item.upload.taobao.com';
    requestHeader['referer'] = `https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=${draftId}`;
    const data = {
        "id": draftId,
        "draftId": draftId,
        "catId": catId,
        "draftData": draftData,
        "globalExtendInfo": {startTraceId : startTraceId}
    }

    const res = await axios.post(url, data, {
        headers: headers
    })

    console.log("update draft data result:", res.data)
//     curl 'https://item.upload.taobao.com/sell/draftOp/update.json?catId=50011165' \
//   -H 'accept: application/json, text/plain, */*' \
//   -H 'accept-language: zh-CN,zh;q=0.9' \
//   -H 'bx-v: 2.5.28' \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/x-www-form-urlencoded' \
//   -H 'cookie: x-gpf-submit-trace-id=213e033a17375182665017173e0e17; miid=8556505062647258024; t=d49fc16ed496d59451e1ea7efb8ab1ab; thw=cn; lgc=%5Cu5DE5%5Cu4F5C%5Cu80052011; cancelledSubSites=empty; dnk=%5Cu5DE5%5Cu4F5C%5Cu80052011; tracknick=%5Cu5DE5%5Cu4F5C%5Cu80052011; havana_lgc2_0=eyJoaWQiOjY5NTYzNzU4OSwic2ciOiJiZmEyZDAxYzAwMWYzNDcwYWU2YmJhNDQ2OTRlYTdiYiIsInNpdGUiOjAsInRva2VuIjoiMVI2akZzVUJtMmlJeUIyV0F3bm56bncifQ; _hvn_lgc_=0; wk_cookie2=19a2a2c126a448b8836968024e8ddb8d; wk_unb=VWZ7qbKwBSHT; sn=; unb=695637589; _l_g_=Ug%3D%3D; sg=199; cookie1=BqVu236ovVcExzB3sc%2FXZFaInb4jpSi22yVvayJVBsw%3D; _bl_uid=2mmmF5Uk3h7b7LrbnnnRl1zd19CU; _tb_token_=5e36e3ab5de3; cookie2=28966a57ed071711a20885ccf0129ba4; cna=9+fhH7RvlyYCAXJc1l4k1XTh; _samesite_flag_=true; sgcookie=E1004eUCHFNSEeKygWvR%2FKQHAE2LedkwaoOK35acYclaGSbZ1TY5maYL108QTe%2Bc9vy%2BkJUhgJrOETcKV3RL6knYuF568ZozDgmKQzZ1qKMa9dhvIJUJ6eBEEloCE5oSkU5HuJWIGFqyErPwBBticiBbzw%3D%3D; havana_lgc_exp=1768551792740; uc3=id2=VWZ7qbKwBSHT&nk2=2ivE6HZcVmeV3g%3D%3D&vt3=F8dD2EwGe9novPJbbpQ%3D&lg2=W5iHLLyFOGW7aA%3D%3D; csg=161e260b; cookie17=VWZ7qbKwBSHT; skt=2dad623003be3d0a; existShop=MTczNzQ0Nzc5Mg%3D%3D; uc4=id4=0%40V8exEJquE4vDLBw5ule%2BYtl5Mp0%3D&nk4=0%402BEF%2Fur2ofJiBo4N%2FoMhf0ueL6IR; publishItemObj=Ng%3D%3D; _cc_=VFC%2FuZ9ajQ%3D%3D; _nk_=%5Cu5DE5%5Cu4F5C%5Cu80052011; sdkSilent=1737534192778; havana_sdkSilent=1737534192778; xlly_s=1; XSRF-TOKEN=f707de61-f9a4-404a-9bd4-a93d1541326d; mtop_partitioned_detect=1; _m_h5_tk=aea74733165d9783a25ff504076cd612_1737523396146; _m_h5_tk_enc=f1c89278148cce0dcf807e7ab2fcaa92; _utk=VocP@qJyn^AtWdm; uc1=cookie14=UoYdWtWj7c8z5A%3D%3D&cookie16=WqG3DMC9UpAPBHGz5QBErFxlCA%3D%3D&cookie21=V32FPkk%2Fg3cS53dlAQ%3D%3D&pas=0&cookie15=URm48syIIVrSKA%3D%3D&existShop=true; isg=BENDtlKWIDpt6OyH8nrOhAsf0gHtuNf6ojpBjHUgB6IZNGJW_YksSqqvrsR6lC_y; tfstk=gHHKbDADNhIpNLwDKpOgq3zfZGtieYnEf2ofEz4hNV3t-mG3t0ZnV33syYV7rBu8w40aNv2nxVUSoVwuRuVSWun-ybXoVYqSeJkitT4H88nSo8LDoKvmYDyYFEYmF2rUs-ZcdM_uRdi_EupY7zdoYDyPbGbWifiFyQu1i0wSPRN_co27A8aIfhE8Dzw7R7_11oa_P8g7VlZ_YuXQP86WXcaaV8aSPWM_ZMU1AzW-MTFGLCdeqtWqBkFLyTqGemlAnu4jAPBWlOrU9_iQWT6SBfDW4uUvBNaiVml76YdhT8oiM4hSlFf3RjExko0HC9eS1VHYGc8ALyhs8Ye3gpQ4vfiYCy2XM1eKj2kYdxLdKl2a-SGjAFfTXfinB5DXkTFE12l4wYYM3JcmmYPjdpQ4SSr-WScpk93f4zDmHndCorElOhKOa_PQbdc5uxn86dnQXrxd9_5z_lrTohLfa_PQblUDjxfPa5rN.' \
//   -H 'origin: https://item.upload.taobao.com' \
//   -H 'pragma: no-cache' \
//   -H 'priority: u=1, i' \
//   -H 'referer: https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=1162974866' \
//   -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-origin' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
//   -H 'x-requested-with: XMLHttpRequest' \
//   -H 'x-xsrf-token: f707de61-f9a4-404a-9bd4-a93d1541326d' \
//   --data-raw $'id=1162974866&dbDraftId=1162974866&jsonBody=%7B%22frontDataLog%22%3A%7B%22identityId%22%3A%22general-taobao-100%22%2C%22mainCategoryId%22%3A30%2C%22fromSmart%22%3Afalse%2C%22fromStandardSpuPublish%22%3Afalse%2C%22fromSearch%22%3Afalse%2C%22fromSpuMatch%22%3Afalse%2C%22fromImageSearch%22%3Afalse%2C%22fromSuggestion%22%3Afalse%2C%22fromStandardCategory%22%3Afalse%2C%22fromSpuBasePublish%22%3Afalse%2C%22fromAIPublish%22%3Afalse%2C%22fromAICategory%22%3Afalse%2C%22fromAIImage%22%3Afalse%2C%22traceId%22%3A%22213e033a17375182031923237e0e17%22%2C%22gpfRenderTraceId%22%3A%22213e033a17375182031923237e0e17%22%2C%22trueItemId%22%3A879925419906%2C%22isEdit%22%3Afalse%2C%22pageUniqueId%22%3A%22pc%22%2C%22newPublish%22%3Atrue%7D%2C%22auctionType%22%3A%22b%22%2C%22sevenDayDefaultValue%22%3A1%2C%22id%22%3A879925419906%2C%22copyItemMode%22%3A0%2C%22postCouponPromotionId%22%3Anull%2C%22spuMatch%22%3Anull%2C%22croRule%22%3A%22%7B%5C%22url%5C%22%3A%5C%22asyncOpt.htm%3FoptType%3DcroRuleAsyncCheck%26catId%3D50011165%5C%22%2C%5C%22input%5C%22%3A%5B%5C%22id%5C%22%2C%5C%22userId%5C%22%2C%5C%22catId%5C%22%2C%5C%22title%5C%22%2C%5C%22desc%5C%22%2C%5C%22descForShenbiPc%5C%22%2C%5C%22sku%5C%22%2C%5C%22price%5C%22%2C%5C%22catProp%5C%22%2C%5C%22saleProp%5C%22%2C%5C%22descType%5C%22%2C%5C%22shopping_title%5C%22%2C%5C%22skuPublishSuggest%5C%22%5D%7D%22%2C%22subSizeRecommend%22%3Anull%2C%22subSizeMapping%22%3A%7B%22supportSizeReference%22%3Atrue%7D%2C%22subSizeModelTryInfo%22%3Anull%2C%22itemWithScProductItem%22%3Anull%2C%22multiDiscountPromotionId%22%3Anull%2C%22batchInventoryTemplateId%22%3Anull%2C%22guideMaterialEnable%22%3A1%2C%22afterSaleVideo_videoId%22%3Anull%2C%22guaranteeService%22%3Anull%2C%22sevenDayGray%22%3A-1%2C%22catSuggest%22%3A%7B%22empty%22%3Afalse%7D%2C%22fakeCreditSubmit%22%3Afalse%2C%22ifdWarningSubmit%22%3Afalse%2C%22riskWarningSubmit%22%3Afalse%2C%22feedbackSubmit_catErrorWarningSubmit%22%3Afalse%2C%22taobaoMarketTransform%22%3Anull%2C%22taobaoMarketClean%22%3Anull%2C%22xiaoxin%22%3Anull%2C%22snapshotId%22%3Anull%2C%22showDraft%22%3A1%2C%22newDescVersion%22%3A1%2C%22descRepublicEnable%22%3A1%2C%22skyLightRule%22%3Anull%2C%22recommendInfo%22%3Anull%2C%22dbDraftId%22%3A%221162974866%22%2C%22draftIdKey%22%3A%22dbDraftId%22%2C%22firstStartTime%22%3Anull%2C%22itemdiagnoseInfo%22%3A%22%7B%5C%22showNewVersion%5C%22%3Atrue%7D%22%2C%22diagnoseInvokeId%22%3Anull%2C%22diagnoseSource%22%3Anull%2C%22aliColorEnable%22%3A%22p-1627207%22%2C%22mediaCenterEnable%22%3Anull%2C%22newMaterialEnable%22%3Anull%2C%22catId%22%3A50011165%2C%22userId%22%3A695637589%2C%22category%22%3A%7B%22categorySelect%22%3A%7B%22id%22%3A50011165%2C%22name%22%3A%22%E6%A3%89%E8%A1%A3%22%2C%22idpath%22%3A%5B30%2C50011165%5D%2C%22path%22%3A%5B%22%E7%94%B7%E8%A3%85%22%2C%22%E6%A3%89%E8%A1%A3%22%5D%2C%22brand%22%3Afalse%2C%22leaf%22%3Atrue%2C%22publish%22%3Atrue%2C%22submitId%22%3A50011165%2C%22empty%22%3Afalse%7D%7D%2C%22base-card%22%3A%7B%7D%2C%22stuffStatus%22%3A%7B%22value%22%3A5%7D%2C%22title%22%3A%222323%22%2C%22catProp%22%3A%7B%22p-20000%22%3A%7B%22value%22%3A30025069481%2C%22text%22%3A%22%E6%97%A0%E5%93%81%E7%89%8C%2F%E6%97%A0%E6%B3%A8%E5%86%8C%E5%95%86%E6%A0%87%22%7D%2C%22p-122216347%22%3A%7B%22value%22%3A16019865786%2C%22text%22%3A%222024%E5%B9%B4%E5%86%AC%E5%AD%A3%22%7D%2C%22p-122216562%22%3A%7B%22value%22%3A40626789%2C%22text%22%3A%22%E5%B8%B8%E8%A7%84%E6%AC%BE%22%7D%2C%22p-122216586%22%3A%7B%22value%22%3A4042331%2C%22text%22%3A%22%E5%AE%BD%E6%9D%BE%E5%9E%8B%22%7D%2C%22p-20663%22%3A%7B%22value%22%3A29541%2C%22text%22%3A%22%E7%AB%8B%E9%A2%86%22%7D%2C%22p-31611%22%3A%7B%22value%22%3A115481%2C%22text%22%3A%22%E6%8B%89%E9%93%BE%22%7D%2C%22p-122216588%22%3A%7B%22value%22%3A129555%2C%22text%22%3A%22%E5%8D%B0%E8%8A%B1%22%7D%2C%22p-20019%22%3A%7B%22value%22%3A4194098%2C%22text%22%3A%22%E4%BF%9D%E6%9A%96%22%7D%2C%22p-122216515%22%3A%7B%22value%22%3A29535%2C%22text%22%3A%22%E5%85%B6%E4%BB%96%E4%BC%91%E9%97%B2%22%7D%2C%22p-122216608%22%3A%7B%22value%22%3A3267959%2C%22text%22%3A%22%E9%9D%92%E5%B9%B4%22%7D%2C%22p-122276336%22%3A%7B%22value%22%3A190810599%2C%22text%22%3A%22%E4%BE%A7%E7%BC%9D%E6%8F%92%E8%A2%8B%22%7D%2C%22p-122216507%22%3A%7B%22value%22%3A113060%2C%22text%22%3A%22%E5%8A%A0%E5%8E%9A%22%7D%2C%22p-42722636%22%3A%7B%22value%22%3A248572013%2C%22text%22%3A%22%E9%9D%92%E6%98%A5%E6%B5%81%E8%A1%8C%22%7D%2C%22p-42718685%22%3A%7B%22value%22%3A178914558%2C%22text%22%3A%22%E6%BD%AE%22%7D%2C%22p-20603%22%3A%7B%22value%22%3A14863995%2C%22text%22%3A%22%E5%85%B6%E4%BB%96%2Fother%22%7D%2C%22p-122216629%22%3A%7B%22value%22%3A3267927%2C%22text%22%3A%22%E5%85%8D%E7%83%AB%E5%A4%84%E7%90%86%22%7D%7D%2C%22spuConfirm%22%3A1%2C%22customize%22%3A%7B%22value%22%3A%22customize_0%22%7D%2C%22globalStock%22%3A%7B%22value%22%3A%22globalStock_0%22%7D%2C%22departurePlace%22%3A%7B%22value%22%3A0%7D%2C%22logisticsMode%22%3A%7B%22value%22%3A2529666%7D%2C%22sale-card%22%3A%7B%7D%2C%22saleProp%22%3A%7B%22p-20509%22%3A%7B%22selectedSizeGroupId%22%3A%7B%22text%22%3A%22%E4%B8%AD%E5%9B%BD%E5%8F%B7%E5%9E%8BA%22%2C%22value%22%3A%22136553091-men_tops%22%2C%22subName%22%3A%22sizeGroup_136553091-men_tops%22%2C%22sizeGroupType%22%3A%22men_tops%22%7D%2C%22value%22%3A%5B%7B%22value%22%3A3267942%2C%22text%22%3A%22165%2F88A%22%7D%2C%7B%22value%22%3A3267943%2C%22text%22%3A%22170%2F92A%22%7D%2C%7B%22value%22%3A3267944%2C%22text%22%3A%22175%2F96A%22%7D%2C%7B%22value%22%3A25571983%2C%22text%22%3A%22170%2F84A%22%7D%5D%7D%2C%22p-1627207%22%3A%5B%7B%22img%22%3A%22https%3A%2F%2Fimg.alicdn.com%2Fimgextra%2Fi3%2F695637589%2FO1CN017JBruc25volvYyJOI_\u0021\u0021695637589.webp%22%2C%22pix%22%3A%22800x871%22%2C%22text%22%3A%22%E4%B9%B3%E7%99%BD%E8%89%B2%22%2C%22value%22%3A28321%7D%5D%7D%2C%22sizeMappingV3%22%3A%7B%22sizeRecommend%22%3A%7B%22supportOneDim%22%3Atrue%7D%2C%22sizeMapping%22%3A%7B%22disabled%22%3Afalse%7D%2C%22sizeModelTryInfo%22%3A%7B%22disabled%22%3Afalse%7D%7D%2C%22deliveryTimeType%22%3A%7B%22value%22%3A0%7D%2C%22deliveryTimeSetBySku%22%3A0%2C%22sku%22%3A%5B%7B%22cspuId%22%3Anull%2C%22skuPrice%22%3A%224.00%22%2C%22skuBatchInventory%22%3Anull%2C%22action%22%3A%7B%22selected%22%3Atrue%7D%2C%22skuId%22%3Anull%2C%22skuStatus%22%3A1%2C%22skuStock%22%3A110%2C%22skuCustomize%22%3A%7B%22text%22%3A%22%E5%90%A6%22%2C%22value%22%3A0%7D%2C%22disabled%22%3Anull%2C%22props%22%3A%5B%7B%22name%22%3A%22p-1627207%22%2C%22img%22%3A%22https%3A%2F%2Fimg.alicdn.com%2Fimgextra%2Fi3%2F695637589%2FO1CN017JBruc25volvYyJOI_\u0021\u0021695637589.webp%22%2C%22pix%22%3A%22800x871%22%2C%22text%22%3A%22%E4%B9%B3%E7%99%BD%E8%89%B2%22%2C%22value%22%3A28321%2C%22label%22%3A%22%E9%A2%9C%E8%89%B2%22%7D%2C%7B%22name%22%3A%22p-20509%22%2C%22value%22%3A3267942%2C%22text%22%3A%22165%2F88A%22%2C%22label%22%3A%22%E5%B0%BA%E7%A0%81%22%7D%5D%2C%22salePropKey%22%3A%221627207-28321_20509-3267942%22%2C%22errorInfo%22%3A%7B%7D%2C%22_originalIndex%22%3A0%7D%2C%7B%22cspuId%22%3Anull%2C%22skuPrice%22%3A%2242.00%22%2C%22skuBatchInventory%22%3Anull%2C%22action%22%3A%7B%22selected%22%3Atrue%7D%2C%22skuId%22%3Anull%2C%22skuStatus%22%3A1%2C%22skuStock%22%3A11%2C%22skuCustomize%22%3A%7B%22text%22%3A%22%E5%90%A6%22%2C%22value%22%3A0%7D%2C%22disabled%22%3Anull%2C%22props%22%3A%5B%7B%22name%22%3A%22p-1627207%22%2C%22img%22%3A%22https%3A%2F%2Fimg.alicdn.com%2Fimgextra%2Fi3%2F695637589%2FO1CN017JBruc25volvYyJOI_\u0021\u0021695637589.webp%22%2C%22pix%22%3A%22800x871%22%2C%22text%22%3A%22%E4%B9%B3%E7%99%BD%E8%89%B2%22%2C%22value%22%3A28321%2C%22label%22%3A%22%E9%A2%9C%E8%89%B2%22%7D%2C%7B%22name%22%3A%22p-20509%22%2C%22value%22%3A3267943%2C%22text%22%3A%22170%2F92A%22%2C%22label%22%3A%22%E5%B0%BA%E7%A0%81%22%7D%5D%2C%22salePropKey%22%3A%221627207-28321_20509-3267943%22%2C%22errorInfo%22%3A%7B%7D%2C%22_originalIndex%22%3A1%7D%2C%7B%22cspuId%22%3Anull%2C%22skuPrice%22%3A%229.00%22%2C%22skuBatchInventory%22%3Anull%2C%22action%22%3A%7B%22selected%22%3Atrue%7D%2C%22skuId%22%3Anull%2C%22skuStatus%22%3A1%2C%22skuStock%22%3A11%2C%22skuCustomize%22%3A%7B%22text%22%3A%22%E5%90%A6%22%2C%22value%22%3A0%7D%2C%22disabled%22%3Anull%2C%22props%22%3A%5B%7B%22name%22%3A%22p-1627207%22%2C%22img%22%3A%22https%3A%2F%2Fimg.alicdn.com%2Fimgextra%2Fi3%2F695637589%2FO1CN017JBruc25volvYyJOI_\u0021\u0021695637589.webp%22%2C%22pix%22%3A%22800x871%22%2C%22text%22%3A%22%E4%B9%B3%E7%99%BD%E8%89%B2%22%2C%22value%22%3A28321%2C%22label%22%3A%22%E9%A2%9C%E8%89%B2%22%7D%2C%7B%22name%22%3A%22p-20509%22%2C%22value%22%3A3267944%2C%22text%22%3A%22175%2F96A%22%2C%22label%22%3A%22%E5%B0%BA%E7%A0%81%22%7D%5D%2C%22salePropKey%22%3A%221627207-28321_20509-3267944%22%2C%22errorInfo%22%3A%7B%7D%2C%22_originalIndex%22%3A2%7D%2C%7B%22cspuId%22%3Anull%2C%22skuPrice%22%3A%224.00%22%2C%22skuBatchInventory%22%3Anull%2C%22action%22%3A%7B%22selected%22%3Atrue%7D%2C%22skuId%22%3Anull%2C%22skuStatus%22%3A1%2C%22skuStock%22%3A11%2C%22skuCustomize%22%3A%7B%22text%22%3A%22%E5%90%A6%22%2C%22value%22%3A0%7D%2C%22disabled%22%3Anull%2C%22props%22%3A%5B%7B%22name%22%3A%22p-1627207%22%2C%22img%22%3A%22https%3A%2F%2Fimg.alicdn.com%2Fimgextra%2Fi3%2F695637589%2FO1CN017JBruc25volvYyJOI_\u0021\u0021695637589.webp%22%2C%22pix%22%3A%22800x871%22%2C%22text%22%3A%22%E4%B9%B3%E7%99%BD%E8%89%B2%22%2C%22value%22%3A28321%2C%22label%22%3A%22%E9%A2%9C%E8%89%B2%22%7D%2C%7B%22name%22%3A%22p-20509%22%2C%22value%22%3A25571983%2C%22text%22%3A%22170%2F84A%22%2C%22label%22%3A%22%E5%B0%BA%E7%A0%81%22%7D%5D%2C%22salePropKey%22%3A%221627207-28321_20509-25571983%22%2C%22errorInfo%22%3A%7B%7D%2C%22_originalIndex%22%3A3%7D%5D%2C%22quantity%22%3A%22143%22%2C%22sizeinfo-card%22%3A%7B%7D%2C%22desc-card%22%3A%7B%7D%2C%22mainImagesGroup%22%3A%7B%7D%2C%22auctionVideos%22%3A%5B%5D%2C%22desc%22%3A%22%22%2C%22descForShenbiPc%22%3A%7B%22detail%22%3Anull%7D%2C%22descForShenbiMobile%22%3A%7B%22cid%22%3A0%2C%22descContainer%22%3A%7B%7D%7D%2C%22descRepublicOfSell%22%3A%7B%22descPageCommitParam%22%3A%7B%22opt%22%3A2%2C%22clientType%22%3A1%2C%22userId%22%3A695637589%2C%22itemId%22%3A0%2C%22templateId%22%3A0%2C%22templateContent%22%3A%22%7B%5C%22groups%5C%22%3A%5B%5D%2C%5C%22sellergroups%5C%22%3A%5B%5D%7D%22%2C%22version%22%3A0%2C%22freeTry%22%3A0%2C%22needServerComposite%22%3Afalse%2C%22batchPut%22%3Afalse%2C%22detailHeight%22%3A0%2C%22params%22%3A%22params%22%2C%22maxHeight%22%3A100000%2C%22articleId%22%3A0%2C%22sell%22%3Afalse%2C%22smart%22%3Afalse%2C%22bsellerBack2OldVersion%22%3Afalse%2C%22fliggyItem%22%3Afalse%2C%22newItem%22%3Atrue%2C%22changed%22%3Atrue%2C%22catId%22%3A50011165%2C%22bizSource%22%3A%22sell%22%2C%22draftKey%22%3A%22sell_695637589_12503_154053%22%2C%22descDomain%22%3A%22%2F%2Fg.alicdn.com%22%2C%22descVersion%22%3A%221.1.53%22%2C%22bseller%22%3Afalse%2C%22sourceAgent%22%3A%22sell%22%2C%22editType%22%3A%22lite%22%7D%2C%22descPageRenderParam%22%3A%7B%22userId%22%3A695637589%2C%22itemId%22%3A0%2C%22templateId%22%3A0%2C%22clientType%22%3A1%2C%22catId%22%3A50011165%2C%22bizSource%22%3A%22sell%22%2C%22draftKey%22%3A%22sell_695637589_12503_154053%22%2C%22descDomain%22%3A%22%2F%2Fg.alicdn.com%22%2C%22descVersion%22%3A%221.1.53%22%2C%22smart%22%3Afalse%2C%22bseller%22%3Afalse%2C%22newItem%22%3Atrue%7D%2C%22descPageRenderModel%22%3A%7B%22wholeConfigBO%22%3A%7B%22width%22%3A620%2C%22maxHeight%22%3A100000%2C%22splitHeight%22%3A960%2C%22ratio%22%3A2%2C%22canCoverFromTmall%22%3Afalse%2C%22userId%22%3A695637589%2C%22liteCannotEdit%22%3Afalse%2C%22renderWhite%22%3Afalse%7D%2C%22descPageDO%22%3A%7B%22templateId%22%3A0%2C%22editRst%22%3A%22%7B%5C%22groups%5C%22%3A%5B%5D%2C%5C%22sellergroups%5C%22%3A%5B%5D%7D%22%7D%2C%22extendFields%22%3A%22%7B%7D%22%2C%22extendConfig%22%3A%7B%22httpRequestUrlConfig%22%3A%7B%22imageSelectUrl%22%3A%22%2F%2Fmarket.m.taobao.com%2Fapp%2Fcrs-qn%2Fsucai-selector-ng%2Findex%22%2C%22tokenUrl%22%3A%22https%3A%2F%2Fxiangqing.wangpu.taobao.com%2FGetToken.do%22%2C%22mtopHost%22%3A%22h5api.m.taobao.com%22%2C%22mediaUploadUrl%22%3A%5B%22stream.xiangqing.taobao.com%22%2C%22stream-xiangqing.taobao.com%22%5D%2C%22httpHost%22%3A%22sell.xiangqing.taobao.com%22%2C%22url%22%3A%22https%3A%2F%2Fxiangqing.wangpu.taobao.com%2Ftemplate%2Fajax%2Fcommit_item_description.do%22%7D%2C%22wangpuEditorConfig%22%3A%7B%22type%22%3A%22iframe%22%2C%22params%22%3A%7B%22isAdescription%22%3A1%2C%22catId%22%3A0%2C%22itemId%22%3A0%2C%22clientType%22%3A1%2C%22isV3%22%3A%22true%22%7D%2C%22url%22%3A%22https%3A%2F%2Fsell.xiangqing.taobao.com%2Fnew_user_panel.htm%22%7D%2C%22functionConfig%22%3A%7B%22showPreview%22%3Atrue%2C%22seniorEditDisabled%22%3Afalse%2C%22showDistinguish%22%3Afalse%2C%22backOldDiscardDraft%22%3Afalse%2C%22showBackOldVersion%22%3Atrue%2C%22showTemplate%22%3Atrue%2C%22showFastAddText%22%3Atrue%2C%22bSeller%22%3Afalse%2C%22foreverDisableEdit%22%3Afalse%2C%22showWangpuEditor%22%3Atrue%7D%2C%22imageConfig%22%3A%7B%22usePreDraw%22%3Atrue%2C%22mustCutImage%22%3Afalse%2C%22useCutThreshold%22%3Atrue%2C%22cutImageConfig%22%3A%7B%22cutWidthThreshold%22%3A1500%2C%22cutHeightThreshold%22%3A2000%2C%22cutMinWidth%22%3A620%2C%22cutMinHeight%22%3A0%7D%7D%2C%22imagePluginConfig%22%3A%7B%22appkey%22%3A%22tu%22%2C%22url%22%3A%22https%3A%2F%2Fmarket.m.taobao.com%2Fapp%2Fcrs-qn%2Fsucai-selector-ng%2Findex%22%7D%2C%22uploadConfig%22%3A%7B%22localFile%22%3Afalse%2C%22picUploadApi%22%3A%22picUploadApi%22%2C%22params%22%3A%7B%22folderId%22%3A%22folderId%22%7D%7D%7D%7D%7D%2C%22shopcat%22%3A%5B%5D%2C%22payment-card%22%3A%7B%7D%2C%22subStock%22%3A%7B%22value%22%3A1%7D%2C%22deliver-card%22%3A%7B%7D%2C%22tbExtractWay%22%3A%7B%22value%22%3A%5B%222%22%5D%2C%22template%22%3A%22%22%7D%2C%22regionLimitSale%22%3A%7B%22value%22%3A%22regionLimitSale_0%22%7D%2C%22post-sale-service-card%22%3A%7B%7D%2C%22sevenDaySupport%22%3A1%2C%22sevenDayOptional%22%3A0%2C%22startTime%22%3A%7B%22type%22%3A0%2C%22shelfTime%22%3A1736926853145%7D%2C%22riskWarning%22%3Afalse%2C%22feedbackSubmit_catErrorWarning%22%3Afalse%2C%22home-service-card%22%3A%7B%7D%2C%22aiFood-card%22%3A%7B%7D%2C%22product-card%22%3A%7B%7D%2C%22customizeBySku%22%3A0%2C%22sevenDayNotSupport%22%3Anull%2C%22price%22%3A4%7D&globalExtendInfo=%7B%22startTraceId%22%3A%22213e033a17375182031923237e0e17%22%7D'


}

async function clickPublishButton(page : Page){

}


async function getCommonData(page : Page){
    // 获取window对象中 json 数据 
    const commonData = await page.evaluate(() => {
        return {
          // @ts-ignore
          data: window.Json, 
          // @ts-ignore
          csrfToken : window.csrfToken.tokenValue
        };
    });
    return commonData;
}

async function clickSaveDraf(page : Page){
    // 保存草稿

}

function publishSku(){
    // MB 发布源
    // 先打开发布界面 根据源商品ID
    // 保存草稿，获取草稿数据
    // 填充品牌信息 调用接口获取品牌信息
    // 填充主图 和详情 接口方式
        /**
         *  "mainImagesGroup": {
        "images": [
            {
                "url": "//img.alicdn.com/imgextra/i1/695637589/O1CN01bkK3tN25voluyH7Di_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i3/695637589/O1CN01DanQGT25volrl7WVu_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i2/695637589/O1CN013s5TpM25volu5Cz9o_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i1/695637589/O1CN01HwFwrL25voltcUqcD_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            },
            {
                "url": "//img.alicdn.com/imgextra/i3/695637589/O1CN019fkYuu25voltcTZZb_!!695637589.webp",
                "pix": "800x800",
                "width": "800",
                "height": "800"
            }
        ]
    },
         */


        /**
         * 填充详情
         * 
         * "descForShenbiPc": {
        "pushCode": -602086880,
        "customizationData": null,
        "detail": "<div style=\"width: 750px; height:0px; overflow: hidden;\"><div style=\"width: 750px; height:0px; overflow: hidden;\"></div></div>",
        "nativeDetail": null,
        "cid": 29512987050589
    },
    "descForShenbiMobile": {
        "sign": "36B9A99D3B1C18C7FAD06618A6042E59",
        "descContainer": {
            "customizationData": null,
            "detail": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<wapDesc><img size=\"403918\">https://img.alicdn.com/imgextra/i1/695637589/O1CN01DoFyCU25volvWAMWz_!!695637589.webp</img><img size=\"442678\">https://img.alicdn.com/imgextra/i1/695637589/O1CN01UD7iC825volubFdMR_!!695637589.webp</img><img size=\"340086\">https://img.alicdn.com/imgextra/i1/695637589/O1CN01g2blH125voltr5oUm_!!695637589.webp</img><img size=\"569402\">https://img.alicdn.com/imgextra/i2/695637589/O1CN01IVM2Gq25voluyGe8L_!!695637589.webp</img><img size=\"586314\">https://img.alicdn.com/imgextra/i4/695637589/O1CN01mWstLA25volubBfwV_!!695637589.webp</img></wapDesc>",
            "editorVersion": null,
            "featureMatch": null,
            "features": {
                "tspeditor_sell_wl_push": "-241882901",
                "tspeditor_wl_template": "0",
                "wap_desc_component_sizechart": "0"
            },
            "itemUpdateData": null,
            "moduleList": "group",
            "nativeDetail": "{\"api\":\"com.taobao.wireless.DescTemplate\",\"data\":{\"ID\":\"detail_layout_0\",\"children\":[{\"ID\":\"detail_pic_1736922846678_1\",\"key\":\"detail_container_style7\",\"params\":{\"childrenStyle\":\"sequence\",\"picUrl\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01DoFyCU25volvWAMWz_!!695637589.webp\",\"size\":{\"width\":\"620\",\"height\":\"1357\"}},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"detail_pic_1736922846678_2\",\"key\":\"detail_container_style7\",\"params\":{\"childrenStyle\":\"sequence\",\"picUrl\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01UD7iC825volubFdMR_!!695637589.webp\",\"size\":{\"width\":\"620\",\"height\":\"1360\"}},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"detail_pic_1736922846678_3\",\"key\":\"detail_container_style7\",\"params\":{\"childrenStyle\":\"sequence\",\"picUrl\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01g2blH125voltr5oUm_!!695637589.webp\",\"size\":{\"width\":\"620\",\"height\":\"1357\"}},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"detail_pic_1736922846678_4\",\"key\":\"detail_container_style7\",\"params\":{\"childrenStyle\":\"sequence\",\"picUrl\":\"https://img.alicdn.com/imgextra/i2/695637589/O1CN01IVM2Gq25voluyGe8L_!!695637589.webp\",\"size\":{\"width\":\"620\",\"height\":\"1352\"}},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"detail_pic_1736922846678_5\",\"key\":\"detail_container_style7\",\"params\":{\"childrenStyle\":\"sequence\",\"picUrl\":\"https://img.alicdn.com/imgextra/i4/695637589/O1CN01mWstLA25volubBfwV_!!695637589.webp\",\"size\":{\"width\":\"620\",\"height\":\"1349\"}},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"_SL_SeeMore\",\"children\":[{\"ID\":\"seemore_division_title6\",\"key\":\"detail_division_title\",\"params\":{\"backgroundColor\":\"0xffffff\",\"titleColor\":\"0x051b28\",\"lineColor\":\"0xffffff\",\"title\":\"看了又看\"},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"_SL_SeeMore_Component\",\"key\":\"detail_iteminfo\",\"params\":{\"loopStyle\":\"loop\"},\"putID\":-1,\"type\":\"native\"}],\"key\":\"detail_container_style3\",\"params\":{\"childrenStyle\":\"sequence\"},\"putID\":-1,\"type\":\"native\"},{\"ID\":\"division_b1736922846678_7\",\"key\":\"division\",\"params\":{\"topLine\":\"double\",\"bgcolor\":\"0xeeeeee\",\"type\":\"text\",\"title\":\"已经到最底了\"},\"putID\":-1,\"type\":\"native\"}],\"key\":\"sys_list\",\"params\":{\"shenbiJsonTfsUrl\":\"desc/icoss4223076335ca6f3f5a5c3133eb\",\"requestMap\":\"{\\\"see_more\\\":true}\"},\"putID\":-1,\"type\":\"native\"},\"ret\":[\"SUCCESS::调用成功\"],\"v\":\"1.0\"}",
            "recommendInfo": {
                "isSmart": -1,
                "itemIdList": "-1",
                "putsetId": -1
            },
            "removeFeatures": [],
            "removeTags": [
                466050
            ],
            "tags": [],
            "templateId": null,
            "templateVersion": null,
            "tmallDetailH5": null,
            "tmallModuleList": null
        },
        "cid": 29512987060589
    },
    "descRepublicOfSell": {
        "descPageCommitParam": {
            "opt": 2,
            "clientType": 1,
            "userId": 695637589,
            "itemId": 0,
            "templateId": 0,
            "templateContent": "{\"groups\":[{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1357},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1357,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01DoFyCU25volvWAMWz_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1357},\"picMeta\":{\"width\":800,\"height\":1751,\"size\":403918,\"id\":1758908353522604300},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912746774\",\"groupId\":\"group1736912752733\",\"selected\":false}],\"groupId\":\"group1736912752733\",\"id\":\"group1736912752733\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1360},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1360,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01UD7iC825volubFdMR_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1360},\"picMeta\":{\"width\":800,\"height\":1755,\"size\":442678,\"id\":1758908352681609500},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912749567\",\"groupId\":\"group1736912747271\",\"selected\":false}],\"groupId\":\"group1736912747271\",\"id\":\"group1736912747271\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1357},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1357,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01g2blH125voltr5oUm_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1357},\"picMeta\":{\"width\":800,\"height\":1751,\"size\":340086,\"id\":1758908351999557400},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912750531\",\"groupId\":\"group1736912750160\",\"selected\":false}],\"groupId\":\"group1736912750160\",\"id\":\"group1736912750160\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1352},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1352,\"background-image\":\"https://img.alicdn.com/imgextra/i2/695637589/O1CN01IVM2Gq25voluyGe8L_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1352},\"picMeta\":{\"width\":800,\"height\":1745,\"size\":569402,\"id\":1758908353021706500},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912746791\",\"groupId\":\"group1736912754155\",\"selected\":false}],\"groupId\":\"group1736912754155\",\"id\":\"group1736912754155\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1349},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1349,\"background-image\":\"https://img.alicdn.com/imgextra/i4/695637589/O1CN01mWstLA25volubBfwV_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1349},\"picMeta\":{\"width\":800,\"height\":1741,\"size\":586314,\"id\":1758908352680666000},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912751746\",\"groupId\":\"group1736912752708\",\"selected\":false}],\"groupId\":\"group1736912752708\",\"id\":\"group1736912752708\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":20},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":10,\"left\":0,\"width\":620,\"height\":0,\"background-color\":\"transparent\"},\"textStyle\":{\"color\":\"#333333\",\"value\":\"\",\"font-weight\":\"normal\",\"font-size\":14,\"font-family\":\"SimHei, STHeiti\",\"font-style\":\"normal\",\"text-align\":\"left\",\"text-decoration\":\"none\"},\"componentName\":\"文字组件\",\"componentType\":\"text\",\"componentId\":\"component1736922772043\",\"groupId\":\"group1736922771943\",\"selected\":false}],\"groupId\":\"group1736922771943\",\"id\":\"group1736922771943\",\"bizName\":\"图文模块\"}],\"sellergroups\":[]}",
            "version": 0,
            "freeTry": 0,
            "needServerComposite": false,
            "batchPut": false,
            "detailHeight": 6775,
            "params": "params",
            "maxHeight": 100000,
            "articleId": 0,
            "bsellerBack2OldVersion": false,
            "sell": false,
            "smart": false,
            "newItem": true,
            "fliggyItem": false,
            "changed": true,
            "catId": 50011165,
            "bizSource": "sell",
            "draftKey": "sell_695637589_12503_11464",
            "descDomain": "//g.alicdn.com",
            "descVersion": "1.1.53",
            "bseller": false,
            "sourceAgent": "sell",
            "editType": "lite",
            "detailParam": ""
        },
        "descPageRenderParam": {
            "userId": 695637589,
            "itemId": 0,
            "templateId": 0,
            "clientType": 1,
            "catId": 50011165,
            "bizSource": "sell",
            "draftKey": "sell_695637589_12503_11464",
            "descDomain": "//g.alicdn.com",
            "descVersion": "1.1.53",
            "bseller": false,
            "smart": false,
            "newItem": true
        },
        "descPageRenderModel": {
            "wholeConfigBO": {
                "width": 620,
                "maxHeight": 100000,
                "splitHeight": 960,
                "ratio": 2,
                "canCoverFromTmall": false,
                "userId": 695637589,
                "liteCannotEdit": false,
                "renderWhite": false
            },
            "descPageDO": {
                "templateId": 0,
                "editRst": "{\"groups\":[{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1357},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1357,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01DoFyCU25volvWAMWz_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1357},\"picMeta\":{\"width\":800,\"height\":1751,\"size\":403918,\"id\":1758908353522604300},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912746774\",\"groupId\":\"group1736912752733\",\"selected\":false}],\"groupId\":\"group1736912752733\",\"id\":\"group1736912752733\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1360},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1360,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01UD7iC825volubFdMR_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1360},\"picMeta\":{\"width\":800,\"height\":1755,\"size\":442678,\"id\":1758908352681609500},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912749567\",\"groupId\":\"group1736912747271\",\"selected\":false}],\"groupId\":\"group1736912747271\",\"id\":\"group1736912747271\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1357},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1357,\"background-image\":\"https://img.alicdn.com/imgextra/i1/695637589/O1CN01g2blH125voltr5oUm_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1357},\"picMeta\":{\"width\":800,\"height\":1751,\"size\":340086,\"id\":1758908351999557400},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912750531\",\"groupId\":\"group1736912750160\",\"selected\":false}],\"groupId\":\"group1736912750160\",\"id\":\"group1736912750160\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1352},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1352,\"background-image\":\"https://img.alicdn.com/imgextra/i2/695637589/O1CN01IVM2Gq25voluyGe8L_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1352},\"picMeta\":{\"width\":800,\"height\":1745,\"size\":569402,\"id\":1758908353021706500},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912746791\",\"groupId\":\"group1736912754155\",\"selected\":false}],\"groupId\":\"group1736912754155\",\"id\":\"group1736912754155\",\"bizName\":\"图文模块\"},{\"type\":\"group\",\"hide\":false,\"bizCode\":0,\"propertyPanelVisible\":true,\"level\":1,\"boxStyle\":{\"background-color\":\"#ffffff\",\"width\":620,\"height\":1349},\"position\":\"middle\",\"groupName\":\"模块\",\"scenario\":\"wde\",\"components\":[{\"type\":\"component\",\"level\":2,\"sellerEditable\":true,\"boxStyle\":{\"rotate\":0,\"z-index\":0,\"top\":0,\"left\":0,\"width\":620,\"height\":1349,\"background-image\":\"https://img.alicdn.com/imgextra/i4/695637589/O1CN01mWstLA25volubBfwV_!!695637589.webp\"},\"componentName\":\"图片组件\",\"clipType\":\"rect\",\"imgStyle\":{\"top\":0,\"left\":0,\"width\":620,\"height\":1349},\"picMeta\":{\"width\":800,\"height\":1741,\"size\":586314,\"id\":1758908352680666000},\"isEdit\":false,\"componentType\":\"pic\",\"componentId\":\"component1736912751746\",\"groupId\":\"group1736912752708\",\"selected\":false}],\"groupId\":\"group1736912752708\",\"id\":\"group1736912752708\",\"bizName\":\"图文模块\"}],\"sellergroups\":[]}"
            },
            "extendFields": "{}",
            "extendConfig": {
                "functionConfig": {
                    "showPreview": true,
                    "seniorEditDisabled": false,
                    "showDistinguish": false,
                    "showBackOldVersion": true,
                    "showTemplate": true,
                    "foreverDisableEdit": false
                }
            }
        }
    },
         */
    // 填充销售信息 
    /**
     *   1. 根据 skus的 获取到相关的属性和值 判断是否有图片 
     *   2. 组装 草稿的 sku属性
     *       {
            "cspuId": null,
            "skuPrice": "111.00",
            "skuBatchInventory": null,
            "action": {
                "selected": true
            },
            "skuId": null,
            "skuStatus": 1,
            "skuStock": 99,
            "skuQuality": {
                "value": "mainSku",
                "text": "单品",
                "prefilled": true,
                "prefilledText": {
                    "bottom": "<span style='color:#ff6600'>请确认分类</span>"
                }
            },
            "skuCustomize": {
                "text": "否",
                "value": 0
            },
            "disabled": null,
            "props": [
                {
                    "name": "p-1627207",
                    "img": "https://img.alicdn.com/imgextra/i2/695637589/O1CN01888uR425volu5AIlK_!!695637589.webp",
                    "text": "黑色",
                    "value": 28341,
                    "pix": "800x800",
                    "label": "颜色"
                },
                {
                    "name": "p-20509",
                    "value": 3267942,
                    "text": "165/88A",
                    "label": "尺码"
                }
            ],
            "salePropKey": "1627207-28341_20509-3267942",
            "errorInfo": {},
            "skuSpecification": null,
            "skuTitle": null,
            "_originalIndex": 0
        }
     * 
     */
    // 调用接口 更新草稿信息

    // 确认无误，发布商品


    // 1. document.querySelector(".image-list .text").click() 获取主图
          //mainImagesGroup 弹出iframe
          //点击iframe 中的 图片  
          //document.querySelector(".next-checkbox-group.next-checkbox-group-hoz.PicturesShow_PicturesShow_main-document__oAlE7 input").click()


    // document.querySelector(".next-input.next-medium.fusion-input input").value = "dsadsad" 标题设置

    // 下拉框选中 document.querySelector(".options-content .options-item").click()


}