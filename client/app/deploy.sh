#!/bin/bash

remote_path="app/updates"
bucket_name="eavesdropper" # 七牛云空间名
qiniuyun_domain="http://eavesdropper.eaochat.com"


echo "开始部署Electron应用更新文件..."

# 读取.env中的SERVER_TARGET环境变量
if [ -f ./.env ]; then
    echo "正在读取.env文件..."
    # 修改grep命令，排除注释行（以#开头的行）
    SERVER_TARGET=$(grep -v "^#" ./.env | grep SERVER_TARGET | cut -d '=' -f2 | tr -d ' "')
    echo "从.env获取SERVER_TARGET: $SERVER_TARGET"
    
else
    echo "无法找到.env文件，将使用默认SERVER_TARGET"
fi

# 显示将要使用的SERVER_TARGET
echo "将使用SERVER_TARGET: $SERVER_TARGET"

# 获取最新版本信息
echo "正在获取最新版本信息..."
# 添加更多curl选项以便调试
VERSION_INFO=$(curl -v -s "${SERVER_TARGET}/api/version/latest?appId=taotaoapp" 2>&1)
CURL_STATUS=$?
echo "服务器返回的完整JSON数据:"
echo "$VERSION_INFO"

if [ $CURL_STATUS -ne 0 ] || [ -z "$VERSION_INFO" ]; then
    echo "获取版本信息失败，将使用当前package.json中的版本"
