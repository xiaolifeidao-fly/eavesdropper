const fs = require("fs");

const responseData = fs.readFileSync("./220259498220.html", "utf8");
//responseData 包含 window.rawData={data: {}}
console.log(responseData);  
const match = responseData.match(/window\.rawData\s*=\s*({.*})/);
if(match){
    let rawData = match[0];
    rawData = rawData.substring(rawData.indexOf("{"), rawData.length);
    console.log("row data ", rawData);
} else {
    console.log("row data not found");
}

