const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/laboratories', require('./routes/laboratoryRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/borrowing', require('./routes/borrowingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check / root route
app.get('/', (req, res) => {
  res.send('LabTrack API is running');
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler - must be registered LAST. Every controller is
// wrapped in asyncHandler (utils/asyncHandler.js), so any error thrown in a
// service (e.g. `throw new ApiError(404, 'Equipment not found')`) ends up
// here instead of each route needing its own try/catch.
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
