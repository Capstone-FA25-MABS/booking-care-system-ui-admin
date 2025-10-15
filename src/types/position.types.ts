export interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface PositionBasicInfo {
    id: string;
    name: string;
}
