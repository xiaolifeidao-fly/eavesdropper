const content = "success.htm?primaryId=891171473015&catId=50025942&isEdit=false";
                
// 新增代码：从 content 中提取 primaryId
const primaryIdMatch = content.match(/primaryId=(\d+)/);
let primaryId = null;
if (primaryIdMatch && primaryIdMatch[1]) {
    primaryId = primaryIdMatch[1];
}
console.log(primaryId);