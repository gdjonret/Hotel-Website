const express = require('express');
const publicBookingsController = require('../controllers/publicBookingsController');
const { createBookingValidation, updateBookingValidation, handleValidationErrors } = require('../validators/bookingsValidator');
const router = express.Router();

// API endpoints using controller methods with proper validation
router.post("/", createBookingValidation, handleValidationErrors, publicBookingsController.createBooking);
router.get("/", publicBookingsController.getAllBookings);
router.get("/:id", publicBookingsController.getBookingById);
router.put("/:id", updateBookingValidation, handleValidationErrors, publicBookingsController.updateBooking);
router.delete("/:id", publicBookingsController.deleteBooking);

module.exports = router;