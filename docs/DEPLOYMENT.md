# Deployment Guide

Complete instructions for deploying the n8n Workflow Library to production.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Requirements](#server-requirements)
3. [Docker Deployment](#docker-deployment)
4. [Database Setup](#database-setup)
5. [Reverse Proxy Setup](#reverse-proxy-setup)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations tested
- [ ] Frontend build tested locally
- [ ] Security headers configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Backup plan in place
- [ ] Monitoring tools installed
- [ ] Log aggregation configured
- [ ] Rate limiting configured
- [ ] CORS origins configured
- [ ] Admin credentials changed

## 🖥️ Server Requirements

### Minimum (Small Deployment)
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Bandwidth**: 10 Mbps

### Recommended (Medium Deployment)
- **CPU**: 4 cores
- **RAM**: 8-16 GB
- **Storage**: 100+ GB SSD
- **Bandwidth**: 100 Mbps

### High-Traffic (Large Deployment)
- **CPU**: 8+ cores
- **RAM**: 32+ GB
- **Storage**: 500+ GB SSD
- **Bandwidth**: 1+ Gbps

### Software
- Docker CE 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+ (if not containerized)
- Ubuntu 20.04 LTS or similar

## 🐳 Docker Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone <your-repo-url> minisaas-wordpress
cd minisaas-wordpress
sudo chown -R $USER:$USER .
```

### Step 3: Configure Environment

```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration
nano backend/.env
nano frontend/.env
```

**Critical environment variables:**

**Backend:**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/minisaas_db
JWT_SECRET=<generate-secure-random-string>
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
PORT=3000
```

**Frontend:**
```
VITE_API_URL=https://your-domain.com/api/v1
VITE_APP_URL=https://your-domain.com
```

### Step 4: Build and Deploy

```bash
# Build images
docker-compose -f docker/docker-compose.yml build

# Start services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Step 5: Verify Deployment

```bash
# Check services are running
docker ps

# Test health endpoint
curl http://localhost:3000/health

# Check logs for errors
docker logs minisaas-backend
docker logs minisaas-frontend
```

## 🗄️ Database Setup

### Step 1: Database Creation

The database is created automatically by the container, but verify:

```bash
# Connect to PostgreSQL
docker exec -it minisaas-postgres psql -U minisaas -d minisaas_db

# Check tables
\dt

# Exit
\q
```

### Step 2: Run Migrations

```bash
# From backend directory
docker exec minisaas-backend npx prisma migrate deploy

# Verify schema
docker exec minisaas-postgres psql -U minisaas -d minisaas_db -c "\dt"
```

### Step 3: Seed Initial Data (Optional)

```bash
# Create seed script
cat > backend/prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash('changeme', salt)
  
  await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      apiKey: 'sk_' + Math.random().toString(36).substr(2, 24),
    },
  })
  
  console.log('Seeded admin user: admin@example.com')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
EOF

# Run seed
docker exec minisaas-backend npm run db:seed
```

## 🔄 Reverse Proxy Setup

### Using Traefik (Recommended)

Use the included Traefik configuration in `docker-compose.yml` with production profile:

```bash
docker-compose -f docker/docker-compose.yml --profile production up -d
```

### Using Nginx

Create `/etc/nginx/sites-available/minisaas`:

```nginx
upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API backend
    location /api/ {
        proxy_pass http://backend;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/minisaas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL/TLS Certificates

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

### Using Traefik (Automated)

```bash
# Traefik automatically handles Let's Encrypt renewal
docker-compose -f docker/docker-compose.yml --profile production restart reverse-proxy
```

## 📊 Monitoring & Logging

### Docker Logs

```bash
# View logs
docker logs minisaas-backend
docker logs minisaas-frontend
docker logs minisaas-postgres

# Follow logs in real-time
docker logs -f minisaas-backend

# View specific number of lines
docker logs --tail 100 minisaas-backend
```

### Prometheus Monitoring

Add to `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  ports:
    - "9090:9090"
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
  networks:
    - minisaas-network
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

For advanced logging and analysis - documentation at [elastic.co](https://elastic.co)

## 💾 Backup & Recovery

### Database Backup

```bash
# Manual backup
docker exec minisaas-postgres pg_dump -U minisaas minisaas_db > backup.sql

# Restore from backup
docker exec -i minisaas-postgres psql -U minisaas minisaas_db < backup.sql

# Automated daily backup
0 2 * * * docker exec minisaas-postgres pg_dump -U minisaas minisaas_db > /backups/minisaas_$(date +\%Y\%m\%d).sql
```

Add to crontab:
```bash
sudo crontab -e
```

### Volume Backup

```bash
# Backup PostgreSQL volume
docker run --rm -v minisaas-postgres_data:/data -v $(pwd)/backups:/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Restore from backup
docker run --rm -v minisaas-postgres_data:/data -v $(pwd)/backups:/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /
```

### Complete System Backup

```bash
# Backup entire application
sudo tar -czf /backups/minisaas-backup-$(date +%Y%m%d).tar.gz /opt/minisaas-wordpress

# Restore application
sudo tar -xzf /backups/minisaas-backup-20240116.tar.gz -C /opt/
```

## 🔄 Zero-Downtime Deployment

### Rolling Update

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose -f docker/docker-compose.yml build

# Stop processes gracefully
docker-compose -f docker/docker-compose.yml down --timeout 30

# Start new version
docker-compose -f docker/docker-compose.yml up -d

# Verify health
curl http://localhost:3000/health
```

### Blue-Green Deployment

Maintain two production instances and switch traffic:

```bash
# Deploy to green environment
docker-compose -f docker/docker-compose.green.yml build
docker-compose -f docker/docker-compose.green.yml up -d

# Test green environment
curl http://green.your-domain.com/api/v1/health

# Switch traffic (update reverse proxy or DNS)
# Point traffic from blue to green

# Keep blue as fallback
docker-compose -f docker/docker-compose.blue.yml up
```

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs <container-name>

# Inspect container
docker inspect <container-name>

# Check resource constraints
docker stats
```

### Database Connection Issues

```bash
# Test connection
docker exec minisaas-postgres pg_isready -U minisaas

# Check credentials in .env
cat backend/.env | grep DATABASE_URL
```

### High Memory Usage

```bash
# Check memory limits
docker inspect minisaas-backend | grep Memory

# Update docker-compose.yml
services:
  backend:
    mem_limit: 1g
    memswap_limit: 2g
```

## 📞 Support & Resources

- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Nginx Docs](https://nginx.org/en/docs)
- [Let's Encrypt](https://letsencrypt.org)
- [Traefik Docs](https://doc.traefik.io)

---

**Last Updated:** 2024
