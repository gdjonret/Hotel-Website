const bookingsService = require('../services/bookingsService');

const publicBookingsController = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      const booking = await bookingsService.createBooking(req.body);
      res.status(201).json(booking);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(error.status || 500).json({
        error: error.message,
        details: error.details
      });
    }
  },

  // Get all bookings
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingsService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(error.status || 500).json({
        error: error.message,
        details: error.details
      });
    }
  },

  // Get a specific booking by ID
  async getBookingById(req, res) {
    try {
      const booking = await bookingsService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(error.status || 500).json({
        error: error.message,
        details: error.details
      });
    }
  },

  // Update a booking
  async updateBooking(req, res) {
    try {
      const booking = await bookingsService.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(error.status || 500).json({
        error: error.message,
        details: error.details
      });
    }
  },

  // Delete a booking
  async deleteBooking(req, res) {
    try {
      const result = await bookingsService.deleteBooking(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(error.status || 500).json({
        error: error.message,
        details: error.details
      });
    }
  }
};

module.exports = publicBookingsController;