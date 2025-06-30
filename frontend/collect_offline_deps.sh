#!/bin/bash
# =====================================
# 前端一键离线依赖收集脚本（WSL优化）
# =====================================
# 可在任何目录下执行，自动切换到脚本所在目录
# =====================================
set -e
cd "$(dirname "$0")"
echo "[INFO] 正在本地联网安装依赖..."
npm install
echo "[OK] 所有依赖已下载到 node_modules/ 目录。"
echo "[提示] Dockerfile中可用如下方式离线构建："
echo "  COPY node_modules/ ./node_modules/"
echo "  RUN npm run build"