import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import SortDropdown from '@/components/SortDropdown';
import ExportDropdown from '@/components/ExportDropdown';
import styles from './ListDoctors.module.scss';

// Import ảnh trực tiếp
import doctor01 from '@/assets/img/doctors/doctor-01.jpg';
import doctor02 from '@/assets/img/doctors/doctor-02.jpg';
import doctor03 from '@/assets/img/doctors/doctor-03.jpg';
import doctor04 from '@/assets/img/doctors/doctor-04.jpg';

interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: { name: string };
    specialtyId: string;
    yearsOfExperience: number;
    status: string;
    avatarUrl: string;
    prices: { serviceTypeName: string; amount: number }[];
    createdAt: string;
}

const mockDoctors: Doctor[] = [
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd6',
        firstName: 'Ngô',
        lastName: 'Văn I',
        email: 'dr.ngo.van.i@bookingcare.com',
        position: { name: 'Bác sĩ ngoại khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd1',
        yearsOfExperience: 7,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 750000 },
            { serviceTypeName: 'TELEHEALTH', amount: 450000 },
        ],
        createdAt: '2025-09-14T09:30:59.67',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd7',
        firstName: 'Trần',
        lastName: 'Thị A',
        email: 'dr.tran.thi.a@bookingcare.com',
        position: { name: 'Bác sĩ nhi khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd2',
        yearsOfExperience: 10,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 600000 },
            { serviceTypeName: 'TELEHEALTH', amount: 300000 },
        ],
        createdAt: '2025-09-15T10:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd8',
        firstName: 'Lê',
        lastName: 'Văn B',
        email: 'dr.le.van.b@bookingcare.com',
        position: { name: 'Bác sĩ nội khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd3',
        yearsOfExperience: 5,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1200000 },
            { serviceTypeName: 'TELEHEALTH', amount: 800000 },
        ],
        createdAt: '2025-09-16T11:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd9',
        firstName: 'Phạm',
        lastName: 'Thị C',
        email: 'dr.pham.thi.c@bookingcare.com',
        position: { name: 'Bác sĩ ngoại khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd1',
        yearsOfExperience: 8,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [{ serviceTypeName: 'TELEHEALTH', amount: 400000 }],
        createdAt: '2025-09-17T12:00:00.00',
    },
    // Thêm 26 bác sĩ nữa để có tổng cộng 30 bác sĩ
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd10',
        firstName: 'Hoàng',
        lastName: 'Văn D',
        email: 'dr.hoang.van.d@bookingcare.com',
        position: { name: 'Bác sĩ tim mạch' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd4',
        yearsOfExperience: 12,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1500000 },
            { serviceTypeName: 'TELEHEALTH', amount: 900000 },
        ],
        createdAt: '2025-09-18T08:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd11',
        firstName: 'Vũ',
        lastName: 'Thị E',
        email: 'dr.vu.thi.e@bookingcare.com',
        position: { name: 'Bác sĩ da liễu' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd5',
        yearsOfExperience: 6,
        status: 'ACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 800000 },
            { serviceTypeName: 'TELEHEALTH', amount: 500000 },
        ],
        createdAt: '2025-09-19T09:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd12',
        firstName: 'Đặng',
        lastName: 'Văn F',
        email: 'dr.dang.van.f@bookingcare.com',
        position: { name: 'Bác sĩ thần kinh' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd6',
        yearsOfExperience: 15,
        status: 'INACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 2000000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1200000 },
        ],
        createdAt: '2025-09-20T10:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd13',
        firstName: 'Bùi',
        lastName: 'Thị G',
        email: 'dr.bui.thi.g@bookingcare.com',
        position: { name: 'Bác sĩ mắt' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd7',
        yearsOfExperience: 9,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1000000 },
            { serviceTypeName: 'TELEHEALTH', amount: 600000 },
        ],
        createdAt: '2025-09-21T11:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd14',
        firstName: 'Phan',
        lastName: 'Văn H',
        email: 'dr.phan.van.h@bookingcare.com',
        position: { name: 'Bác sĩ tai mũi họng' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd8',
        yearsOfExperience: 11,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 900000 },
            { serviceTypeName: 'TELEHEALTH', amount: 550000 },
        ],
        createdAt: '2025-09-22T12:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd15',
        firstName: 'Tôn',
        lastName: 'Thị I',
        email: 'dr.ton.thi.i@bookingcare.com',
        position: { name: 'Bác sĩ sản phụ khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd9',
        yearsOfExperience: 13,
        status: 'ACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1300000 },
            { serviceTypeName: 'TELEHEALTH', amount: 700000 },
        ],
        createdAt: '2025-09-23T13:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd16',
        firstName: 'Đinh',
        lastName: 'Văn J',
        email: 'dr.dinh.van.j@bookingcare.com',
        position: { name: 'Bác sĩ xương khớp' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd10',
        yearsOfExperience: 8,
        status: 'INACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1100000 },
            { serviceTypeName: 'TELEHEALTH', amount: 650000 },
        ],
        createdAt: '2025-09-24T14:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd17',
        firstName: 'Hồ',
        lastName: 'Thị K',
        email: 'dr.ho.thi.k@bookingcare.com',
        position: { name: 'Bác sĩ tiêu hóa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd11',
        yearsOfExperience: 7,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 950000 },
            { serviceTypeName: 'TELEHEALTH', amount: 580000 },
        ],
        createdAt: '2025-09-25T15:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd18',
        firstName: 'Mai',
        lastName: 'Văn L',
        email: 'dr.mai.van.l@bookingcare.com',
        position: { name: 'Bác sĩ nội tiết' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd12',
        yearsOfExperience: 14,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1400000 },
            { serviceTypeName: 'TELEHEALTH', amount: 850000 },
        ],
        createdAt: '2025-09-26T16:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd19',
        firstName: 'Lý',
        lastName: 'Thị M',
        email: 'dr.ly.thi.m@bookingcare.com',
        position: { name: 'Bác sĩ tâm thần' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd13',
        yearsOfExperience: 16,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1800000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1000000 },
        ],
        createdAt: '2025-09-27T17:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd20',
        firstName: 'Cao',
        lastName: 'Văn N',
        email: 'dr.cao.van.n@bookingcare.com',
        position: { name: 'Bác sĩ ung bướu' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd14',
        yearsOfExperience: 18,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 2500000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1500000 },
        ],
        createdAt: '2025-09-28T18:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd21',
        firstName: 'Đào',
        lastName: 'Thị O',
        email: 'dr.dao.thi.o@bookingcare.com',
        position: { name: 'Bác sĩ nhi khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd2',
        yearsOfExperience: 6,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 700000 },
            { serviceTypeName: 'TELEHEALTH', amount: 400000 },
        ],
        createdAt: '2025-09-29T19:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd22',
        firstName: 'Võ',
        lastName: 'Văn P',
        email: 'dr.vo.van.p@bookingcare.com',
        position: { name: 'Bác sĩ ngoại khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd1',
        yearsOfExperience: 9,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1200000 },
            { serviceTypeName: 'TELEHEALTH', amount: 700000 },
        ],
        createdAt: '2025-09-30T20:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd23',
        firstName: 'Dương',
        lastName: 'Thị Q',
        email: 'dr.duong.thi.q@bookingcare.com',
        position: { name: 'Bác sĩ nội khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd3',
        yearsOfExperience: 12,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1000000 },
            { serviceTypeName: 'TELEHEALTH', amount: 600000 },
        ],
        createdAt: '2025-10-01T21:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd24',
        firstName: 'Nguyễn',
        lastName: 'Văn R',
        email: 'dr.nguyen.van.r@bookingcare.com',
        position: { name: 'Bác sĩ tim mạch' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd4',
        yearsOfExperience: 20,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 2000000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1200000 },
        ],
        createdAt: '2025-10-02T22:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd25',
        firstName: 'Trương',
        lastName: 'Thị S',
        email: 'dr.truong.thi.s@bookingcare.com',
        position: { name: 'Bác sĩ da liễu' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd5',
        yearsOfExperience: 8,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 850000 },
            { serviceTypeName: 'TELEHEALTH', amount: 520000 },
        ],
        createdAt: '2025-10-03T23:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd26',
        firstName: 'Lương',
        lastName: 'Văn T',
        email: 'dr.luong.van.t@bookingcare.com',
        position: { name: 'Bác sĩ thần kinh' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd6',
        yearsOfExperience: 17,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 2200000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1300000 },
        ],
        createdAt: '2025-10-04T00:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd27',
        firstName: 'Hà',
        lastName: 'Thị U',
        email: 'dr.ha.thi.u@bookingcare.com',
        position: { name: 'Bác sĩ mắt' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd7',
        yearsOfExperience: 10,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1100000 },
            { serviceTypeName: 'TELEHEALTH', amount: 650000 },
        ],
        createdAt: '2025-10-05T01:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd28',
        firstName: 'Phùng',
        lastName: 'Văn V',
        email: 'dr.phung.van.v@bookingcare.com',
        position: { name: 'Bác sĩ tai mũi họng' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd8',
        yearsOfExperience: 13,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 950000 },
            { serviceTypeName: 'TELEHEALTH', amount: 570000 },
        ],
        createdAt: '2025-10-06T02:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd29',
        firstName: 'Tạ',
        lastName: 'Thị W',
        email: 'dr.ta.thi.w@bookingcare.com',
        position: { name: 'Bác sĩ sản phụ khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd9',
        yearsOfExperience: 11,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1250000 },
            { serviceTypeName: 'TELEHEALTH', amount: 750000 },
        ],
        createdAt: '2025-10-07T03:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd30',
        firstName: 'Quách',
        lastName: 'Văn X',
        email: 'dr.quach.van.x@bookingcare.com',
        position: { name: 'Bác sĩ xương khớp' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd10',
        yearsOfExperience: 15,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1600000 },
            { serviceTypeName: 'TELEHEALTH', amount: 950000 },
        ],
        createdAt: '2025-10-08T04:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd31',
        firstName: 'Vương',
        lastName: 'Thị Y',
        email: 'dr.vuong.thi.y@bookingcare.com',
        position: { name: 'Bác sĩ tiêu hóa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd11',
        yearsOfExperience: 7,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 900000 },
            { serviceTypeName: 'TELEHEALTH', amount: 550000 },
        ],
        createdAt: '2025-10-09T05:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd32',
        firstName: 'Tô',
        lastName: 'Văn Z',
        email: 'dr.to.van.z@bookingcare.com',
        position: { name: 'Bác sĩ nội tiết' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd12',
        yearsOfExperience: 19,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1700000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1000000 },
        ],
        createdAt: '2025-10-10T06:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd33',
        firstName: 'Lâm',
        lastName: 'Thị AA',
        email: 'dr.lam.thi.aa@bookingcare.com',
        position: { name: 'Bác sĩ tâm thần' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd13',
        yearsOfExperience: 14,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1900000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1100000 },
        ],
        createdAt: '2025-10-11T07:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd34',
        firstName: 'Thạch',
        lastName: 'Văn BB',
        email: 'dr.thach.van.bb@bookingcare.com',
        position: { name: 'Bác sĩ ung bướu' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd14',
        yearsOfExperience: 21,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 2800000 },
            { serviceTypeName: 'TELEHEALTH', amount: 1700000 },
        ],
        createdAt: '2025-10-12T08:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd35',
        firstName: 'Sơn',
        lastName: 'Thị CC',
        email: 'dr.son.thi.cc@bookingcare.com',
        position: { name: 'Bác sĩ nhi khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd2',
        yearsOfExperience: 5,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 650000 },
            { serviceTypeName: 'TELEHEALTH', amount: 380000 },
        ],
        createdAt: '2025-10-13T09:00:00.00',
    },
];

const ListDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
    const [originalDoctors, setOriginalDoctors] = useState<Doctor[]>(mockDoctors);
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination logic
    const paginatedDoctors = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return doctors.slice(startIndex, endIndex);
    }, [doctors, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(doctors.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterSubmit = () => {
        let filteredDoctors = [...originalDoctors];

        // Lọc theo bác sĩ
        if (selectedDoctors.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedDoctors.includes(doctor.id)
            );
        }

        // Lọc theo học hàm/học vị
        if (selectedPositions.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedPositions.includes(doctor.position.name)
            );
        }

        // Lọc theo chuyên khoa
        if (selectedSpecialties.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedSpecialties.includes(doctor.specialtyId)
            );
        }

        // Lọc theo loại dịch vụ
        if (selectedServiceTypes.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                doctor.prices.some((price) => selectedServiceTypes.includes(price.serviceTypeName))
            );
        }

        // Lọc theo giá
        if (selectedPrices.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                doctor.prices.some((price) => {
                    const amount = price.amount;
                    if (selectedPrices.includes('m-1') && amount < 500000) return true;
                    if (selectedPrices.includes('m-2') && amount >= 500000 && amount <= 1000000)
                        return true;
                    if (selectedPrices.includes('m-3') && amount > 1000000) return true;
                    return false;
                })
            );
        }

        // Lọc theo trạng thái
        if (selectedStatuses.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedStatuses.includes(doctor.status)
            );
        }

        setDoctors(filteredDoctors);
        setCurrentPage(1); // Reset về trang 1 khi filter
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedDoctors([]);
        setSelectedPositions([]);
        setSelectedSpecialties([]);
        setSelectedServiceTypes([]);
        setSelectedPrices([]);
        setSelectedStatuses([]);
        setDoctors(originalDoctors);
        setCurrentPage(1); // Reset về trang 1 khi clear filter
    };

    const handleResetFilter = (type: string) => {
        switch (type) {
            case 'doctors':
                setSelectedDoctors([]);
                break;
            case 'positions':
                setSelectedPositions([]);
                break;
            case 'specialties':
                setSelectedSpecialties([]);
                break;
            case 'serviceTypes':
                setSelectedServiceTypes([]);
                break;
            case 'prices':
                setSelectedPrices([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
                break;
            default:
                break;
        }
    };

    // Delete functions
    const handleDeleteClick = (doctor: Doctor) => {
        setDoctorToDelete(doctor);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (doctorToDelete) {
            // Remove doctor from list
            setDoctors((prev) => prev.filter((doctor) => doctor.id !== doctorToDelete.id));
            setOriginalDoctors((prev: Doctor[]) =>
                prev.filter((doctor: Doctor) => doctor.id !== doctorToDelete.id)
            );

            // Close modal
            setShowDeleteModal(false);
            setDoctorToDelete(null);

            // Show success message
            alert(
                `Đã xóa bác sĩ ${doctorToDelete.firstName} ${doctorToDelete.lastName} thành công!`
            );
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDoctorToDelete(null);
    };

    return (
        <div className="main-wrapper">
            <div className="settings-wrapper">
                <div className="content">
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-bold mb-0">
                                Danh Sách Bác Sĩ{' '}
                                <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                    Tổng Bác Sĩ: {doctors.length}
                                </span>
                            </h4>
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
                                    to="/hospitals/doctors"
                                    className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                                >
                                    <i className="ti ti-list fs-14 text-body"></i>
                                </Link>
                                <Link
                                    to="/hospitals/doctors"
                                    className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                                >
                                    <i className="ti ti-layout-grid fs-14 text-body"></i>
                                </Link>
                            </div>
                            <Button
                                variant="primary"
                                size="md"
                                className="ms-2 fs-13"
                                icon="ti ti-plus"
                                onClick={() => (window.location.href = '/hospitals/doctors/add')}
                            >
                                Thêm Bác Sĩ
                            </Button>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set mb-3">
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <div className="table-search d-flex align-items-center mb-0">
                                    <label htmlFor="doctor-search" className="visually-hidden">
                                        Tìm kiếm bác sĩ
                                    </label>
                                    <div className="search-input">
                                        <div className="input-icon-start position-relative">
                                            <span className="input-icon-addon">
                                                <i className="ti ti-search"></i>
                                            </span>
                                            <input
                                                id="doctor-search"
                                                type="text"
                                                className="form-control shadow-sm"
                                                placeholder="Tìm kiếm bác sĩ..."
                                            />
                                            <span className="input-icon-addon text-dark shadow fs-18 d-inline-flex p-0 header-search-icon">
                                                <i className="ti ti-command"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
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
                                    { value: 'recent', label: 'Mới Thêm Gần Đây' },
                                    { value: 'asc', label: 'Tăng Dần' },
                                    { value: 'desc', label: 'Giảm Dần' },
                                    { value: 'last-month', label: 'Tháng Trước' },
                                    { value: 'last-7-days', label: '7 Ngày Qua' },
                                ]}
                                selectedValue={sortBy}
                                onSelect={setSortBy}
                                placeholder="Sắp xếp theo:"
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-nowrap datatable">
                            <thead className="thead-light">
                                <tr>
                                    <th>Tên & Học hàm/Học vị</th>
                                    <th>Chuyên khoa</th>
                                    <th>Email</th>
                                    <th>Kinh nghiệm</th>
                                    <th>Loại dịch vụ</th>
                                    <th>Giá</th>
                                    <th>Trạng thái</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDoctors.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to={`/clinic/doctor-details/${doctor.id}`}
                                                    className="avatar me-2"
                                                >
                                                    <img
                                                        src={doctor.avatarUrl}
                                                        alt="Bác sĩ"
                                                        className="rounded-circle"
                                                    />
                                                </Link>
                                                <div>
                                                    <h6 className="mb-1 fs-14 fw-semibold">
                                                        <Link
                                                            to={`/clinic/doctor-details/${doctor.id}`}
                                                        >
                                                            {doctor.firstName} {doctor.lastName}
                                                        </Link>
                                                    </h6>
                                                    <span className="fs-13 d-block">
                                                        {doctor.position.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{doctor.specialtyId}</td>
                                        <td>
                                            <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                                        </td>
                                        <td>
                                            <h6 className="fs-14 fw-semibold mb-0">
                                                {doctor.yearsOfExperience} năm
                                            </h6>
                                        </td>
                                        <td>
                                            {doctor.prices
                                                .map((price) =>
                                                    price.serviceTypeName === 'IN_PERSON'
                                                        ? 'Trực tiếp'
                                                        : 'Từ xa'
                                                )
                                                .join(', ')}
                                        </td>
                                        <td>
                                            {doctor.prices
                                                .map(
                                                    (price) =>
                                                        `${price.amount.toLocaleString('vi-VN')} VNĐ`
                                                )
                                                .join(', ')}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-soft-${
                                                    doctor.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'danger'
                                                } border border-${doctor.status === 'ACTIVE' ? 'success' : 'danger'}`}
                                            >
                                                {doctor.status === 'ACTIVE'
                                                    ? 'Có mặt'
                                                    : 'Không có mặt'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="action-item me-2">
                                                    <Link to="/clinic/appointment-calendar">
                                                        <i className="ti ti-calendar-cog"></i>
                                                    </Link>
                                                </div>
                                                <div className="action-item">
                                                    <button
                                                        className={styles.dotsButton}
                                                        data-bs-toggle="dropdown"
                                                        type="button"
                                                    >
                                                        <i className="ti ti-dots-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <Link
                                                                to={`/hospitals/doctors/edit/${doctor.id}`}
                                                                className="dropdown-item d-flex align-items-center"
                                                            >
                                                                Sửa
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item d-flex align-items-center"
                                                                onClick={() =>
                                                                    handleDeleteClick(doctor)
                                                                }
                                                                type="button"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />

                    <div className="footer text-center bg-white p-2 border-top">
                        <p className="text-dark mb-0">
                            2025 &copy;{' '}
                            <Link to="/" className="link-primary">
                                Preclinic
                            </Link>
                            , Tất Cả Quyền Được Bảo Lưu
                        </p>
                    </div>
                </div>

                {/* Filter Modal */}
                <ModalFilter
                    show={showFilterModal}
                    onHide={() => setShowFilterModal(false)}
                    onApply={handleFilterSubmit}
                    onReset={handleClearFilters}
                    title="Lọc Bác Sĩ"
                    fields={[
                        {
                            name: 'doctors',
                            label: 'Bác Sĩ',
                            type: 'multiselect',
                            options: originalDoctors.map((doctor) => ({
                                value: doctor.id,
                                label: `${doctor.firstName} ${doctor.lastName}`,
                            })),
                            value: selectedDoctors,
                            onChange: setSelectedDoctors,
                            resetValue: () => handleResetFilter('doctors'),
                        },
                        {
                            name: 'positions',
                            label: 'Học hàm/Học vị',
                            type: 'multiselect',
                            options: [
                                ...new Set(originalDoctors.map((doctor) => doctor.position.name)),
                            ].map((position) => ({
                                value: position,
                                label: position,
                            })),
                            value: selectedPositions,
                            onChange: setSelectedPositions,
                            resetValue: () => handleResetFilter('positions'),
                        },
                        {
                            name: 'specialties',
                            label: 'Chuyên Khoa',
                            type: 'multiselect',
                            options: [
                                ...new Set(originalDoctors.map((doctor) => doctor.specialtyId)),
                            ].map((specialty) => ({
                                value: specialty,
                                label: specialty,
                            })),
                            value: selectedSpecialties,
                            onChange: setSelectedSpecialties,
                            resetValue: () => handleResetFilter('specialties'),
                        },
                        {
                            name: 'serviceTypes',
                            label: 'Loại Dịch Vụ',
                            type: 'multiselect',
                            options: [
                                ...new Set(
                                    originalDoctors.flatMap((doctor) =>
                                        doctor.prices.map((p) => p.serviceTypeName)
                                    )
                                ),
                            ].map((type) => ({
                                value: type,
                                label: type === 'IN_PERSON' ? 'Trực tiếp' : 'Từ xa',
                            })),
                            value: selectedServiceTypes,
                            onChange: setSelectedServiceTypes,
                            resetValue: () => handleResetFilter('serviceTypes'),
                        },
                        {
                            name: 'prices',
                            label: 'Giá',
                            type: 'multiselect',
                            options: [
                                { value: 'm-1', label: 'Dưới 500,000 VNĐ' },
                                { value: 'm-2', label: '500,000 - 1,000,000 VNĐ' },
                                { value: 'm-3', label: 'Trên 1,000,000 VNĐ' },
                            ],
                            value: selectedPrices,
                            onChange: setSelectedPrices,
                            resetValue: () => handleResetFilter('prices'),
                        },
                        {
                            name: 'statuses',
                            label: 'Trạng Thái',
                            type: 'multiselect',
                            options: [
                                { value: 'ACTIVE', label: 'Có mặt' },
                                { value: 'INACTIVE', label: 'Không có mặt' },
                            ],
                            value: selectedStatuses,
                            onChange: setSelectedStatuses,
                            resetValue: () => handleResetFilter('statuses'),
                        },
                    ]}
                />

                {/* Delete Modal */}
                <ModalDelete
                    show={showDeleteModal}
                    onHide={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    title="Xác Nhận Xóa"
                    message="Bạn có chắc chắn muốn xóa bác sĩ này không?"
                    itemName={
                        doctorToDelete
                            ? `${doctorToDelete.firstName} ${doctorToDelete.lastName}`
                            : ''
                    }
                />
            </div>
        </div>
    );
};

export default ListDoctors;
