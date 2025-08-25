export const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Default error
    let error = { ...err };
    error.message = err.message;

    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique constraint violation
                error.message = 'Duplicate entry found';
                error.statusCode = 400;
                break;
            case '23503': // Foreign key constraint violation
                error.message = 'Referenced record not found';
                error.statusCode = 400;
                break;
            case '23502': // Not null constraint violation
                error.message = 'Required field is missing';
                error.statusCode = 400;
                break;
            default:
                error.message = 'Database error occurred';
                error.statusCode = 500;
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error.message = message;
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
