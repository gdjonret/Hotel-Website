// /public/js/lib/utils.js
// General utility functions

(function() {
  // Debounce function - delays execution until after wait time has elapsed
  window.debounce = function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Sanitize user input to prevent XSS
  window.sanitizeInput = function sanitizeInput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Sanitize an object of inputs
  window.sanitizeObject = function sanitizeObject(obj) {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = typeof obj[key] === 'string' ? sanitizeInput(obj[key]) : obj[key];
      }
    }
    return sanitized;
  };

  // Validate email format
  window.isValidEmail = function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone format (basic)
  window.isValidPhone = function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  };

  // Format phone number
  window.formatPhone = function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned;
  };

  // ===== Analytics & Tracking =====
  
  // Track page views
  window.trackPageView = function trackPageView(pageName, additionalData = {}) {
    const data = {
      page: pageName,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...additionalData
    };
    
    console.log('📊 Page View:', data);
    
    // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example: gtag('event', 'page_view', data);
    
    // Store in sessionStorage for debugging
    try {
      const views = JSON.parse(sessionStorage.getItem('pageViews') || '[]');
      views.push(data);
      sessionStorage.setItem('pageViews', JSON.stringify(views.slice(-20))); // Keep last 20
    } catch (e) {
      console.warn('Failed to store page view', e);
    }
  };

  // Track events
  window.trackEvent = function trackEvent(category, action, label = '', value = null) {
    const data = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };
    
    console.log('📈 Event:', data);
    
    // TODO: Send to analytics service
    // Example: gtag('event', action, { event_category: category, event_label: label, value: value });
    
    // Store in sessionStorage for debugging
    try {
      const events = JSON.parse(sessionStorage.getItem('events') || '[]');
      events.push(data);
      sessionStorage.setItem('events', JSON.stringify(events.slice(-50))); // Keep last 50
    } catch (e) {
      console.warn('Failed to store event', e);
    }
  };

  // Track booking funnel steps
  window.trackBookingStep = function trackBookingStep(step, data = {}) {
    trackEvent('Booking Funnel', step, JSON.stringify(data));
  };

  // Track errors
  window.trackError = function trackError(errorType, errorMessage, context = {}) {
    const data = {
      type: errorType,
      message: errorMessage,
      context,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };
    
    console.error('❌ Error Tracked:', data);
    
    // TODO: Send to error tracking service (Sentry, Rollbar, etc.)
    
    // Store in sessionStorage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('errors') || '[]');
      errors.push(data);
      sessionStorage.setItem('errors', JSON.stringify(errors.slice(-20))); // Keep last 20
    } catch (e) {
      console.warn('Failed to store error', e);
    }
  };

  // ===== Session Timeout Warning =====
  
  let sessionTimeoutId = null;
  let sessionWarningShown = false;
  const SESSION_TIMEOUT = 25 * 60 * 1000; // 25 minutes
  const WARNING_BEFORE = 5 * 60 * 1000; // Warn 5 minutes before

  window.initSessionTimeout = function initSessionTimeout() {
    // Clear any existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }
    
    sessionWarningShown = false;
    
    // Set timeout for warning
    sessionTimeoutId = setTimeout(() => {
      if (!sessionWarningShown) {
        sessionWarningShown = true;
        showSessionWarning();
      }
    }, SESSION_TIMEOUT - WARNING_BEFORE);
    
    console.log('⏱️ Session timeout initialized');
  };

  function showSessionWarning() {
    const existingWarning = document.getElementById('sessionWarning');
    if (existingWarning) {
      existingWarning.remove();
    }

    const warningDiv = document.createElement('div');
    warningDiv.id = 'sessionWarning';
    warningDiv.className = 'session-warning';
    warningDiv.setAttribute('role', 'alert');
    warningDiv.setAttribute('aria-live', 'assertive');
    warningDiv.innerHTML = `
      <div class="session-warning__content">
        <div class="session-warning__icon" aria-hidden="true">
          <i class="fas fa-clock"></i>
        </div>
        <div class="session-warning__text">
          <h2>Session Timeout Warning</h2>
          <p>Your session will expire in <strong>5 minutes</strong>. Please complete your booking to keep your information safe.</p>
        </div>
        <div class="session-warning__actions">
          <button type="button" class="session-warning__cta" onclick="dismissSessionWarning()">Stay signed in</button>
        </div>
      </div>
      <div class="session-warning__progress" aria-hidden="true"></div>
    `;

    document.body.appendChild(warningDiv);

    requestAnimationFrame(() => {
      warningDiv.classList.add('session-warning--visible');
    });
    
    trackEvent('Session', 'Timeout Warning Shown');
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      dismissSessionWarning();
    }, 30000);
  }

  window.dismissSessionWarning = function dismissSessionWarning() {
    const warning = document.getElementById('sessionWarning');
    if (warning) {
      warning.classList.remove('session-warning--visible');

      const removeWarning = () => {
        warning.remove();
      };

      warning.addEventListener('transitionend', removeWarning, { once: true });
      setTimeout(removeWarning, 400);
    }
  };

  // Reset session timeout on user activity
  window.resetSessionTimeout = function resetSessionTimeout() {
    initSessionTimeout();
  };

  // Listen for user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  let lastActivity = Date.now();
  
  activityEvents.forEach(event => {
    document.addEventListener(event, () => {
      const now = Date.now();
      // Only reset if more than 1 minute has passed since last activity
      if (now - lastActivity > 60000) {
        lastActivity = now;
        resetSessionTimeout();
      }
    }, { passive: true });
  });

  // ===== Browser Compatibility Checks =====
  
  window.checkBrowserCompatibility = function checkBrowserCompatibility() {
    const required = {
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      Promise: typeof Promise !== 'undefined',
      Intl: typeof Intl !== 'undefined',
      JSON: typeof JSON !== 'undefined',
      addEventListener: typeof document.addEventListener !== 'undefined'
    };
    
    const missing = Object.keys(required).filter(key => !required[key]);
    
    if (missing.length > 0) {
      console.error('❌ Browser compatibility issues:', missing);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger';
      errorDiv.style.cssText = 'margin: 20px; padding: 20px;';
      errorDiv.innerHTML = `
        <h4><i class="fas fa-exclamation-triangle"></i> Browser Compatibility Issue</h4>
        <p>Your browser is missing required features: <strong>${missing.join(', ')}</strong></p>
        <p>Please update your browser or use a modern browser like:</p>
        <ul>
          <li>Google Chrome (latest version)</li>
          <li>Mozilla Firefox (latest version)</li>
          <li>Microsoft Edge (latest version)</li>
          <li>Safari (latest version)</li>
        </ul>
      `;
      
      document.body.insertBefore(errorDiv, document.body.firstChild);
      
      trackError('Browser Compatibility', `Missing features: ${missing.join(', ')}`);
      
      return false;
    }
    
    console.log('✅ Browser compatibility check passed');
    return true;
  };

  // Auto-check on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkBrowserCompatibility();
      initSessionTimeout();
    });
  } else {
    checkBrowserCompatibility();
    initSessionTimeout();
  }
})();
