const fs = require("fs");
const axios = require("axios");

const responseData = fs.readFileSync("./220259498220.html", "utf8");
//responseData 包含 window.rawData={data: {}}
const match = responseData.match(/window\.rawData\s*=\s*({.*})/);
if(match){
    let rawData = match[0];
    rawData = rawData.substring(rawData.indexOf("{"), rawData.length);
    const jsonData = JSON.parse(rawData);
    const initDataObj = jsonData?.store?.initDataObj;
    if(!initDataObj){
        console.log("initDataObj not found");
        return;
    }
    const data = {
        data: JSON.stringify(initDataObj),
        type: "pdd",
        itemKey: "220259498220",
        doorKey : "PxxSkuMonitor"
    };
    console.log(JSON.stringify(initDataObj));
    axios.post("http://101.43.28.195:8081/api/doors/save", data).then(res => {
        // console.log(res.data);
    }).then(res => {
        // console.log(res.data);
    });
} else {
    console.log("row data not found");
}

