// Collect guest info and move to Confirmation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('guestDetailsForm');
    if (!form) return;

    // Load saved guest details on page load
    function loadSavedGuestDetails() {
        const saved = localStorage.getItem('guestDetails');
        if (saved) {
            try {
                const guestDetails = JSON.parse(saved);
                document.getElementById('firstName').value = guestDetails.firstName || '';
                document.getElementById('lastName').value = guestDetails.lastName || '';
                document.getElementById('email').value = guestDetails.email || '';
                document.getElementById('phone').value = guestDetails.phone || '';
                document.getElementById('specialRequests').value = guestDetails.specialRequest || '';
                document.getElementById('city').value = guestDetails.city || '';
                document.getElementById('zip').value = guestDetails.zip || '';
                document.getElementById('country').value = guestDetails.country || '';
            } catch (e) {
                console.error('Error loading saved guest details:', e);
            }
        }
    }

    // Load saved data on page load
    loadSavedGuestDetails();
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName')?.value?.trim() || '';
      const lastName  = document.getElementById('lastName')?.value?.trim() || '';
      const email     = document.getElementById('email')?.value?.trim() || '';
      const phone     = document.getElementById('phone')?.value?.trim() || '';
      const specialRequest = document.getElementById('specialRequest')?.value || '';
      const city      = document.getElementById('city')?.value?.trim() || '';
      const zip       = document.getElementById('zip')?.value?.trim() || '';
      const country   = document.getElementById('country')?.value?.trim() || '';
  
      if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
      }
  
      localStorage.setItem('guestDetails', JSON.stringify({
        firstName, lastName, email, phone, specialRequest, city, zip, country
      }));
      window.location.href = '/Confirmation';
    });
  });
  