/**
 * Validation error messages constants
 * Helps avoid hardcoded strings and ensures consistency across the application
 */

export const VALIDATION_MESSAGES = {
    // Email validation
    EMAIL_REQUIRED: 'Email là bắt buộc',
    EMAIL_INVALID: 'Vui lòng nhập địa chỉ email hợp lệ',

    // Password validation
    PASSWORD_REQUIRED: 'là bắt buộc',
    PASSWORD_NEW_REQUIRED: 'mới là bắt buộc',
    PASSWORD_CONFIRM_REQUIRED: 'Vui lòng xác nhận  mới',
    PASSWORD_MISMATCH: 'không khớp',
    PASSWORD_STRENGTH_REQUIREMENT:
        'phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',

    // Token validation
    RESET_TOKEN_MISSING: 'Token đặt lại  bị thiếu',

    // Generic
    FIELD_REQUIRED: 'Trường này là bắt buộc',
} as const;

export const PASSWORD_VALIDATION_DETAILS = {
    MIN_LENGTH: 'phải có ít nhất 8 ký tự',
    LOWERCASE_REQUIRED: 'phải chứa ít nhất một chữ cái thường',
    UPPERCASE_REQUIRED: 'phải chứa ít nhất một chữ cái hoa',
    DIGIT_REQUIRED: 'phải chứa ít nhất một chữ số',
    SPECIAL_CHAR_REQUIRED: 'phải chứa ít nhất một ký tự đặc biệt',
} as const;

export const API_ENDPOINTS = {
    // Auth endpoints
    FORGOT_PASSWORD: '/auth/forgot',
    RESET_PASSWORD: '/auth/reset',
} as const;

export const ROUTE_PATHS = {
    // General paths
    FORGOT_PASSWORD: '/forgot',
    RESET_PASSWORD: '/reset',
} as const;
