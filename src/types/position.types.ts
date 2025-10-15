export interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface PositionBasicInfo {
    id: string;
    name: string;
}

export interface PositionFormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    description: string;
}
