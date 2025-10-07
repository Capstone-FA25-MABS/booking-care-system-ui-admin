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

interface Patient {
    id: string;
    name: string;
    avatar: string;
    phone: string;
}

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    avatar: string;
}

export interface Appointment {
    id: string;
    appointmentId: string;
    patient: Patient;
    doctor: Doctor;
    type: string;
    date: string;
    time: string;
    reason: string;
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'UPCOMING' | 'ONGOING';
}

export const mockPatients: Patient[] = [
    { id: '1', name: 'Nguyễn Văn An', avatar: user01, phone: '0901 234 567' },
    { id: '2', name: 'Trần Thị Bình', avatar: user02, phone: '0902 345 678' },
    { id: '3', name: 'Lê Văn Cường', avatar: user03, phone: '0903 456 789' },
    { id: '4', name: 'Phạm Thị Dung', avatar: user04, phone: '0904 567 890' },
    { id: '5', name: 'Hoàng Văn Em', avatar: user05, phone: '0905 678 901' },
    { id: '6', name: 'Vũ Thị Phượng', avatar: user06, phone: '0906 789 012' },
    { id: '7', name: 'Đỗ Văn Giang', avatar: user07, phone: '0907 890 123' },
    { id: '8', name: 'Bùi Thị Hồng', avatar: user08, phone: '0908 901 234' },
    { id: '9', name: 'Ngô Văn Ích', avatar: user09, phone: '0909 012 345' },
    { id: '10', name: 'Trương Thị Khánh', avatar: user10, phone: '0910 123 456' },
];

export const mockAppointments: Appointment[] = [
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
        reason: 'Phẫu thuật nhỏ',
        status: 'UPCOMING',
    },
    {
        id: '5',
        appointmentId: 'AP005',
        patient: { id: '5', name: 'Hoàng Văn Em', avatar: user05, phone: '0905 678 901' },
        doctor: { id: '5', name: 'BS. Hoàng Văn E', specialty: 'Da liễu', avatar: user05 },
        type: 'Trực tiếp',
        date: '20/03/2025',
        time: '10:45',
        reason: 'Điều trị mụn',
        status: 'ONGOING',
    },
];

export const appointmentStatuses = ['Sắp tới', 'Đang khám', 'Hoàn thành', 'Đã hủy', 'Chờ xác nhận'];

export const statusMapping: Record<string, string> = {
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    upcoming: 'UPCOMING',
    ongoing: 'ONGOING',
    pending: 'PENDING',
};
