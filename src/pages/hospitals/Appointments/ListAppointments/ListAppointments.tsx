import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ListAppointments.module.scss';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import SortDropdown from '@/components/SortDropdown';
import ExportDropdown from '@/components/ExportDropdown';
import StatusBadge from '@/components/StatusBadge';

// Types definition
interface Patient {
    id: string;
    name: string;
    avatar: string;
    email?: string;
    phone?: string;
}

interface Appointment {
    id: string;
    appointmentId: string;
    patient: Patient;
    type: AppointmentType;
    date: string;
    time: string;
    reason: string;
    status: AppointmentStatus;
    location?: string;
    doctor?: {
        id: string;
        name: string;
        specialty: string;
        avatar: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

type AppointmentType = 'Trực tiếp' | 'Trực tuyến';

type AppointmentStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'SCHEDULED' | 'UPCOMING';

interface AppointmentFormData {
    appointmentId: string;
    patient: string;
    type: string;
    date: string;
    time: string;
    reason: string;
    status: string;
}

// Import images
import user01 from '@/assets/img/users/user-01.jpg';
import user02 from '@/assets/img/users/user-02.jpg';
import user03 from '@/assets/img/users/user-03.jpg';
import user04 from '@/assets/img/users/user-04.jpg';
import user05 from '@/assets/img/users/user-05.jpg';
import user06 from '@/assets/img/users/user-06.jpg';
import user07 from '@/assets/img/users/user-07.jpg';
import user08 from '@/assets/img/users/user-08.jpg';
import user09 from '@/assets/img/users/user-09.jpg';
import user10 from '@/assets/img/users/user-10.jpg';
import avatar01 from '@/assets/img/profiles/avatar-01.jpg';
import avatar14 from '@/assets/img/profiles/avatar-14.jpg';
import avatar15 from '@/assets/img/profiles/avatar-15.jpg';
import avatar16 from '@/assets/img/profiles/avatar-16.jpg';
import avatar2 from '@/assets/img/users/avatar-2.jpg';

const mockPatients: Patient[] = [
    { id: '1', name: 'Nguyễn Thị Lan', avatar: user02 },
    { id: '2', name: 'Trần Văn Nam', avatar: avatar01 },
    { id: '3', name: 'Lê Thị Mai', avatar: avatar16 },
    { id: '4', name: 'Phạm Văn Đức', avatar: avatar15 },
    { id: '5', name: 'Hoàng Thị Hoa', avatar: avatar14 },
    { id: '6', name: 'Vũ Văn Minh', avatar: avatar01 },
];

// Mock doctors data
const mockDoctors = [
    { id: '1', name: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', avatar: user01 },
    { id: '2', name: 'BS. Trần Thị B', specialty: 'Nhi khoa', avatar: user02 },
    { id: '3', name: 'BS. Lê Văn C', specialty: 'Nội khoa', avatar: user03 },
    { id: '4', name: 'BS. Phạm Thị D', specialty: 'Ngoại khoa', avatar: user04 },
    { id: '5', name: 'BS. Hoàng Văn E', specialty: 'Sản phụ khoa', avatar: user05 },
    { id: '6', name: 'BS. Vũ Thị F', specialty: 'Da liễu', avatar: user06 },
];

const appointmentTypes: AppointmentType[] = ['Trực tiếp', 'Trực tuyến'];
const appointmentStatuses: AppointmentStatus[] = [
    'COMPLETED',
    'PENDING',
    'CANCELLED',
    'SCHEDULED',
    'UPCOMING',
];

// Status mapping for tabs
const statusMapping = {
    upcoming: 'SCHEDULED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    pending: 'PENDING',
};

const mockAppointments: Appointment[] = [
    {
        id: '1',
        appointmentId: 'AP001',
        patient: { id: '1', name: 'Nguyễn Văn An', avatar: user01, phone: '0901 234 567' },
        doctor: { id: '1', name: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', avatar: user01 },
        type: 'Trực tiếp',
        date: '30/04/2025',
        time: '09:30',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '2',
        appointmentId: 'AP002',
        patient: { id: '2', name: 'Trần Thị Bình', avatar: user02, phone: '0902 345 678' },
        doctor: { id: '2', name: 'BS. Trần Thị B', specialty: 'Nhi khoa', avatar: user02 },
        type: 'Trực tuyến',
        date: '15/04/2025',
        time: '11:20',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '3',
        appointmentId: 'AP003',
        patient: { id: '3', name: 'Lê Văn Cường', avatar: user03, phone: '0903 456 789' },
        doctor: { id: '3', name: 'BS. Lê Văn C', specialty: 'Nội khoa', avatar: user03 },
        type: 'Trực tiếp',
        date: '02/04/2025',
        time: '08:15',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '4',
        appointmentId: 'AP004',
        patient: { id: '4', name: 'Phạm Thị Dung', avatar: user04, phone: '0904 567 890' },
        doctor: { id: '4', name: 'BS. Phạm Thị D', specialty: 'Ngoại khoa', avatar: user04 },
        type: 'Trực tuyến',
        date: '27/03/2025',
        time: '14:00',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '5',
        appointmentId: 'AP005',
        patient: { id: '5', name: 'Hoàng Văn Em', avatar: user05, phone: '0905 678 901' },
        doctor: { id: '5', name: 'BS. Hoàng Văn E', specialty: 'Sản phụ khoa', avatar: user05 },
        type: 'Trực tuyến',
        date: '12/03/2025',
        time: '17:40',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '6',
        appointmentId: 'AP006',
        patient: { id: '6', name: 'Vũ Thị Phương', avatar: user06, phone: '0906 789 012' },
        type: 'Trực tiếp',
        date: '24/02/2025',
        time: '09:20',
        reason: 'Điều trị',
        status: 'CANCELLED',
    },
    {
        id: '7',
        appointmentId: 'AP007',
        patient: { id: '7', name: 'Đặng Văn Giang', avatar: user07, phone: '0907 890 123' },
        type: 'Trực tuyến',
        date: '16/02/2025',
        time: '11:40',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '8',
        appointmentId: 'AP008',
        patient: { id: '8', name: 'Bùi Thị Hương', avatar: user08, phone: '0908 901 234' },
        type: 'Trực tuyến',
        date: '01/02/2025',
        time: '16:00',
        reason: 'Tái khám',
        status: 'COMPLETED',
    },
    {
        id: '9',
        appointmentId: 'AP009',
        patient: { id: '9', name: 'Ngô Văn I', avatar: user09, phone: '0909 012 345' },
        type: 'Trực tuyến',
        date: '25/01/2025',
        time: '15:10',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '10',
        appointmentId: 'AP010',
        patient: { id: '10', name: 'Đinh Thị Khoa', avatar: user10, phone: '0910 123 456' },
        type: 'Trực tiếp',
        date: '12/01/2025',
        time: '15:10',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    // Thêm 20 cuộc hẹn nữa để có tổng cộng 30 cuộc hẹn
    {
        id: '11',
        appointmentId: 'AP011',
        patient: { id: '11', name: 'Đinh Văn Minh', avatar: avatar01, phone: '0911 234 567' },
        type: 'Trực tuyến',
        date: '28/01/2025',
        time: '11:30',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '12',
        appointmentId: 'AP012',
        patient: { id: '12', name: 'Hồ Thị Nga', avatar: avatar14, phone: '0912 345 678' },
        type: 'Trực tiếp',
        date: '20/01/2025',
        time: '14:15',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '13',
        appointmentId: 'AP013',
        patient: { id: '13', name: 'Lý Văn Oanh', avatar: avatar15, phone: '0913 456 789' },
        type: 'Trực tuyến',
        date: '15/01/2025',
        time: '16:45',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '14',
        appointmentId: 'AP014',
        patient: { id: '14', name: 'Cao Thị Phúc', avatar: avatar16, phone: '0914 567 890' },
        type: 'Trực tiếp',
        date: '08/01/2025',
        time: '08:30',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '15',
        appointmentId: 'AP015',
        patient: { id: '15', name: 'Đào Văn Quang', avatar: user01, phone: '0915 678 901' },
        type: 'Trực tuyến',
        date: '02/01/2025',
        time: '12:00',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '16',
        appointmentId: 'AP016',
        patient: { id: '16', name: 'Tạ Thị Rồng', avatar: user02, phone: '0916 789 012' },
        type: 'Trực tiếp',
        date: '28/12/2024',
        time: '15:30',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '17',
        appointmentId: 'AP017',
        patient: { id: '17', name: 'Quách Văn Sơn', avatar: user03, phone: '0917 890 123' },
        type: 'Trực tuyến',
        date: '22/12/2024',
        time: '17:15',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '18',
        appointmentId: 'AP018',
        patient: { id: '18', name: 'Vương Thị Tuyết', avatar: user04, phone: '0918 901 234' },
        type: 'Trực tiếp',
        date: '18/12/2024',
        time: '10:45',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '19',
        appointmentId: 'AP019',
        patient: { id: '19', name: 'Tô Văn Uyên', avatar: user05, phone: '0919 012 345' },
        type: 'Trực tuyến',
        date: '12/12/2024',
        time: '13:20',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '20',
        appointmentId: 'AP020',
        patient: { id: '20', name: 'Lâm Thị Vân', avatar: user06, phone: '0920 123 456' },
        type: 'Trực tiếp',
        date: '05/12/2024',
        time: '14:50',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '21',
        appointmentId: 'AP021',
        patient: { id: '21', name: 'Thạch Văn Xuyên', avatar: user07, phone: '0921 234 567' },
        type: 'Trực tuyến',
        date: '30/11/2024',
        time: '16:10',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '22',
        appointmentId: 'AP022',
        patient: { id: '22', name: 'Sơn Thị Yến', avatar: user08, phone: '0922 345 678' },
        type: 'Trực tiếp',
        date: '25/11/2024',
        time: '09:15',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '23',
        appointmentId: 'AP023',
        patient: { id: '23', name: 'Lương Văn Zin', avatar: user09, phone: '0923 456 789' },
        type: 'Trực tuyến',
        date: '20/11/2024',
        time: '11:40',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '24',
        appointmentId: 'AP024',
        patient: { id: '24', name: 'Hà Thị Anh', avatar: user10, phone: '0924 567 890' },
        type: 'Trực tiếp',
        date: '15/11/2024',
        time: '13:25',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '25',
        appointmentId: 'AP025',
        patient: { id: '25', name: 'Phùng Văn Bình', avatar: avatar01, phone: '0925 678 901' },
        type: 'Trực tuyến',
        date: '10/11/2024',
        time: '15:55',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '26',
        appointmentId: 'AP026',
        patient: { id: '26', name: 'Tạ Thị Cường', avatar: avatar14, phone: '0926 789 012' },
        type: 'Trực tiếp',
        date: '05/11/2024',
        time: '08:40',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '27',
        appointmentId: 'AP027',
        patient: { id: '27', name: 'Quách Văn Dung', avatar: avatar15, phone: '0927 890 123' },
        type: 'Trực tuyến',
        date: '30/10/2024',
        time: '12:35',
        reason: 'Tư vấn sức khỏe',
        status: 'PENDING',
    },
    {
        id: '28',
        appointmentId: 'AP028',
        patient: { id: '28', name: 'Vương Thị Em', avatar: avatar16, phone: '0928 901 234' },
        type: 'Trực tiếp',
        date: '25/10/2024',
        time: '14:05',
        reason: 'Tái khám',
        status: 'CANCELLED',
    },
    {
        id: '29',
        appointmentId: 'AP029',
        patient: { id: '29', name: 'Tô Văn Phương', avatar: user01, phone: '0929 012 345' },
        type: 'Trực tuyến',
        date: '20/10/2024',
        time: '16:30',
        reason: 'Khám sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '30',
        appointmentId: 'AP030',
        patient: { id: '30', name: 'Lâm Thị Giang', avatar: user02, phone: '0930 123 456' },
        type: 'Trực tiếp',
        date: '15/10/2024',
        time: '10:20',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    // Thêm 20 appointments nữa để test pagination
    {
        id: '31',
        appointmentId: 'AP031',
        patient: { id: '31', name: 'Nguyễn Văn Hùng', avatar: user03, phone: '0931 234 567' },
        type: 'Trực tuyến',
        date: '10/10/2024',
        time: '14:30',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '32',
        appointmentId: 'AP032',
        patient: { id: '32', name: 'Trần Thị Lan', avatar: user04, phone: '0932 345 678' },
        type: 'Trực tiếp',
        date: '05/10/2024',
        time: '09:45',
        reason: 'Tái khám',
        status: 'PENDING',
    },
    {
        id: '33',
        appointmentId: 'AP033',
        patient: { id: '33', name: 'Lê Văn Minh', avatar: user05, phone: '0933 456 789' },
        type: 'Trực tuyến',
        date: '01/10/2024',
        time: '16:15',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    {
        id: '34',
        appointmentId: 'AP034',
        patient: { id: '34', name: 'Phạm Thị Nga', avatar: user06, phone: '0934 567 890' },
        type: 'Trực tiếp',
        date: '28/09/2024',
        time: '11:20',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '35',
        appointmentId: 'AP035',
        patient: { id: '35', name: 'Hoàng Văn Oanh', avatar: user07, phone: '0935 678 901' },
        type: 'Trực tuyến',
        date: '25/09/2024',
        time: '13:40',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '36',
        appointmentId: 'AP036',
        patient: { id: '36', name: 'Vũ Thị Phúc', avatar: user08, phone: '0936 789 012' },
        type: 'Trực tiếp',
        date: '20/09/2024',
        time: '08:50',
        reason: 'Tái khám',
        status: 'PENDING',
    },
    {
        id: '37',
        appointmentId: 'AP037',
        patient: { id: '37', name: 'Đặng Văn Quang', avatar: user09, phone: '0937 890 123' },
        type: 'Trực tuyến',
        date: '15/09/2024',
        time: '15:25',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    {
        id: '38',
        appointmentId: 'AP038',
        patient: { id: '38', name: 'Bùi Thị Rinh', avatar: user10, phone: '0938 901 234' },
        type: 'Trực tiếp',
        date: '10/09/2024',
        time: '12:10',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '39',
        appointmentId: 'AP039',
        patient: { id: '39', name: 'Ngô Văn Sơn', avatar: user01, phone: '0939 012 345' },
        type: 'Trực tuyến',
        date: '05/09/2024',
        time: '17:35',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '40',
        appointmentId: 'AP040',
        patient: { id: '40', name: 'Đinh Thị Tuyết', avatar: user02, phone: '0940 123 456' },
        type: 'Trực tiếp',
        date: '01/09/2024',
        time: '10:45',
        reason: 'Tái khám',
        status: 'PENDING',
    },
    {
        id: '41',
        appointmentId: 'AP041',
        patient: { id: '41', name: 'Hồ Văn Uyên', avatar: user03, phone: '0941 234 567' },
        type: 'Trực tuyến',
        date: '28/08/2024',
        time: '14:20',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    {
        id: '42',
        appointmentId: 'AP042',
        patient: { id: '42', name: 'Lý Thị Vân', avatar: user04, phone: '0942 345 678' },
        type: 'Trực tiếp',
        date: '25/08/2024',
        time: '09:15',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '43',
        appointmentId: 'AP043',
        patient: { id: '43', name: 'Cao Văn Xuyên', avatar: user05, phone: '0943 456 789' },
        type: 'Trực tuyến',
        date: '20/08/2024',
        time: '16:50',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '44',
        appointmentId: 'AP044',
        patient: { id: '44', name: 'Thạch Thị Yến', avatar: user06, phone: '0944 567 890' },
        type: 'Trực tiếp',
        date: '15/08/2024',
        time: '11:30',
        reason: 'Tái khám',
        status: 'PENDING',
    },
    {
        id: '45',
        appointmentId: 'AP045',
        patient: { id: '45', name: 'Sơn Văn Zin', avatar: user07, phone: '0945 678 901' },
        type: 'Trực tuyến',
        date: '10/08/2024',
        time: '13:45',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    {
        id: '46',
        appointmentId: 'AP046',
        patient: { id: '46', name: 'Lương Thị Anh', avatar: user08, phone: '0946 789 012' },
        type: 'Trực tiếp',
        date: '05/08/2024',
        time: '08:25',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    {
        id: '47',
        appointmentId: 'AP047',
        patient: { id: '47', name: 'Hà Văn Bình', avatar: user09, phone: '0947 890 123' },
        type: 'Trực tuyến',
        date: '01/08/2024',
        time: '15:10',
        reason: 'Tư vấn sức khỏe',
        status: 'SCHEDULED',
    },
    {
        id: '48',
        appointmentId: 'AP048',
        patient: { id: '48', name: 'Phùng Thị Cường', avatar: user10, phone: '0948 901 234' },
        type: 'Trực tiếp',
        date: '28/07/2024',
        time: '12:55',
        reason: 'Tái khám',
        status: 'PENDING',
    },
    {
        id: '49',
        appointmentId: 'AP049',
        patient: { id: '49', name: 'Tạ Văn Dung', avatar: user01, phone: '0949 012 345' },
        type: 'Trực tuyến',
        date: '25/07/2024',
        time: '17:20',
        reason: 'Khám sức khỏe',
        status: 'CANCELLED',
    },
    {
        id: '50',
        appointmentId: 'AP050',
        patient: { id: '50', name: 'Quách Thị Em', avatar: user02, phone: '0950 123 456' },
        type: 'Trực tiếp',
        date: '20/07/2024',
        time: '10:40',
        reason: 'Khám sức khỏe định kỳ',
        status: 'COMPLETED',
    },
    // Thêm một số appointment với status UPCOMING
    {
        id: '51',
        appointmentId: 'AP051',
        patient: { id: '51', name: 'Nguyễn Văn Sắp', avatar: user01, phone: '0951 234 567' },
        doctor: { id: '1', name: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', avatar: user01 },
        type: 'Trực tiếp',
        date: '15/01/2025',
        time: '09:00',
        reason: 'Khám tim mạch',
        status: 'UPCOMING',
    },
    {
        id: '52',
        appointmentId: 'AP052',
        patient: { id: '52', name: 'Trần Thị Tới', avatar: user02, phone: '0952 345 678' },
        doctor: { id: '2', name: 'BS. Trần Thị B', specialty: 'Nhi khoa', avatar: user02 },
        type: 'Trực tuyến',
        date: '20/01/2025',
        time: '14:30',
        reason: 'Tư vấn sức khỏe trẻ em',
        status: 'UPCOMING',
    },
    {
        id: '53',
        appointmentId: 'AP053',
        patient: { id: '53', name: 'Lê Văn Sắp', avatar: user03, phone: '0953 456 789' },
        doctor: { id: '3', name: 'BS. Lê Văn C', specialty: 'Nội khoa', avatar: user03 },
        type: 'Trực tiếp',
        date: '25/01/2025',
        time: '11:15',
        reason: 'Khám nội tổng quát',
        status: 'UPCOMING',
    },
];

const ListAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
    const [originalAppointments] = useState<Appointment[]>(mockAppointments);
    const [showNewAppointment, setShowNewAppointment] = useState(false);
    const [showEditAppointment, setShowEditAppointment] = useState(false);
    const [showViewDetails, setShowViewDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [sortBy, setSortBy] = useState<string>('Gần đây');

    // Filter states
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Status tab state
    const [activeStatusTab, setActiveStatusTab] = useState<string>('upcoming');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form states for new appointment
    const [newAppointment, setNewAppointment] = useState<AppointmentFormData>({
        appointmentId: 'AP234354',
        patient: '',
        type: '',
        date: '',
        time: '',
        reason: '',
        status: 'PENDING',
    });

    // Form states for edit appointment
    const [editAppointment, setEditAppointment] = useState<AppointmentFormData>({
        appointmentId: 'AP234354',
        patient: 'Emily Clark',
        type: 'In Person',
        date: '20/08/2025',
        time: '01 : 20 : PM',
        reason: 'An account of the present illness, which includes the circumstances surrounding the onset of recent health changes and the Purpose.',
        status: 'COMPLETED',
    });

    const handleNewAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New appointment:', newAppointment);
        setShowNewAppointment(false);
    };

    const handleEditAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Edit appointment:', editAppointment);
        setShowEditAppointment(false);
    };

    const handleDeleteConfirm = () => {
        if (selectedAppointment) {
            setAppointments(appointments.filter((apt) => apt.id !== selectedAppointment.id));
        }
        setShowDeleteModal(false);
        setSelectedAppointment(null);
    };

    const handleEditClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setEditAppointment({
            appointmentId: appointment.appointmentId,
            patient: appointment.patient.name,
            type: appointment.type,
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason,
            status: appointment.status,
        });
        setShowEditAppointment(true);
    };

    const handleViewClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowViewDetails(true);
    };

    const handleDeleteClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDeleteModal(true);
    };

    // Helper functions for filtering
    const filterByPatients = (appointments: Appointment[]) => {
        if (selectedPatients.length === 0) return appointments;
        return appointments.filter((appointment) =>
            selectedPatients.includes(appointment.patient.id)
        );
    };

    const filterByTypes = (appointments: Appointment[]) => {
        if (selectedTypes.length === 0) return appointments;
        return appointments.filter((appointment) => selectedTypes.includes(appointment.type));
    };

    const filterByDoctors = (appointments: Appointment[]) => {
        if (selectedDoctors.length === 0) return appointments;
        return appointments.filter((appointment) =>
            selectedDoctors.includes(appointment.doctor?.id || '')
        );
    };

    const filterByDateRange = (appointments: Appointment[]) => {
        if (!selectedDateRange.start || !selectedDateRange.end) return appointments;
        return appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date.split('/').reverse().join('-'));
            return (
                appointmentDate >= selectedDateRange.start! &&
                appointmentDate <= selectedDateRange.end!
            );
        });
    };

    const handleFilterSubmit = () => {
        let filteredAppointments = [...originalAppointments];

        // Apply all filters sequentially
        filteredAppointments = filterByPatients(filteredAppointments);
        filteredAppointments = filterByTypes(filteredAppointments);
        filteredAppointments = filterByDoctors(filteredAppointments);
        filteredAppointments = filterByDateRange(filteredAppointments);

        setAppointments(filteredAppointments);
        setCurrentPage(1); // Reset về trang 1 khi filter
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedPatients([]);
        setSelectedTypes([]);
        setSelectedDoctors([]);
        setSelectedDateRange({ start: null, end: null });
        setAppointments(originalAppointments);
        setCurrentPage(1); // Reset về trang 1 khi clear filter
    };

    // Filter appointments by status tab
    const getFilteredAppointments = () => {
        let filtered = appointments;

        // Filter by status tab
        if (activeStatusTab !== 'all') {
            const statusToFilter = statusMapping[activeStatusTab as keyof typeof statusMapping];
            filtered = filtered.filter((appointment) => appointment.status === statusToFilter);
        }

        return filtered;
    };

    // Pagination logic
    const paginatedAppointments = useMemo(() => {
        const filtered = getFilteredAppointments();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [appointments, activeStatusTab, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(getFilteredAppointments().length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Get count for each status tab
    const getStatusCounts = () => {
        return {
            upcoming: appointments.filter((apt) => apt.status === 'SCHEDULED').length,
            completed: appointments.filter((apt) => apt.status === 'COMPLETED').length,
            cancelled: appointments.filter((apt) => apt.status === 'CANCELLED').length,
            pending: appointments.filter((apt) => apt.status === 'PENDING').length,
        };
    };

    return (
        <div className="main-wrapper">
            <div className="settings-wrapper">
                <div className="content">
                    {/* Start Page Header */}
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-semibold mb-0">Lịch Hẹn</h4>
                        </div>
                        <div className="text-end d-flex">
                            <ExportDropdown
                                options={[
                                    { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                    {
                                        value: 'excel',
                                        label: 'Tải xuống dạng Excel',
                                        format: 'excel',
                                    },
                                ]}
                                onExport={(format: string) => {
                                    console.log('Exporting:', format);
                                    // Handle export logic here
                                }}
                            />
                            <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                                <Link
                                    to="/doctors-appointment"
                                    className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                                >
                                    <i className="ti ti-list fs-14 text-body"></i>
                                </Link>
                                <Link
                                    to="/doctors-appointment-details"
                                    className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                                >
                                    <i className="fa-solid fa-calendar-days"></i>
                                </Link>
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                className="ms-2 fs-13"
                                icon="ti ti-plus"
                                onClick={() => setShowNewAppointment(true)}
                            >
                                Lịch Hẹn Mới
                            </Button>
                        </div>
                    </div>
                    {/* End Page Header */}

                    {/* Start Filter */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                        {/* Status Tabs */}
                        <div className="d-flex gap-2">
                            <button
                                className={`btn ${activeStatusTab === 'upcoming' ? 'btn-primary' : 'btn-light'} ${styles.statusTab}`}
                                onClick={() => {
                                    setActiveStatusTab('upcoming');
                                    setCurrentPage(1);
                                }}
                            >
                                Sắp Tới
                                <span
                                    className={`badge ${activeStatusTab === 'upcoming' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                                >
                                    {getStatusCounts().upcoming}
                                </span>
                            </button>
                            <button
                                className={`btn ${activeStatusTab === 'cancelled' ? 'btn-primary' : 'btn-light'} ${styles.statusTab}`}
                                onClick={() => {
                                    setActiveStatusTab('cancelled');
                                    setCurrentPage(1);
                                }}
                            >
                                Đã Hủy
                                <span
                                    className={`badge ${activeStatusTab === 'cancelled' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                                >
                                    {getStatusCounts().cancelled}
                                </span>
                            </button>
                            <button
                                className={`btn ${activeStatusTab === 'completed' ? 'btn-primary' : 'btn-light'} ${styles.statusTab}`}
                                onClick={() => {
                                    setActiveStatusTab('completed');
                                    setCurrentPage(1);
                                }}
                            >
                                Hoàn Thành
                                <span
                                    className={`badge ${activeStatusTab === 'completed' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                                >
                                    {getStatusCounts().completed}
                                </span>
                            </button>
                            <button
                                className={`btn ${activeStatusTab === 'pending' ? 'btn-primary' : 'btn-light'} ${styles.statusTab}`}
                                onClick={() => {
                                    setActiveStatusTab('pending');
                                    setCurrentPage(1);
                                }}
                            >
                                Đang Khám
                                <span
                                    className={`badge ${activeStatusTab === 'pending' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                                >
                                    {getStatusCounts().pending}
                                </span>
                            </button>
                        </div>

                        <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3">
                            <Button
                                variant="white"
                                size="md"
                                className="me-2 fs-14 py-1 border d-inline-flex text-dark align-items-center"
                                icon="ti ti-filter text-gray-5"
                                onClick={() => setShowFilterModal(true)}
                            >
                                Lọc
                            </Button>
                            <SortDropdown
                                options={[
                                    { value: 'recent', label: 'Gần đây' },
                                    { value: 'asc', label: 'Tăng dần' },
                                    { value: 'desc', label: 'Giảm dần' },
                                    { value: 'last-month', label: 'Tháng trước' },
                                    { value: 'last-7-days', label: '7 ngày qua' },
                                ]}
                                selectedValue={sortBy}
                                onSelect={setSortBy}
                                placeholder="Sắp xếp theo:"
                            />
                        </div>
                    </div>
                    {/* End Filter */}

                    {/* Start Table */}
                    <div className="table-responsive">
                        <table className="table datatable table-nowrap">
                            <thead className="">
                                <tr>
                                    <th className="no-sort">Ngày & Giờ</th>
                                    <th>Bệnh Nhân</th>
                                    <th>Bác Sĩ</th>
                                    <th>Hình Thức</th>
                                    <th>Trạng Thái</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>
                                            {appointment.date} - {appointment.time}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to="/doctors-patient-details"
                                                    className="avatar avatar-md me-2"
                                                >
                                                    <img
                                                        src={appointment.patient.avatar}
                                                        alt="product"
                                                        className="rounded-circle"
                                                    />
                                                </Link>
                                                <Link
                                                    to="/doctors-patient-details"
                                                    className="fw-semibold"
                                                >
                                                    {appointment.patient.name}
                                                    <span className="text-body fs-13 fw-normal d-block">
                                                        {appointment.patient.phone}
                                                    </span>
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to="/doctors-profile"
                                                    className="avatar avatar-md me-2"
                                                >
                                                    <img
                                                        src={appointment.doctor?.avatar || user01}
                                                        alt="doctor"
                                                        className="rounded-circle"
                                                    />
                                                </Link>
                                                <Link to="/doctors-profile" className="fw-semibold">
                                                    {appointment.doctor?.name || 'Chưa phân công'}
                                                    <span className="text-body fs-13 fw-normal d-block">
                                                        {appointment.doctor?.specialty || ''}
                                                    </span>
                                                </Link>
                                            </div>
                                        </td>
                                        <td>{appointment.type}</td>
                                        <td>
                                            <StatusBadge status={appointment.status} />
                                        </td>
                                        <td className="action-item">
                                            <button
                                                type="button"
                                                className="btn btn-link p-0"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="ti ti-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu p-2">
                                                <li>
                                                    <button
                                                        type="button"
                                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                        onClick={() => handleEditClick(appointment)}
                                                    >
                                                        Sửa
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        type="button"
                                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                        onClick={() => handleViewClick(appointment)}
                                                    >
                                                        Xem
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        type="button"
                                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                        onClick={() =>
                                                            handleDeleteClick(appointment)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* End Table */}
                </div>
                {/* End Content */}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />

                {/* Footer Start */}
                <div className="footer text-center bg-white p-2 border-top">
                    <p className="text-dark mb-0">
                        2025 &copy;{' '}
                        <Link to="/" className="link-primary">
                            Preclinic
                        </Link>
                        , Tất Cả Quyền Được Bảo Lưu
                    </p>
                </div>
                {/* Footer End */}
            </div>

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Lọc Lịch Hẹn"
                fields={[
                    {
                        name: 'patients',
                        label: 'Bệnh Nhân',
                        type: 'multiselect',
                        value: selectedPatients,
                        onChange: (value) => setSelectedPatients(value as string[]),
                        options: mockPatients.map((patient) => ({
                            value: patient.id,
                            label: patient.name,
                        })),
                        placeholder: 'Chọn bệnh nhân...',
                        resetValue: [],
                    },
                    {
                        name: 'types',
                        label: 'Loại Khám',
                        type: 'multiselect',
                        value: selectedTypes,
                        onChange: (value) => setSelectedTypes(value as string[]),
                        options: appointmentTypes.map((type) => ({
                            value: type,
                            label: type,
                        })),
                        placeholder: 'Chọn loại khám...',
                        resetValue: [],
                    },
                    {
                        name: 'doctors',
                        label: 'Bác Sĩ',
                        type: 'multiselect',
                        value: selectedDoctors,
                        onChange: (value) => setSelectedDoctors(value as string[]),
                        options: mockDoctors.map((doctor) => ({
                            value: doctor.id,
                            label: doctor.name,
                        })),
                        placeholder: 'Chọn bác sĩ...',
                        resetValue: [],
                    },
                    {
                        name: 'dateRange',
                        label: 'Khoảng thời gian',
                        type: 'daterange',
                        value: selectedDateRange,
                        onChange: (value) => setSelectedDateRange(value as any),
                        resetValue: { start: null, end: null },
                    },
                ]}
            />

            {/* Start Add New Appointment */}
            <div
                className={`offcanvas offcanvas-offset offcanvas-end ${showNewAppointment ? 'show' : ''}`}
                tabIndex={-1}
                id="new_appointment"
                style={{ display: showNewAppointment ? 'block' : 'none' }}
            >
                <div className="offcanvas-header d-block pb-0 px-0">
                    <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
                        <h5 className="offcanvas-title fs-18 fw-bold">Lịch Hẹn Mới</h5>
                        <button
                            type="button"
                            className="btn-close opacity-100"
                            onClick={() => setShowNewAppointment(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
                <div className="offcanvas-body pt-3">
                    <form onSubmit={handleNewAppointmentSubmit}>
                        {/* start row*/}
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label
                                        htmlFor="appointment-id"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Mã Lịch Hẹn <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            id="appointment-id"
                                            type="text"
                                            className="form-control rounded bg-light"
                                            value={newAppointment.appointmentId}
                                            onChange={(e) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    appointmentId: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label
                                        htmlFor="patient-dropdown"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Bệnh Nhân<span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            id="patient-dropdown"
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {newAppointment.patient || 'Select'}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Search"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-3 list-style-none">
                                                {mockPatients.map((patient) => (
                                                    <li key={patient.id}>
                                                        <label
                                                            htmlFor={`patient-${patient.id}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`patient-${patient.id}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="patient"
                                                                value={patient.name}
                                                                onChange={(e) =>
                                                                    setNewAppointment({
                                                                        ...newAppointment,
                                                                        patient: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            <span className="avatar avatar-sm rounded-circle me-2">
                                                                <img
                                                                    src={patient.avatar}
                                                                    className="flex-shrink-0 rounded-circle"
                                                                    alt={`Avatar của ${patient.name}`}
                                                                />
                                                            </span>
                                                            {patient.name}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label
                                        htmlFor="appointment-type-dropdown"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Loại Khám <span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            id="appointment-type-dropdown"
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {newAppointment.type || 'Select'}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Select"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-3 list-style-none">
                                                {appointmentTypes.map((type, index) => (
                                                    <li key={`type-${type}-${index}`}>
                                                        <label
                                                            htmlFor={`type-${index}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`type-${index}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="type"
                                                                value={type}
                                                                onChange={(e) =>
                                                                    setNewAppointment({
                                                                        ...newAppointment,
                                                                        type: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            {type}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label
                                        htmlFor="appointment-date"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        {' '}
                                        Ngày Khám <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-end position-relative">
                                        <input
                                            id="appointment-date"
                                            type="text"
                                            className="form-control datetimepicker"
                                            placeholder="dd/mm/yyyy"
                                            value={newAppointment.date}
                                            onChange={(e) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    date: e.target.value,
                                                })
                                            }
                                        />
                                        <span className="input-icon-addon">
                                            <i className="ti ti-calendar"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label
                                        htmlFor="appointment-time"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        {' '}
                                        Giờ <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-end position-relative">
                                        <input
                                            id="appointment-time"
                                            type="text"
                                            className="form-control timepicker"
                                            placeholder="-- : --"
                                            value={newAppointment.time}
                                            onChange={(e) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    time: e.target.value,
                                                })
                                            }
                                        />
                                        <span className="input-icon-addon">
                                            <i className="ti ti-clock"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <div>
                                        <label
                                            htmlFor="appointment-reason"
                                            className="form-label mb-1 text-dark fs-14 fw-medium"
                                        >
                                            Lý Do Khám
                                        </label>
                                        <textarea
                                            id="appointment-reason"
                                            rows={4}
                                            className="form-control rounded"
                                            value={newAppointment.reason}
                                            onChange={(e) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    reason: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label
                                        htmlFor="appointment-status-dropdown"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Trạng Thái<span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            id="appointment-status-dropdown"
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {newAppointment.status || 'Select'}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Select"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-3 list-style-none">
                                                {appointmentStatuses.map((status, index) => (
                                                    <li key={`status-${status}-${index}`}>
                                                        <label
                                                            htmlFor={`status-${index}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`status-${index}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={
                                                                    status === newAppointment.status
                                                                }
                                                                onChange={(e) =>
                                                                    setNewAppointment({
                                                                        ...newAppointment,
                                                                        status: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            {status}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                        </div>
                        {/* end row*/}
                    </form>
                </div>
                <div className="offcanvas-footer mb-1 mt-3 p-3 border-1 border-top">
                    <div className=" d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-light btm-md"
                            onClick={() => setShowNewAppointment(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btm-md"
                            id="filter-submit"
                            onClick={() => setShowNewAppointment(false)}
                        >
                            Tạo Lịch Hẹn
                        </button>
                    </div>
                </div>
            </div>
            {/* End Add New Appointment*/}

            {/* Start Edit New Appointment */}
            <div
                className={`offcanvas offcanvas-offset offcanvas-end ${showEditAppointment ? 'show' : ''}`}
                tabIndex={-1}
                id="edit_appointment"
                style={{ display: showEditAppointment ? 'block' : 'none' }}
            >
                <div className="offcanvas-header d-block pb-0 px-0">
                    <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
                        <h5 className="offcanvas-title fs-18 fw-bold"> Sửa Lịch Hẹn</h5>
                        <button
                            type="button"
                            className="btn-close opacity-100"
                            onClick={() => setShowEditAppointment(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
                <div className="offcanvas-body pt-3">
                    <form onSubmit={handleEditAppointmentSubmit}>
                        {/* start row*/}
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        Mã Lịch Hẹn <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control rounded bg-light"
                                            value={editAppointment.appointmentId}
                                            onChange={(e) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    appointmentId: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        Bệnh Nhân<span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {editAppointment.patient}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Search"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-3 list-style-none">
                                                {mockPatients.map((patient) => (
                                                    <li key={patient.id}>
                                                        <label
                                                            htmlFor={`edit-patient-${patient.id}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`edit-patient-${patient.id}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="editPatient"
                                                                value={patient.name}
                                                                checked={
                                                                    patient.name ===
                                                                    editAppointment.patient
                                                                }
                                                                onChange={(e) =>
                                                                    setEditAppointment({
                                                                        ...editAppointment,
                                                                        patient: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            <span className="avatar avatar-sm rounded-circle me-2">
                                                                <img
                                                                    src={patient.avatar}
                                                                    className="flex-shrink-0 rounded-circle"
                                                                    alt={`Avatar của ${patient.name}`}
                                                                />
                                                            </span>
                                                            {patient.name}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        Loại Khám <span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {editAppointment.type}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Select"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-0 list-style-none">
                                                {appointmentTypes.map((type, index) => (
                                                    <li key={`edit-type-${type}-${index}`}>
                                                        <label
                                                            htmlFor={`edit-type-${index}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`edit-type-${index}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="editType"
                                                                value={type}
                                                                checked={
                                                                    type === editAppointment.type
                                                                }
                                                                onChange={(e) =>
                                                                    setEditAppointment({
                                                                        ...editAppointment,
                                                                        type: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            {type}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        {' '}
                                        Ngày Khám <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-end position-relative">
                                        <input
                                            type="text"
                                            className="form-control datetimepicker"
                                            placeholder="20/08/2025"
                                            value={editAppointment.date}
                                            onChange={(e) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    date: e.target.value,
                                                })
                                            }
                                        />
                                        <span className="input-icon-addon">
                                            <i className="ti ti-calendar"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        {' '}
                                        Giờ <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-end position-relative">
                                        <input
                                            type="text"
                                            className="form-control timepicker"
                                            placeholder="01 : 20 : PM"
                                            value={editAppointment.time}
                                            onChange={(e) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    time: e.target.value,
                                                })
                                            }
                                        />
                                        <span className="input-icon-addon">
                                            <i className="ti ti-clock"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <div>
                                        <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                            Lý Do Khám
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="form-control rounded"
                                            value={editAppointment.reason}
                                            onChange={(e) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    reason: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                            <div className="col-lg-12">
                                <div className="mb-3">
                                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                                        Trạng Thái<span className="text-danger">*</span>
                                    </label>
                                    <div className="dropdown">
                                        <button
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {editAppointment.status}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Select"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-3 list-style-none">
                                                {appointmentStatuses.map((status, index) => (
                                                    <li key={`edit-status-${status}-${index}`}>
                                                        <label
                                                            htmlFor={`edit-status-${index}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`edit-status-${index}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="editStatus"
                                                                value={status}
                                                                checked={
                                                                    status ===
                                                                    editAppointment.status
                                                                }
                                                                onChange={(e) =>
                                                                    setEditAppointment({
                                                                        ...editAppointment,
                                                                        status: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                            {status}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>{' '}
                            {/* end col*/}
                        </div>
                        {/* end row*/}
                    </form>
                </div>
                <div className="offcanvas-footer mb-1 mt-3 p-3 border-1 border-top">
                    <div className=" d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-light btm-md"
                            onClick={() => setShowEditAppointment(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btm-md"
                            id="filter-submit2"
                            onClick={() => setShowEditAppointment(false)}
                        >
                            Cập Nhật Lịch Hẹn
                        </button>
                    </div>
                </div>
            </div>
            {/* End Edit New Appointment*/}

            {/* Start View Details */}
            <div
                className={`offcanvas offcanvas-offset offcanvas-end ${showViewDetails ? 'show' : ''}`}
                tabIndex={-1}
                id="view_details"
                style={{ display: showViewDetails ? 'block' : 'none' }}
            >
                <div className="offcanvas-header d-block pb-0 px-0">
                    <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
                        <h5 className="offcanvas-title fs-18 fw-bold">
                            Chi Tiết Lịch Hẹn{' '}
                            <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2">
                                #{selectedAppointment?.appointmentId || 'AP544658'}
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn-close opacity-100"
                            onClick={() => setShowViewDetails(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
                <div className="offcanvas-body pt-0 px-0">
                    <h6 className="bg-light py-2 px-3 text-dark fw-bold"> Khi Nào & Ở Đâu </h6>
                    <div className="px-3 my-4">
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Ngày Khám{' '}
                            <span className="text-body fw-normal">
                                {' '}
                                {selectedAppointment?.date}{' '}
                            </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Giờ{' '}
                            <span className="text-body fw-normal">
                                {' '}
                                {selectedAppointment?.time}{' '}
                            </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Địa Điểm <span className="text-body fw-normal">Hà Nội, Việt Nam </span>
                        </p>
                        <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Loại Khám{' '}
                            <span className="text-body fw-normal">
                                {' '}
                                {selectedAppointment?.type}{' '}
                            </span>
                        </p>
                        <div className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                            Thông Tin Bệnh Nhân
                            <div className="text-body fw-normal d-flex align-items-center">
                                <span className="avatar avatar-sm">
                                    <img
                                        src={selectedAppointment?.patient.avatar || avatar2}
                                        alt=""
                                        className="rounded-circle me-1"
                                    />
                                </span>
                                {selectedAppointment?.patient.name || 'James Adrian'}
                            </div>
                        </div>
                    </div>
                    <h6 className="bg-light py-2 px-3 text-dark fw-bold"> Chi Tiết Lịch Hẹn </h6>
                    <div className="px-3 my-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                Khám Từ Xa
                                <label
                                    htmlFor="remote-consultation"
                                    className="d-flex align-items-center form-switch ps-1"
                                >
                                    <input
                                        id="remote-consultation"
                                        className="form-check-input m-0 me-2"
                                        type="checkbox"
                                        defaultChecked
                                    />
                                    <span className="visually-hidden">Khám từ xa</span>
                                </label>
                            </div>
                            <div>
                                <Link
                                    to="/online-consultation"
                                    className="btn-primary btn btn-sm rounded d-flex align-items-center"
                                >
                                    <i className="ti ti-video me-1"></i> Start
                                </Link>
                            </div>
                        </div>
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6">
                                <p className="text-dark"> Trạng Thái </p>
                            </div>

                            <div className="col-lg-6 col-md-6">
                                <div className="mb-3">
                                    <div className="dropdown">
                                        <button
                                            type="button"
                                            className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                            aria-expanded="true"
                                        >
                                            {selectedAppointment?.status || 'Pending'}
                                        </button>
                                        <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                                            <div className="mb-3">
                                                <div className="input-icon-start position-relative">
                                                    <span className="input-icon-addon fs-12">
                                                        <i className="ti ti-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Select"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="mb-0 list-style-none">
                                                {appointmentStatuses.map((status, index) => (
                                                    <li key={`view-status-${status}-${index}`}>
                                                        <label
                                                            htmlFor={`view-status-${index}`}
                                                            className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                        >
                                                            <input
                                                                id={`view-status-${index}`}
                                                                className="form-check-input m-0 me-2"
                                                                type="radio"
                                                                name="viewStatus"
                                                                value={status}
                                                                defaultChecked={
                                                                    status === 'COMPLETED'
                                                                }
                                                            />
                                                            {status}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Add New Appointment*/}

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Xác Nhận Xóa"
                message="Bạn có chắc chắn muốn xóa lịch hẹn này không?"
                itemName={selectedAppointment?.appointmentId}
            />
        </div>
    );
};

export default ListAppointments;
