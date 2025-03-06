const urlObj = new URL("https://baike.taobao.com/list.htm?q=皖XK16-205-00020");
const searchParams = new URLSearchParams(urlObj.search);
const value = searchParams.get("q");
console.log(value);