// /public/js/pages/bookNow.js
(function () {
    // -------- selectors on BookNow page --------
    const SEL = {
      checkin: '#checkin',
      checkout: '#checkout',
      adults: '#adults',
      searchForm: '#searchForm', // if present
    };
  
    // -------- tiny utils --------
    const qs = (s) => document.querySelector(s);
    const getParam = (p) => new URLSearchParams(window.location.search).get(p);
  
    // Use centralized utilities from /js/lib/
    const parseYmd = window.parseYmd;
    const toYmd = window.toYmd;
    const getTodayChad = window.getTodayChad;
    const setInputValue = window.setInputValue;
    const getAdultsSafe = window.getAdultsSafe;
    const saveState = window.saveBookingState;
    const loadState = window.loadBookingState;

    function getDefaultValues() {
      // Get server-provided defaults from template
      const defaultCheckIn = window.defaultCheckIn || null;
      const defaultCheckOut = window.defaultCheckOut || null;
      const defaultGuests = window.defaultGuests || 1;
      
      return {
        checkIn: defaultCheckIn,
        checkOut: defaultCheckOut,
        adults: defaultGuests
      };
    }
  
    function stripQuery() {
      if (history.replaceState) history.replaceState({}, '', location.pathname);
    }
  
    document.addEventListener('DOMContentLoaded', function () {
      // Track page view
      if (window.trackPageView) {
        window.trackPageView('Book Now');
      }

      const $in = qs(SEL.checkin);
      const $out = qs(SEL.checkout);
      const $ad = qs(SEL.adults);
      const $form = qs(SEL.searchForm);

      if (!$in || !$out || !$ad) return; // required elements

      // Modern card interface elements
      const $checkinDisplay = qs('#checkin-display');
      const $checkinMonth = $checkinDisplay?.nextElementSibling;
      const $checkoutDisplay = qs('#checkout-display');
      const $checkoutMonth = $checkoutDisplay?.nextElementSibling;
      const $adultsDisplay = qs('#adults-display');
      const $checkinCard = qs('.booking-card:nth-child(2)');
      const $checkoutCard = qs('.booking-card:nth-child(3)');
      const $adultsCard = qs('.booking-card:nth-child(4)');

      // Function to update card displays
      function updateCardDisplays() {
        // Update check-in display
        if ($checkinDisplay && $in.value) {
          const date = parseYmd($in.value);
          if (date) {
            $checkinDisplay.textContent = date.getDate();
            if ($checkinMonth) {
              $checkinMonth.textContent = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
          }
        }

        // Update check-out display
        if ($checkoutDisplay && $out.value) {
          const date = parseYmd($out.value);
          if (date) {
            $checkoutDisplay.textContent = date.getDate();
            if ($checkoutMonth) {
              $checkoutMonth.textContent = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
          }
        }

        // Update adults display
        if ($adultsDisplay && $ad.value) {
          $adultsDisplay.textContent = $ad.value;
        }
      }

      // Make cards clickable
      if ($checkinCard) {
        $checkinCard.addEventListener('click', () => {
          if ($in._flatpickr) {
            $in._flatpickr.open();
          } else {
            $in.focus();
          }
        });
      }

      if ($checkoutCard) {
        $checkoutCard.addEventListener('click', () => {
          if ($out._flatpickr) {
            $out._flatpickr.open();
          } else {
            $out.focus();
          }
        });
      }

      if ($adultsCard) {
        $adultsCard.addEventListener('click', (e) => {
          // Don't focus if clicking on stepper buttons
          if (!e.target.closest('.adults-steppers')) {
            $ad.focus();
          }
        });
      }

      // Adults stepper functionality
      const $adultsSteppers = document.querySelectorAll('.adults-steppers .card-dropdown');
      if ($adultsSteppers.length >= 2) {
        const $upBtn = $adultsSteppers[0]; // First button (chevron-up)
        const $downBtn = $adultsSteppers[1]; // Second button (chevron-down)

        $upBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentValue = parseInt($ad.value) || 1;
          const maxValue = parseInt($ad.getAttribute('max')) || 6;
          if (currentValue < maxValue) {
            $ad.value = currentValue + 1;
            $ad.dispatchEvent(new Event('change', { bubbles: true }));
            updateCardDisplays();
          }
        });

        $downBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentValue = parseInt($ad.value) || 1;
          const minValue = parseInt($ad.getAttribute('min')) || 1;
          if (currentValue > minValue) {
            $ad.value = currentValue - 1;
            $ad.dispatchEvent(new Event('change', { bubbles: true }));
            updateCardDisplays();
          }
        });
      }

      // 1) Flatpickr init using centralized helper
      let outPicker = null;
      let inPicker = null;
      if (window.initFlatpickrChad) {
        // Initialize checkout picker (no minDate initially)
        outPicker = !$out._flatpickr && window.initFlatpickrChad($out, {
          minDate: null // Will be set dynamically based on check-in
        });
        
        // Initialize check-in picker with onChange handler
        inPicker = !$in._flatpickr && window.initFlatpickrChad($in, {
          onChange(selected) {
            if (!selected[0]) return;
            const next = new Date(selected[0]);
            next.setDate(next.getDate() + 1);
            // set checkout minDate and clear invalid value
            const picker = $out._flatpickr;
            if (picker) {
              picker.set('minDate', next);
              const co = picker.selectedDates[0];
              if (co && co < next) picker.clear();
            }
          }
        });
      }
  
      // 2) Read URL params coming from Home/Availability
      const qp = {
        checkIn: toYmd(getParam('arrivalDate') || getParam('checkIn') || getParam('checkInDate')),
        checkOut: toYmd(getParam('departureDate') || getParam('checkOut') || getParam('checkOutDate')),
        adults: getParam('adults')
      };
  
      // 3) Fall back to storage, then defaults
      const stored = loadState();
      const defaults = getDefaultValues();
      const checkIn = qp.checkIn || stored.checkIn || defaults.checkIn;
      const checkOut = qp.checkOut || stored.checkOut || defaults.checkOut;
      const adults = qp.adults != null ? qp.adults : (stored.adults != null ? stored.adults : defaults.adults);
  
      // 4) Apply to inputs
      setInputValue($in, checkIn);
      // link minDate for checkout when we have a checkin
      if (checkIn && $out._flatpickr) {
        const min = parseYmd(checkIn);
        if (min) {
          const next = new Date(min);
          next.setDate(next.getDate() + 1);
          $out._flatpickr.set('minDate', next);
        }
      }
      setInputValue($out, checkOut);
      if ($ad && adults != null && adults !== '') {
        $ad.value = String(adults);
        $ad.dispatchEvent(new Event('change', { bubbles: true }));
      }
  
      // 5) Persist for later pages
      saveState({ checkIn, checkOut, adults });

      // 5.5) Update card displays after setting initial values
      updateCardDisplays();

      // 6) Keep URL clean
      if (qp.checkIn || qp.checkOut || qp.adults != null) stripQuery();
  
      // 7) Wire changes → storage & keep minDate in sync (with debouncing)
      // Debounced save function to avoid excessive storage writes
      const debouncedSave = window.debounce ? window.debounce(() => {
        const ci = toYmd($in.value || $in._flatpickr?.input?.value);
        const co = toYmd($out.value || $out._flatpickr?.input?.value);
        const ad = getAdultsSafe($ad);
        saveState({ checkIn: ci, checkOut: co, adults: ad });
        if (typeof loadBookingSummary === 'function') loadBookingSummary();
      }, 300) : null;

      $in.addEventListener('change', () => {
        const v = toYmd($in.value || $in._flatpickr?.input?.value);
        // update checkout minDate on the fly
        if (v && $out._flatpickr) {
          const min = parseYmd(v);
          const next = new Date(min);
          next.setDate(next.getDate() + 1);
          $out._flatpickr.set('minDate', next);
        }
        updateCardDisplays();
        // Use debounced save if available, otherwise save immediately
        if (debouncedSave) {
          debouncedSave();
        } else {
          saveState({ checkIn: v, checkOut: toYmd($out.value || $out._flatpickr?.input?.value), adults: getAdultsSafe($ad) });
          if (typeof loadBookingSummary === 'function') loadBookingSummary();
        }
      });
      $out.addEventListener('change', () => {
        updateCardDisplays();
        if (debouncedSave) {
          debouncedSave();
        } else {
          const v = toYmd($out.value || $out._flatpickr?.input?.value);
          saveState({ checkIn: toYmd($in.value || $in._flatpickr?.input?.value), checkOut: v, adults: getAdultsSafe($ad) });
          if (typeof loadBookingSummary === 'function') loadBookingSummary();
        }
      });
      $ad.addEventListener('change', () => {
        updateCardDisplays();
        if (debouncedSave) {
          debouncedSave();
        } else {
          saveState({ checkIn: toYmd($in.value || $in._flatpickr?.input?.value), checkOut: toYmd($out.value || $out._flatpickr?.input?.value), adults: getAdultsSafe($ad) });
          if (typeof loadBookingSummary === 'function') loadBookingSummary();
        }
      });
  
      // 8) Optional: handle the search form on BookNow (if you show availability ping)
      if ($form) {
        $form.addEventListener('submit', (e) => {
          e.preventDefault();
          const ci = toYmd($in.value || $in._flatpickr?.input?.value);
          const co = toYmd($out.value || $out._flatpickr?.input?.value);
          const g  = getAdultsSafe($ad);
  
          if (!ci || !co || !g) {
            window.showAlert('warnings.booking.fillAllFields', 'Please fill in all required fields');
            return;
          }
          const ciDt = parseYmd(ci), coDt = parseYmd(co);
          if (!ciDt || !coDt || coDt <= ciDt) {
            window.showAlert('warnings.booking.invalidCheckout', 'Check-out date must be after check-in date');
            return;
          }
          // Persist latest (so GuestDetails/Confirmation can read)
          saveState({ checkIn: ci, checkOut: co, adults: g });
          
          // Track availability check
          if (window.trackEvent) {
            window.trackEvent('Booking', 'Check Availability', `${ci} to ${co}, ${g} guests`);
          }
          
          // Reload page with search parameters to show real-time availability
          const params = new URLSearchParams({
            checkIn: ci,
            checkOut: co,
            adults: g
          });
          window.location.href = `/BookNow?${params.toString()}`;
        });
      }
  
      // 9) BOOK NOW buttons → save chosen room + current dates, go to GuestDetails
      document.querySelectorAll('.book-now-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // CRITICAL FIX: Make availability check MANDATORY
          const hasAvailability = btn.getAttribute('data-has-availability');
          if (hasAvailability === 'false') {
            // Block booking and show clear error message
            if (typeof window.showAlert === 'function') {
              window.showAlert('warnings.booking.checkAvailabilityFirst', '⚠️ Please check room availability first!\n\nClick "CHECK ROOMS" at the top of the page to see available rooms for your selected dates.');
            } else {
              // Fallback if showAlert isn't loaded yet
              alert('⚠️ Please check room availability first!\n\nClick "CHECK ROOMS" at the top of the page to see available rooms for your selected dates.');
            }
            
            // Scroll to the search form
            const searchForm = document.getElementById('searchForm');
            if (searchForm) {
              searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the search button
              const searchBtn = searchForm.querySelector('button[type="submit"]');
              if (searchBtn) {
                searchBtn.style.animation = 'pulse 1s ease-in-out 3';
              }
            }
            
            return; // BLOCK the booking process
          }
  
          const ci = toYmd($in.value || $in._flatpickr?.input?.value);
          const co = toYmd($out.value || $out._flatpickr?.input?.value);
          const g  = getAdultsSafe($ad);
  
          if (!ci || !co || !g) {
            window.showAlert('warnings.booking.selectDatesAndGuests', 'Please select check-in, check-out, and guests');
            return;
          }
          const ciDt = parseYmd(ci), coDt = parseYmd(co);
          if (!ciDt || !coDt || coDt <= ciDt) {
            window.showAlert('warnings.booking.invalidCheckout', 'Check-out date must be after check-in date');
            return;
          }
  
          // room details
          const card = btn.closest('.room-details') || btn.closest('.room-card') || btn.closest('.col-md-6');
          const roomType =
            card?.querySelector('h2,h3')?.textContent?.trim() ||
            card?.querySelector('h2')?.textContent?.trim() ||
            'Standard Room';

          // Get roomTypeId from button's data attribute
          const roomTypeId = btn.getAttribute('data-room-type-id') || 
                            card?.getAttribute('data-room-type-id');

          let price = 0;
          const priceText =
            card?.querySelector('.price')?.textContent ||
            card?.textContent?.match(/(\d+[,\s]*\d*)\s*FCFA/i)?.[1] ||
            '0';
          price = parseFloat(String(priceText).replace(/[^\d.]/g, '')) || 0;

          // save flow state for next page
          const bookingDetails = { 
            roomType,
            roomTypeId: roomTypeId ? parseInt(roomTypeId) : null,  
            checkInDate: ci,  
            checkOutDate: co, 
            guests: g, 
            price 
          };
          // Save booking details to localStorage for other pages to access
          try {
            localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
          } catch (e) {
            console.error('Failed to save booking details', e);
          }
          
          saveState({ checkIn: ci, checkOut: co, adults: g });

          // Track room selection
          if (window.trackBookingStep) {
            const nights = nightsBetween(ci, co);
            window.trackBookingStep('Room Selected', { roomType, price, nights });
          }

          // go to guest details
          window.location.href = '/GuestDetails';
        });
      });
      window.handleSortChange = function(sortValue) {
        const roomContainers = Array.from(document.querySelectorAll('.room-container'));
        const parent = roomContainers[0]?.parentNode;
        
        if (!parent || roomContainers.length === 0) return;

        // Sort rooms based on selected criteria
        roomContainers.sort((a, b) => {
          const roomA = a.querySelector('.room-details');
          const roomB = b.querySelector('.room-details');
          
          switch (sortValue) {
            case 'price-asc':
              const priceA = parseFloat(roomA.dataset.price || roomA.textContent.match(/(\d+[,\s]*\d*)\s*FCFA/i)?.[1]?.replace(/[^\d.]/g, '') || '0');
              const priceB = parseFloat(roomB.dataset.price || roomB.textContent.match(/(\d+[,\s]*\d*)\s*FCFA/i)?.[1]?.replace(/[^\d.]/g, '') || '0');
              return priceA - priceB;
              
            case 'price-desc':
              const priceA2 = parseFloat(roomA.dataset.price || roomA.textContent.match(/(\d+[,\s]*\d*)\s*FCFA/i)?.[1]?.replace(/[^\d.]/g, '') || '0');
              const priceB2 = parseFloat(roomB.dataset.price || roomB.textContent.match(/(\d+[,\s]*\d*)\s*FCFA/i)?.[1]?.replace(/[^\d.]/g, '') || '0');
              return priceB2 - priceA2;
              
            case 'availability':
              // Both room types have same availability (6 rooms), so maintain original order
              return 0;
              
            default: // 'default'
              // Keep original order - could use data-original-index if needed
              return 0;
          }
        });

        // Re-append sorted rooms to parent
        roomContainers.forEach(container => parent.appendChild(container));
      };

      // Room Card Image Carousel Navigation
      const roomCardCarousels = document.querySelectorAll('.room-card-carousel');
      
      // Define available images for each room
      const availableRoomImages = [
        '/images/room-1.jpg',
        '/images/room2.jpg',
        '/images/slider-img-1.jpeg',
        '/images/slider-img-2.jpg',
        '/images/slider-img-3.jpg',
        '/images/slider-img-4.jpg',
        '/images/slider-img-5.jpg',
        '/images/slider-img-6.jpg'
      ];
      
      const defaultModalImages = [
        '/images/room-1.jpg',
        '/images/room2.jpg',
        '/images/slider-img-1.jpeg',
        '/images/slider-img-2.jpg',
        '/images/slider-img-3.jpg',
        '/images/slider-img-4.jpg'
      ];

      const deluxeModalImages = [
        '/images/rooms/Deluxe/room.jpg',
        '/images/rooms/Deluxe/room1.jpg',
        '/images/rooms/Deluxe/room2.jpg',
        '/images/rooms/Deluxe/room3.jpg',
        '/images/rooms/Deluxe/room4.jpg',
        '/images/rooms/Deluxe/room5.jpg',
        '/images/rooms/Deluxe/room6.jpg'
      ];

      const standardModalImages = [
        '/images/rooms/Standard/room1.jpg',
        '/images/rooms/Standard/room2.jpg',
        '/images/rooms/Standard/room3.jpg',
        '/images/rooms/Standard/room4.jpg'
      ];

      roomCardCarousels.forEach(carousel => {
        const img = carousel.querySelector('img');
        const prevBtn = carousel.querySelector('.room-card-prev');
        const nextBtn = carousel.querySelector('.room-card-next');
        let currentImageIndex = 0;
        
        // Get images from data attribute (actual room images from backend)
        let roomImages = [];
        try {
          const imagesData = carousel.getAttribute('data-images');
          if (imagesData) {
            roomImages = JSON.parse(imagesData);
          }
        } catch (e) {
          console.error('Error parsing room images:', e);
        }
        
        // Fallback to default images if no images available
        if (!roomImages || roomImages.length === 0) {
          const roomId = carousel.getAttribute('data-room-id');
          const startIdx = parseInt(roomId) % availableRoomImages.length;
          roomImages = [
            availableRoomImages[startIdx],
            availableRoomImages[(startIdx + 1) % availableRoomImages.length],
            availableRoomImages[(startIdx + 2) % availableRoomImages.length],
            availableRoomImages[(startIdx + 3) % availableRoomImages.length]
          ];
        }
        
        if (prevBtn && nextBtn && img) {
          prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + roomImages.length) % roomImages.length;
            img.style.opacity = '0.7';
            setTimeout(() => {
              img.src = roomImages[currentImageIndex];
              img.style.opacity = '1';
            }, 150);
          });
          
          nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % roomImages.length;
            img.style.opacity = '0.7';
            setTimeout(() => {
              img.src = roomImages[currentImageIndex];
              img.style.opacity = '1';
            }, 150);
          });

          // Make image clickable to open more details modal
          img.addEventListener('click', (e) => {
            // Find the corresponding "More details" link and trigger it
            const roomContainer = carousel.closest('.room-container');
            const moreDetailsLink = roomContainer?.querySelector('.more-details-link');
            if (moreDetailsLink) {
              moreDetailsLink.click();
            }
          });
          
          // Add cursor pointer to image
          img.style.cursor = 'pointer';
        }
      });

      // Room Details Modal Functionality
      const roomModal = document.getElementById('roomDetailsModal');
      const moreDetailsLinks = document.querySelectorAll('.more-details-link');
      
      if (roomModal && moreDetailsLinks.length > 0) {
        const bsModal = new bootstrap.Modal(roomModal);
        
        moreDetailsLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();

            // Get room data from link attributes
            const roomName = link.getAttribute('data-room-name');
            const capacity = link.getAttribute('data-capacity');
            const equipment = JSON.parse(link.getAttribute('data-equipment') || '[]');
            const amenities = JSON.parse(link.getAttribute('data-amenities') || '[]');
            const price = link.getAttribute('data-price');
            const imageNum = link.getAttribute('data-image-num');

            // Determine images for modal
            let roomImages = [];
            const roomContainer = link.closest('.room-container');
            const carouselEl = roomContainer?.querySelector('.room-image');

            if (carouselEl) {
              try {
                const imagesAttr = carouselEl.getAttribute('data-images');
                if (imagesAttr) {
                  roomImages = JSON.parse(imagesAttr);
                }
              } catch (err) {
                console.error('Error parsing room images for modal:', err);
              }
            }

            if (!roomImages || roomImages.length === 0) {
              const normalizedName = roomName?.trim().toLowerCase();
              if (normalizedName === 'deluxe single') {
                roomImages = deluxeModalImages;
              } else if (normalizedName === 'standard single') {
                roomImages = standardModalImages;
              } else {
                roomImages = defaultModalImages;
              }
            }

            // Update modal title
            document.getElementById('roomDetailsModalLabel').textContent = 'Room Information';

            // Update room name and subtitle
            document.getElementById('modalRoomName').textContent = roomName;
            document.getElementById('modalRoomSubtitle').textContent = 'City view';

            // Populate carousel with images (show all available)
            const carouselInner = document.getElementById('carouselImages');
            carouselInner.innerHTML = '';

            // Ensure we have unique, truthy image URLs
            const uniqueImages = Array.from(new Set((roomImages || []).filter(Boolean)));

            // Fallback safety in case parsing produced nothing
            if (uniqueImages.length === 0) {
              uniqueImages.push(...defaultModalImages);
            }

            uniqueImages.forEach((img, index) => {
              const carouselItem = document.createElement('div');
              carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
              carouselItem.innerHTML = `<img src="${img}" class="d-block w-100" alt="${roomName}">`;
              carouselInner.appendChild(carouselItem);
            });

            
            // Populate equipment list (Chambre)
            const equipmentList = document.getElementById('modalEquipmentList');
            if (equipmentList) {
              equipmentList.innerHTML = equipment.length > 0
                ? equipment.map(item => `<li>${item}</li>`).join('')
                : '<li class="text-muted" style="font-style: italic;">No equipment listed</li>';
            }

            // Populate amenities list (Toilettes)
            const amenitiesList = document.getElementById('modalAmenitiesList');
            if (amenitiesList) {
              amenitiesList.innerHTML = amenities.length > 0
                ? amenities.map(item => `<li>${item}</li>`).join('')
                : '<li class="text-muted" style="font-style: italic;">No amenities listed</li>';
            }

            // Show the modal
            bsModal.show();

            // Track modal view
            if (window.trackEvent) {
              window.trackEvent('Room Details', 'View Modal', roomName);
            }
          });
        });
      }
    });
  })();
  