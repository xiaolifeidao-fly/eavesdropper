#!/bin/bash

# 安装Windows平台特定的Sharp模块
npm install --os=win32 --cpu=x64 sharp

sh package.sh
cp .env ./dist/
electron-builder --win --x64
