const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const scp2 = require('scp2');
const util = require('util');

// 使用 fs.promises 来处理异步文件操作
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// 排除的文件和文件夹规则（可以根据需要扩展）
const excludePatterns = [
  'builder-debug.yml',
  'win-unpacked'
];

// 检查文件或文件夹是否匹配排除模式
function shouldExclude(filePath) {
  return excludePatterns.some(pattern => {
    return filePath.includes(pattern);
  });
}

// 获取目录中的所有文件（包括子目录）
async function getFiles(dir) {
  const files = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      // 递归获取子目录文件
      files.push(...await getFiles(fullPath));
    } else {
      // 如果不是排除的文件或文件夹，加入结果
      if (!shouldExclude(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}


// 打包应用
function buildApp() {
  return new Promise((resolve, reject) => {
    // 此处的命令换成你的打包命令
    exec('pnpm electron-builder --win --x64', (err, stdout, stderr) => {
      if (err) {
        reject(`打包失败: ${stderr}`);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
}

// 上传单个文件到远程服务器
function uploadFile(file) {
  return new Promise((resolve, reject) => {
    scp2.scp(file, {
      host: '127.0.0.1',
      username: 'katana',
      password: '1008',
      path: '/Users/dxt/Desktop/katana/nginx/html/updates',
    }, (err) => {
      if (err) {
        reject(`SCP上传失败 ${file}: ${err}`);
        return;
      }
      console.log(`文件 ${file} 已成功上传`);
      resolve();
    });
  });
}

// 上传所有文件到远程服务器
async function uploadToServer(files) {
  for (const file of files) {
    await uploadFile(file); // 逐个上传文件
  }
}

// 执行打包和上传
async function release() {
  try {
    console.log('开始打包...');
    await buildApp();
    console.log('打包完成，正在上传...');
    const distPath = path.join(__dirname, 'dist');
    const files = await getFiles(distPath);
    await uploadToServer(files);
    console.log('版本发布完成!');
  } catch (err) {
    console.error('版本发布失败:', err);
    process.exit(1);
  }
}

release();

