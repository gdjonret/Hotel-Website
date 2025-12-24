# Hotel Process Documentation

This directory contains architecture notes, API contracts, and operational runbooks for the Hotel Process booking system.

## 📁 Directory Structure

```
docs/
├── README.md                    # This file - documentation overview
├── architecture/
│   ├── overview.md             # System architecture overview
│   ├── data-flow.md            # Data flow diagrams and explanations
│   └── tech-stack.md           # Technology stack and dependencies
├── api/
│   ├── contracts/              # API contract specifications
│   │   ├── booking-api.md      # Booking endpoints specification
│   │   └── frontend-bff.md     # BFF layer API contracts
│   └── examples/               # API request/response examples
├── runbooks/
│   ├── deployment.md           # Deployment procedures
│   ├── troubleshooting.md      # Common issues and solutions
│   └── monitoring.md           # Logging and monitoring guide
└── development/
    ├── setup.md                # Development environment setup
    ├── coding-standards.md     # Code style and conventions
    └── testing.md              # Testing strategies and procedures
```

## 🏗️ System Overview

The Hotel Process booking system follows a layered architecture pattern:

- **Frontend Layer**: EJS templates with vanilla JavaScript
- **BFF Layer**: Express.js Backend-for-Frontend
- **Backend Layer**: Java Spring Boot (external service)
- **Data Layer**: Persistent storage (managed by backend)

## 🚀 Quick Start

1. **Development Setup**: See `development/setup.md`
2. **API Documentation**: See `api/contracts/`
3. **Deployment**: See `runbooks/deployment.md`
4. **Troubleshooting**: See `runbooks/troubleshooting.md`

## 📋 Key Features

- Hotel room booking workflow
- Date-based availability checking
- Guest information management
- Booking confirmation system
- Responsive web interface

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), EJS templating
- **BFF**: Node.js, Express.js, Axios
- **Backend**: Java Spring Boot (external)
- **Styling**: Custom CSS with responsive design
- **Date Handling**: Flatpickr, consistent YYYY-MM-DD format
- **Development**: npm, nodemon, dotenv

## 📖 Documentation Standards

All documentation follows:
- Clear, concise language
- Code examples where applicable
- Up-to-date with current implementation
- Structured with consistent formatting
