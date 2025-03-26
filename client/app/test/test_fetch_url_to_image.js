
const playwright = require('playwright');
const sharp = require('sharp');

async function screenshot(url, path) {
    const device = playwright.devices['iPhone 13 Pro'];
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext({
        ...device,
    });
    const page = await context.newPage();
    await page.goto('http://172.18.38.178:8081/lumos/home?channel=ZY_T3&channelCode=ZY_T3');
     // 选择要截图的元素
     const element = await page.locator('.m-home-page-v2-container.m-home-page-v2-container-enhanced').first(); // 替换为你的选择器

     // 获取元素的边界框
     const boundingBox = await element.boundingBox();
 
     // 截图并保存为长图
     await page.screenshot({
         path: 'test.png',
         fullPage: true
        //  clip: {
        //      x: boundingBox.x,
        //      y: boundingBox.y,
        //      width: boundingBox.width,
        //      height: boundingBox.height
        //  }
     });
 
    // await browser.close();
}

async function mergeImage(imageFile1, imageFile2) {  
    const image1 = await sharp(imageFile1);
    const image2 = await sharp(imageFile2);
    const { width: firstWidth, height: firstHeight } = await image1.metadata();
    const { height: secondHeight } = await image2.metadata();

    await sharp({
        create: {
            width: firstWidth,
            height: firstHeight + secondHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 } // 背景颜色
        }
    })
    .composite([
        { input: imageFile1, top: 0, left: 0 },
        { input: imageFile2, top: firstHeight, left: 0 }
    ])
    .toFile('combined-image.png');
}

(async () => {
    await mergeImage('1.png', '2.png');
})();