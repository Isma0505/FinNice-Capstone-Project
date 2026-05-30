// Simple async wrapper to catch rejected promises in express route handlers
module.exports.wrap = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (err) {
    next(err);
  }
};
