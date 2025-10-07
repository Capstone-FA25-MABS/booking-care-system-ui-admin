import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ListAppointments.module.scss';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import FilterSortToolbar from '@/components/FilterSortToolbar';
import ExportDropdown from '@/components/ExportDropdown';
import StatusBadge from '@/components/StatusBadge';
import {
    mockAppointments as importedMockAppointments,
    mockPatients as importedMockPatients,
    appointmentStatuses as importedAppointmentStatuses,
} from '@/data/mockAppointments';

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

import avatar2 from '@/assets/img/users/avatar-2.jpg';

// Use imported mock patients
const mockPatients = importedMockPatients as unknown as Patient[];

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
// Use imported appointment statuses
const appointmentStatuses = importedAppointmentStatuses;

// Status mapping for tabs (keep local as it differs from imported version)
const statusMapping = {
    upcoming: 'UPCOMING',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    pending: 'PENDING',
};

// Use imported mock data
const mockAppointments = importedMockAppointments as unknown as Appointment[];
// Use imported mock data
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
        <>
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
                            Sắp Tới{' '}
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
                            Đã Hủy{' '}
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
                            Hoàn Thành{' '}
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
                            Đang Khám{' '}
                            <span
                                className={`badge ${activeStatusTab === 'pending' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {getStatusCounts().pending}
                            </span>
                        </button>
                    </div>

                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3">
                        <FilterSortToolbar
                            onFilterClick={() => setShowFilterModal(true)}
                            sortOptions={[
                                { value: 'recent', label: 'Gần đây' },
                                { value: 'asc', label: 'Tăng dần' },
                                { value: 'desc', label: 'Giảm dần' },
                                { value: 'last-month', label: 'Tháng trước' },
                                { value: 'last-7-days', label: '7 ngày qua' },
                            ]}
                            selectedSort={sortBy}
                            onSortChange={setSortBy}
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
                                                    onClick={() => handleDeleteClick(appointment)}
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
                                    />{' '}
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
        </>
    );
};

export default ListAppointments;
