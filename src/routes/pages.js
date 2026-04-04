const express = require('express');
const axios = require('axios');
const router = express.Router();
const { generateSitemap } = require('../utils/sitemap');

// Index page route
router.get("/", (req, res) => {
    res.render("pages/index");
});

// BookNow page route
router.get("/BookNow", async (req, res) => {
    try {
        // Set default values for fresh page loads (Chad timezone)
        const dates = require('../utils/dates');
        const todayChad = dates.getTodayString(); // Get today in Chad timezone
        const tomorrowChad = dates.addDays(todayChad, 1); // Tomorrow in Chad timezone
        
        const defaultCheckIn = todayChad; // YYYY-MM-DD in Chad time
        const defaultCheckOut = tomorrowChad; // YYYY-MM-DD in Chad time
        const defaultGuests = 1;
        
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        
        // Check if availability search parameters are provided
        const checkIn = req.query.checkIn;
        const checkOut = req.query.checkOut;
        const adults = req.query.adults;
        
        let roomTypes = [];
        let availability = [];
        let hasAvailabilityData = false;
        
        if (checkIn && checkOut && adults) {
            // Fetch real-time availability from backend
            try {
                const availabilityResponse = await axios.get(
                    `${backendUrl}/api/public/availability`,
                    { params: { checkIn, checkOut, adults } }
                );
                availability = availabilityResponse.data;
                hasAvailabilityData = true;
                
                // Also fetch room types to merge with availability data
                const roomTypesResponse = await axios.get(`${backendUrl}/api/public/room-types`);
                const allRoomTypes = roomTypesResponse.data;
                
                // Merge availability data with room types
                roomTypes = allRoomTypes.map(roomType => {
                    const availData = availability.find(a => a.roomType === roomType.name);
                    return {
                        ...roomType,
                        available: availData ? availData.available : 0,
                        hasAvailability: !!availData && availData.available > 0
                    };
                });
            } catch (error) {
                console.error('Error fetching availability:', error.message);
                // Fallback to showing all room types without availability
                const response = await axios.get(`${backendUrl}/api/public/room-types`);
                roomTypes = response.data;
            }
        } else {
            // No search parameters - show all room types
            const response = await axios.get(`${backendUrl}/api/public/room-types`);
            roomTypes = response.data;
        }
        
        res.render("pages/BookNow", {
            defaultCheckIn,
            defaultCheckOut,
            defaultGuests,
            roomTypes,
            hasAvailabilityData,
            searchParams: { checkIn, checkOut, adults }
        });
    } catch (error) {
        console.error('Error in BookNow route:', error.message);
        // Render with empty room types and error message (Chad timezone)
        const dates = require('../utils/dates');
        const todayChad = dates.getTodayString();
        const tomorrowChad = dates.addDays(todayChad, 1);
        
        res.render("pages/BookNow", {
            defaultCheckIn: todayChad,
            defaultCheckOut: tomorrowChad,
            defaultGuests: 1,
            roomTypes: [],
            hasAvailabilityData: false,
            searchParams: {},
            error: 'Unable to load room types. Please try again later or contact us directly.'
        });
    }
});

// GuestDetails page route
router.get("/GuestDetails", (req, res) => { 
    res.render("pages/GuestDetails");
});

// Checkout page route
router.get("/Checkout", (req, res) => { 
    res.render("pages/Checkout");
});

// Confirmation page route
router.get("/confirmation", (req, res) => {
    res.render("pages/confirmation");
});

// Signin page route
router.get("/Signin", (req, res) => {
    res.render("pages/Signin");
});

// Discover Chad page route
router.get("/discover-chad", (req, res) => {
    res.render("pages/discover-chad");
});

// Restaurant & Bar page route
router.get("/restaurant-bar", (req, res) => {
    res.render("pages/restaurant-bar");
});

// Contact page route
router.get("/contact", (req, res) => {
    res.render("pages/contact", { submitted: false });
});

