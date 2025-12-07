import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';
import Pagination from '@/components/Pagination';
import ModalCancel from '@/pages/hospitals/Appointments/ModalCancel';
import ModalRejectPending from '@/pages/hospitals/Appointments/ModalRejectPending';
import AssignDoctorModal from '@/pages/hospitals/Appointments/AssignDoctorModal';
import AssignDoctorToAppointmentModal from '@/pages/hospitals/Appointments/AssignDoctorToAppointmentModal';
import { AppointmentFilterModal } from '@/components/AppointmentFilterModal';
import {
    useAppointmentFilterState,
    useAppointmentPaginationState,
    useHospitalTabCounts,
} from '@/hooks/useAppointmentListState';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import {
    appointmentTableColumns,
    cancelledAppointmentTableColumns,
} from '@/components/TableSkeleton/skeletonConfigs';
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
import { Role } from '@/enums/common.enums';
import { RootState } from '@/store';
import { PATHS } from '@/routes/paths';
import {
    AppointmentSearchControls,
    APPOINTMENT_SORT_OPTIONS,
} from '@/components/AppointmentSearchControls';
import {
    AppointmentStatusTabs,
    HOSPITAL_APPOINTMENT_TABS,
} from '@/components/AppointmentStatusTabs';
import {
    parseSortParam,
    formatLocalDate,
    filterAppointmentsBySearch,
} from '@/utils/appointment-search-utils';
import ActionDropdown from '@/components/ActionDropdown';

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
    const [showRejectPendingModal, setShowRejectPendingModal] = useState(false);
    const [showAssignDoctorModal, setShowAssignDoctorModal] = useState(false);
    const [showAssignDoctorToAppointmentModal, setShowAssignDoctorToAppointmentModal] =
        useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    // Search and Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedSort, setSelectedSort] = useState<string>('CreatedAt_desc');

    // Filtered appointments based on search term (using shared utility with doctor/service search)
    const appointments = useMemo(() => {
        return filterAppointmentsBySearch(allAppointments, debouncedSearchTerm, {
            includeDoctorSearch: true,
            includeServiceSearch: true,
        });
    }, [allAppointments, debouncedSearchTerm]);

    // Filter states (using shared hook)
    const { selectedTypes, setSelectedTypes, selectedDateRange, setSelectedDateRange } =
        useAppointmentFilterState();

    // Status tab state - now use AppointmentUITab type
    const [activeStatusTab, setActiveStatusTab] = useState<AppointmentUITab>('waiting');

    // Pagination states (using shared hook)
    const { currentPage, setCurrentPage, itemsPerPage } = useAppointmentPaginationState();

    // Tab counts (using shared hook)
    const { tabCounts, setTabCounts } = useHospitalTabCounts();

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
        // Only allow cancellation of CONFIRMED appointments (use reject for PENDING)
        if (appointment.status !== 'CONFIRMED') {
            toast.warning('Chỉ có thể hủy lịch hẹn ở trạng thái Sắp tới');
            return;
        }

        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    // Handler for rejecting PENDING appointments (before payment)
    const handleRejectClick = (appointment: AppointmentCardData) => {
        if (appointment.status !== 'PENDING') {
            toast.warning('Chỉ có thể từ chối lịch hẹn ở trạng thái Chờ xử lý');
            return;
        }

        setSelectedAppointment(appointment);
        setShowRejectPendingModal(true);
    };

    // Handler for reject pending confirmation
    const handleRejectConfirm = async (rejectionReason: string, notifyPatient: boolean) => {
        if (!selectedAppointment) return;

        setIsRejecting(true);
        try {
            await AppointmentService.rejectPendingAppointment(
                selectedAppointment.appointmentId,
                rejectionReason,
                hospitalProfile?.id || '',
                notifyPatient
            );

            toast.success('Đã từ chối lịch hẹn thành công');

            // Close modal and reset state
            setShowRejectPendingModal(false);
            setSelectedAppointment(null);

            // Refresh the list
            await fetchAppointments();
        } catch (error: any) {
            console.error('Error rejecting appointment:', error);
            toast.error(error.message || 'Không thể từ chối lịch hẹn');
        } finally {
            setIsRejecting(false);
        }
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

    // Helper function to render provider info (doctor or service) - extracted to avoid nested ternary
    const renderProviderInfo = (appointment: AppointmentCardData, providerName: string) => {
        if (appointment.doctorInfo?.id) {
            return (
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
            );
        }

        if (appointment.serviceInfo?.id) {
            return (
                <div>
                    <span className="fw-semibold">
                        <i className="ti ti-medical-cross me-1 text-primary" aria-hidden="true"></i>
                        {providerName}
                    </span>
                    <span className="text-body fs-13 fw-normal d-block">Dịch vụ y tế</span>
                </div>
            );
        }

        return <span className="text-muted">Chưa phân công</span>;
    };

    // Check if current tab is cancelled to show reason column
    const isCancelledTab = activeStatusTab === 'cancelled';

    // Get appropriate skeleton columns based on tab
    const skeletonColumns = isCancelledTab
        ? cancelledAppointmentTableColumns
        : appointmentTableColumns;

    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={skeletonColumns} />;
        }

        // Calculate colSpan based on current tab (cancelled has extra "Lý do" column but no actions)
        const colSpan = isCancelledTab ? 7 : 7;

        if (apiError) {
            return (
                <tr>
                    <td colSpan={colSpan} className="text-center py-5">
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
                    <td colSpan={colSpan} className="text-center py-5">
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
                            {renderProviderInfo(appointment, providerName)}
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
                    {/* Lý do - only show for cancelled tab */}
                    {isCancelledTab && (
                        <td>
                            <span
                                className="text-muted text-truncate d-inline-block"
                                style={{ maxWidth: '200px' }}
                                title={appointment.reason || ''}
                            >
                                {appointment.reason || 'Không có lý do'}
                            </span>
                        </td>
                    )}
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
                                                <i
                                                    className="ti ti-user-plus me-2"
                                                    aria-hidden="true"
                                                ></i>{' '}
                                                Gán bác sĩ
                                            </button>
                                        </li>
                                    )}
                                {/* PENDING: Show "Từ chối" (reject - no refund needed) */}
                                {appointment.status === 'PENDING' && (
                                    <li>
                                        <button
                                            type="button"
                                            className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                                            onClick={() => handleRejectClick(appointment)}
                                        >
                                            <i className="ti ti-x me-2" aria-hidden="true"></i>
                                            Từ chối lịch hẹn
                                        </button>
                                    </li>
                                )}
                                {/* CONFIRMED: Show "Hủy" (cancel - with refund options) */}
                                {appointment.status === 'CONFIRMED' && (
                                    <li>
                                        <button
                                            type="button"
                                            className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-warning"
                                            onClick={() => handleCancelClick(appointment)}
                                        >
                                            <i className="ti ti-x me-2" aria-hidden="true"></i>
                                            Hủy lịch hẹn
                                        </button>
                                    </li>
                                )}
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
                <AppointmentStatusTabs
                    tabs={HOSPITAL_APPOINTMENT_TABS}
                    activeTab={activeStatusTab}
                    tabCounts={appointmentCounts}
                    onTabChange={(tab) => {
                        setActiveStatusTab(tab);
                        setCurrentPage(1);
                    }}
                />

                {/* Search and Filter Controls */}
                <AppointmentSearchControls
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    selectedSort={selectedSort}
                    onSortChange={handleSortChange}
                    sortOptions={APPOINTMENT_SORT_OPTIONS}
                    onFilterClick={() => setShowFilterModal(true)}
                />
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
                                {isCancelledTab && <th>Lý do</th>}
                                <th>Trạng thái</th>
                                {!isCancelledTab && <th></th>}
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
            <AppointmentFilterModal
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
            />

            {/* Cancel Modal - for CONFIRMED appointments (with refund options) */}
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

            {/* Reject Pending Modal - for PENDING appointments (no refund needed) */}
            <ModalRejectPending
                show={showRejectPendingModal}
                onHide={() => {
                    if (!isRejecting) {
                        setShowRejectPendingModal(false);
                        setSelectedAppointment(null);
                    }
                }}
                onConfirm={handleRejectConfirm}
                loading={isRejecting}
                appointmentId={selectedAppointment?.appointmentId}
                patientName={selectedAppointment ? getActualPatientName(selectedAppointment) : ''}
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
