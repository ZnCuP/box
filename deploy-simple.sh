#!/bin/bash

# 简化的阿里云部署脚本
echo "🚀 开始部署PackMe可视化工具..."

# 创建日志目录
mkdir -p logs

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📥 安装PM2..."
    npm install -g pm2
fi

# 使用PM2配置文件启动服务
echo "🚀 启动服务..."
pm2 start ecosystem.config.js

# 保存配置
pm2 save

echo "✅ 部署完成!"
echo ""
echo "📊 查看服务状态: pm2 status"
echo "📋 查看日志: pm2 logs"
echo "🔄 重启服务: pm2 restart all"
echo "🛑 停止服务: pm2 stop all"