const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 设置路径
const rootDir = path.resolve(__dirname, '..');
const platformInfo = `平台: ${process.platform}, 架构: ${process.arch}`;
console.log(platformInfo);

// 列出所有.node文件
function findNodeFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // 递归搜索子目录
      results = results.concat(findNodeFiles(filePath));
    } else if (file.endsWith('.node')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// 检查文件类型
function checkFileType(filePath) {
  try {
    let cmd;
    if (process.platform === 'win32') {
      cmd = `file "${filePath}"`;
    } else {
      cmd = `file "${filePath}"`;
    }
    
    const output = execSync(cmd, { encoding: 'utf8' });
    return {
      path: filePath,
      type: output.trim()
    };
  } catch (error) {
    return {
      path: filePath,
      type: `Error: ${error.message}`
    };
  }
}

// 主函数
function main() {
  console.log('查找所有.node文件...');
  const nodeFiles = findNodeFiles(rootDir);
  
  if (nodeFiles.length === 0) {
    console.log('未找到任何.node文件');
    return;
  }
  
  console.log(`找到 ${nodeFiles.length} 个.node文件:`);
  
  nodeFiles.forEach(file => {
    const relativePath = path.relative(rootDir, file);
    const fileSize = fs.statSync(file).size;
    
    console.log(`\n文件: ${relativePath}`);
    console.log(`大小: ${(fileSize / 1024).toFixed(2)} KB`);
    
    try {
      // 尝试检查文件类型
      const fileInfo = checkFileType(file);
      console.log(`类型: ${fileInfo.type}`);
    } catch (error) {
      console.log(`无法检查文件类型: ${error.message}`);
    }
  });
}

main(); 