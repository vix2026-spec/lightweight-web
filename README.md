# lightweight-web

A lightweight Node.js Express web page designed for deployment on **GCP e2-micro VM**.

---

## English

### Prerequisites

- GCP e2-micro VM (or any Linux VM)
- Node.js & npm
- pm2 (`npm install -g pm2`)
- git

### First-time Deployment

```bash
# Clone the repository
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/vix2026-spec/lightweight-web.git

# Set directory ownership
sudo chown -R $USER:$USER /var/www/lightweight-web

# Install dependencies
cd /var/www/lightweight-web/light_web
npm install

# Start with pm2
pm2 start app.js --name lightweight-web

# Save pm2 config and enable auto-start on reboot
pm2 save
pm2 startup  # Copy and run the command it outputs
```

### Updating （After deployment）

```bash
cd /var/www/lightweight-web
git pull origin main
pm2 restart lightweight-web
```

---

## 繁體中文

### 環境需求

- GCP e2-micro VM（或任何 Linux VM）
- Node.js 與 npm
- pm2（`npm install -g pm2`）
- git

### 首次佈署

```bash
# Clone 專案
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/vix2026-spec/lightweight-web.git

# 設定目錄權限
sudo chown -R $USER:$USER /var/www/lightweight-web

# 安裝相依套件
cd /var/www/lightweight-web/light_web
npm install

# 用 pm2 啟動伺服器
pm2 start app.js --name lightweight-web

# 儲存 pm2 設定，並設定開機自動啟動
pm2 save
pm2 startup  # 複製它輸出的指令並執行
```

### 後續更新（佈署後的更新方式）

```bash
cd /var/www/lightweight-web
git pull origin main
pm2 restart lightweight-web
```
