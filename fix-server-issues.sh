#!/bin/bash

echo "🔧 PackMe服务器问题修复脚本"
echo "================================"

# 1. 检查服务状态
echo "📊 检查当前服务状态..."
pm2 status

# 2. 检查端口占用
echo ""
echo "🔍 检查端口占用情况..."
echo "前端端口 5173:"
netstat -tlnp | grep :5173 || echo "端口5173未被占用"
echo "后端端口 3001:"
netstat -tlnp | grep :3001 || echo "端口3001未被占用"

# 3. 检查环境变量配置
echo ""
echo "🌍 检查环境变量配置..."
if [ -f ".env.production" ]; then
    echo "✅ .env.production 文件存在"
    cat .env.production
else
    echo "❌ .env.production 文件不存在，正在创建..."
    # 获取服务器外网IP
    SERVER_IP=$(curl -s ifconfig.me)
    cat > .env.production << EOF
# 生产环境API配置
VITE_API_BASE_URL=http://${SERVER_IP}:3001/api
EOF
    echo "✅ 已创建 .env.production 文件"
    cat .env.production
fi

# 4. 重新构建项目
echo ""
echo "🔨 重新构建项目..."
npm run build

# 5. 停止现有服务
echo ""
echo "🛑 停止现有服务..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 6. 创建日志目录
echo ""
echo "📁 创建日志目录..."
mkdir -p logs

# 7. 启动后端服务
echo ""
echo "🚀 启动后端服务..."
pm2 start server.js --name "packme-backend" --log ./logs/backend.log

# 8. 等待后端启动
echo ""
echo "⏳ 等待后端服务启动..."
sleep 3

# 9. 测试后端API
echo ""
echo "🧪 测试后端API连接..."
curl -s http://localhost:3001/api/health && echo "✅ 后端API正常" || echo "❌ 后端API异常"

# 10. 启动前端服务
echo ""
echo "🚀 启动前端服务..."
pm2 start "npm run preview -- --host 0.0.0.0 --port 5173" --name "packme-frontend" --log ./logs/frontend.log

# 11. 保存PM2配置
echo ""
echo "💾 保存PM2配置..."
pm2 save

# 12. 显示最终状态
echo ""
echo "📊 最终服务状态:"
pm2 status

echo ""
echo "✅ 修复完成！"
echo ""
echo "🌐 访问地址:"
echo "前端: http://$(curl -s ifconfig.me):5173"
echo "后端: http://$(curl -s ifconfig.me):3001"
echo ""
echo "📋 常用命令:"
echo "查看日志: pm2 logs"
echo "重启服务: pm2 restart all"
echo "停止服务: pm2 stop all"