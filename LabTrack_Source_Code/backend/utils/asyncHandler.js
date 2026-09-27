// Wraps an async controller so a thrown error goes to Express's error
// middleware automatically, instead of every route needing its own try/catch.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
