#!/bin/bash

# 替换API文件中的环境变量引用
find ./src/api -type f -name "*.js" -exec sed -i '' 's/process.env.VUE_APP_API/import.meta.env.VITE_APP_API/g' {} \;

# 替换其他文件中可能的环境变量引用
find ./src/views -type f -name "*.vue" -exec sed -i '' 's/process.env.VUE_APP_API/import.meta.env.VITE_APP_API/g' {} \;

echo "环境变量引用更新完成" 