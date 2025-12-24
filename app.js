require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require("axios");

// Import utilities
const env = require('./src/utils/env');

// Import middleware
const { requestLogger, errorLogger, morganLogger } = require('./src/middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import routes
const pagesRouter = require('./src/routes/pages');
const publicBookingsRouter = require('./src/routes/publicBookings');

// Import CORS configuration
const corsConfig = require('./src/config/cors');

const app = express();

// CORS configuration
app.use(cors(corsConfig));

// Logging middleware
app.use(morganLogger);
app.use(requestLogger);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use route modules
app.use('/', pagesRouter);
app.use('/api/bookings', publicBookingsRouter);

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (env.isDevelopment()) {
    env.logConfiguration();
  }
  console.log(`Access locally via: http://localhost:${PORT}`);
  console.log(`Access from devices on your network via: http://10.0.0.147:${PORT}`);
});
