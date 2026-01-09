// availability.js (plain script, no imports/exports)
document.addEventListener('DOMContentLoaded', function () {
    // ---- guards -------------------------------------------------------------
    if (typeof flatpickr !== 'function') {
      console.error('Flatpickr not loaded before availability.js');
      return;
    }
    const $form   = document.getElementById('availabilityForm');
    const $in     = document.getElementById('arrivalDate');
    const $out    = document.getElementById('departureDate');
    const $adults = document.getElementById('adults');
    if (!$form || !$in || !$out || !$adults) return;
  
    // prevent double init on partial reloads
    if ($form.dataset.initialized === '1') return;
    $form.dataset.initialized = '1';
  
    // ---- Use centralized utilities ------------------------------------------
    const toYmd = window.toYmd;
    const parseYmd = window.parseYmd;
    const getTodayChad = window.getTodayChad;
  
    // ---- Homepage always starts fresh (no prefill) --------------
    // Note: We don't clear localStorage here as it's used across pages
    const storedIn  = '';
    const storedOut = '';
    const storedG   = '';
    
    // Adults dropdown starts empty (no prefill)
  
    // ---- flatpickr init using centralized helper ---------------------------
    const departurePicker = window.initFlatpickrChad ? window.initFlatpickrChad('#departureDate', {
      minDate: null, // Will be set dynamically
      defaultDate: null,
      onReady: function(selectedDates, dateStr, instance) {
        // Copy original input classes to alt input for consistent styling
        const originalInput = instance.input;
        const altInput = instance.altInput;
        if (originalInput && altInput) {
          altInput.className = originalInput.className;
        }
      }
    }) : null;

    const arrivalPicker = window.initFlatpickrChad ? window.initFlatpickrChad('#arrivalDate', {
      defaultDate: null,
      onReady: function(selectedDates, dateStr, instance) {
        // Copy original input classes to alt input for consistent styling
        const originalInput = instance.input;
        const altInput = instance.altInput;
        if (originalInput && altInput) {
          altInput.className = originalInput.className;
        }
      },
      onChange(selectedDates) {
        if (!selectedDates[0]) return;
        const nextDay = new Date(selectedDates[0]);
        nextDay.setDate(nextDay.getDate() + 1);
        if (departurePicker) {
          departurePicker.set('minDate', nextDay);
          // if existing checkout is < nextDay, clear it
          const co = departurePicker.selectedDates[0];
          if (co && co < nextDay) departurePicker.clear();
        }
      }
    }) : null;
    // ---- submit -------------------------------------------------------------
    $form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const inStr  = $in.value.trim();
      const outStr = $out.value.trim();
      const adults = $adults.value.trim();
  
      // Specific error messages for each field
      if (!inStr) {
        window.showAlert('warnings.booking.selectCheckinDate', 'Please select a check-in date');
        $in.focus();
        return;
      }
      
      if (!outStr) {
        window.showAlert('warnings.booking.selectCheckoutDate', 'Please select a check-out date');
        $out.focus();
        return;
      }
      
      if (!adults) {
        window.showAlert('warnings.booking.selectGuests', 'Please select number of guests');
        $adults.focus();
        return;
      }
  
      // validate with TZ-safe parsing
      const ci = parseYmd(inStr);
      const co = parseYmd(outStr);
      
      if (!ci || !co) {
        window.showAlert('warnings.booking.invalidDateFormat', 'Invalid date format. Please select dates from the calendar.');
        return;
      }
      
      if (co <= ci) {
        window.showAlert('warnings.booking.checkoutAfterCheckin', 'Check-out date must be at least one day after check-in date');
        $out.focus();
        return;
      }
  
      // FIXED: persist for BookNow using ONLY localStorage
      const bookingDates = JSON.stringify({ checkIn: inStr, checkOut: outStr });
      localStorage.setItem('bookingDates', bookingDates);
      localStorage.setItem('adults', adults);
  
      const params = new URLSearchParams({
        checkIn: inStr,
        checkOut: outStr,
        adults
      });
      window.location.href = `/BookNow?${params.toString()}`;
    });
  });
  