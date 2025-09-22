#!/bin/bash

echo "🔓 配置服务器防火墙，开放必要端口..."

# 检查防火墙状态
echo "1. 检查防火墙状态："
if systemctl is-active --quiet firewalld; then
    echo "✅ firewalld 正在运行"
    FIREWALL_TYPE="firewalld"
elif command -v ufw >/dev/null 2>&1; then
    echo "✅ 检测到 ufw"
    FIREWALL_TYPE="ufw"
else
    echo "⚠️  未检测到常见防火墙，尝试使用 iptables"
    FIREWALL_TYPE="iptables"
fi

echo ""
echo "2. 开放端口 5173 和 3001："

case $FIREWALL_TYPE in
    "firewalld")
        echo "使用 firewalld 配置..."
        firewall-cmd --permanent --add-port=5173/tcp
        firewall-cmd --permanent --add-port=3001/tcp
        firewall-cmd --reload
        echo "✅ firewalld 配置完成"
        
        echo "当前开放的端口："
        firewall-cmd --list-ports
        ;;
        
    "ufw")
        echo "使用 ufw 配置..."
        ufw allow 5173/tcp
        ufw allow 3001/tcp
        echo "✅ ufw 配置完成"
        
        echo "当前 ufw 状态："
        ufw status
        ;;
        
    "iptables")
        echo "使用 iptables 配置..."
        iptables -I INPUT -p tcp --dport 5173 -j ACCEPT
        iptables -I INPUT -p tcp --dport 3001 -j ACCEPT
        
        # 保存 iptables 规则
        if command -v iptables-save >/dev/null 2>&1; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
            iptables-save > /etc/sysconfig/iptables 2>/dev/null || \
            echo "⚠️  请手动保存 iptables 规则"
        fi
        echo "✅ iptables 配置完成"
        
        echo "当前 iptables INPUT 规则："
        iptables -L INPUT -n | grep -E "(5173|3001)"
        ;;
esac

echo ""
echo "3. 检查端口监听状态："
netstat -tlnp | grep -E ":(5173|3001)" || echo "⚠️  端口未监听，请检查服务状态"

echo ""
echo "4. 测试端口连通性："
echo "测试 3001 端口（后端）："
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "❌ 后端服务未响应"

echo ""
echo "测试 5173 端口（前端）："
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "❌ 前端服务未响应"

echo ""
echo "🎯 重要提示："
echo "1. 服务器防火墙已配置，但阿里云安全组仍然是必需的！"
echo "2. 请在阿里云控制台 → ECS → 安全组中添加以下规则："
echo "   - 端口范围：5173/5173，协议：TCP，授权对象：0.0.0.0/0"
echo "   - 端口范围：3001/3001，协议：TCP，授权对象：0.0.0.0/0"
echo "3. 如果前端服务未响应，请先运行 ./fix-frontend.sh"

echo ""
echo "✅ 防火墙配置完成！"