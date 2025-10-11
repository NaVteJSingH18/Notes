// This is a new global error handler.
// It detects the status code from the response object (if set) or defaults to 500.
// It provides a consistent JSON error response for all parts of your API.
const errorHandler = (err, req, res, next) => {
    // If the status code is 200 (OK), but an error was thrown,
    // it means we have an unhandled server error. Set it to 500.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // In development mode, we can also send the error stack for easier debugging.
        // In production, we don't want to expose this information.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
