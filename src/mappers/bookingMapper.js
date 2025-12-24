// Booking data transformation utilities
// Handles mapping between frontend, BFF, and backend data formats
const dates = require('../utils/dates');

const bookingMapper = {
  // Transform frontend booking data to backend DTO format
  toBackendDTO(frontendBooking) {
    return {
      // Core booking details
    checkin: frontendBooking.checkin,
    checkout: frontendBooking.checkout,
    adults: frontendBooking.adults,
    roomType: frontendBooking.roomType,
    
    // Guest information
    guestName: frontendBooking.firstName && frontendBooking.lastName 
      ? `${frontendBooking.firstName.trim()} ${frontendBooking.lastName.trim()}` 
      : frontendBooking.guestName?.trim(),
    guestEmail: frontendBooking.guestEmail?.toLowerCase().trim(),
    guestPhone: frontendBooking.guestPhone?.replace(/\s+/g, ''),
    
    // Financial information
    totalAmount: frontendBooking.totalAmount,
    currency: frontendBooking.currency || 'XAF',
    price: frontendBooking.price, // Keep if it represents price per night
    
    // Additional information
    specialRequests: frontendBooking.specialRequests,
    status: frontendBooking.status || 'PENDING',
    
    // Address information
    address: frontendBooking.address?.trim(),
    city: frontendBooking.city?.trim(),
    zipCode: frontendBooking.zip || frontendBooking.zipCode, // Handle both field names
    country: frontendBooking.country,
    
    // Metadata
    source: frontendBooking.source || 'WEB',
    createdAt: new Date().toISOString(),
    };
  },

  // Transform backend response to frontend format
  toFrontendFormat(backendBooking) {
    return {
      id: backendBooking.id,
      roomNumber: backendBooking.roomNumber,
      roomType: backendBooking.roomType,
      checkInDate: backendBooking.checkin,
      checkOutDate: backendBooking.checkout,
      guestName: backendBooking.guestName,
      guestEmail: backendBooking.guestEmail,
      guestPhone: backendBooking.guestPhone,
      status: backendBooking.status,
      totalAmount: backendBooking.totalAmount,
      currency: backendBooking.currency || 'USD',
      createdAt: backendBooking.createdAt,
      updatedAt: backendBooking.updatedAt,
      // Format dates for display
      checkInDateFormatted: this.formatDateForDisplay(backendBooking.checkin),
      checkOutDateFormatted: this.formatDateForDisplay(backendBooking.checkout),
      // Calculate derived fields
      numberOfNights: this.calculateNights(backendBooking.checkin, backendBooking.checkout)
    };
  },

  // Transform browser localStorage data to API format
  fromBrowserStorage(storageData) {
    const bookingDetails = storageData.bookingDetails || {};
    const dates = storageData.dates || {};
    
    return {
      roomNumber: parseInt(bookingDetails.roomNumber) || null,
      roomType: bookingDetails.roomType,
      checkin: dates.checkInDate,
      checkout: dates.checkOutDate,
      guestName: storageData.guestName,
      guestEmail: storageData.guestEmail,
      guestPhone: storageData.guestPhone,
      adults: parseInt(storageData.adults) || 1,
      children: parseInt(storageData.children) || 0,
      specialRequests: storageData.specialRequests,
      price: parseFloat(bookingDetails.price) || 0
    };
  },

  // Transform API response for browser storage
  toBrowserStorage(apiBooking) {
    return {
      bookingDetails: {
        id: apiBooking.id,
        roomNumber: apiBooking.roomNumber,
        roomType: apiBooking.roomType,
        price: apiBooking.totalAmount / this.calculateNights(apiBooking.checkin, apiBooking.checkout),
        status: apiBooking.status
      },
      dates: {
        checkInDate: apiBooking.checkin,
        checkOutDate: apiBooking.checkout
      },
      guestName: apiBooking.guestName,
      guestEmail: apiBooking.guestEmail,
      guestPhone: apiBooking.guestPhone,
      totalAmount: apiBooking.totalAmount,
      numberOfNights: this.calculateNights(apiBooking.checkin, apiBooking.checkout)
    };
  },

  // Utility functions
  formatDateForDisplay(dateString) {
    return dates.formatDate(dateString);
  },

  calculateNights(checkin, checkout) {
    return dates.nightsBetween(checkin, checkout);
  },

  // Validate booking data structure
  validateBookingData(bookingData) {
    const errors = [];
    
    if (!bookingData.roomNumber || bookingData.roomNumber <= 0) {
      errors.push('Invalid room number');
    }
    
    if (!bookingData.checkin || !this.isValidDate(bookingData.checkin)) {
      errors.push('Invalid check-in date');
    }
    
    if (!bookingData.checkout || !this.isValidDate(bookingData.checkout)) {
      errors.push('Invalid check-out date');
    }
    
    if (bookingData.checkin && bookingData.checkout) {
      if (!dates.isValidDateRange(bookingData.checkin, bookingData.checkout)) {
        errors.push('Check-out date must be after check-in date');
      }
    }
    
    if (!bookingData.guestName || bookingData.guestName.trim().length < 2) {
      errors.push('Invalid guest name');
    }
    
    if (!bookingData.guestEmail || !this.isValidEmail(bookingData.guestEmail)) {
      errors.push('Invalid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Helper validation functions
  isValidDate(dateString) {
    return dates.isValidDateString(dateString);
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize data for logging (remove sensitive information)
  sanitizeForLogging(bookingData) {
    const sanitized = { ...bookingData };
    
    // Mask sensitive data
    if (sanitized.guestEmail) {
      const [username, domain] = sanitized.guestEmail.split('@');
      sanitized.guestEmail = `${username.substring(0, 2)}***@${domain}`;
    }
    
    if (sanitized.guestPhone) {
      sanitized.guestPhone = `***${sanitized.guestPhone.slice(-4)}`;
    }
    
    return sanitized;
  }
};

module.exports = bookingMapper;