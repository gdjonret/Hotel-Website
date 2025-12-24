// Use centralized utilities
const toYmd = window.toYmd || ((dateStr) => dateStr);
const fmtNice = window.fmtNice;
const nightsBetween = window.nightsBetween;

const translate = (key, options) => {
  if (window.i18next && typeof window.i18next.t === 'function') {
    return window.i18next.t(key, options);
  }
  return key;
};

function toCurrency(n) {
    const v = Number(n || 0);
    try { 
      // Format as FCFA with space and no decimal places
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(v).replace('XAF', 'FCFA'); 
    }
    catch (_) { return `${v.toFixed(0)} FCFA`; }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    // Track page view
    if (window.trackPageView) {
      window.trackPageView('Confirmation');
    }
    if (window.trackBookingStep) {
      window.trackBookingStep('Confirmation Page');
    }

    const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
    const guestDetails   = JSON.parse(localStorage.getItem('guestDetails') || '{}');
  
    // Guard
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate || !guestDetails.email) {
      if (window.trackError) {
        window.trackError('Booking Flow', 'Missing booking data on confirmation page');
      }
      alert('Missing booking or guest details. Please start again.');
      return location.replace('/BookNow');
    }
  
    // Call loadBookingSummary to update the booking-summary.ejs partial
    if (typeof window.loadBookingSummary === 'function') {
      window.loadBookingSummary();
    }
  
    // Calculate nights and total for other elements
    const nights = nightsBetween(bookingDetails.checkInDate, bookingDetails.checkOutDate);
    const total  = (parseFloat(bookingDetails.price || 0) * nights) || 0;
  
    document.getElementById('confirmRoomType')?.replaceChildren(bookingDetails.roomType || 'Standard Room');
    document.getElementById('checkIn')?.replaceChildren(fmtNice(bookingDetails.checkInDate));
    document.getElementById('checkOut')?.replaceChildren(fmtNice(bookingDetails.checkOutDate));
  
    const fullName = `${guestDetails.firstName || ''} ${guestDetails.lastName || ''}`.trim();
    document.getElementById('guestName')?.replaceChildren(fullName || 'Guest');
    document.getElementById('guestEmail')?.replaceChildren(guestDetails.email || '—');
    document.getElementById('guestPhone')?.replaceChildren(guestDetails.phone || '—');
    
    // Display total amount
    document.getElementById('confirmTotalAmount')?.replaceChildren(toCurrency(total));
  
    // Build the public DTO (browser → Spring backend)
    const payload = {
      // Core booking details
      checkInDate: toYmd(bookingDetails.checkInDate),
      checkOutDate: toYmd(bookingDetails.checkOutDate),
      adults: parseInt(bookingDetails.guests || 1),
      roomType: bookingDetails.roomType,
      roomTypeId: bookingDetails.roomTypeId ? parseInt(bookingDetails.roomTypeId) : null,
      
      // Guest information
      guestName: fullName,
      guestEmail: guestDetails.email,
      guestPhone: guestDetails.phone,
      
      // Financial information - Let backend calculate and validate
      totalPrice: total,
      pricePerNight: parseFloat(bookingDetails.price || 0),
      currency: 'XAF',
      
      // Additional information
      specialRequests: guestDetails.specialRequests || '',
      
      // Address information
      city: guestDetails.city || '',
      zipCode: guestDetails.zip || '',
      country: guestDetails.country || '',
      
      // Metadata
      source: 'WEB',
      createdAt: new Date().toISOString()
    };
  
    // Show loading state
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'alert alert-info mt-3';
    loadingMsg.id = 'loadingMessage';
    loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <strong>${translate('confirmation.processingMessage')}</strong><br>${translate('confirmation.processingDetails')}`;
    document.querySelector('.confirmation-header')?.appendChild(loadingMsg);

    // Retry logic for API calls
    async function submitBookingWithRetry(payload, maxRetries = 3) {
      const backendUrl = window.BACKEND_URL || 'http://localhost:8080';
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          const res = await fetch(`${backendUrl}/api/public/bookings`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Booking failed: ${res.status}`);
          }
          
          return await res.json();
        } catch (err) {
          console.warn(`Booking attempt ${i + 1} failed:`, err);
          
          // If this is the last retry, throw the error
          if (i === maxRetries - 1) {
            throw err;
          }
          
          // Wait before retrying (exponential backoff: 1s, 2s, 3s)
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          
          // Update loading message to show retry
          if (loadingMsg) {
            loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <strong>${translate('confirmation.retrying')}</strong><br>${translate('confirmation.retryAttempt', { current: i + 2, total: maxRetries })}`;
          }
        }
      }
    }

    // POST directly to Spring Boot backend with retry logic
    try {
      const saved = await submitBookingWithRetry(payload);
      
      // Remove loading message
      loadingMsg?.remove();
  
      console.log('Booking successful:', saved);
      
      // Track successful booking
      if (window.trackBookingStep) {
        window.trackBookingStep('Booking Completed', { 
          bookingId: saved.id || saved.bookingReference,
          totalAmount: total,
          roomType: bookingDetails.roomType
        });
      }
      if (window.trackEvent) {
        window.trackEvent('Booking', 'Completed', bookingDetails.roomType, total);
      }
      
      // Use server truth (reference, dates, etc.)
      const bookingRef = saved.bookingReference || saved.id || saved.confirmationNumber || 'N/A';
      document.getElementById('bookingReference')?.replaceChildren(bookingRef);

      // Show a success message
      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success mt-3';
      successMsg.innerHTML = `<i class="fas fa-check-circle"></i> <strong>${translate('confirmation.successMessage')}</strong>`;
      document.querySelector('.confirmation-header')?.appendChild(successMsg);
      
      // Show email confirmation notice
      const emailNotice = document.createElement('div');
      emailNotice.className = 'alert alert-success mt-3';
      emailNotice.innerHTML = `
        <i class="fas fa-envelope"></i> ${translate('confirmation.emailSent', { email: guestDetails.email })}
      `;
      document.querySelector('.confirmation-header')?.appendChild(emailNotice);

      // Clear storage after success
      localStorage.removeItem('bookingDetails');
      localStorage.removeItem('guestDetails');
      localStorage.removeItem('paymentMethod');
      localStorage.removeItem('paymentStatus');
    } catch (err) {
      console.error('Booking error:', err);
      
      // Track booking error
      if (window.trackError) {
        window.trackError('Booking Submission', err.message, { 
          roomType: bookingDetails.roomType,
          checkIn: bookingDetails.checkInDate,
          checkOut: bookingDetails.checkOutDate
        });
      }
      
      // Remove loading message
      loadingMsg?.remove();
      
      // Create error message container
      const errorMsg = document.createElement('div');
      errorMsg.className = 'alert alert-danger mt-3';
      
      // Try to parse error details if available
      let errorDetails = translate('confirmation.errorDefault');
      try {
        if (err.message && err.message.startsWith('{')) {
          const errorJson = JSON.parse(err.message);
          if (errorJson.details && Array.isArray(errorJson.details)) {
            errorDetails = errorJson.details.map(d => d.message || d).join('<br>');
          } else if (errorJson.message) {
            errorDetails = errorJson.message;
          }
        } else if (err.message) {
          errorDetails = err.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
        errorDetails = err.message || errorDetails;
      }
      
      errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>${translate('confirmation.errorTitle')}</strong><br>${errorDetails}`;
      
      // Add to the page
      const headerElement = document.querySelector('.confirmation-header');
      if (headerElement) {
        headerElement.appendChild(errorMsg);
      } else {
        // Fallback to alert if we can't find the header element
        alert(translate('confirmation.errorAlert') + ': ' + errorDetails);
      }
    }
  });
  
  // Buttons
  function printConfirmation(){ window.print(); }
  function returnToHomepage(){
    localStorage.removeItem('bookingDetails');
    localStorage.removeItem('guestDetails');
    window.location.href = '/';
  }
  window.printConfirmation = printConfirmation;
  window.returnToHomepage = returnToHomepage;
  