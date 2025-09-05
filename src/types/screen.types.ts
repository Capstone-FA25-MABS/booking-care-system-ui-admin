// src/types/screen.types.ts
export interface Screen {
    id: string;
    name: string;
    path: string;
    category: ScreenCategory;
    description?: string;
    status: ScreenStatus;
    component?: string;
    icon?: string;
    tags?: string[];
}

export enum ScreenCategory {
    AUTHENTICATION = 'Authentication',
    USER_PROFILE = 'User Profile',
    DOCTOR = 'Doctor',
    DASHBOARD = 'Dashboard',
    PUBLIC = 'Public',
    DEMO = 'Demo & Components',
}

export enum ScreenStatus {
    COMPLETED = 'completed',
    IN_PROGRESS = 'in-progress',
    PLANNED = 'planned',
    DEPRECATED = 'deprecated',
}

export interface ScreenFilter {
    category?: ScreenCategory;
    status?: ScreenStatus;
    search?: string;
}
