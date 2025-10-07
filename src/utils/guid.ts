import { Guid } from '../types/doctor.types';

/**
 * Generates a new GUID/UUID v4
 * @returns A new GUID string
 */
export const generateGuid = (): Guid => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Validates if a string is a valid GUID format
 * @param guid The string to validate
 * @returns True if the string is a valid GUID format
 */
export const isValidGuid = (guid: string): guid is Guid => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
};

/**
 * Creates an empty GUID (useful for form initialization)
 * @returns An empty string that can be used as a placeholder for GUID
 */
export const emptyGuid = (): Guid => '' as Guid;
