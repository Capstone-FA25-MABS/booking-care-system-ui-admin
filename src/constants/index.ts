// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Phone validation regex (Vietnamese format)
export const PHONE_REGEX_VN = /^0\d{9}$/;

// Password validation regexes
export const PASSWORD_REGEX = {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    DIGIT: /\d/,
    SPECIAL_CHAR: /[@$!%*?&]/,
    LOOKAHEAD_LOWERCASE: /(?=.*[a-z])/,
    LOOKAHEAD_UPPERCASE: /(?=.*[A-Z])/,
    LOOKAHEAD_DIGIT: /(?=.*\d)/,
    LOOKAHEAD_SPECIAL: /(?=.*[@$!%*?&])/,
} as const;

// Password minimum length
export const PASSWORD_MIN_LENGTH = 8;
