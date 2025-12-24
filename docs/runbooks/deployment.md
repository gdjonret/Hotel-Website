# Deployment Runbook

## 🚀 Deployment Overview

This runbook covers deployment procedures for the Hotel Process booking system across different environments.

## 🏗️ Environment Setup

### Development Environment
```bash
# Prerequisites
- Node.js v18.x or higher
- npm v8.x or higher
- Git

# Setup steps
git clone <repository-url>
cd Hotel_process\ 2
npm install
cp .env.example .env  # Configure environment variables
npm start
```

### Production Environment
```bash
# Prerequisites
- Node.js v18.x (LTS)
- PM2 process manager
- Nginx (reverse proxy)
- SSL certificates

# Environment variables
NODE_ENV=production
PORT=3000
BACKEND_URL=https://api.yourdomain.com
SESSION_SECRET=<secure-random-string>
CORS_ORIGINS=https://yourdomain.com
```

## 📦 Build Process

### CSS Processing
```bash
# Build optimized CSS
npm run build:css

# Files processed:
# public/css/*.css → minified and autoprefixed
```

### Asset Optimization
```bash
# Optimize images (manual process)
- Compress images in public/images/
- Use WebP format where supported
- Implement lazy loading for large images
```

## 🔧 Configuration Management

### Environment Variables
```bash
# Required for production
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Backend integration
BACKEND_URL=https://api.yourdomain.com
BACKEND_TIMEOUT=10000

# Security
SESSION_SECRET=<generate-secure-key>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### SSL/TLS Configuration
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
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

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  hotel-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BACKEND_URL=http://backend:8080
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: hotel-backend:latest
    ports:
      - "8080:8080"
    restart: unless-stopped
```

## ☁️ Cloud Deployment

### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init hotel-process-frontend

# Create environment
eb create production

# Deploy
eb deploy
```

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create hotel-process-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set BACKEND_URL=https://your-backend.herokuapp.com

# Deploy
git push heroku main
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build CSS
      run: npm run build:css
    
    - name: Deploy to production
      run: |
        # Your deployment script here
        npm run deploy:prod
```

## 📊 Health Checks

### Application Health
```javascript
// Add to app.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

### Backend Connectivity
```javascript
// Add to health check
app.get('/health/backend', async (req, res) => {
  try {
    const response = await axios.get(`${env.BACKEND_URL}/health`, {
      timeout: 5000
    });
    res.json({
      status: 'healthy',
      backend: response.data
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Backend unavailable'
    });
  }
});
```

## 🔍 Monitoring Setup

### Process Manager (PM2)
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hotel-process-frontend',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Log Rotation
```bash
# Setup logrotate
sudo nano /etc/logrotate.d/hotel-process

/path/to/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reload hotel-process-frontend
    endscript
}
```

## 🚨 Rollback Procedures

### Quick Rollback
```bash
# Using PM2
pm2 stop hotel-process-frontend
git checkout <previous-commit>
npm install
pm2 start ecosystem.config.js
```

### Database Rollback
```bash
# If backend changes affect database
# Coordinate with backend team for rollback
# Ensure data consistency
```

## 📋 Pre-deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code review completed
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met

### Configuration
- [ ] Environment variables updated
- [ ] SSL certificates valid
- [ ] CORS origins configured
- [ ] Backend connectivity verified

### Monitoring
- [ ] Health checks responding
- [ ] Log aggregation working
- [ ] Error tracking configured
- [ ] Performance monitoring active

### Backup
- [ ] Database backup completed (backend)
- [ ] Configuration backup saved
- [ ] Previous version tagged in Git

## 🔧 Post-deployment Verification

### Functional Testing
```bash
# Test critical paths
curl https://yourdomain.com/health
curl https://yourdomain.com/
curl -X POST https://yourdomain.com/api/bookings -d '{"test": true}'
```

### Performance Testing
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Monitor response times and error rates
```

### Security Verification
```bash
# SSL certificate check
openssl s_client -connect yourdomain.com:443

# Security headers check
curl -I https://yourdomain.com/
```
