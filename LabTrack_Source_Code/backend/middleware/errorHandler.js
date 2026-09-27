const ApiError = require('../utils/ApiError');

// Register this LAST in server.js, after all the app.use('/api/...') lines:
//   app.use(errorHandler);
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: 'Server error' });
}

module.exports = errorHandler;
