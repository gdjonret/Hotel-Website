# Troubleshooting Runbook

## 🚨 Common Issues & Solutions

### Server Won't Start

#### Issue: "Cannot find module" errors
```bash
Error: Cannot find module 'dotenv'
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Install missing dependencies
npm install

# If package-lock.json is corrupted
rm package-lock.json node_modules -rf
npm install

# Check Node.js version compatibility
node --version  # Should be v18.x or higher
```

#### Issue: Port already in use
```bash
Error: listen EADDRINUSE :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm start
```

#### Issue: Environment variables not loading
```bash
# .env file not found or not loaded
```

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify dotenv is installed
npm list dotenv

# Check file format (no spaces around =)
NODE_ENV=development
PORT=3000
```

### Runtime Errors

#### Issue: Template rendering errors
```bash
Error: Failed to lookup view "pages/index" in views directory
```

**Solution:**
```bash
# Check views directory structure
ls -la views/pages/

# Verify EJS is installed
npm list ejs

# Check template syntax
# Ensure proper EJS tags: <%= %>, <% %>
```

#### Issue: CORS errors in browser
```bash
Access to fetch blocked by CORS policy
```

**Solution:**
```javascript
// Check CORS configuration in src/config/cors.js
// Verify origins include your frontend URL
origin: ['http://localhost:3000', 'http://localhost:5000']

// Check environment variables
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

#### Issue: Backend connection failures
```bash
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Solution:**
```bash
# Check backend service status
curl http://localhost:8080/health

# Verify backend URL configuration
echo $BACKEND_URL

# Check network connectivity
ping localhost
telnet localhost 8080
```

### Database/API Issues

#### Issue: Booking creation fails
```bash
POST /api/bookings returns 500 Internal Server Error
```

**Diagnostic Steps:**
```bash
# Check backend logs
tail -f backend.log

# Test backend directly
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"roomNumber":101,"checkin":"2024-01-15","checkout":"2024-01-17"}'

# Verify data format
# Ensure dates are YYYY-MM-DD format
# Check required fields are present
```

**Solution:**
```javascript
// Check bookingMapper validation
const validation = bookingMapper.validateBookingData(data);
console.log('Validation result:', validation);

// Verify date format consistency
const dates = require('./src/utils/dates');
console.log('Date valid:', dates.isValidDateString('2024-01-15'));
```

### Frontend Issues

#### Issue: JavaScript errors in browser
```javascript
Uncaught ReferenceError: loadBookingSummary is not defined
```

**Solution:**
```html
<!-- Check script loading order -->
<script src="/js/lib/booking.js"></script>
<script src="/js/pages/checkout.js"></script>

<!-- Verify function exists -->
<script>
if (typeof loadBookingSummary === 'function') {
  loadBookingSummary();
} else {
  console.error('loadBookingSummary not loaded');
}
</script>
```

#### Issue: Date picker not working
```javascript
Flatpickr not initialized
```

**Solution:**
```html
<!-- Check Flatpickr CSS/JS loading -->
<link rel="stylesheet" href="/css/flatpickr.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

<!-- Verify initialization -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (typeof flatpickr !== 'undefined') {
    flatpickr('.date-picker', {
      dateFormat: 'Y-m-d',
      minDate: 'today'
    });
  }
});
</script>
```

#### Issue: LocalStorage data corruption
```javascript
SyntaxError: Unexpected token in JSON
```

**Solution:**
```javascript
// Safe localStorage access
function getBookingDetails() {
  try {
    const raw = localStorage.getItem('bookingDetails');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('LocalStorage parse error:', error);
    localStorage.removeItem('bookingDetails');
    return null;
  }
}
```

## 🔍 Debugging Tools

### Logging Configuration
```javascript
// Enable debug logging
DEBUG=* npm start

// Application-specific logging
const debug = require('debug')('hotel:booking');
debug('Processing booking:', bookingData);
```

### Request Debugging
```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Log response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});
```

### Backend API Testing
```bash
# Test booking creation
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "checkin": "2024-01-15",
    "checkout": "2024-01-17",
    "guestName": "Test User",
    "guestEmail": "test@example.com"
  }'

# Test health endpoint
curl http://localhost:3000/health
```

## 🔧 Performance Issues

### Slow Response Times
```bash
# Monitor response times
npm install clinic
clinic doctor -- node app.js

# Profile memory usage
clinic heapprofiler -- node app.js

# Check for memory leaks
node --inspect app.js
```

### High Memory Usage
```javascript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB'
  });
}, 30000);
```

### Database Connection Issues
```javascript
// Add connection timeout handling
const backendClient = axios.create({
  baseURL: env.BACKEND_URL,
  timeout: env.BACKEND_TIMEOUT,
  retry: 3,
  retryDelay: 1000
});

// Implement circuit breaker pattern
let failureCount = 0;
const maxFailures = 5;

backendClient.interceptors.response.use(
  response => {
    failureCount = 0;
    return response;
  },
  error => {
    failureCount++;
    if (failureCount >= maxFailures) {
      console.error('Circuit breaker opened - too many failures');
    }
    return Promise.reject(error);
  }
);
```

## 📊 Monitoring & Alerts

### Health Check Implementation
```javascript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };

  try {
    // Test backend connectivity
    await axios.get(`${env.BACKEND_URL}/health`, { timeout: 5000 });
    health.backend = 'connected';
  } catch (error) {
    health.backend = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Error Tracking
```javascript
// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to external service (e.g., Sentry)
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to external service
});
```

## 🚨 Emergency Procedures

### Service Restart
```bash
# Using PM2
pm2 restart hotel-process-frontend

# Using systemd
sudo systemctl restart hotel-process

# Manual restart
pkill -f "node app.js"
npm start
```

### Rollback to Previous Version
```bash
# Git rollback
git log --oneline -10
git checkout <previous-commit-hash>
npm install
npm start

# Docker rollback
docker pull hotel-process:previous
docker stop hotel-process-current
docker run -d --name hotel-process hotel-process:previous
```

### Database Recovery
```bash
# Contact backend team for database issues
# Coordinate recovery procedures
# Verify data consistency after recovery
```

## 📞 Escalation Contacts

- **Backend Team**: backend-team@company.com
- **DevOps Team**: devops@company.com
- **On-call Engineer**: +1-555-0123
- **Emergency Hotline**: +1-555-HELP

## 📋 Incident Response Checklist

1. **Identify the Issue**
   - [ ] Check error logs
   - [ ] Verify service status
   - [ ] Test critical functionality

2. **Immediate Response**
   - [ ] Assess impact severity
   - [ ] Notify stakeholders if needed
   - [ ] Implement temporary workaround

3. **Investigation**
   - [ ] Gather diagnostic information
   - [ ] Identify root cause
   - [ ] Document findings

4. **Resolution**
   - [ ] Apply fix
   - [ ] Test functionality
   - [ ] Monitor for stability

5. **Post-Incident**
   - [ ] Document lessons learned
   - [ ] Update runbooks
   - [ ] Implement preventive measures
