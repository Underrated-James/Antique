# Vinque E-commerce Deployment Guide

This guide will help you deploy the Vinque e-commerce system to your Stinger host using SSH.

## Prerequisites

### Local Machine Requirements
- SSH client installed
- SSH key pair generated (`ssh-keygen -t rsa -b 4096`)
- rsync installed (for file synchronization)
- Access to your Stinger host

### Server Requirements (Stinger Host)
- Ubuntu/Debian Linux server
- Root or sudo access
- Internet connection
- At least 2GB RAM and 20GB storage

## Quick Deployment

### Option 1: Using PowerShell Script (Windows)

```powershell
# Make sure you're in the project directory
cd "C:\path\to\vinque-main"

# Run the deployment script
.\deploy.ps1 -ServerIP "your-stinger-host-ip" -Username "root"
```

### Option 2: Using Bash Script (Linux/WSL)

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh your-stinger-host-ip root
```

## Manual Deployment Steps

If you prefer to deploy manually or need to troubleshoot:

### Step 1: Prepare Your SSH Connection

1. **Generate SSH key** (if not already done):
   ```bash
   ssh-keygen -t rsa -b 4096
   ```

2. **Copy your public key to the server**:
   ```bash
   ssh-copy-id root@your-stinger-host-ip
   ```

3. **Test SSH connection**:
   ```bash
   ssh root@your-stinger-host-ip
   ```

### Step 2: Server Setup

Connect to your server and run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
sudo mkdir -p /var/www/vinque
sudo chown -R $USER:$USER /var/www/vinque
```

### Step 3: Upload Application Files

From your local machine:

```bash
# Upload database files
scp create_db.sql create_orders_table.sql root@your-server-ip:/var/www/vinque/

# Upload backend files
rsync -avz --exclude='node_modules' Backend/ root@your-server-ip:/var/www/vinque/backend/

# Upload frontend files
rsync -avz --exclude='node_modules' --exclude='dist' pro/ root@your-server-ip:/var/www/vinque/frontend/
```

### Step 4: Database Setup

On your server:

```bash
# Secure MySQL installation (optional but recommended)
sudo mysql_secure_installation

# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`e-web\`;"

# Import database schema
cd /var/www/vinque
mysql -u root -p e-web < create_db.sql
mysql -u root -p e-web < create_orders_table.sql
```

### Step 5: Install Dependencies

```bash
# Install backend dependencies
cd /var/www/vinque/backend
npm install --production

# Install frontend dependencies and build
cd /var/www/vinque/frontend
npm install
npm run build
```

### Step 6: Configure Environment

1. **Copy production environment file**:
   ```bash
   cp /var/www/vinque/.env.production /var/www/vinque/backend/.env
   ```

2. **Edit the environment file**:
   ```bash
   nano /var/www/vinque/backend/.env
   ```
   
   Update the following values:
   - `DB_PASSWORD`: Your MySQL root password
   - `FRONTEND_URL`: Your domain or server IP
   - `JWT_SECRET`: Generate a secure random string
   - Other configuration as needed

### Step 7: Setup Process Manager (PM2)

1. **Create PM2 ecosystem file**:
   ```bash
   cat > /var/www/vinque/ecosystem.config.js << 'EOF'
   module.exports = {
     apps: [{
       name: 'vinque-backend',
       script: './backend/server.js',
       cwd: '/var/www/vinque',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   EOF
   ```

2. **Start the application**:
   ```bash
   cd /var/www/vinque
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Step 8: Configure Nginx Reverse Proxy

1. **Create Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/vinque
   ```

2. **Add this configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       # Frontend (static files)
       location / {
           root /var/www/vinque/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:3000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/vinque /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Post-Deployment Steps

### 1. Setup SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 2. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 3. Setup Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# Check application logs
pm2 logs vinque-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check MySQL service: `sudo systemctl status mysql`
   - Verify database credentials in `.env` file
   - Test database connection: `mysql -u root -p e-web`

2. **Frontend Not Loading**:
   - Check if build was successful: `ls /var/www/vinque/frontend/dist`
   - Verify Nginx configuration: `sudo nginx -t`
   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

3. **Backend API Not Working**:
   - Check PM2 status: `pm2 status`
   - View backend logs: `pm2 logs vinque-backend`
   - Test backend directly: `curl http://localhost:3000`

4. **Permission Issues**:
   - Fix ownership: `sudo chown -R www-data:www-data /var/www/vinque`
   - Fix permissions: `sudo chmod -R 755 /var/www/vinque`

### Useful Commands

```bash
# Restart application
pm2 restart vinque-backend

# Update application (after code changes)
cd /var/www/vinque/backend && npm install --production
cd /var/www/vinque/frontend && npm install && npm run build
pm2 restart vinque-backend
sudo systemctl reload nginx

# View system resources
htop
df -h
free -h

# Database backup
mysqldump -u root -p e-web > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Security Recommendations

1. **Change default MySQL root password**
2. **Create a dedicated MySQL user for the application**
3. **Setup fail2ban for SSH protection**
4. **Enable automatic security updates**
5. **Regular database backups**
6. **Monitor server resources and logs**

## Support

If you encounter any issues during deployment:

1. Check the logs first (PM2, Nginx, MySQL)
2. Verify all services are running
3. Test each component individually
4. Check firewall and network connectivity

---

**Your Vinque e-commerce system should now be live at your domain/server IP!**