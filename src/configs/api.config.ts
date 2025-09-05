// src/configs/api.config.ts

export interface ApiVersionConfig {
    version: string;
    isDefault: boolean;
    isSupported: boolean;
    deprecationDate?: string;
    migrationGuide?: string;
}

export const API_VERSIONS: Record<string, ApiVersionConfig> = {
    'v1.0': {
        version: 'v1.0',
        isDefault: false,
        isSupported: true,
        deprecationDate: '2025-12-31',
        migrationGuide: '/docs/migration/v1.0-to-v1.1',
    },
    'v1.1': {
        version: 'v1.1',
        isDefault: true,
        isSupported: true,
    },
    'v2.0': {
        version: 'v2.0',
        isDefault: false,
        isSupported: false, // Future version
    },
} as const;

export const DEFAULT_API_VERSION = 'v1.1';
export const FALLBACK_API_VERSION = 'v1.0';

export const API_CONFIG = {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:6020/api',
    gatewayUrl: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:6020',
    timeout: 30000,
    retryAttempts: 3,
    versions: API_VERSIONS,
    defaultVersion: DEFAULT_API_VERSION,
} as const;

export type ApiVersion = keyof typeof API_VERSIONS;
