#!/bin/bash

echo "🔧 修复前端服务..."

# 确保在正确的目录
cd /home/box

# 停止前端服务
echo "🛑 停止前端服务..."
pm2 stop packme-frontend
pm2 delete packme-frontend

# 检查dist目录
echo "📁 检查构建文件..."
if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在，开始构建..."
    npm run build
else
    echo "✅ dist目录存在"
    ls -la dist/
fi

# 检查package.json中的preview命令
echo "📋 检查preview命令..."
npm run preview --help

# 方法1：使用vite preview直接启动
echo "🚀 方法1：直接使用vite preview启动..."
pm2 start "npx vite preview --host 0.0.0.0 --port 5173" --name "packme-frontend-vite"

# 等待几秒
sleep 3

# 检查状态
echo "📊 检查服务状态..."
pm2 status

# 测试访问
echo "🧪 测试本地访问..."
curl -I http://localhost:5173

echo ""
echo "如果上面的方法不行，我们尝试方法2..."

# 方法2：使用serve静态文件服务器
echo "🚀 方法2：安装并使用serve..."
npm install -g serve
pm2 start "serve -s dist -l 5173 -H 0.0.0.0" --name "packme-frontend-serve"

# 保存配置
pm2 save

echo "✅ 修复完成！"
echo "📊 最终状态："
pm2 status