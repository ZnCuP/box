#!/bin/bash

# 阿里云部署脚本
echo "🚀 开始部署到阿里云..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建前端项目
echo "🔧 设置生产环境配置..."
# 创建生产环境配置文件
cat > .env.production << EOF
# 生产环境API配置
VITE_API_BASE_URL=http://$(curl -s ifconfig.me):3001/api
EOF

echo "🔧 构建生产版本..."
npm run build

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📥 安装PM2..."
    npm install -g pm2
fi

# 停止现有服务（如果存在）
echo "🛑 停止现有服务..."
pm2 stop packme-backend 2>/dev/null || true
pm2 stop packme-frontend 2>/dev/null || true
pm2 delete packme-backend 2>/dev/null || true
pm2 delete packme-frontend 2>/dev/null || true

# 启动后端服务
echo "🚀 启动后端服务..."
pm2 start server.js --name "packme-backend"

# 启动前端服务（预览模式）
echo "🚀 启动前端服务..."
pm2 start "npm run preview -- --host 0.0.0.0 --port 5173" --name "packme-frontend"

# 保存PM2配置
echo "💾 保存PM2配置..."
pm2 save

# 设置PM2开机自启
echo "⚙️ 设置PM2开机自启..."
pm2 startup

# 显示服务状态
echo "📊 服务状态:"
pm2 status

echo "✅ 部署完成!"
echo "🌐 前端访问地址: http://$(curl -s ifconfig.me):5173"
echo "🔗 后端API地址: http://$(curl -s ifconfig.me):3001"
echo ""
echo "📝 请确保在阿里云安全组中开放以下端口:"
echo "   - 5173 (前端)"
echo "   - 3001 (后端API)"