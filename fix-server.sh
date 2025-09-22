#!/bin/bash

echo "🔧 修复阿里云服务器配置..."

# 停止并删除所有PM2进程
echo "🛑 清理现有PM2进程..."
pm2 stop all
pm2 delete all

# 确保在正确的目录
cd /home/box

# 重新构建项目（如果需要）
echo "🔨 重新构建项目..."
npm run build

# 启动后端服务
echo "🚀 启动后端服务..."
pm2 start server.js --name "packme-backend"

# 启动前端服务（正确的预览模式，绑定到所有网络接口）
echo "🌐 启动前端服务..."
pm2 start "npm run preview -- --host 0.0.0.0 --port 5173" --name "packme-frontend"

# 保存PM2配置
pm2 save

echo "✅ 修复完成！"
echo ""
echo "📊 服务状态："
pm2 status

echo ""
echo "🌐 访问地址："
echo "   前端: http://$(curl -s ifconfig.me):5173"
echo "   后端: http://$(curl -s ifconfig.me):3001"
echo ""
echo "⚠️  请确保阿里云安全组已开放 5173 和 3001 端口！"