const backendClient = require('./backendClient');

const bookingsService = {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      // Add default status if not provided
      const bookingPayload = {
        ...bookingData,
        status: bookingData.status || 'PENDING'
      };

      const response = await backendClient.post('/bookings', bookingPayload);
      return response.data;
    } catch (error) {
      throw {
        message: 'Failed to create booking',
        details: error.data || error.message,
        status: error.status || 500
      };
    }
  },

  // Get all bookings
  async getAllBookings() {
    try {
      const response = await backendClient.get('/bookings');
      return response.data;
    } catch (error) {
      throw {
        message: 'Failed to fetch bookings',
        details: error.data || error.message,
        status: error.status || 500
      };
    }
  },

  // Get a specific booking by ID
  async getBookingById(bookingId) {
    try {
      const response = await backendClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw {
        message: 'Failed to fetch booking',
        details: error.data || error.message,
        status: error.status || 500
      };
    }
  },

  // Update a booking
  async updateBooking(bookingId, updateData) {
    try {
      const response = await backendClient.put(`/bookings/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      throw {
        message: 'Failed to update booking',
        details: error.data || error.message,
        status: error.status || 500
      };
    }
  },

  // Delete a booking
  async deleteBooking(bookingId) {
    try {
      const response = await backendClient.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw {
        message: 'Failed to delete booking',
        details: error.data || error.message,
        status: error.status || 500
      };
    }
  },

  // Additional BFF orchestration methods can be added here
  // For example: booking validation, data transformation, etc.

  // Transform booking data for frontend consumption (DTO mapping)
  transformBookingForFrontend(booking) {
    return {
      id: booking.id,
      roomType: booking.roomType,
      checkInDate: booking.checkin,
      checkOutDate: booking.checkout,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      status: booking.status,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  },

  // Transform frontend data for backend consumption
  transformBookingForBackend(frontendData) {
    return {
      roomNumber: frontendData.roomNumber,
      checkin: frontendData.checkin,
      checkout: frontendData.checkout,
      guestName: frontendData.guestName,
      guestEmail: frontendData.guestEmail,
      guestPhone: frontendData.guestPhone,
      status: frontendData.status || 'PENDING'
    };
  }
};

module.exports = bookingsService;