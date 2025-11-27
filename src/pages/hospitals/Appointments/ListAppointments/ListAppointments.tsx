import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import TableSkeleton from '@/components/TableSkeleton';
import { appointmentTableColumns } from '@/components/TableSkeleton/skeletonConfigs';
import { AppointmentService } from '@/services/appointment.service';
import { createConversationAndNavigate } from '@/utils/chat-utils';
import {
    AppointmentCardData,
    AppointmentQueryRequest,
    transformToCardData,
    isNewAppointment,
    mapUITabToStatus,
    getAppointmentTypeText,
    AppointmentUITab,
    isRelativeAppointment,
    getActualPatientName,
    getRepresentativeName,
    getProviderName,
} from '@/types/appointment.types';
import { fetchAndTransformAppointments } from '@/utils/appointment-management-utils';
import { createAppointmentTypeFilterField } from '@/utils/filter-field-configs';
import { AppointmentType } from '@/enums/appointment.enums';
import { Role } from '@/enums/common.enums';
import { RootState } from '@/store';
import { PATHS } from '@/routes/paths';
import { mockPatients as importedMockPatients } from '@/data/mockAppointments';

// Types definition
interface Patient {
    id: string;
    name: string;
    avatar: string;
    email?: string;
    phone?: string;
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

const ListAppointments: React.FC = () => {
    // Get auth and user profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { doctorProfile, hospitalProfile } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    // API data states
    const [appointments, setAppointments] = useState<AppointmentCardData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
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

    const handleChatWithPatient = async (appointment: AppointmentCardData) => {
        const messagesPath = `${PATHS.HOSPITAL.ROOT}/${PATHS.HOSPITAL.MESSAGES}`;
        await createConversationAndNavigate(
            appointment,
            hospitalProfile?.accountId,
            messagesPath,
            navigate,
            'ListAppointments'
        );
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
                    <td colSpan={7} className="text-center py-5">
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
                    <td colSpan={7} className="text-center py-5">
                        <i className="ti ti-calendar-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có lịch hẹn nào</p>
                    </td>
                </tr>
            );
        }

        return appointments.map((appointment) => {
            const hasRelative = isRelativeAppointment(appointment);
            const patientName = getActualPatientName(appointment);
            const representativeName = getRepresentativeName(appointment);
            const providerName = getProviderName(appointment);

            return (
                <tr key={appointment.appointmentId}>
                    <td>
                        {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                        {' | '}
                        {appointment.appointmentTime}
                    </td>
                    {/* Bệnh nhân - người thực sự khám */}
                    <td>
                        <div className="d-flex align-items-center">
                            <Link to="/doctors-patient-details" className="avatar avatar-md me-2">
                                <img
                                    src={appointment.patientInfo?.avatarUrl}
                                    alt="patient"
                                    className="rounded-circle"
                                />
                            </Link>
                            <div>
                                <Link to="/doctors-patient-details" className="fw-semibold">
                                    {patientName}
                                </Link>
                                {hasRelative && appointment.relativeInfo?.relationshipDisplay && (
                                    <span className="badge bg-info-light text-info ms-1 fs-11">
                                        {appointment.relativeInfo.relationshipDisplay}
                                    </span>
                                )}
                                <span className="text-body fs-13 fw-normal d-block">
                                    {hasRelative
                                        ? appointment.relativeInfo?.phone || ''
                                        : appointment.patientInfo?.phone ||
                                          appointment.patientInfo?.email}
                                </span>
                            </div>
                        </div>
                    </td>
                    {/* Người đại diện - người đặt lịch */}
                    <td>
                        {hasRelative ? (
                            <div className="d-flex align-items-center">
                                <Link
                                    to="/doctors-patient-details"
                                    className="avatar avatar-md me-2"
                                >
                                    <img
                                        src={appointment.patientInfo?.avatarUrl}
                                        alt="representative"
                                        className="rounded-circle"
                                    />
                                </Link>
                                <div>
                                    <Link to="/doctors-patient-details" className="fw-semibold">
                                        {representativeName}
                                    </Link>
                                    <span className="text-body fs-13 fw-normal d-block">
                                        {appointment.patientInfo?.phone ||
                                            appointment.patientInfo?.email}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-muted">—</span>
                        )}
                    </td>
                    {/* Bác sĩ / Dịch vụ */}
                    <td>
                        <div className="d-flex align-items-center">
                            {appointment.doctorInfo?.id ? (
                                <>
                                    <Link to="/doctors-profile" className="avatar avatar-md me-2">
                                        <img
                                            src={appointment.doctorInfo?.avatarUrl || user01}
                                            alt="doctor"
                                            className="rounded-circle"
                                        />
                                    </Link>
                                    <div>
                                        <Link to="/doctors-profile" className="fw-semibold">
                                            {providerName}
                                        </Link>
                                        <span className="text-body fs-13 fw-normal d-block">
                                            {appointment.doctorInfo?.specialtyName || ''}
                                        </span>
                                    </div>
                                </>
                            ) : appointment.serviceInfo?.id ? (
                                <div>
                                    <span className="fw-semibold">
                                        <i className="ti ti-medical-cross me-1 text-primary"></i>
                                        {providerName}
                                    </span>
                                    <span className="text-body fs-13 fw-normal d-block">
                                        Dịch vụ y tế
                                    </span>
                                </div>
                            ) : (
                                <span className="text-muted">Chưa phân công</span>
                            )}
                        </div>
                    </td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                            <span>{getAppointmentTypeText(appointment.appointmentType)}</span>

                            <button
                                type="button"
                                className="btn btn-icon btn-sm btn-primary-light"
                                onClick={() => handleChatWithPatient(appointment)}
                                title="Chat với bệnh nhân"
                            >
                                <i className="ti ti-message-circle"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <StatusBadge status={appointment.status} />
                    </td>
                    {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
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
                                        onClick={() => handleCancelClick(appointment)}
                                    >
                                        Hủy lịch hẹn
                                    </button>
                                </li>
                            </ul>
                        </td>
                    )}
                </tr>
            );
        });
    };

    return (
        <>
            <div className="content">
                {/* Start Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Lịch hẹn</h4>
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
                            Đang chờ xác nhận{' '}
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
                            Sắp khám{' '}
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
                            Đã hủy{' '}
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
                            Đã khám{' '}
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
                                <th className="no-sort">Ngày & giờ</th>
                                <th>Bệnh nhân</th>
                                <th>Người đại diện</th>
                                <th>Bác sĩ / Dịch vụ</th>
                                <th>Hình thức</th>
                                <th>Trạng thái</th>
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
                title="Lọc lịch hẹn"
                fields={[
                    {
                        name: 'patients',
                        label: 'Bệnh nhân',
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
                        label: 'Bác sĩ',
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
                title="Xác nhận hủy lịch hẹn"
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
