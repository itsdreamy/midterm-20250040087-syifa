const VALID_TOKEN = process.env.VALID_TOKEN;

//Logger middleware
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${req.method} ${req.originalUrl}`);
  next();
}

//Auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const tokenHeader = req.headers["x-api-token"];

  const token =
    typeof tokenHeader === "string" && tokenHeader.trim()
      ? tokenHeader.trim()
      : typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : typeof authHeader === "string"
          ? authHeader.trim()
          : "";

  if (!token || token !== VALID_TOKEN) {
    const err = new Error("Unauthorized: Invalid or missing token");
    err.statusCode = 401;
    return next(err);
  }

  next();
}

//404 handler
function notFound(req, res, next) {
  const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

//4 params Error Handler
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && !err.statusCode
      ? "Internal Server Error"
      : err.message || "Unknown Error";

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
    },
  });
}

module.exports = {
  logger,
  requireAuth,
  notFound,
  errorHandler,
};