// Contact form submission handler
router.post("/contact", async (req, res) => {
    const { name, email, subject, message, website, recaptcha_token, form_timestamp } = req.body;
    
    // Server-side spam protection checks
    
    // 1. Honeypot check - if filled, it's a bot
    if (website && website.trim() !== '') {
        console.log('Spam detected: honeypot field filled');
        return res.render("pages/contact", { 
            submitted: false, 
            error: 'Une erreur est survenue lors de l\'envoi de votre message.' 
        });
    }
    
    // 2. Check form submission speed (must take at least 3 seconds)
    if (form_timestamp) {
        const loadTime = parseInt(form_timestamp);
        const submitTime = Date.now();
        const timeDiff = (submitTime - loadTime) / 1000; // in seconds
        
        if (timeDiff < 3) {
            console.log('Spam detected: form submitted too fast');
            return res.render("pages/contact", { 
                submitted: false, 
                error: 'Veuillez prendre le temps de remplir le formulaire correctement.' 
            });
        }
        
        // Also reject if timestamp is too old (more than 1 hour)
        if (timeDiff > 3600) {
            console.log('Form expired: timestamp too old');
            return res.render("pages/contact", { 
                submitted: false, 
                error: 'Le formulaire a expiré. Veuillez rafraîchir la page et réessayer.' 
            });
        }
    }
    
    // 3. Basic validation
    if (!name || !email || !subject || !message) {
        return res.render("pages/contact", { 
            submitted: false, 
            error: 'Tous les champs sont requis.' 
        });
    }
    
    // 4. Check for spam patterns in message
    const spamPatterns = [
        /\b(viagra|cialis|casino|poker|lottery|winner|prize)\b/i,
        /(.)\1{10,}/, // Repeated characters
        /[A-Z]{30,}/, // Too many uppercase
    ];
    
    const urlMatches = message.match(/https?:\/\//gi);
    if ((urlMatches && urlMatches.length > 2) || spamPatterns.some(p => p.test(message))) {
        console.log('Spam detected: suspicious content patterns');
        return res.render("pages/contact", { 
            submitted: false, 
            error: 'Votre message contient du contenu suspect.' 
        });
    }
    
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        
        // Send contact message to backend with reCAPTCHA token
        await axios.post(`${backendUrl}/api/public/contact`, {
            name,
            email,
            subject,
            message,
            recaptcha_token
        });
        
        console.log('Contact form submission sent to backend:', { name, email, subject });
        
        // Render the contact page with success message
        res.render("pages/contact", { submitted: true, error: null });
    } catch (error) {
        console.error('Error submitting contact form:', error.message);
        
        // Show error message to user
        let errorMessage = 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.';
        
        if (error.response) {
            // Backend returned an error response
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Les données du formulaire sont invalides. Veuillez vérifier votre saisie.';
                    break;
                case 429:
                    errorMessage = 'Trop de tentatives d\'envoi. Veuillez attendre quelques minutes avant de réessayer.';
                    break;
                case 500:
                    errorMessage = 'Erreur serveur temporaire. Veuillez réessayer plus tard ou nous contacter directement.';
                    break;
                default:
                    errorMessage = 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
            }
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.';
        }
        
        // Render the contact page with error message
        res.render("pages/contact", { submitted: false, error: errorMessage });
    }
});

// Admin Room Types page route
router.get("/admin/room-types", (req, res) => {
    res.render("pages/admin-room-types");
});

// Book room form handler
router.post("/book-room", (req, res) => {
    const { arrivalDate, departureDate, adults } = req.body;
    
    const bookingData = {
        arrivalDate,
        departureDate,
        adults
    };
    
    res.redirect(`/GuestDetails?arrival=${arrivalDate}&departure=${departureDate}&adults=${adults}`);
});

// Sitemap route for SEO
router.get("/sitemap.xml", (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(generateSitemap());
});

module.exports = router;