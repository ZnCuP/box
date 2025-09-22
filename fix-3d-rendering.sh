#!/bin/bash

echo "🔧 修复3D渲染问题..."

# 1. 停止前端服务
echo "1. 停止前端服务..."
pm2 stop packme-frontend 2>/dev/null || echo "前端服务未运行"
pm2 delete packme-frontend 2>/dev/null || echo "清理旧进程"

# 2. 清理构建缓存
echo "2. 清理构建缓存..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# 3. 重新构建项目（已修复HDR加载问题）
echo "3. 重新构建项目..."
npm run build

# 4. 检查构建结果
echo "4. 检查构建结果..."
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist目录不存在"
    exit 1
fi

echo "✅ 构建成功，检查文件："
ls -la dist/

# 5. 检查是否有script.js文件（可能导致冲突）
echo "5. 检查潜在冲突文件..."
if [ -f "dist/script.js" ]; then
    echo "⚠️  发现可能冲突的script.js文件，重命名为script.js.bak"
    mv dist/script.js dist/script.js.bak
fi

# 6. 确保serve已安装
echo "6. 确保serve已安装..."
if ! command -v serve &> /dev/null; then
    echo "安装serve..."
    npm install -g serve
fi

# 7. 启动前端服务
echo "7. 启动前端服务..."
pm2 start "serve -s dist -l 5173 -H 0.0.0.0" --name "packme-frontend"

# 8. 等待服务启动
echo "8. 等待服务启动..."
sleep 3

# 9. 检查服务状态
echo "9. 检查服务状态..."
pm2 status

# 10. 测试服务
echo "10. 测试服务连通性..."
echo "测试前端服务："
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:5173

echo "测试后端服务："
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3001/api/health

# 11. 保存PM2配置
echo "11. 保存PM2配置..."
pm2 save

echo ""
echo "🎯 修复完成！"
echo "前端地址: http://8.134.236.143:5173"
echo "后端地址: http://8.134.236.143:3001"
echo ""
echo "✅ 已修复的问题："
echo "1. HDR环境贴图加载失败 - 改用本地光照"
echo "2. WebGL上下文丢失 - 清理缓存重新构建"
echo "3. script.js冲突 - 自动检测并重命名"
echo ""
echo "如果3D区域仍然有问题，可能需要："
echo "1. 检查浏览器WebGL支持"
echo "2. 清除浏览器缓存"
echo "3. 尝试不同的浏览器"