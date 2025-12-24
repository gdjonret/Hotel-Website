# Hotel Le Process

A hotel booking system with a Node.js Express frontend and a Spring Boot backend.

## System Architecture

The system consists of two main components:

1. **Frontend**: A Node.js Express application serving EJS templates
2. **Backend**: A Spring Boot Java application with a PostgreSQL database

## Setup and Running

### Prerequisites

- Node.js (v14+)
- Java 17+
- PostgreSQL

### Starting the Backend

1. Navigate to the Backend-Hotel directory:
   ```
   cd ~/Desktop/Backend-Hotel
   ```

2. Run the Spring Boot application:
   ```
   ./mvnw spring-boot:run
   ```

3. The backend will start on http://localhost:8080

### Starting the Frontend

1. Navigate to the Hotel_process directory:
   ```
   cd ~/Documents/Hotel_process\ 2
   ```

2. Install dependencies (if not already done):
   ```
   npm install
   ```

3. Start the frontend application:
   ```
   npm start
   ```

4. The frontend will start on http://localhost:3000

### Quick Check Script

We've included a script to check if the backend is running:

```
./check_backend.sh
```

This script will:
- Check if the backend is running
- Try to start it if it's not running
- Provide instructions for manual startup if needed

## Testing the Booking Flow

1. Make sure both frontend and backend are running
2. Visit http://localhost:3000/BookNow
3. Select a room and dates
4. Fill in guest details
5. Complete the checkout process
6. View your booking confirmation

## Room Types and Pricing

- **Standard Single Room**: 20,000 FCFA/night
- **Premium Single Room**: 25,000 FCFA/night

## API Endpoints

### Public API (No Authentication)

- `POST /api/public/bookings` - Create a new booking

### Admin API (Requires Authentication)

- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/{id}` - Get a specific booking
- `PUT /api/admin/bookings/{id}` - Update a booking
- `DELETE /api/admin/bookings/{id}` - Delete a booking

## Troubleshooting

### CORS Issues

If you encounter CORS issues, check:
1. The backend CORS configuration in `WebConfig.java`
2. The frontend API calls in `confirmation.js`
3. Make sure the URLs in `.env` match your actual running services

### Database Connection Issues

If the backend fails to start due to database issues:
1. Check PostgreSQL is running
2. Verify database credentials in `application.yml`
3. Ensure the `hotel_db` database exists
