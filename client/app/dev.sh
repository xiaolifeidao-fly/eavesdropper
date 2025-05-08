
# 检查 resource/mac 目录下是否存在 @img 和 sharp 文件夹
if [ -d "resource/mac/@img" ] && [ -d "resource/mac/sharp" ]; then
    echo "Found cached @img and sharp folders, copying to node_modules..."
    # 删除现有的文件夹
    rm -rf node_modules/@img
    rm -rf node_modules/sharp
    
    # 从缓存复制文件夹到 node_modules
    cp -r resource/mac/@img node_modules/
    cp -r resource/mac/sharp node_modules/
else
    echo "No cached folders found, installing sharp..."
    # 删除现有的文件夹
    rm -rf node_modules/@img
    rm -rf node_modules/sharp
    
    # 安装 sharp
    npm install sharp
    
    # 确保 resource/mac 目录存在
    mkdir -p resource/mac
    
    # 复制到 resource/mac 作为缓存
    cp -r node_modules/@img resource/mac/
    cp -r node_modules/sharp resource/mac/
fi
cp -rf static/html ../resource/ 
webpack --config webpack.config.js --mode development
electron .