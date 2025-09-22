# 阿里云服务器部署指南

## 🔧 问题修复说明

**已修复的问题**：之前遇到的API连接问题是因为前端代码中硬编码了 `localhost:3001`，在阿里云服务器上无法访问。

**修复内容**：
1. ✅ 修改了 `src/utils/fileUtils.ts`，支持动态API地址配置
2. ✅ 添加了环境变量支持，可以通过 `.env.production` 配置API地址
3. ✅ 更新了部署脚本，自动配置正确的API地址

## 前置条件

1. 阿里云ECS服务器（推荐配置：2核4G以上）
2. 已安装Node.js 18+
3. 已安装npm或yarn
4. 开放安全组端口：5173（前端）、3001（后端）

## 部署步骤

### 1. 上传代码到服务器

```bash
# 将项目代码上传到 /home/box 目录
scp -r packme-visualizer/ root@your-server-ip:/home/box/
```

### 2. 登录服务器并进入项目目录

```bash
ssh root@your-server-ip
cd /home/box
```

### 3. 执行部署脚本

```bash
# 给脚本执行权限
chmod +x deploy-simple.sh

# 执行部署
./deploy-simple.sh
```

### 4. 验证部署

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 检查端口是否监听
netstat -tlnp | grep :5173
netstat -tlnp | grep :3001
```

## 访问应用

- 前端地址：`http://your-server-ip:5173`
- 后端API：`http://your-server-ip:3001`

## 常用管理命令

```bash
# 重启所有服务
pm2 restart all

# 停止所有服务
pm2 stop all

# 查看实时日志
pm2 logs --lines 100

# 重新加载配置
pm2 reload ecosystem.config.js

# 删除所有服务
pm2 delete all
```

## 故障排除

### 1. 端口被占用

```bash
# 查看端口占用
lsof -i :5173
lsof -i :3001

# 杀死占用进程
kill -9 <PID>
```

### 2. 权限问题

```bash
# 确保目录权限正确
chown -R root:root /home/box
chmod -R 755 /home/box
```

### 3. 防火墙设置

```bash
# CentOS/RHEL
firewall-cmd --permanent --add-port=5173/tcp
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# Ubuntu/Debian
ufw allow 5173
ufw allow 3001
```

### 4. API连接问题

检查 `src/utils/fileUtils.ts` 中的API地址配置是否正确。系统会自动根据当前域名配置API地址。

## 自动配置说明

项目已配置自动环境检测：
- 本地开发：使用 `localhost:3001`
- 生产环境：使用 `当前域名:3001`

这样无需手动修改API地址配置。