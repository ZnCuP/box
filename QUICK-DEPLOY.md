# 🚀 阿里云快速部署指南

## 📋 已完成的修改

### 1. ✅ API地址自动配置
- 修改了 `src/utils/fileUtils.ts`
- 自动检测环境：本地使用localhost，生产环境使用服务器IP
- 无需手动修改API地址

### 2. ✅ 部署脚本
- `deploy-simple.sh` - 简化部署脚本
- `ecosystem.config.js` - PM2配置文件
- 自动管理前后端服务

### 3. ✅ 构建修复
- 修复了TypeScript编译错误
- 项目可以正常构建

## 🎯 在阿里云服务器上的部署步骤

### 第一步：上传代码
```bash
# 将整个项目文件夹上传到服务器的 /home/box 目录
scp -r packme-visualizer/ root@your-server-ip:/home/box/
```

### 第二步：登录服务器并部署
```bash
# SSH登录服务器
ssh root@your-server-ip

# 进入项目目录
cd /home/box

# 执行部署脚本
chmod +x deploy-simple.sh
./deploy-simple.sh
```

### 第三步：配置安全组
在阿里云控制台开放以下端口：
- **5173** - 前端访问端口
- **3001** - 后端API端口

### 第四步：访问应用
- 前端：`http://your-server-ip:5173`
- 后端API：`http://your-server-ip:3001`

## 🔧 管理命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

## 🎉 完成！

现在你的PackMe可视化工具已经部署在阿里云服务器上，可以通过公网IP访问了！

API地址会自动配置为服务器IP，无需手动修改任何配置文件。