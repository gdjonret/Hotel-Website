// Node-side YYYY-MM-DD date helpers
// Consistent with frontend date handling logic

const dates = {
  // Calculate nights between two YYYY-MM-DD dates
  nightsBetween(checkin, checkout) {
    if (!checkin || !checkout) return 1;
    try {
      const a = new Date(`${checkin}T00:00:00Z`);
      const b = new Date(`${checkout}T00:00:00Z`);
      if (Number.isNaN(a) || Number.isNaN(b)) return 1;
      const diff = (b - a) / (1000 * 60 * 60 * 24);
      return Math.max(1, Math.round(diff));
    } catch (error) {
      console.error('Date calculation error:', error);
      return 1;
    }
  },

  // Format YYYY-MM-DD date for display
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const dt = new Date(`${dateString}T00:00:00Z`);
      if (Number.isNaN(dt)) return dateString;
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  },

  // Get today's date in YYYY-MM-DD format (Chad timezone)
  getTodayString() {
    // Get today in Chad timezone (Africa/Ndjamena, UTC+1)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Ndjamena',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now); // Returns YYYY-MM-DD in Chad time
  },

  // Validate YYYY-MM-DD format
  isValidDateString(dateString) {
    if (!dateString) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const date = new Date(`${dateString}T00:00:00Z`);
    return date instanceof Date && !isNaN(date);
  },

  // Check if date is today or in the future (Chad timezone)
  isDateTodayOrFuture(dateString) {
    if (!this.isValidDateString(dateString)) return false;
    const inputDate = new Date(`${dateString}T00:00:00Z`);
    const todayChad = this.getTodayString(); // Get today in Chad timezone
    const todayDate = new Date(`${todayChad}T00:00:00Z`);
    return inputDate >= todayDate;
  },

  // Check if checkout is after checkin
  isValidDateRange(checkin, checkout) {
    if (!this.isValidDateString(checkin) || !this.isValidDateString(checkout)) {
      return false;
    }
    const checkinDate = new Date(`${checkin}T00:00:00Z`);
    const checkoutDate = new Date(`${checkout}T00:00:00Z`);
    return checkoutDate > checkinDate;
  },

  // Add days to a YYYY-MM-DD date
  addDays(dateString, days) {
    if (!this.isValidDateString(dateString)) return null;
    try {
      const date = new Date(`${dateString}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date addition error:', error);
      return null;
    }
  },

  // Get date range as array of YYYY-MM-DD strings
  getDateRange(checkin, checkout) {
    if (!this.isValidDateRange(checkin, checkout)) return [];
    
    const dates = [];
    const start = new Date(`${checkin}T00:00:00Z`);
    const end = new Date(`${checkout}T00:00:00Z`);
    
    const current = new Date(start);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setUTCDate(current.getUTCDate() + 1);
    }
    
    return dates;
  },

  // Parse date from various formats to YYYY-MM-DD
  parseToDateString(input) {
    if (!input) return null;
    
    // Already in YYYY-MM-DD format
    if (this.isValidDateString(input)) return input;
    
    try {
      const date = new Date(input);
      if (isNaN(date)) return null;
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  },

  // Business logic helpers
  calculateBookingTotal(checkin, checkout, pricePerNight) {
    const nights = this.nightsBetween(checkin, checkout);
    return nights * (pricePerNight || 0);
  },

  // Validation for booking dates
  validateBookingDates(checkin, checkout) {
    const errors = [];
    
    if (!this.isValidDateString(checkin)) {
      errors.push('Invalid check-in date format');
    } else if (!this.isDateTodayOrFuture(checkin)) {
      errors.push('Check-in date cannot be in the past');
    }
    
    if (!this.isValidDateString(checkout)) {
      errors.push('Invalid check-out date format');
    }
    
    if (checkin && checkout && !this.isValidDateRange(checkin, checkout)) {
      errors.push('Check-out date must be after check-in date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = dates;