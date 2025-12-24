# System Architecture Overview

## 🏗️ Architecture Pattern

The Hotel Process booking system implements a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                Frontend Layer (BFF)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │    EJS      │ │   Static    │ │      Express.js         │ │
│  │ Templates   │ │   Assets    │ │    (Node.js BFF)        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST API
┌─────────────────────────▼───────────────────────────────────┐
│                  Backend Layer                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Java Spring Boot                             │ │
│  │         (External Service)                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ JPA/Database
┌─────────────────────────▼───────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Database                                   │ │
│  │         (Managed by Backend)                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. User Interaction Flow
```
User → Browser → BFF → Backend → Database
                  ↓
            EJS Template Rendering
                  ↓
               Response
```

### 2. Booking Process Flow
```
1. User visits homepage (/)
2. Selects dates and room type
3. Proceeds to booking form (/BookNow)
4. Fills guest details
5. Reviews booking (/Checkout)
6. Confirms booking (POST /api/bookings)
7. Receives confirmation (/GuestDetails)
```

## 🏢 Layer Responsibilities

### Frontend Layer (BFF)
- **Purpose**: Backend-for-Frontend pattern
- **Technology**: Node.js + Express.js
- **Responsibilities**:
  - Serve static assets (CSS, JS, images)
  - Render EJS templates
  - Handle user sessions
  - Proxy API calls to backend
  - Data transformation and validation
  - CORS management

### Backend Layer
- **Purpose**: Business logic and data persistence
- **Technology**: Java Spring Boot (external service)
- **Responsibilities**:
  - Business logic processing
  - Data validation and persistence
  - Room availability management
  - Booking state management

### Data Layer
- **Purpose**: Persistent storage
- **Technology**: Database (managed by backend)
- **Responsibilities**:
  - Store booking information
  - Guest data persistence

## 📁 Directory Structure Mapping

```
Hotel_process 2/
├── public/                     # Frontend Assets
│   ├── css/                   # Styling
│   ├── js/                    # Client-side logic
│   └── images/                # Static images
├── views/                     # EJS Templates
│   ├── pages/                 # Page templates
│   └── partials/              # Reusable components
├── routes/                    # Express Routes
│   ├── pages.js              # Page rendering routes
│   └── publicBookings.js     # API proxy routes
├── src/                      # BFF Business Logic
│   ├── controllers/          # Request handlers
│   ├── services/             # External service clients
│   ├── middleware/           # Express middleware
│   ├── mappers/              # Data transformation
│   ├── utils/                # Utility functions
│   └── config/               # Configuration
└── app.js                    # Application entry point
```

## 🔗 Integration Points

### Frontend ↔ BFF
- **Protocol**: HTTP requests
- **Data Format**: Form data, JSON
- **Authentication**: Session-based

### BFF ↔ Backend
- **Protocol**: REST API over HTTP
- **Data Format**: JSON
- **Base URL**: `http://localhost:8080` (configurable)
- **Timeout**: 10 seconds
- **Error Handling**: Axios interceptors

## 🛡️ Security Considerations

- CORS configuration for cross-origin requests
- Input validation at BFF layer
- Session management for user state
- Environment variable protection
- Error message sanitization

## 📊 Performance Characteristics

- **Static Asset Caching**: 304 responses for unchanged files
- **Template Rendering**: Server-side EJS compilation
- **API Timeouts**: Configurable request timeouts
- **Connection Pooling**: Axios instance reuse

## 🔧 Configuration Management

- Environment-based configuration via `.env`
- Centralized config in `src/utils/env.js`
- CORS origins configurable per environment
- Backend URL configurable for different environments
