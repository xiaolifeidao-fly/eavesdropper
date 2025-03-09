const fs = require('fs');
const path = require('path');

function getFilesInDirectory(dirPath) {
    return fs.readdirSync(dirPath).filter(file => {
        return fs.statSync(path.join(dirPath, file)).isFile(); // 只返回文件
    });
}

function writeFileNamesToTxt(dirPath, outputFilePath) {
    const files = getFilesInDirectory(dirPath);
    const fileNames = files.map(file => "https://mobile.yangkeduo.com/goods.html?goods_id=" + file.split('.')[0]);
    fs.writeFileSync(outputFilePath, fileNames.join('\n'), 'utf8'); // 每行一个文件名
}

// 使用示例
const directoryPath = '/Users/fly/Library/Containers/com.tencent.xinWeChat/Data/Library/Application Support/com.tencent.xinWeChat/2.0b4.0.9/7440eb8864d19c7e68748c64eae79a40/Message/MessageTemp/7a4674989b55d23ab01e0e7457c67d00/File/商品链接'; // 替换为您的目录路径
const outputFilePath = 'output.txt'; // 输出文件名
writeFileNamesToTxt(directoryPath, outputFilePath);
