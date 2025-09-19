/**
 * Validation error messages constants
 * Helps avoid hardcoded strings and ensures consistency across the application
 */

export const VALIDATION_MESSAGES = {
    // Email validation
    EMAIL_REQUIRED: '',
    EMAIL_INVALID: '',

    // Password validation
    PASSWORD_REQUIRED: '',
    PASSWORD_NEW_REQUIRED: '',
    PASSWORD_CONFIRM_REQUIRED: '',
    PASSWORD_MISMATCH: '',
    PASSWORD_STRENGTH_REQUIREMENT: '',

    // Token validation
    RESET_TOKEN_MISSING: '',

    // Generic
    FIELD_REQUIRED: '',
} as const;

export const PASSWORD_VALIDATION_DETAILS = {
    MIN_LENGTH: '',
    LOWERCASE_REQUIRED: '',
    UPPERCASE_REQUIRED: '',
    DIGIT_REQUIRED: '',
    SPECIAL_CHAR_REQUIRED: '',
} as const;

export const API_ENDPOINTS = {
    // Auth endpoints
    FORGOT_PASSWORD: '',
    RESET_PASSWORD: '',
} as const;

export const ROUTE_PATHS = {
    // General paths
    FORGOT_PASSWORD: '',
    RESET_PASSWORD: '',
} as const;
