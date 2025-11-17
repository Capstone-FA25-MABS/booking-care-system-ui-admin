/**
 * Communication Service Utilities
 *
 * Shared utilities for services that communicate with ASP.NET Core backend
 * which expects PascalCase property names and UPPERCASE GUID values.
 *
 * Used by:
 * - chat.service.ts (Communication Service)
 * - tag.service.ts (Tag Service - part of Communication Service)
 */

/**
 * Check if a string is a valid GUID/UUID or MongoDB ObjectId format
 *
 * @param value - String to check
 * @returns true if the string matches GUID or ObjectId format
 *
 * @example
 * isGuid("40a06335-1b7d-46c4-8235-08de0497ca95") // true (GUID)
 * isGuid("507f1f77bcf86cd799439011")             // true (ObjectId)
 * isGuid("not-a-guid")                           // false
 */
export const isGuid = (value: string): boolean => {
    // GUID format: 8-4-4-4-12 (with dashes)
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // MongoDB ObjectId format: 24 hex characters (no dashes)
    const objectIdRegex = /^[0-9a-f]{24}$/i;

    return guidRegex.test(value) || objectIdRegex.test(value);
};

/**
 * Convert camelCase string to PascalCase
 *
 * @param str - String to convert
 * @returns PascalCase string
 *
 * @example
 * toPascalCase("conversationId") // "ConversationId"
 * toPascalCase("userId")         // "UserId"
 */
export const toPascalCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transform object keys from camelCase to PascalCase recursively
 * AND uppercase all GUID values
 *
 * Communication Service backend (ASP.NET Core) expects:
 * - PascalCase property names
 * - UPPERCASE GUID values
 *
 * @param obj - Object to transform (can be nested objects or arrays)
 * @returns Transformed object with PascalCase keys and uppercase GUIDs
 *
 * @example
 * const input = {
 *   conversationId: "40a06335-1b7d-46c4-8235-08de0497ca95",
 *   userId: "abc123",
 *   metadata: { createdBy: "user-123" }
 * };
 *
 * const output = transformToPascalCase(input);
 * // {
 * //   ConversationId: "40A06335-1B7D-46C4-8235-08DE0497CA95",
 * //   UserId: "ABC123",
 * //   Metadata: { CreatedBy: "USER-123" }
 * // }
 */
export const transformToPascalCase = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => transformToPascalCase(item));
    }

    // Handle objects
    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const pascalKey = toPascalCase(key);
            const value = obj[key];

            // Transform the value recursively first
            let transformedValue = transformToPascalCase(value);

            // If the value is a GUID string, uppercase it
            if (typeof transformedValue === 'string' && isGuid(transformedValue)) {
                transformedValue = transformedValue.toUpperCase();
            }

            acc[pascalKey] = transformedValue;
            return acc;
        }, {} as any);
    }

    // Return primitive values as-is (will be uppercased if GUID in parent)
    return obj;
};
