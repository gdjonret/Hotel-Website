// /public/js/lib/booking.js

(function () {
    // ----- State Management -----
    // FIXED: Use ONLY localStorage for consistency (sessionStorage cleared)
    window.saveBookingState = function saveBookingState({ checkIn, checkOut, adults }) {
      const dates = JSON.stringify({ checkInDate: checkIn, checkOutDate: checkOut });
      try {
        if (checkIn || checkOut) {
          localStorage.setItem('bookingDates', dates);
        }
        if (adults != null) {
          localStorage.setItem('adults', String(adults));
        }
      } catch (_) {}
    };

    window.loadBookingState = function loadBookingState() {
      let dates = null, adults = null;
      try {
        dates = JSON.parse(localStorage.getItem('bookingDates') || 'null');
        adults = localStorage.getItem('adults');
      } catch (_) {}
      return {
        checkIn: dates?.checkInDate || dates?.checkIn || null,
        checkOut: dates?.checkOutDate || dates?.checkOut || null,
        adults: adults != null ? adults : null
      };
    };

    // ----- Safe getters from storage -----
    function getBookingDetails() {
      try {
        const raw = localStorage.getItem('bookingDetails');
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    }
  
    function getBookingDates() {
      try {
        // Primary source: bookingDetails with standardized property names
        const bookingDetails = getBookingDetails();
        if (bookingDetails && (bookingDetails.checkInDate || bookingDetails.checkOutDate)) {
          return {
            checkInDate: bookingDetails.checkInDate,
            checkOutDate: bookingDetails.checkOutDate
          };
        }
        // Legacy fallback for checkIn/checkOut format
        if (bookingDetails && (bookingDetails.checkIn || bookingDetails.checkOut)) {
          return {
            checkInDate: bookingDetails.checkIn,
            checkOutDate: bookingDetails.checkOut
          };
        }
        return null;
      } catch (_) { return null; }
    }
  
    function getAdults() {
      try {
        // First try bookingDetails
        const bookingDetails = getBookingDetails();
        if (bookingDetails && bookingDetails.guests) {
          return bookingDetails.guests;
        }
        // Fallback to separate storage
        return sessionStorage.getItem('adults') ?? localStorage.getItem('adults') ?? null;
      } catch (_) { return null; }
    }
  
    // ----- Core calculations -----
    function nightsBetween(ci, co) {
      if (!ci || !co) return 1;
      // Parse dates without timezone issues
      const [inYear, inMonth, inDay] = ci.split('-').map(Number);
      const [outYear, outMonth, outDay] = co.split('-').map(Number);
      
      const a = new Date(inYear, inMonth - 1, inDay);
      const b = new Date(outYear, outMonth - 1, outDay);
      
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
      const diff = (b - a) / (1000 * 60 * 60 * 24);
      return Math.max(1, Math.floor(diff));
    }
  
    function fmtDate(d) {
    // If you have formatters in /js/lib/dates.js, use them:
    if (typeof window.formatDate === 'function') {
      try { return window.formatDate(d); } catch (_) {}
    }
    if (!d) return 'N/A';
    
    // Parse date without timezone issues
    const [year, month, day] = d.split('-').map(Number);
    const dt = new Date(year, month - 1, day);
    
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  
    function fmtMoney(n) {
      if (n == null || Number.isNaN(n)) return 'N/A';
      try { 
        // Format as FCFA with space and no decimal places
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'XAF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(n).replace('XAF', 'FCFA'); 
      }
      catch (_) { return `${Number(n).toFixed(0)} FCFA`; }
    }
  
    function setText(id, v) {
      const el = document.getElementById(id);
      if (el) el.textContent = (v ?? 'N/A');
    }
  
    // ----- Public: call this on any page that shows the summary -----
  window.loadBookingSummary = function loadBookingSummary() {
    try {
      const bookingDetails = getBookingDetails() || {};
      const dates = getBookingDates() || {};
      const adults = getAdults();

      const roomType = bookingDetails.roomType || 'N/A';
      const pricePerNight = parseFloat(bookingDetails.price || 0) || 0;

      // Use standardized property names (checkInDate/checkOutDate)
      const checkInDate = dates.checkInDate || null;
      const checkOutDate = dates.checkOutDate || null;

      // Calculate nights and total correctly
      const nights = nightsBetween(checkInDate, checkOutDate);
      const total = pricePerNight * nights;
    
    console.log('Booking Summary:', {
      checkInDate,
      checkOutDate,
      nights,
      pricePerNight,
      total
    });

    // Update DOM elements that exist in booking-summary.ejs (use local time for display)
    if (checkInDate) {
      try {
        const [y, m, d] = checkInDate.split('-').map(Number);
        const checkInDateObj = new Date(y, m - 1, d);
        if (!isNaN(checkInDateObj.getTime())) {
          setText('checkInDay', checkInDateObj.getDate());
          setText('checkInMonthYear', checkInDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch (e) {
        console.error('Error parsing check-in date:', e);
      }
    }
    if (checkOutDate) {
      try {
        const [y, m, d] = checkOutDate.split('-').map(Number);
        const checkOutDateObj = new Date(y, m - 1, d);
        if (!isNaN(checkOutDateObj.getTime())) {
          setText('checkOutDay', checkOutDateObj.getDate());
          setText('checkOutMonthYear', checkOutDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch (e) {
        console.error('Error parsing check-out date:', e);
      }
    }  
      
      setText('numberOfGuests', adults ? String(adults) : '1');
      setText('numberOfNights', String(nights || 1));
      setText('totalAmount', fmtMoney(total));

      // Legacy DOM updates for other pages
      setText('roomType', roomType);
      setText('checkInDate', checkInDate ? fmtDate(checkInDate) : 'N/A');
      setText('checkOutDate', checkOutDate ? fmtDate(checkOutDate) : 'N/A');

      // If your confirmation page mirrors these fields elsewhere:
      if (document.getElementById('confirmTotalAmount')) {
        setText('confirmTotalAmount', fmtMoney(total));
      }
      if (document.getElementById('roomRate')) {
        setText('roomRate', `${fmtMoney(pricePerNight)}/night`);
      }
    } catch (error) {
      console.error('Error loading booking summary:', error);
      // Fail gracefully - don't break the page
    }
  };
  })();
  