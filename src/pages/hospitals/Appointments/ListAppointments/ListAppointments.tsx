import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './ListAppointments.module.scss';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalCancel from '@/pages/hospitals/Appointments/ModalCancel';
import AssignDoctorModal from '@/pages/hospitals/Appointments/AssignDoctorModal';
import ModalFilter from '@/components/ModalFilter';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import PatientDropdown from '@/components/PatientDropdown';
import StatusDropdown from '@/components/StatusDropdown';
import TableSkeleton from '@/components/TableSkeleton';
import { appointmentTableColumns } from '@/components/TableSkeleton/skeletonConfigs';
import { AppointmentService } from '@/services/appointment.service';
import {
    AppointmentCardData,
    AppointmentQueryRequest,
    transformToCardData,
    isNewAppointment,
    mapUITabToStatus,
    getAppointmentTypeText,
    formatFullName,
    AppointmentUITab,
} from '@/types/appointment.types';
import { fetchAndTransformAppointments } from '@/utils/appointment-management-utils';
import { createAppointmentTypeFilterField } from '@/utils/filter-field-configs';
import { AppointmentDetailsOffcanvas } from '@/components/AppointmentDetailsOffcanvas';
import { AppointmentType } from '@/enums/appointment.enums';
import { Role } from '@/enums/common.enums';
import { RootState } from '@/store';
import {
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

// Use imported appointment statuses
const appointmentStatuses = importedAppointmentStatuses;

const ListAppointments: React.FC = () => {
    // Get auth and user profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { doctorProfile, hospitalProfile } = useSelector((state: RootState) => state.user);

    // API data states
    const [appointments, setAppointments] = useState<AppointmentCardData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showNewAppointment, setShowNewAppointment] = useState(false);
    const [showEditAppointment, setShowEditAppointment] = useState(false);
    const [showViewDetails, setShowViewDetails] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showAssignDoctorModal, setShowAssignDoctorModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [sortBy, setSortBy] = useState<string>('Gần đây');
    const [isCancelling, setIsCancelling] = useState(false);

    // Filter states
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<AppointmentType[]>([]);
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Status tab state - now use AppointmentUITab type
    const [activeStatusTab, setActiveStatusTab] = useState<AppointmentUITab>('waiting');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Tab counts
    const [tabCounts, setTabCounts] = useState({
        waiting: 0,
        upcoming: 0,
        cancelled: 0,
        completed: 0,
    });

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

    // Helper: Validate user profile
    const validateUserProfile = (primaryRole: string) => {
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not available, skipping appointment fetch');
            return false;
        }
        if (primaryRole === Role.STAFF && !hospitalProfile) {
            console.warn('Hospital profile not available, skipping appointment fetch');
            return false;
        }
        return true;
    };

    // Helper: Build appointment query with role-based filters
    const buildAppointmentQuery = (): AppointmentQueryRequest => {
        const query: AppointmentQueryRequest = {
            status: mapUITabToStatus(activeStatusTab),
            fromDate: selectedDateRange.start?.toISOString().split('T')[0] || undefined,
            toDate: selectedDateRange.end?.toISOString().split('T')[0] || undefined,
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy: 'CreatedAt',
            sortDescending: true,
            includeStatusCounts: true,
        };

        const primaryRole = roles[0]?.toUpperCase();

        // Auto-fill doctorId or hospitalId based on user role
        if (primaryRole === Role.DOCTOR && doctorProfile?.id) {
            query.doctorId = doctorProfile.id;
        } else if (primaryRole === Role.STAFF && hospitalProfile?.id) {
            query.hospitalId = hospitalProfile.id;
        }

        // Add user-selected filters
        if (selectedPatients.length > 0) query.patientId = selectedPatients[0];
        if (selectedTypes.length > 0) query.appointmentType = selectedTypes[0];
        if (selectedDoctors.length > 0) query.doctorId = selectedDoctors[0];

        return query;
    };

    // Validate user profile before fetching appointments
    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        // Check if required profile is loaded
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not loaded yet');
        }
        if (primaryRole === Role.STAFF && !hospitalProfile) {
            console.warn('Hospital profile not loaded yet');
        }
    }, [roles, doctorProfile, hospitalProfile]);

    // Fetch appointments from API
    const fetchAppointments = async () => {
        const primaryRole = roles[0]?.toUpperCase();
        if (!validateUserProfile(primaryRole)) return;

        setIsLoading(true);
        setApiError(null);

        const query = buildAppointmentQuery();

        // Call API for management
        await fetchAndTransformAppointments(query, transformToCardData, isNewAppointment, {
            setAppointments,
            setTotalCount,
            setTabCounts,
            setApiError,
            setIsLoading,
        });
    };

    useEffect(() => {
        fetchAppointments();
    }, [
        activeStatusTab,
        selectedDateRange.start,
        selectedDateRange.end,
        selectedPatients,
        selectedTypes,
        selectedDoctors,
        currentPage,
        itemsPerPage,
        roles,
        doctorProfile?.id,
        hospitalProfile?.id,
    ]);

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

    const handleCancelConfirm = async (cancellationReason: string, rescheduleOptions?: any) => {
        if (!selectedAppointment) return;

        setIsCancelling(true);
        try {
            // Determine if reschedule options should be enabled (staff cancellation only)
            const enableReschedule = !!rescheduleOptions;

            // Call API to cancel appointment (with reschedule options for staff)
            await AppointmentService.cancelAppointment(
                selectedAppointment.appointmentId,
                cancellationReason,
                hospitalProfile?.id, // cancelledByStaffId
                enableReschedule,
                rescheduleOptions // Pass selected options to backend
            );

            toast.success('Hủy lịch hẹn thành công. Quá trình hoàn tiền đã được khởi tạo.');

            // Close modal and reset state
            setShowCancelModal(false);
            setSelectedAppointment(null);

            // Refresh the list to get updated status and counts from server
            await fetchAppointments();
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            toast.error(error.message || 'Không thể hủy lịch hẹn');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleEditClick = (appointment: AppointmentCardData) => {
        setSelectedAppointment(appointment);
        setEditAppointment({
            appointmentId: appointment.appointmentId,
            patient: formatFullName(
                appointment.patientInfo?.firstName,
                appointment.patientInfo?.lastName
            ),
            type: getAppointmentTypeText(appointment.appointmentType),
            date: new Date(appointment.appointmentDate).toLocaleDateString('vi-VN'),
            time: appointment.appointmentTime,
            reason: appointment.reason || '',
            status: appointment.status,
        });
        setShowEditAppointment(true);
    };

    const handleViewClick = (appointment: AppointmentCardData) => {
        setSelectedAppointment(appointment);
        setShowViewDetails(true);
    };

    const handleCancelClick = (appointment: AppointmentCardData) => {
        // Only allow cancellation of PENDING or CONFIRMED appointments
        if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
            toast.warning('Chỉ có thể hủy lịch hẹn ở trạng thái Chờ xử lý hoặc Sắp tới');
            return;
        }

        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    // New handler for assign doctor from cancel modal
    // Note: Appointment will be cancelled AFTER successful doctor assignment
    // This prevents the case where staff cancels but doesn't assign a new doctor
    const handleAssignDoctorFromCancel = () => {
        if (!selectedAppointment) return;

        // Close cancel modal and open assign doctor modal
        // The actual cancellation will happen in AssignNewDoctor API
        setShowCancelModal(false);
        setShowAssignDoctorModal(true);
    };

    // Handler for successful doctor assignment - refresh appointment list
    const handleAssignSuccess = async () => {
        // Refresh the appointment list after successful assignment and cancellation
        await fetchAppointments();
    };

    const handleFilterSubmit = () => {
        // Filters are now applied via API, so just close modal and reset to page 1
        setCurrentPage(1);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedPatients([]);
        setSelectedTypes([]);
        setSelectedDoctors([]);
        setSelectedDateRange({ start: null, end: null });
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate total pages based on API response
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Get appointment counts for tabs - using tabCounts state
    const appointmentCounts = tabCounts;

    // Helper: Get button class names for status tabs
    const getStatusTabClass = (tab: AppointmentUITab) => {
        return `btn ${activeStatusTab === tab ? 'btn-primary' : 'btn-light'} ${styles.statusTab}`;
    };

    // Helper: Get badge class names for status tabs
    const getStatusBadgeClass = (tab: AppointmentUITab) => {
        return `badge ${activeStatusTab === tab ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`;
    };

    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={appointmentTableColumns} />;
        }

        if (apiError) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <div className="text-danger">
                            <i className="ti ti-alert-circle fs-1"></i>
                            <p className="mt-2">{apiError}</p>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => globalThis.location.reload()}
                            >
                                Thử lại
                            </button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (appointments.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <i className="ti ti-calendar-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có lịch hẹn nào</p>
                    </td>
                </tr>
            );
        }

        return appointments.map((appointment) => (
            <tr key={appointment.appointmentId}>
                <td>
                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                    {' | '}
                    {appointment.appointmentTime}
                </td>
                <td>
                    <div className="d-flex align-items-center">
                        <Link to="/doctors-patient-details" className="avatar avatar-md me-2">
                            <img
                                src={appointment.patientInfo?.avatarUrl}
                                alt="patient"
                                className="rounded-circle"
                            />
                        </Link>
                        <Link to="/doctors-patient-details" className="fw-semibold">
                            {formatFullName(
                                appointment.patientInfo?.firstName,
                                appointment.patientInfo?.lastName
                            )}
                            <span className="text-body fs-13 fw-normal d-block">
                                {appointment.patientInfo?.phone || appointment.patientInfo?.email}
                            </span>
                        </Link>
                    </div>
                </td>
                <td>
                    <div className="d-flex align-items-center">
                        <Link to="/doctors-profile" className="avatar avatar-md me-2">
                            <img
                                src={appointment.doctorInfo?.avatarUrl || user01}
                                alt="doctor"
                                className="rounded-circle"
                            />
                        </Link>
                        <Link to="/doctors-profile" className="fw-semibold">
                            {appointment.doctorInfo?.fullName || 'Chưa phân công'}
                            <span className="text-body fs-13 fw-normal d-block">
                                {appointment.doctorInfo?.specialtyName || ''}
                            </span>
                        </Link>
                    </div>
                </td>
                <td>{getAppointmentTypeText(appointment.appointmentType)}</td>
                <td>
                    <StatusBadge status={appointment.status} />
                </td>
                <td className="action-item">
                    <button type="button" className="btn btn-link p-0" data-bs-toggle="dropdown">
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
                        {(appointment.status === 'PENDING' ||
                            appointment.status === 'CONFIRMED') && (
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                    onClick={() => handleCancelClick(appointment)}
                                >
                                    Hủy lịch hẹn
                                </button>
                            </li>
                        )}
                    </ul>
                </td>
            </tr>
        ));
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
                        <ActionDropdown
                            type="export"
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
                            className={getStatusTabClass('waiting')}
                            onClick={() => {
                                setActiveStatusTab('waiting');
                                setCurrentPage(1);
                            }}
                        >
                            Chờ xử lý{' '}
                            <span className={getStatusBadgeClass('waiting')}>
                                {appointmentCounts.waiting}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('upcoming')}
                            onClick={() => {
                                setActiveStatusTab('upcoming');
                                setCurrentPage(1);
                            }}
                        >
                            Sắp Tới{' '}
                            <span className={getStatusBadgeClass('upcoming')}>
                                {appointmentCounts.upcoming}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('cancelled')}
                            onClick={() => {
                                setActiveStatusTab('cancelled');
                                setCurrentPage(1);
                            }}
                        >
                            Đã Hủy{' '}
                            <span className={getStatusBadgeClass('cancelled')}>
                                {appointmentCounts.cancelled}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('completed')}
                            onClick={() => {
                                setActiveStatusTab('completed');
                                setCurrentPage(1);
                            }}
                        >
                            Hoàn Thành{' '}
                            <span className={getStatusBadgeClass('completed')}>
                                {appointmentCounts.completed}
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
                        <ActionDropdown
                            type="sort"
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
                        <tbody>{renderTableBody()}</tbody>
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
                    createAppointmentTypeFilterField(selectedTypes, setSelectedTypes),
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
                        onChange: (value) => setSelectedDateRange(value),
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
                                        <PatientDropdown
                                            patients={mockPatients}
                                            selectedPatient={newAppointment.patient}
                                            onSelect={(patientName) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    patient: patientName,
                                                })
                                            }
                                            idPrefix="patient"
                                            name="patient"
                                        />
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
                                                <li>
                                                    <label
                                                        htmlFor="type-telehealth"
                                                        className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                    >
                                                        <input
                                                            id="type-telehealth"
                                                            className="form-check-input m-0 me-2"
                                                            type="radio"
                                                            name="type"
                                                            value="Trực tuyến"
                                                            onChange={(e) =>
                                                                setNewAppointment({
                                                                    ...newAppointment,
                                                                    type: e.target.value,
                                                                })
                                                            }
                                                        />{' '}
                                                        Trực tuyến
                                                    </label>
                                                </li>
                                                <li>
                                                    <label
                                                        htmlFor="type-inperson"
                                                        className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                    >
                                                        <input
                                                            id="type-inperson"
                                                            className="form-check-input m-0 me-2"
                                                            type="radio"
                                                            name="type"
                                                            value="Trực tiếp"
                                                            onChange={(e) =>
                                                                setNewAppointment({
                                                                    ...newAppointment,
                                                                    type: e.target.value,
                                                                })
                                                            }
                                                        />{' '}
                                                        Trực tiếp
                                                    </label>
                                                </li>
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
                                        <StatusDropdown
                                            statuses={appointmentStatuses}
                                            selectedStatus={newAppointment.status}
                                            onSelect={(status) =>
                                                setNewAppointment({
                                                    ...newAppointment,
                                                    status: status,
                                                })
                                            }
                                            idPrefix="status"
                                            name="status"
                                        />
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
                                    <label
                                        htmlFor="appointment-code"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Mã Lịch Hẹn <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            id="appointment-code"
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
                                            {editAppointment.patient}
                                        </button>
                                        <PatientDropdown
                                            patients={mockPatients}
                                            selectedPatient={editAppointment.patient}
                                            onSelect={(patientName) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    patient: patientName,
                                                })
                                            }
                                            idPrefix="edit-patient"
                                            name="editPatient"
                                        />
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
                                                <li>
                                                    <label
                                                        htmlFor="edit-type-telehealth"
                                                        className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                    >
                                                        <input
                                                            id="edit-type-telehealth"
                                                            className="form-check-input m-0 me-2"
                                                            type="radio"
                                                            name="editType"
                                                            value="Trực tuyến"
                                                            checked={
                                                                editAppointment.type ===
                                                                'Trực tuyến'
                                                            }
                                                            onChange={(e) =>
                                                                setEditAppointment({
                                                                    ...editAppointment,
                                                                    type: e.target.value,
                                                                })
                                                            }
                                                        />{' '}
                                                        Trực tuyến
                                                    </label>
                                                </li>
                                                <li>
                                                    <label
                                                        htmlFor="edit-type-inperson"
                                                        className="dropdown-item px-2 d-flex align-items-center text-dark"
                                                    >
                                                        <input
                                                            id="edit-type-inperson"
                                                            className="form-check-input m-0 me-2"
                                                            type="radio"
                                                            name="editType"
                                                            value="Trực tiếp"
                                                            checked={
                                                                editAppointment.type === 'Trực tiếp'
                                                            }
                                                            onChange={(e) =>
                                                                setEditAppointment({
                                                                    ...editAppointment,
                                                                    type: e.target.value,
                                                                })
                                                            }
                                                        />{' '}
                                                        Trực tiếp
                                                    </label>
                                                </li>
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
                                    <label
                                        htmlFor="appointment-time"
                                        className="form-label mb-1 text-dark fs-14 fw-medium"
                                    >
                                        Giờ <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-end position-relative">
                                        <input
                                            id="appointment-time"
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
                                            {editAppointment.status}
                                        </button>
                                        <StatusDropdown
                                            statuses={appointmentStatuses}
                                            selectedStatus={editAppointment.status}
                                            onSelect={(status) =>
                                                setEditAppointment({
                                                    ...editAppointment,
                                                    status: status,
                                                })
                                            }
                                            idPrefix="edit-status"
                                            name="editStatus"
                                        />
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
            <AppointmentDetailsOffcanvas
                show={showViewDetails}
                onClose={() => setShowViewDetails(false)}
                appointment={selectedAppointment}
            />
            <div
                className={`offcanvas offcanvas-offset offcanvas-end ${showViewDetails ? 'show' : ''}`}
                tabIndex={-1}
                id="view_details_extended"
                style={{ display: showViewDetails ? 'block' : 'none' }}
            >
                <div className="offcanvas-body pt-0 px-0">
                    <h6 className="bg-light py-2 px-3 text-dark fw-bold"> Chi Tiết Lịch Hẹn </h6>
                    <div className="px-3 my-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                Khám Từ Xa{' '}
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

            {/* Cancel Modal */}
            <ModalCancel
                show={showCancelModal}
                onHide={() => {
                    if (!isCancelling) {
                        setShowCancelModal(false);
                        setSelectedAppointment(null);
                    }
                }}
                onConfirm={handleCancelConfirm}
                onAssignDoctor={handleAssignDoctorFromCancel}
                title="Xác Nhận Hủy Lịch Hẹn"
                message="Bạn có chắc chắn muốn hủy lịch hẹn"
                confirmText="Xác nhận hủy"
                cancelText="Đóng"
                loading={isCancelling}
                itemName={selectedAppointment?.appointmentId?.substring(0, 8)}
                reasonLabel="Lý do hủy"
                reasonPlaceholder="Vui lòng nhập lý do hủy lịch hẹn (tối thiểu 10 ký tự)..."
                minReasonLength={10}
                showRescheduleOptions={true}
                hasDoctorAssigned={!!selectedAppointment?.doctorInfo?.id}
                consultationFees={selectedAppointment?.consultationFees}
            />

            {/* Assign Doctor Modal */}
            <AssignDoctorModal
                show={showAssignDoctorModal}
                onHide={() => {
                    setShowAssignDoctorModal(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
                staffId={hospitalProfile?.id || ''}
                onSuccess={handleAssignSuccess}
            />
        </>
    );
};

export default ListAppointments;
