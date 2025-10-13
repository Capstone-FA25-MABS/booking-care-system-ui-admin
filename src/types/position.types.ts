export interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt?: string;
    updatedAt?: string;
    description?: string;
}

export interface PositionFormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    description: string;
}
