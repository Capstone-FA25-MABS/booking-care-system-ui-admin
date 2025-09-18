import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
    sub?: string;
    email?: string;
    role?: string | string[];
    roles?: string[];
    exp?: number;
    iat?: number;
    [key: string]: any;
}

export function decodeJwt(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

export function getRolesFromJwt(token: string): string[] {
    const payload = decodeJwt(token);
    if (!payload) return [];
    const roles = payload.roles ?? payload.role;
    if (Array.isArray(roles)) return roles.map(String);
    if (typeof roles === 'string') return [roles];
    return [];
}
