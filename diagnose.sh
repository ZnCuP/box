#!/bin/bash

echo "🔍 诊断前端服务问题..."

echo "1. 检查PM2状态："
pm2 status

echo ""
echo "2. 检查前端服务日志："
pm2 logs packme-frontend --lines 20

echo ""
echo "3. 检查端口占用："
netstat -tlnp | grep :5173

echo ""
echo "4. 检查dist目录是否存在："
ls -la dist/

echo ""
echo "5. 测试本地访问："
curl -I http://localhost:5173

echo ""
echo "6. 检查防火墙状态："
systemctl status firewalld 2>/dev/null || echo "firewalld未运行"

echo ""
echo "7. 检查iptables规则："
iptables -L INPUT | grep 5173 || echo "未找到5173端口规则"