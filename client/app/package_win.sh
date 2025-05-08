#!/bin/bash

# 检查 resource/win 目录下是否存在 @img 和 sharp 文件夹
if [ -d "resource/win/@img" ] && [ -d "resource/win/sharp" ]; then
    echo "Found cached @img and sharp folders, copying to node_modules..."
    # 删除现有的文件夹
    rm -rf node_modules/@img
    rm -rf node_modules/sharp
    
    # 从缓存复制文件夹到 node_modules
    cp -r resource/win/@img node_modules/
    cp -r resource/win/sharp node_modules/
else
    echo "No cached folders found, installing sharp..."
    # 删除现有的文件夹
    rm -rf node_modules/@img
    rm -rf node_modules/sharp
    
    # 安装 sharp
    npm install --os=win32 --arch=x64 sharp
    
    # 确保 resource/win 目录存在
    mkdir -p resource/win
    
    # 复制到 resource/win 作为缓存
    cp -r node_modules/@img resource/win/
    cp -r node_modules/sharp resource/win/
fi

# 继续执行打包过程
sh package.sh
cp .env ./dist/
electron-builder --win --x64