else
    echo "成功获取版本信息"
    
    # 直接提取data对象中的version和changeLog字段
    VERSION=$(echo $VERSION_INFO | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)
    CHANGE_LOG=$(echo $VERSION_INFO | grep -o '"changeLog":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    # 调试信息
    echo "提取到的版本号: $VERSION"
    echo "提取到的更新日志: $CHANGE_LOG"
    
    # 更新package.json文件
    if [ -n "$VERSION" ] && [ -n "$CHANGE_LOG" ]; then
        echo "更新package.json中的版本号和更新日志..."
        
        # 首先备份package.json文件
        cp package.json package.json.bak
        
        echo "正在更新版本号..."
        # 更新版本号 - 使用perl进行更准确的替换
        perl -i -pe "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
        
        echo "正在更新更新日志..."
        # 使用JavaScript处理换行符和引号转义，更可靠
        ESCAPED_CHANGELOG=$(node -e "
          const log = \`$CHANGE_LOG\`;
          const escaped = log.replace(/\"/g, '\\\\\"').replace(/\n/g, '\\\\\\\\n');
          console.log(escaped);
        ")
        
        echo "转义后的更新日志: $ESCAPED_CHANGELOG"
        
        # 使用处理后的CHANGE_LOG更新releaseNotes - 使用sed直接修改releaseNotes字段
        # 确保只更新build.releaseInfo.releaseNotes字段，而不是添加新字段
        sed -i'.bak' -e "s|\"releaseNotes\": \"[^\"]*\"|\"releaseNotes\": \"$ESCAPED_CHANGELOG\"|" package.json
        
        # 验证releaseNotes是否正确更新
        grep -n "releaseNotes" package.json
        
        # 验证版本号更新是否成功
        NEW_VERSION=$(grep -o '"version": "[^"]*"' package.json | head -1 | cut -d'"' -f4)
        echo "更新后的package.json版本号: $NEW_VERSION"
        
        if [ "$NEW_VERSION" = "$VERSION" ]; then
            echo "package.json版本号更新成功!"
        else
            echo "警告: package.json版本号更新可能失败。期望: $VERSION, 实际: $NEW_VERSION"
            echo "尝试使用备份文件重新更新..."
            cp package.json.bak package.json
            
            # 直接使用sed再次尝试更新版本号
            sed -i'.bak' -e "s|\"version\": \"[^\"]*\"|\"version\": \"$VERSION\"|" package.json
            
            # 再次验证
            NEW_VERSION=$(grep -o '"version": "[^"]*"' package.json | head -1 | cut -d'"' -f4)
            echo "第二次尝试后的package.json版本号: $NEW_VERSION"
        fi
        
        # 删除备份文件
        rm -f package.json.bak
    else
        echo "从API获取的版本号或更新日志为空，将使用当前package.json中的信息"
    fi
fi

# 步骤1: 确定要打包的平台
platform=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到macOS系统，将打包macOS版本"
    platform="mac"
else
    echo "检测到非macOS系统，将打包Windows版本"
    platform="win"
fi

# 允许用户覆盖平台选择
read -p "要打包的平台 (mac/win/both) [$platform]: " platform_input
if [ -n "$platform_input" ]; then
    platform=$platform_input
fi

# 清空package目录，确保没有旧版本文件混淆
echo "清空package目录..."
rm -rf ./package/*

# 创建临时目录用于存放准备上传的文件(无空格版本)
echo "创建临时目录..."
TEMP_DIR="./temp_upload"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 函数：打包并上传特定平台文件
package_and_upload() {
    local platform=$1
    
    # 执行构建和打包
    echo "打包 $platform 版本..."
    if [ "$platform" == "mac" ]; then
        npm run package:mac
    elif [ "$platform" == "win" ]; then
        # 安装Windows平台特定的Sharp模块
        npm run package:win
    else
        echo "不支持的平台: $platform"
        return 1
    fi

    if [ $? -ne 0 ]; then
        echo "$platform 打包失败"
        return 1
    fi

    # 检查生成的文件
    local upload_files=()
    local temp_files=()
    
    # 显示打包目录内容，帮助调试
    echo "打包目录内容:"
    ls -la ./package/
    
    if [ "$platform" == "mac" ]; then
        # 检查macOS包文件 - 按时间顺序获取最新的DMG文件
        local dmg_file=$(find ./package -name "*.dmg" -not -name "*.blockmap" | sort -r | head -1)
        local yml_file=$(find ./package -name "latest-mac.yml" | head -1)
        
        if [ -z "$dmg_file" ] || [ -z "$yml_file" ]; then
            echo "找不到必要的macOS打包文件"
            echo "DMG文件: $dmg_file"
            echo "YML文件: $yml_file"
            echo "目录中的YML文件列表:"
            find ./package -name "*.yml"
            return 1
        fi
        
        echo "找到DMG文件: $dmg_file"
        echo "找到YML文件: $yml_file"
        
        # 要上传的文件
        upload_files=("$dmg_file" "$yml_file")
        
        # 可选：包含blockmap文件用于差量更新 - 确保获取最新版本的blockmap
        local dmg_basename=$(basename "$dmg_file" .dmg)
        local blockmap_file=$(find ./package -name "${dmg_basename}.dmg.blockmap" | head -1)
        if [ -n "$blockmap_file" ]; then
            echo "找到blockmap文件: $blockmap_file"
            upload_files+=("$blockmap_file")
        fi
    else
        # 检查Windows包文件 - 正确查找主安装包，避免选择elevate.exe等辅助程序
        # 使用更精确的模式匹配查找Setup安装包
        local exe_file=$(find ./package -name "*Setup*.exe" -not -name "*.blockmap" | sort -r | head -1)
        
        # 如果没找到，尝试第二种模式（直接在package根目录查找）
        if [ -z "$exe_file" ]; then
            exe_file=$(find ./package -maxdepth 1 -name "*.exe" -not -name "*.blockmap" | sort -r | head -1)
        fi
        
        # 查找latest.yml元数据文件 - 直接在package根目录中搜索
        local yml_file=$(find ./package -maxdepth 1 -name "latest.yml" | head -1)
        
        # 如果没找到，搜索整个package目录
        if [ -z "$yml_file" ]; then
            yml_file=$(find ./package -name "latest.yml" | head -1)
        fi
        
        if [ -z "$exe_file" ] || [ -z "$yml_file" ]; then
            echo "找不到必要的Windows打包文件"
            echo "EXE文件: $exe_file"
            echo "YML文件: $yml_file"
            # 输出找到的所有EXE和YML文件帮助调试
            echo "目录中的所有EXE文件列表:"
            find ./package -name "*.exe" -not -name "*.blockmap"
            echo "目录中的所有YML文件列表:"
            find ./package -name "*.yml"
            return 1
        fi
        
        echo "找到EXE文件: $exe_file"
        echo "找到YML文件: $yml_file"
        
        # 要上传的文件
        upload_files=("$exe_file" "$yml_file")
        
        # 可选：包含blockmap文件用于差量更新 - 确保获取最新版本的blockmap
        local exe_basename=$(basename "$exe_file" .exe)
        local blockmap_file=$(find ./package -name "${exe_basename}.exe.blockmap" | head -1)
        if [ -n "$blockmap_file" ]; then
            echo "找到blockmap文件: $blockmap_file"
            upload_files+=("$blockmap_file")
        fi
    fi
    
    # 打印即将上传的所有文件
    echo "即将上传的文件列表:"
    for file in "${upload_files[@]}"; do
        echo " - $file"
    done
    
    # 复制文件到临时目录，保持原始文件名
    rm -rf $TEMP_DIR/*
    for file in "${upload_files[@]}"; do
        local filename=$(basename "$file")
        echo "复制 $filename 到临时目录..."
        cp "$file" "$TEMP_DIR/$filename"
        temp_files+=("$TEMP_DIR/$filename")
    done
    
    # 上传文件到服务器，分别上传每个文件
    echo "开始上传文件..."
    for file in "${temp_files[@]}"; do
        local filename=$(basename "$file")
        echo "正在上传 $filename..."
        
        # 创建一个没有空格的临时文件名
        local safe_filename=$(echo "$filename" | tr ' ' '_')
        local temp_safe_file="$TEMP_DIR/$safe_filename"
        
        # 复制到安全文件名
        cp "$file" "$temp_safe_file"
        
        # 上传文件，使用没有空格的文件名
        # echo "执行命令: scp $temp_safe_file $remote_server:$remote_path/$safe_filename"
        # sshpass -p "$remote_password" scp $SSH_OPTS "$temp_safe_file" "$remote_server:$remote_path/$safe_filename"
        qiniuyun_upload $temp_safe_file $remote_path/$safe_filename
        
        if [ $? -ne 0 ]; then
            echo "上传 $filename 失败"
            return 1
        fi
        
        # 如果上传的是含空格的文件名，在服务器上重命名回原始文件名
        if [ "$filename" != "$safe_filename" ]; then
            echo "在服务器上重命名 $safe_filename 回 '$filename'"
            # sshpass -p "$remote_password" ssh $SSH_OPTS "$remote_server" "cd $remote_path && mv $safe_filename \"$filename\""
            qiniuyun_upload $temp_safe_file $remote_path/$filename
        fi
                
        echo "$filename 上传并验证成功"
    done
    
    return 0
}

# 文件上传至七牛云
# 配置qshell账号
# 使用前创建用户配置KEY qshell account "$QINIU_ACCESS_KEY" "$QINIU_SECRET_KEY" "eavesdropper"
qiniuyun_upload() {
    local_file=$1 # 本地文件路径
    remote_file=$2 # 远程文件路径

    # 检查qshell是否安装
    if ! command -v qshell &> /dev/null; then
        echo "错误：qshell未安装，请先安装qshell工具"
        echo "下载地址：https://developer.qiniu.com/kodo/tools/1302/qshell"
        exit 1
    fi

    # 上传文件
    echo "正在上传文件 $local_file 到七牛云空间 $bucket_name..."
    qshell fput $bucket_name $remote_file $local_file --overwrite

    # 检查上传结果
    if [ $? -eq 0 ]; then
        echo "上传成功！"
        # 获取文件公开访问URL（如果是公开空间）
        echo "文件URL：$qiniuyun_domain/$remote_file"
    else
        echo "上传失败！"
        exit 1
    fi
}

# 步骤3: 执行打包和上传
if [ "$platform" == "both" ]; then
    echo "将依次打包Windows和macOS版本..."
    
    echo "========== 开始Windows版本打包 =========="
    package_and_upload "win"
    win_status=$?
    
    echo "========== 开始macOS版本打包 =========="
    package_and_upload "mac"
    mac_status=$?
    
    if [ $win_status -ne 0 ] && [ $mac_status -ne 0 ]; then
        echo "Windows和macOS版本都打包失败，部署终止"
        exit 1
    elif [ $win_status -ne 0 ]; then
        echo "Windows版本打包失败，但macOS版本打包成功"
    elif [ $mac_status -ne 0 ]; then
        echo "macOS版本打包失败，但Windows版本打包成功"
    else
        echo "Windows和macOS版本都打包成功"
    fi
else
    echo "========== 开始 $platform 版本打包 =========="
    package_and_upload "$platform"
    if [ $? -ne 0 ]; then
        echo "$platform 版本打包或上传失败，部署终止"
        exit 1
    fi
fi

# 清理临时文件
rm -rf $TEMP_DIR

echo "所有文件上传完成!"
echo "版本更新文件已部署到服务器: $remote_server:$remote_path/"
echo "客户端将在下次启动时自动检测并提示更新"
