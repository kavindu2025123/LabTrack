// Lets a service say exactly what HTTP status/message an error should be,
// without needing to know about req/res at all.
// Usage: throw new ApiError(404, 'Equipment not found');
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
