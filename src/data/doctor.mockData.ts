import { DoctorFormData } from '../types/doctor.types';
import { Position } from '../types/position.types';
import { Specialty } from '../types/specialty.types';
import { Language } from '../types/language.types';
import { ServiceType } from '../types/serviceType.types';
import { Hospital } from '../types/hospital.types';

export const mockPositions: Position[] = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Bác sĩ chính', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Bác sĩ phó', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Bác sĩ trưởng khoa', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Bác sĩ thực tập', status: 'ACTIVE' },
];

export const mockSpecialties: Specialty[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Tim mạch',
        imageUrl: '/images/specialties/cardiology.jpg',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Thần kinh',
        imageUrl: '/images/specialties/neurology.jpg',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Nội khoa',
        imageUrl: '/images/specialties/internal-medicine.jpg',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Ngoại khoa',
        imageUrl: '/images/specialties/surgery.jpg',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Sản phụ khoa',
        imageUrl: '/images/specialties/obstetrics-gynecology.jpg',
        status: 'ACTIVE',
    },
];

export const mockLanguages: Language[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'Tiếng Việt',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440022',
        name: 'Tiếng Anh',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440023',
        name: 'Tiếng Pháp',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440024',
        name: 'Tiếng Nhật',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440025',
        name: 'Tiếng Hàn',
        status: 'ACTIVE',
    },
];

export const mockServiceTypes: ServiceType[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440031',
        name: 'Khám tổng quát',
        description: 'Khám sức khỏe tổng quát cho bệnh nhân',
        imageUrl: 'https://via.placeholder.com/200x150/007bff/ffffff?text=Khám+Tổng+Quát',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440032',
        name: 'Khám chuyên khoa',
        description: 'Khám chuyên sâu theo từng chuyên khoa',
        imageUrl: 'https://via.placeholder.com/200x150/28a745/ffffff?text=Khám+Chuyên+Khoa',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440033',
        name: 'Tư vấn sức khỏe',
        description: 'Tư vấn và hướng dẫn về sức khỏe',
        imageUrl: 'https://via.placeholder.com/200x150/ffc107/ffffff?text=Tư+Vấn+Sức+Khỏe',
        status: 'ACTIVE',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440034',
        name: 'Khám định kỳ',
        description: 'Khám sức khỏe định kỳ hàng năm',
        imageUrl: 'https://via.placeholder.com/200x150/dc3545/ffffff?text=Khám+Định+Kỳ',
        status: 'ACTIVE',
    },
];

export const mockHospitals: Hospital[] = [
    { id: '550e8400-e29b-41d4-a716-446655440041', name: 'Bệnh viện Chợ Rẫy', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440042', name: 'Bệnh viện 115', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440043', name: 'Bệnh viện Từ Dũ', status: 'ACTIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440044', name: 'Bệnh viện Nhi Đồng', status: 'ACTIVE' },
];

export const mockDoctorData: DoctorFormData = {
    firstName: 'Nguyễn Văn',
    lastName: 'A',
    email: 'nguyenvana@example.com',
    phone: '+84901234567',
    dateOfBirth: '1980-01-01',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    gender: 'MALE',
    bio: 'Bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực tim mạch.',
    yearsOfExperience: 10,
    avatar: '',
    positionId: '550e8400-e29b-41d4-a716-446655440001',
    specialtyId: '550e8400-e29b-41d4-a716-446655440011',
    hospitalId: '550e8400-e29b-41d4-a716-446655440041',
    languageIds: ['550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440022'],
    servicePrices: [
        {
            id: 'price-1',
            serviceTypeId: '550e8400-e29b-41d4-a716-446655440031',
            amount: 200000,
        },
        {
            id: 'price-2',
            serviceTypeId: '550e8400-e29b-41d4-a716-446655440032',
            amount: 500000,
        },
    ],
};
