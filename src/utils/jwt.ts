import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
    sub?: string;
    email?: string;
    role?: string | string[];
    roles?: string[];
    confirmEmail?: string;
    confirmPhone?: string;
    hasExternalProvider?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
}

/**
 * Get all authentication information from JWT token
 * Decode token only once and extract all needed information
 */
export function getAllJwtInfo(token: string | null): {
    roles: string[];
    emailConfirmed: boolean;
    phoneConfirmed: boolean;
    hasExternalProvider: boolean;
} {
    // Return default values if no token
    if (!token) {
        return {
            roles: [],
            emailConfirmed: false,
            phoneConfirmed: false,
            hasExternalProvider: false,
        };
    }

    // Decode token only once
    let payload: JwtPayload | null = null;
    try {
        payload = jwtDecode<JwtPayload>(token);
    } catch {
        return {
            roles: [],
            emailConfirmed: false,
            phoneConfirmed: false,
            hasExternalProvider: false,
        };
    }

    // Extract roles
    const rolesData = payload.roles ?? payload.role;
    let roles: string[] = [];
    if (Array.isArray(rolesData)) {
        roles = rolesData.map(String);
    } else if (typeof rolesData === 'string') {
        roles = [rolesData];
    }

    // Extract confirmation statuses
    const emailConfirmed = payload.confirmEmail?.toLowerCase() === 'true';
    const phoneConfirmed = payload.confirmPhone?.toLowerCase() === 'true';
    const hasExternalProvider = payload.hasExternalProvider?.toLowerCase() === 'true';

    return {
        roles,
        emailConfirmed,
        phoneConfirmed,
        hasExternalProvider,
    };
}
