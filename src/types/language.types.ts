export interface Language {
    id: string;
    name: string;
    flag: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface LanguageBasicInfo {
    id: string;
    name: string;
}

export interface DoctorLanguage {
    languageId: string;
    proficiency: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
}
