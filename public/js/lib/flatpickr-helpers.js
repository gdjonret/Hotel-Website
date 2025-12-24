// /public/js/lib/flatpickr-helpers.js
// Flatpickr initialization helpers with Chad timezone support

(function() {
  // Initialize flatpickr with Chad timezone configuration
  window.initFlatpickrChad = function initFlatpickrChad(selector, options = {}) {
    if (typeof flatpickr !== 'function') {
      console.error('Flatpickr not loaded');
      return null;
    }

    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) {
      console.error('Element not found:', selector);
      return null;
    }

    // Prevent double initialization
    if (element._flatpickr) {
      return element._flatpickr;
    }

    const todayChad = window.getTodayChad ? window.getTodayChad() : new Date();
    const todayChadStr = window.toYmd ? window.toYmd(todayChad) : null;

    // Default configuration with Chad timezone
    const defaultConfig = {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j, Y',
      allowInput: true,
      disableMobile: true,
      minDate: todayChad,
      placeholder: '📅 Select date',
      onDayCreate(dObj, dStr, fp, dayElem) {
        // Remove browser's today class and apply Chad's today
        if (todayChadStr && window.toYmd) {
          const dayStr = window.toYmd(dayElem.dateObj);
          if (dayStr === todayChadStr) {
            dayElem.classList.add('today');
          } else {
            dayElem.classList.remove('today');
          }
        }
      }
    };

    // Merge user options with defaults
    const config = { ...defaultConfig, ...options };

    return flatpickr(element, config);
  };

  // Set input value safely (works with flatpickr or regular inputs)
  window.setInputValue = function setInputValue(el, value) {
    if (!el || !value) return;
    const fp = el._flatpickr;
    if (fp && typeof fp.setDate === 'function') {
      fp.setDate(value, true); // triggerChange = true
    } else {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Get adults value safely
  window.getAdultsSafe = function getAdultsSafe(el) {
    if (!el) return null;
    const v = parseInt(el.value, 10);
    return Number.isFinite(v) ? v : null;
  };
})();
