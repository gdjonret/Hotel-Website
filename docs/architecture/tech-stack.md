# Technology Stack Documentation

## 🛠️ Core Technologies

### Frontend Layer
```yaml
Template Engine:
  - EJS (Embedded JavaScript Templates)
  - Server-side rendering
  - Partial template support

Styling:
  - Custom CSS3
  - Responsive design patterns
  - CSS Grid and Flexbox
  - No CSS frameworks (custom implementation)

JavaScript:
  - Vanilla ES6+ JavaScript
  - No frontend frameworks
  - Modular architecture
  - Browser-native APIs

Date Handling:
  - Flatpickr (date picker library)
  - Consistent YYYY-MM-DD format
  - UTC-based calculations
```

### BFF Layer (Backend-for-Frontend)
```yaml
Runtime:
  - Node.js (v18.x recommended)
  - Express.js (web framework)

HTTP Client:
  - Axios (HTTP requests to backend)
  - Request/response interceptors
  - Timeout configuration

Middleware:
  - CORS handling
  - Request logging (Morgan)
  - Error handling
  - Static file serving

Utilities:
  - dotenv (environment variables)
  - Path manipulation
  - Custom utility modules
```

### Backend Layer (External)
```yaml
Framework:
  - Java Spring Boot
  - RESTful API design
  - JSON data exchange

Database:
  - Managed by backend service
  - JPA/Hibernate integration
  - LocalDate for date fields
```

## 📦 Dependencies

### Production Dependencies
```json
{
  "axios": "^1.7.2",           // HTTP client
  "cors": "^2.8.5",            // CORS middleware
  "dotenv": "^17.2.2",         // Environment variables
  "ejs": "^3.1.9",             // Template engine
  "express": "^4.18.2",        // Web framework
  "express-session": "^1.18.1", // Session management
  "express-validator": "^7.0.1", // Input validation
  "morgan": "^1.10.1",         // HTTP request logger
  "nodemailer": "^6.10.0"      // Email functionality
}
```

### Development Dependencies
```json
{
  "autoprefixer": "^10.4.20",  // CSS vendor prefixes
  "cssnano": "^7.0.6",         // CSS minification
  "postcss": "^8.5.2",         // CSS processing
  "postcss-cli": "^11.0.0",    // PostCSS CLI
  "postcss-preset-env": "^10.3.0" // Modern CSS features
}
```

## 🏗️ Architecture Patterns

### Layered Architecture
```
├── Presentation Layer (EJS Templates)
├── Application Layer (Express Routes)
├── Business Layer (Controllers & Services)
├── Data Access Layer (Backend Client)
└── External Services (Java Backend)
```

### Design Patterns Used
- **Backend-for-Frontend (BFF)**: Dedicated API layer for frontend needs
- **Repository Pattern**: Data access abstraction
- **Mapper Pattern**: Data transformation between layers
- **Middleware Pattern**: Request/response processing pipeline
- **Module Pattern**: JavaScript code organization

## 🔧 Configuration Management

### Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development
HOST=0.0.0.0

# Backend Integration
BACKEND_URL=http://localhost:8080
BACKEND_TIMEOUT=10000

# Security
SESSION_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Feature Flags
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
```

### Configuration Structure
```
src/config/
├── cors.js          # CORS policy configuration
src/utils/
├── env.js           # Environment variable management
└── dates.js         # Date utility functions
```

## 📁 File Organization

### Directory Structure
```
Hotel_process 2/
├── public/                    # Static assets
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   └── images/               # Static images
├── views/                    # EJS templates
│   ├── layouts/              # Layout templates
│   ├── pages/                # Page templates
│   └── partials/             # Reusable components
├── routes/                   # Express routes
├── src/                      # Business logic
│   ├── controllers/          # Request handlers
│   ├── services/             # External service clients
│   ├── middleware/           # Express middleware
│   ├── mappers/              # Data transformation
│   ├── utils/                # Utility functions
│   └── config/               # Configuration files
└── docs/                     # Documentation
```

## 🚀 Build & Deployment

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm start

# CSS processing (if needed)
npm run build:css
```

### Production Considerations
```yaml
Performance:
  - Static asset caching
  - Template compilation
  - Connection pooling
  - Request timeout management

Security:
  - Environment variable protection
  - CORS configuration
  - Input validation
  - Error message sanitization

Monitoring:
  - Request logging
  - Error tracking
  - Performance metrics
```

## 🔍 Development Tools

### Code Quality
- ESLint configuration (recommended)
- Prettier for code formatting
- Git hooks for pre-commit checks

### Debugging
- Node.js debugger support
- Console logging with levels
- Request/response logging
- Error stack traces (development only)

### Testing Strategy
```yaml
Unit Testing:
  - Jest (recommended)
  - Mocha + Chai (alternative)

Integration Testing:
  - Supertest for API testing
  - Axios mock for backend calls

End-to-End Testing:
  - Playwright (recommended)
  - Cypress (alternative)
```

## 📊 Performance Characteristics

### Response Times
- Static assets: ~1ms (cached)
- Template rendering: ~10ms
- API proxy calls: ~50-200ms
- Database operations: Handled by backend

### Memory Usage
- Base Node.js process: ~50MB
- Express application: ~20MB
- Template cache: ~10MB
- Request buffers: Variable

### Scalability Considerations
- Stateless BFF design
- Session storage externalization
- Load balancer compatibility
- Horizontal scaling support
