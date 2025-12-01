import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './ListAppointments.module.scss';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalCancel from '@/pages/hospitals/Appointments/ModalCancel';
import AssignDoctorModal from '@/pages/hospitals/Appointments/AssignDoctorModal';
import AssignDoctorToAppointmentModal from '@/pages/hospitals/Appointments/AssignDoctorToAppointmentModal';
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
// Sort options for appointments
const appointmentSortOptions = [
    { value: 'CreatedAt_desc', label: 'Mới nhất' },
    { value: 'CreatedAt_asc', label: 'Cũ nhất' },
    { value: 'AppointmentDate_desc', label: 'Ngày hẹn (mới nhất)' },
    { value: 'AppointmentDate_asc', label: 'Ngày hẹn (cũ nhất)' },
    { value: 'UpdatedAt_desc', label: 'Cập nhật gần đây' },
];

// Import images
import user01 from '@/assets/img/users/user-01.jpg';

const ListAppointments: React.FC = () => {
    // Get auth and user profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { doctorProfile, hospitalProfile } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    // API data states
    const [allAppointments, setAllAppointments] = useState<AppointmentCardData[]>([]); // All appointments from API
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showAssignDoctorModal, setShowAssignDoctorModal] = useState(false);
    const [showAssignDoctorToAppointmentModal, setShowAssignDoctorToAppointmentModal] =
        useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [isCancelling, setIsCancelling] = useState(false);

    // Search and Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedSort, setSelectedSort] = useState<string>('CreatedAt_desc');

    // Client-side search filter on enriched data (patient name, doctor name, service name, phone, email)
    const filterAppointmentsBySearch = useCallback(
        (appointmentList: AppointmentCardData[], search: string): AppointmentCardData[] => {
            if (!search.trim()) return appointmentList;

            const searchLower = search.toLowerCase().trim();
            return appointmentList.filter((apt) => {
                // Search in patient info (firstName + lastName)
                const patientFirstName = apt.patientInfo?.firstName?.toLowerCase() || '';
                const patientLastName = apt.patientInfo?.lastName?.toLowerCase() || '';
                const patientFullName = `${patientFirstName} ${patientLastName}`.trim();
                const patientPhone = apt.patientInfo?.phone?.toLowerCase() || '';
                const patientEmail = apt.patientInfo?.email?.toLowerCase() || '';

                // Search in relative info (if booking for family member)
                const relativeFirstName = apt.relativeInfo?.firstName?.toLowerCase() || '';
                const relativeLastName = apt.relativeInfo?.lastName?.toLowerCase() || '';
                const relativeFullName =
                    apt.relativeInfo?.fullName?.toLowerCase() ||
                    `${relativeFirstName} ${relativeLastName}`.trim();
                const relativePhone = apt.relativeInfo?.phone?.toLowerCase() || '';

                // Search in doctor info
                const doctorFirstName = apt.doctorInfo?.firstName?.toLowerCase() || '';
                const doctorLastName = apt.doctorInfo?.lastName?.toLowerCase() || '';
                const doctorFullName =
                    apt.doctorInfo?.fullName?.toLowerCase() ||
                    `${doctorFirstName} ${doctorLastName}`.trim();
                const specialtyName = apt.doctorInfo?.specialtyName?.toLowerCase() || '';

                // Search in service info
                const serviceName = apt.serviceInfo?.name?.toLowerCase() || '';

                // Search in appointment ID (first 8 chars)
                const appointmentId = apt.appointmentId?.toLowerCase() || '';

                return (
                    patientFullName.includes(searchLower) ||
                    patientPhone.includes(searchLower) ||
                    patientEmail.includes(searchLower) ||
                    relativeFullName.includes(searchLower) ||
                    relativePhone.includes(searchLower) ||
                    doctorFullName.includes(searchLower) ||
                    specialtyName.includes(searchLower) ||
                    serviceName.includes(searchLower) ||
                    appointmentId.includes(searchLower)
                );
            });
        },
        []
    );

    // Filtered appointments based on search term
    const appointments = useMemo(() => {
        return filterAppointmentsBySearch(allAppointments, debouncedSearchTerm);
    }, [allAppointments, debouncedSearchTerm, filterAppointmentsBySearch]);

    // Filter states (simplified: only appointment type and date range)
    const [selectedTypes, setSelectedTypes] = useState<AppointmentType[]>([]);
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

    // Helper: Parse sort parameter (format: "Field_order")
    const parseSortParam = (sortValue: string) => {
        const [field, order] = sortValue.split('_');
        return {
            sortBy: field,
            sortDescending: order === 'desc',
        };
    };

    // Helper: Format date to local YYYY-MM-DD (avoid timezone issues)
    const formatLocalDate = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper: Build appointment query with role-based filters
    const buildAppointmentQuery = useCallback((): AppointmentQueryRequest => {
        const { sortBy, sortDescending } = parseSortParam(selectedSort);

        const query: AppointmentQueryRequest = {
            status: mapUITabToStatus(activeStatusTab),
            fromDate: formatLocalDate(selectedDateRange.start),
            toDate: formatLocalDate(selectedDateRange.end),
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy,
            sortDescending,
            includeStatusCounts: true,
        };

        const primaryRole = roles[0]?.toUpperCase();

        // Auto-fill doctorId or hospitalId based on user role
        if (primaryRole === Role.DOCTOR && doctorProfile?.id) {
            query.doctorId = doctorProfile.id;
        } else if (primaryRole === Role.STAFF && hospitalProfile?.id) {
            query.hospitalId = hospitalProfile.id;
        }

        // Add user-selected filters (simplified: only appointment type)
        if (selectedTypes.length > 0) query.appointmentType = selectedTypes[0];

        return query;
    }, [
        activeStatusTab,
        selectedDateRange,
        currentPage,
        itemsPerPage,
        selectedSort,
        roles,
        doctorProfile?.id,
        hospitalProfile?.id,
        selectedTypes,
    ]);

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
    const fetchAppointments = useCallback(async () => {
        const primaryRole = roles[0]?.toUpperCase();
        if (!validateUserProfile(primaryRole)) return;

        setIsLoading(true);
        setApiError(null);

        const query = buildAppointmentQuery();

        // Call API for management
        await fetchAndTransformAppointments(query, transformToCardData, isNewAppointment, {
            setAppointments: setAllAppointments,
            setTotalCount,
            setTabCounts,
            setApiError,
            setIsLoading,
        });
    }, [buildAppointmentQuery, roles, doctorProfile, hospitalProfile]);

    // Fetch appointments when dependencies change
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Reset to page 1 when search term or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedSort]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle sort change
    const handleSortChange = (value: string) => {
        setSelectedSort(value);
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

    // Handler for clicking "Gán bác sĩ" on PENDING specialty appointments (NEW flow)
    const handleAssignDoctorToAppointmentClick = (appointment: AppointmentCardData) => {
        // Validate: Must be PENDING specialty booking (no doctor assigned)
        if (appointment.status !== 'PENDING') {
            toast.error('Chỉ có thể gán bác sĩ cho lịch hẹn đang chờ xử lý');
            return;
        }

        if (appointment.doctorInfo || appointment.serviceInfo) {
            toast.error('Lịch hẹn này đã có bác sĩ/dịch vụ được gán');
            return;
        }

        if (!appointment.specialtyId) {
            toast.error('Lịch hẹn này không phải là đặt theo chuyên khoa');
            return;
        }

        setSelectedAppointment(appointment);
        setShowAssignDoctorToAppointmentModal(true);
    };

    // Handler for successful assign doctor to appointment
    const handleAssignDoctorToAppointmentSuccess = async () => {
        await fetchAppointments();
    };

    const handleFilterSubmit = () => {
        // Filters are now applied via API, so just close modal and reset to page 1
        setCurrentPage(1);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedTypes([]);
        setSelectedDateRange({ start: null, end: null });
        setSearchTerm('');
        setCurrentPage(1);
        setShowFilterModal(false); // Close modal after reset
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
                            <span className="text-muted">Trống</span>
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
                                {/* Show "Gán bác sĩ" for PENDING specialty appointments without doctor */}
                                {appointment.status === 'PENDING' &&
                                    !appointment.doctorInfo &&
                                    !appointment.serviceInfo &&
                                    appointment.specialtyId && (
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-primary"
                                                onClick={() =>
                                                    handleAssignDoctorToAppointmentClick(
                                                        appointment
                                                    )
                                                }
                                            >
                                                <i className="ti ti-user-plus me-2"></i>
                                                Gán bác sĩ
                                            </button>
                                        </li>
                                    )}
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                        onClick={() => handleCancelClick(appointment)}
                                    >
                                        <i className="ti ti-x me-2"></i>
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

                {/* Status Tabs */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="d-flex gap-2 flex-wrap">
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
                </div>

                {/* Search and Filter Controls */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    {/* Search Input */}
                    <div className="search-set">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label
                                        htmlFor="appointmentSearch"
                                        aria-label="Search appointments"
                                    >
                                        <input
                                            id="appointmentSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm thông tin..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            aria-controls="DataTables_Table_0"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Sort */}
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="white"
                            size="md"
                            className="fs-14 py-1 border d-inline-flex text-dark align-items-center"
                            icon="ti ti-filter text-gray-5"
                            onClick={() => setShowFilterModal(true)}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={appointmentSortOptions}
                            selectedValue={selectedSort}
                            onSelect={handleSortChange}
                            placeholder="Sắp xếp:"
                            size="sm"
                        />
                    </div>
                </div>
                {/* End Search and Filter Controls */}

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

            {/* Filter Modal - Simplified: only appointment type and date range */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Lọc lịch hẹn"
                fields={[
                    createAppointmentTypeFilterField(selectedTypes, setSelectedTypes),
                    {
                        name: 'dateRange',
                        label: 'Khoảng thời gian',
                        type: 'daterange',
                        value: selectedDateRange,
                        onChange: (value) => setSelectedDateRange(value),
                        resetValue: () => setSelectedDateRange({ start: null, end: null }),
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

            {/* Assign Doctor Modal (for cancel/reschedule flow) */}
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

            {/* Assign Doctor To Appointment Modal (NEW flow for "Hospital assigns doctor") */}
            <AssignDoctorToAppointmentModal
                show={showAssignDoctorToAppointmentModal}
                onHide={() => {
                    setShowAssignDoctorToAppointmentModal(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
                staffId={hospitalProfile?.id || ''}
                onSuccess={handleAssignDoctorToAppointmentSuccess}
            />
        </>
    );
};

export default ListAppointments;
