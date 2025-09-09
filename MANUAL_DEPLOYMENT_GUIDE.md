# Manual Deployment Guide for Vinque E-commerce

## Current Status
The automated deployment scripts are encountering password authentication issues. This guide provides manual steps to complete the deployment.

## Password Information
- **SSH Password**: `@Chons123`
- **Server**: 151.106.117.181:65002
- **Username**: u528702659

## Phase 1: Server Setup (Manual Execution Required)

### Step 1: Test SSH Connection
```bash
ssh -p 65002 u528702659@151.106.117.181 "whoami && pwd && echo 'SSH Connection Successful'"
```
**Action**: Enter password `@Chons123` when prompted

### Step 2: Update System Packages
```bash
ssh -p 65002 u528702659@151.106.117.181 "sudo apt update && sudo apt upgrade -y"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 3: Add Node.js Repository
```bash
ssh -p 65002 u528702659@151.106.117.181 "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 4: Install Node.js
```bash
ssh -p 65002 u528702659@151.106.117.181 "sudo apt install -y nodejs"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 5: Install MySQL Server
```bash
ssh -p 65002 u528702659@151.106.117.181 "sudo apt install -y mysql-server"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 6: Install PM2 Process Manager
```bash
ssh -p 65002 u528702659@151.106.117.181 "sudo npm install -g pm2"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 7: Install Nginx Web Server
```bash
ssh -p 65002 u528702659@151.106.117.181 "sudo apt install -y nginx"
```
**Action**: Enter password `@Chons123` when prompted, then enter it again for sudo

### Step 8: Create Application Directory
```bash
ssh -p 65002 u528702659@151.106.117.181 "mkdir -p /home/u528702659/vinque-app && cd /home/u528702659/vinque-app && pwd"
```
**Action**: Enter password `@Chons123` when prompted

## Phase 2: File Upload

After completing Phase 1, proceed with file upload using the commands in `INSTALLATION_STEPS.txt`:

### Upload Backend Files
```bash
scp -P 65002 -r Backend u528702659@151.106.117.181:/home/u528702659/vinque-app/
```

### Upload Frontend Files
```bash
scp -P 65002 -r pro u528702659@151.106.117.181:/home/u528702659/vinque-app/
```

### Upload Configuration Files
```bash
scp -P 65002 .env.production u528702659@151.106.117.181:/home/u528702659/vinque-app/Backend/.env
scp -P 65002 package.json u528702659@151.106.117.181:/home/u528702659/vinque-app/
scp -P 65002 create_db.sql u528702659@151.106.117.181:/home/u528702659/vinque-app/
scp -P 65002 create_orders_table.sql u528702659@151.106.117.181:/home/u528702659/vinque-app/
```

## Phase 3: Database Setup

### Setup MySQL Database
```bash
ssh -p 65002 u528702659@151.106.117.181
# Once connected:
sudo mysql -u root -p < /home/u528702659/vinque-app/create_db.sql
sudo mysql -u root -p vinque_db < /home/u528702659/vinque-app/create_orders_table.sql
```

## Phase 4: Application Setup

### Install Dependencies and Start Application
```bash
ssh -p 65002 u528702659@151.106.117.181
# Once connected:
cd /home/u528702659/vinque-app
npm install
cd Backend
npm install
pm2 start server.js --name "vinque-backend"
cd ../pro
npm install
npm run build
pm2 serve dist --name "vinque-frontend" --spa
```

## Phase 5: Nginx Configuration

### Configure Nginx
```bash
ssh -p 65002 u528702659@151.106.117.181
# Once connected:
sudo nano /etc/nginx/sites-available/vinque
# Add the Nginx configuration from INSTALLATION_STEPS.txt
sudo ln -s /etc/nginx/sites-available/vinque /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Alternative: Use Existing SSH Sessions

If you have active SSH sessions in other terminals (Terminal 3, 4, 5, or 6), you can use those to execute the commands directly without re-authenticating.

## Troubleshooting

1. **Password Issues**: Always use `@Chons123` for both SSH and sudo prompts
2. **Connection Timeout**: If SSH times out, retry the command
3. **Permission Denied**: Ensure you're using the correct password
4. **MySQL Issues**: Use `sudo mysql_secure_installation` if needed

## Next Steps

After completing all phases:
1. Test the application at your server's IP address
2. Configure domain name if needed
3. Set up SSL certificates
4. Configure firewall rules

---

**Note**: This manual approach is necessary due to Windows SSH client limitations with automated password entry. Each command requires manual password input.