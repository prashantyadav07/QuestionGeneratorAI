// backend/src/utils/apiResponseHelper.js

/**
 * Standard API response builders for consistent error and success responses
 */

export const ErrorTypes = {
    RATE_LIMIT: 'RATE_LIMIT',
    MODEL_ERROR: 'MODEL_ERROR',
    API_ERROR: 'API_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    FILE_ERROR: 'FILE_ERROR'
};

/**
 * Build a standardized success response
 */
export const successResponse = (data, message = 'Success', metadata = {}) => {
    return {
        success: true,
        message,
        data,
        metadata: {
            timestamp: new Date().toISOString(),
            ...metadata
        }
    };
};

/**
 * Build a standardized error response
 */
export const errorResponse = (type, message, details = null, suggestions = []) => {
    const response = {
        success: false,
        error: {
            type,
            message,
            timestamp: new Date().toISOString()
        }
    };

    // Only include details in development mode
    if (process.env.NODE_ENV === 'development' && details) {
        response.error.details = details;
    }

    if (suggestions.length > 0) {
        response.error.suggestions = suggestions;
    }

    return response;
};

/**
 * Map error type to HTTP status code
 */
export const getHttpStatus = (errorType) => {
    const statusMap = {
        [ErrorTypes.RATE_LIMIT]: 429,
        [ErrorTypes.MODEL_ERROR]: 503,
        [ErrorTypes.API_ERROR]: 503,
        [ErrorTypes.INVALID_INPUT]: 400,
        [ErrorTypes.NETWORK_ERROR]: 503,
        [ErrorTypes.DATABASE_ERROR]: 500,
        [ErrorTypes.FILE_ERROR]: 400
    };

    return statusMap[errorType] || 500;
};

/**
 * Get user-friendly error message and suggestions
 */
export const getErrorDetails = (errorType, originalMessage) => {
    const details = {
        [ErrorTypes.RATE_LIMIT]: {
            message: 'Too many requests. Please wait a moment before trying again.',
            suggestions: ['Wait 30 seconds', 'Reduce the number of questions requested']
        },
        [ErrorTypes.MODEL_ERROR]: {
            message: 'AI model is temporarily unavailable.',
            suggestions: ['Try again in a few moments', 'Contact support if the issue persists']
        },
        [ErrorTypes.API_ERROR]: {
            message: 'AI service encountered an error.',
            suggestions: ['Try again', 'Check your internet connection']
        },
        [ErrorTypes.INVALID_INPUT]: {
            message: originalMessage || 'Invalid input provided.',
            suggestions: ['Check your input and try again']
        },
        [ErrorTypes.NETWORK_ERROR]: {
            message: 'Network connection error.',
            suggestions: ['Check your internet connection', 'Try again']
        },
        [ErrorTypes.DATABASE_ERROR]: {
            message: 'Database error occurred.',
            suggestions: ['Try again', 'Contact support if the issue persists']
        },
        [ErrorTypes.FILE_ERROR]: {
            message: originalMessage || 'File processing error.',
            suggestions: ['Ensure the file is a valid PDF', 'Try a different file']
        }
    };

    return details[errorType] || {
        message: originalMessage || 'An unexpected error occurred.',
        suggestions: ['Try again', 'Contact support if the issue persists']
    };
};
