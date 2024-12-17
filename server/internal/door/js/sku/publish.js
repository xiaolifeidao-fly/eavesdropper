
class SkuPublish extends Sku {
    constructor(page){
        this.page = page;
    }
    doHandler(a, b){
        console.log("this is a test!," + (a + b));
        return a + b;
    }
}

return new SkuPublish().doHandler(page, a, b);