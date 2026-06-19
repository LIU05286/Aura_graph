#!/usr/bin/env bash
set -e

cd ~/apps/Aura_graph

echo "Pulling latest code..."
git pull

echo "Installing frontend dependencies..."
npm install

echo "Building project..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "Deploying dist to Nginx..."
sudo rsync -av --delete dist/ /var/www/aura-graph/

# —— 后端(存在 server/ 才处理) ——
if [ -d server ]; then
  echo "Installing backend dependencies..."
  ( cd server && npm install )
  echo "Restarting backend service..."
  sudo systemctl restart aura-api || echo "  (aura-api 服务尚未安装,先做一次性设置)"
fi

echo "Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy finished."
