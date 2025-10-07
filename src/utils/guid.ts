/**
 * Generates a new GUID/UUID v4 using cryptographically secure random values
 * @returns A new GUID string
 */
export const generateGuid = (): string => {
    // Use crypto.getRandomValues for cryptographically secure random numbers
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // Set version (4) and variant bits according to UUID v4 spec
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant bits

    // Convert to hex string and format as UUID
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

/**
 * Validates if a string is a valid GUID format
 * @param guid The string to validate
 * @returns True if the string is a valid GUID format
 */
export const isValidGuid = (guid: string): boolean => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
};

/**
 * Creates an empty GUID (useful for form initialization)
 * @returns An empty string that can be used as a placeholder for GUID
 */
export const emptyGuid = (): string => '';
