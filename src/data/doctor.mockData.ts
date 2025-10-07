import {
    Position,
    Specialty,
    Language,
    ServiceType,
    Hospital,
    DoctorFormData,
} from '../types/doctor.types';

export const mockPositions: Position[] = [
    { id: '1', name: 'Bác sĩ chính', status: 'ACTIVE' },
    { id: '2', name: 'Bác sĩ phó', status: 'ACTIVE' },
    { id: '3', name: 'Bác sĩ trưởng khoa', status: 'ACTIVE' },
    { id: '4', name: 'Bác sĩ thực tập', status: 'ACTIVE' },
];

export const mockSpecialties: Specialty[] = [
    { id: '1', name: 'Tim mạch', status: 'ACTIVE' },
    { id: '2', name: 'Thần kinh', status: 'ACTIVE' },
    { id: '3', name: 'Nội khoa', status: 'ACTIVE' },
    { id: '4', name: 'Ngoại khoa', status: 'ACTIVE' },
    { id: '5', name: 'Sản phụ khoa', status: 'ACTIVE' },
];

export const mockLanguages: Language[] = [
    { id: 1, name: 'Tiếng Việt', flag: '/flags/vietnam.png', status: 'ACTIVE' },
    { id: 2, name: 'Tiếng Anh', flag: '/flags/uk.png', status: 'ACTIVE' },
    { id: 3, name: 'Tiếng Pháp', flag: '/flags/france.png', status: 'ACTIVE' },
    { id: 4, name: 'Tiếng Nhật', flag: '/flags/japan.png', status: 'ACTIVE' },
    { id: 5, name: 'Tiếng Hàn', flag: '/flags/korea.png', status: 'ACTIVE' },
];

export const mockServiceTypes: ServiceType[] = [
    { id: '1', name: 'Khám tổng quát', status: 'ACTIVE' },
    { id: '2', name: 'Khám chuyên khoa', status: 'ACTIVE' },
    { id: '3', name: 'Tư vấn sức khỏe', status: 'ACTIVE' },
    { id: '4', name: 'Khám định kỳ', status: 'ACTIVE' },
];

export const mockHospitals: Hospital[] = [
    { id: '1', name: 'Bệnh viện Chợ Rẫy', status: 'ACTIVE' },
    { id: '2', name: 'Bệnh viện 115', status: 'ACTIVE' },
    { id: '3', name: 'Bệnh viện Từ Dũ', status: 'ACTIVE' },
    { id: '4', name: 'Bệnh viện Nhi Đồng', status: 'ACTIVE' },
];

export const mockDoctorData: DoctorFormData = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84901234567',
    dateOfBirth: '1980-01-01',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    gender: 'male',
    description: 'Bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực tim mạch.',
    yearsOfExperience: 10,
    avatar: '',
    positionId: '1',
    specialtyId: '1',
    hospitalId: '1',
    languages: [
        { languageId: 1, proficiency: 'NATIVE' },
        { languageId: 2, proficiency: 'ADVANCED' },
    ],
    servicePrices: [
        { serviceTypeId: '1', price: 200000, note: 'Khám cơ bản' },
        { serviceTypeId: '2', price: 500000, note: 'Khám chuyên sâu' },
    ],
};
