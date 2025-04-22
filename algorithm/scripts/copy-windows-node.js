const fs = require('fs');
const path = require('path');

// 设置路径
const rootDir = path.resolve(__dirname, '..');
const windowsNodeDir = path.join(rootDir, 'win32-x64-msvc');
const windowsNodeFile = 'algorithm.win32-x64-msvc.node';
const sourcePath = path.join(windowsNodeDir, windowsNodeFile);
const destPath = path.join(rootDir, windowsNodeFile);

// 检查win32-x64-msvc目录是否存在
if (fs.existsSync(windowsNodeDir)) {
  // 检查Windows的.node文件是否存在于win32-x64-msvc目录中
  if (fs.existsSync(sourcePath)) {
    console.log(`发现Windows .node文件: ${sourcePath}`);
    
    try {
      // 复制文件到根目录
      fs.copyFileSync(sourcePath, destPath);
      console.log(`成功复制 ${windowsNodeFile} 到 ${rootDir}`);
    } catch (err) {
      console.error(`复制文件时出错: ${err.message}`);
    }
  } else {
    console.log(`警告: Windows .node文件不存在: ${sourcePath}`);
    
    // 检查是否有其他.node文件在该目录中
    const files = fs.readdirSync(windowsNodeDir);
    const nodeFiles = files.filter(file => file.endsWith('.node'));
    
    if (nodeFiles.length > 0) {
      console.log(`发现其他.node文件: ${nodeFiles.join(', ')}`);
      
      // 检查是否有包含"win"或"windows"的.node文件
      const winNodeFiles = nodeFiles.filter(file => 
        file.toLowerCase().includes('win') || 
        file.toLowerCase().includes('windows')
      );
      
      if (winNodeFiles.length > 0) {
        const winNodeFile = winNodeFiles[0];
        const winNodePath = path.join(windowsNodeDir, winNodeFile);
        
        try {
          fs.copyFileSync(winNodePath, destPath);
          console.log(`复制 ${winNodeFile} 到 ${destPath}`);
        } catch (err) {
          console.error(`复制文件时出错: ${err.message}`);
        }
      } else {
        console.error('错误: 未找到Windows版本的.node文件，不会使用非Windows文件替代。');
        console.error('请确保使用正确的交叉编译工具链编译Windows版本。');
        process.exit(1);
      }
    } else {
      console.error('错误: 未找到任何.node文件');
      process.exit(1);
    }
  }
} else {
  console.error(`错误: Windows .node目录不存在: ${windowsNodeDir}`);
  console.error('请确保使用 "napi build --platform win32-x64-msvc --release" 命令构建Windows版本');
  process.exit(1);
} 