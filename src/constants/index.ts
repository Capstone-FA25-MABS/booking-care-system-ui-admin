// Email validation regex components (ReDoS-safe)
export const EMAIL_REGEX = {
    LOCAL_PART: /^[a-zA-Z0-9._%+-]+$/,
    DOMAIN_PART: /^[a-zA-Z0-9.-]+$/,
    TLD_PART: /^[a-zA-Z]{2,}$/,
} as const;

// Phone validation regex (Vietnamese format)
export const PHONE_REGEX_VN = /^0\d{9}$/;

// Password validation regexes
export const PASSWORD_REGEX = {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    DIGIT: /\d/,
    SPECIAL_CHAR: /[@$!%*?&]/,
} as const;

// Password minimum length
export const PASSWORD_MIN_LENGTH = 8;
