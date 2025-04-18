#!/bin/bash

# 安装macOS平台特定的Sharp模块
npm install --os=darwin --cpu=arm64 sharp

sh package.sh
cp .env ./dist/
electron-builder --mac --x64
