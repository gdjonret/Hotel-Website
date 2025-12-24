# Frontend-BFF API Contract

## 📋 Overview

This document defines the internal API contract between the frontend (EJS templates + JavaScript) and the BFF layer (Express.js) for the Hotel Process booking system.

## 🔗 Base Configuration

```yaml
Base URL: http://localhost:3000
Content-Type: application/json, application/x-www-form-urlencoded
Session-based: Yes
CORS: Enabled for development origins
```

## 🌐 Page Routes

### Homepage
**Endpoint:** `GET /`
**Template:** `views/pages/index.ejs`
**Purpose:** Landing page with booking form

### Room Booking
**Endpoint:** `GET /BookNow`
**Template:** `views/pages/BookNow.ejs`
**Purpose:** Room selection and booking form

**Query Parameters:**
- `checkIn` (string): Check-in date (YYYY-MM-DD)
- `checkOut` (string): Check-out date (YYYY-MM-DD)
- `guests` (integer): Number of guests

### Checkout Review
**Endpoint:** `GET /Checkout`
**Template:** `views/pages/Checkout.ejs`
**Purpose:** Booking review and confirmation

### Guest Details Confirmation
**Endpoint:** `GET /GuestDetails`
**Template:** `views/pages/GuestDetails.ejs`
**Purpose:** Booking confirmation page

## 📝 API Routes

### Create Booking
**Endpoint:** `POST /api/bookings`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "roomNumber": "101",
  "checkin": "2024-01-15",
  "checkout": "2024-01-17",
  "guestName": "John Doe",
  "guestEmail": "john.doe@example.com",
  "guestPhone": "1234567890"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "bookingId": 123,
    "roomType": "Standard Room 101",
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-17",
    "guestName": "John Doe",
    "totalAmount": 299.99,
    "numberOfNights": 2,
    "status": "CONFIRMED"
  },
  "redirectUrl": "/GuestDetails?bookingId=123"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Booking validation failed",
    "details": [
      "Check-in date cannot be in the past",
      "Invalid email format"
    ]
  }
}
```

## 📊 Data Flow Patterns

### Form Submission Flow
```javascript
// Frontend form data
const formData = new FormData(form);
const bookingData = {
  roomNumber: formData.get('roomNumber'),
  checkin: formData.get('checkin'),
  checkout: formData.get('checkout'),
  guestName: formData.get('guestName'),
  guestEmail: formData.get('guestEmail'),
  guestPhone: formData.get('guestPhone')
};

// AJAX submission
fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    window.location.href = data.redirectUrl;
  } else {
    displayErrors(data.error.details);
  }
});
```

### LocalStorage Integration
```javascript
// Store booking details for cross-page access
localStorage.setItem('bookingDetails', JSON.stringify({
  roomType: 'Standard Room',
  price: 149.99,
  checkInDate: '2024-01-15',
  checkOutDate: '2024-01-17',
  guests: 2
}));

// Retrieve and display booking summary
function loadBookingSummary() {
  const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
  document.getElementById('roomType').textContent = bookingDetails.roomType;
  document.getElementById('checkInDate').textContent = formatDate(bookingDetails.checkInDate);
  // ... other fields
}
```

## 🔄 Session Management

### Session Data Structure
```javascript
req.session = {
  bookingInProgress: {
    roomType: 'Standard Room',
    dates: {
      checkIn: '2024-01-15',
      checkOut: '2024-01-17'
    },
    guests: 2,
    step: 'booking-form' // 'dates', 'booking-form', 'review', 'confirmed'
  },
  user: {
    // Future: user authentication data
  }
}
```

## 📋 Template Data Contracts

### BookNow Page Data
```javascript
// Data passed to BookNow.ejs
{
  pageTitle: 'Book Your Stay',
  checkInDate: '2024-01-15',
  checkOutDate: '2024-01-17',
  guests: 2,
  availableRooms: [
    {
      roomNumber: 101,
      roomType: 'Standard Room',
      price: 149.99,
      amenities: ['WiFi', 'TV', 'AC']
    }
  ],
  errors: [] // Validation errors if any
}
```

### Checkout Page Data
```javascript
// Data passed to Checkout.ejs
{
  pageTitle: 'Review Your Booking',
  booking: {
    roomType: 'Standard Room 101',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-17',
    numberOfNights: 2,
    pricePerNight: 149.99,
    totalAmount: 299.98,
    guests: 2
  },
  guestDetails: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890'
  }
}
```

## 🔍 Validation Layers

### Client-Side Validation (JavaScript)
```javascript
function validateBookingForm(formData) {
  const errors = [];
  
  if (!formData.guestName || formData.guestName.length < 2) {
    errors.push('Guest name must be at least 2 characters');
  }
  
  if (!isValidEmail(formData.guestEmail)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!isValidDateRange(formData.checkin, formData.checkout)) {
    errors.push('Check-out date must be after check-in date');
  }
  
  return errors;
}
```

### Server-Side Validation (BFF)
```javascript
// Using bookingMapper validation
const validation = bookingMapper.validateBookingData(req.body);
if (!validation.isValid) {
  return res.status(400).json({
    success: false,
    error: {
      message: 'Validation failed',
      details: validation.errors
    }
  });
}
```

## 🎨 UI State Management

### Loading States
```javascript
// Show loading spinner during API calls
function showLoading() {
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('submitBtn').disabled = false;
  document.getElementById('loadingSpinner').style.display = 'none';
}
```

### Error Display
```javascript
function displayErrors(errors) {
  const errorContainer = document.getElementById('errorMessages');
  errorContainer.innerHTML = errors
    .map(error => `<div class="error-message">${error}</div>`)
    .join('');
  errorContainer.style.display = 'block';
}
```

## 📱 Responsive Behavior

### Mobile-First Approach
- Form layouts adapt to screen size
- Touch-friendly button sizes
- Optimized date picker for mobile
- Swipe gestures for image galleries

### Progressive Enhancement
- Basic functionality works without JavaScript
- Enhanced UX with JavaScript enabled
- Graceful degradation for older browsers

## 🔐 Security Considerations

### CSRF Protection
```javascript
// CSRF token in forms
<input type="hidden" name="_csrf" value="<%= csrfToken %>">

// AJAX requests include CSRF token
headers: {
  'Content-Type': 'application/json',
  'X-CSRF-Token': document.querySelector('[name="_csrf"]').value
}
```

### Input Sanitization
- HTML encoding in templates
- XSS prevention in user inputs
- SQL injection prevention (handled by backend)

## 📊 Performance Optimizations

### Caching Strategy
- Static assets cached with ETags
- Template compilation caching
- LocalStorage for form data persistence

### Lazy Loading
- Images loaded on scroll
- JavaScript modules loaded on demand
- CSS critical path optimization
