# lightweight-web

A lightweight Node.js Express web application designed for deployment on **GCP e2-micro VM**, featuring user authentication and an admin panel.

**Features:**
- User registration and login (session-based, PBKDF2 password hashing)
- New accounts require admin approval before login
- Admin panel: approve / suspend / delete accounts, audit log
- SQLite database (no separate DB server required)
- CSRF protection, rate limiting, security headers

---

## English

### Prerequisites

- GCP e2-micro VM (or any Linux VM)
- Node.js 18+ and npm
- build-essential (`sudo apt-get install -y build-essential`)
- pm2 (`sudo npm install -g pm2`)
- git

### First-time Deployment

```bash
# Install Node.js and build tools
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Install pm2
sudo npm install -g pm2

# Clone the repository
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/vix2026-spec/lightweight-web.git

# Set directory ownership
sudo chown -R $USER:$USER /var/www/lightweight-web

# Install dependencies
cd /var/www/lightweight-web/light_web
npm install

# Start with pm2 (SESSION_SECRET is required)
export SESSION_SECRET=$(openssl rand -hex 32)
pm2 start app.js --name lightweight-web

# Save pm2 config and enable auto-start on reboot
pm2 save
pm2 startup  # Copy and run the command it outputs

# Create the first admin account
node /var/www/lightweight-web/light_web/setup-admin.js <username> <password>
```

### Updating (After deployment)

```bash
cd /var/www/lightweight-web
git pull origin main
cd light_web && npm install
pm2 restart lightweight-web
```

---

## 繁體中文

### 環境需求

- GCP e2-micro VM（或任何 Linux VM）
- Node.js 18+ 與 npm
- build-essential（`sudo apt-get install -y build-essential`）
- pm2（`sudo npm install -g pm2`）
- git

### 首次佈署

```bash
# 安裝 Node.js 與編譯工具
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# 安裝 pm2
sudo npm install -g pm2

# Clone 專案
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/vix2026-spec/lightweight-web.git

# 設定目錄權限
sudo chown -R $USER:$USER /var/www/lightweight-web

# 安裝相依套件
cd /var/www/lightweight-web/light_web
npm install

# 用 pm2 啟動伺服器（SESSION_SECRET 為必要環境變數）
export SESSION_SECRET=$(openssl rand -hex 32)
pm2 start app.js --name lightweight-web

# 儲存 pm2 設定，並設定開機自動啟動
pm2 save
pm2 startup  # 複製它輸出的指令並執行

# 建立第一個 admin 帳號
node /var/www/lightweight-web/light_web/setup-admin.js <帳號> <密碼>
```

### 後續更新（佈署後的更新方式）

```bash
cd /var/www/lightweight-web
git pull origin main
cd light_web && npm install
pm2 restart lightweight-web
```
