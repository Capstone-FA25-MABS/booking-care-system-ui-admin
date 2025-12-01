import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Skeleton, Stack } from '@mui/material';
import Pagination from '@/components/Pagination';
import ModalFilter from '@/components/ModalFilter';
import {
    AppointmentCardData,
    AppointmentQueryRequest,
    transformToCardData,
    isNewAppointment,
    mapUITabToStatus,
    AppointmentUITab,
} from '@/types/appointment.types';
import { fetchAndTransformAppointments } from '@/utils/appointment-management-utils';
import { createAppointmentTypeFilterField } from '@/utils/filter-field-configs';
import { useDebounce } from '@/hooks/useDebounce';
import ActionDropdown from '@/components/ActionDropdown';
import Button from '@/components/Button';
import { StatusTabButton } from './components/StatusTabButton';
import { AppointmentTableBody } from './components/AppointmentTableBody';
import { AppointmentType, AppointmentStatus } from '@/enums/appointment.enums';

// Sort options for appointments
const appointmentSortOptions = [
    { value: 'CreatedAt_desc', label: 'Mới nhất' },
    { value: 'CreatedAt_asc', label: 'Cũ nhất' },
    { value: 'AppointmentDate_desc', label: 'Ngày hẹn (mới nhất)' },
    { value: 'AppointmentDate_asc', label: 'Ngày hẹn (cũ nhất)' },
    { value: 'UpdatedAt_desc', label: 'Cập nhật gần đây' },
];
import { Role } from '@/enums/common.enums';
import { RootState } from '@/store';
import { AppointmentService } from '@/services/appointment.service';
import FilePreviewModal from '@/components/FilePreviewModal';
import { PATHS } from '@/routes/paths';
import { createConversationAndNavigate } from '@/utils/chat-utils';

// Table Skeleton Component
const AppointmentTableSkeleton: React.FC<{
    rows?: number;
    activeStatusTab: AppointmentUITab;
}> = ({ rows = 5, activeStatusTab }) => {
    return (
        <>
            {Array.from({ length: rows }, (_, index) => (
                <tr key={`skeleton-row-${index}`}>
                    {/* Date & Time Column */}
                    <td>
                        <Stack spacing={0.5}>
                            <Skeleton variant="text" width={100} height={16} />
                            <Skeleton variant="text" width={80} height={14} />
                        </Stack>
                    </td>

                    {/* Patient Column */}
                    <td>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Skeleton
                                variant="circular"
                                width={40}
                                height={40}
                                sx={{ borderRadius: '50%' }}
                            />
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={120} height={16} />
                                <Skeleton variant="text" width={100} height={14} />
                            </Stack>
                        </Stack>
                    </td>

                    {/* Representative Column */}
                    <td>
                        <Stack spacing={0.5}>
                            <Skeleton variant="text" width={100} height={16} />
                            <Skeleton variant="text" width={80} height={14} />
                        </Stack>
                    </td>

                    {/* Type Column */}
                    <td>
                        <Skeleton variant="text" width={80} height={16} />
                    </td>

                    {/* Symptoms Column (upcoming only) */}
                    {activeStatusTab === 'upcoming' && (
                        <td>
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={150} height={16} />
                                <Skeleton variant="text" width={100} height={14} />
                            </Stack>
                        </td>
                    )}

                    {/* Attachments Column (upcoming only) */}
                    {activeStatusTab === 'upcoming' && (
                        <td>
                            <Stack direction="row" spacing={1}>
                                <Skeleton
                                    variant="rectangular"
                                    width={80}
                                    height={28}
                                    sx={{ borderRadius: '4px' }}
                                />
                            </Stack>
                        </td>
                    )}

                    {/* Cancel Reason Column (cancelled only) */}
                    {activeStatusTab === 'cancelled' && (
                        <td>
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={150} height={16} />
                                <Skeleton variant="text" width={120} height={14} />
                            </Stack>
                        </td>
                    )}

                    {/* Result Column (completed only) */}
                    {activeStatusTab === 'completed' && (
                        <td>
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={180} height={16} />
                                <Skeleton variant="text" width={150} height={14} />
                            </Stack>
                        </td>
                    )}

                    {/* Status Column */}
                    <td>
                        <Skeleton
                            variant="rectangular"
                            width={90}
                            height={24}
                            sx={{ borderRadius: '12px' }}
                        />
                    </td>

                    {/* Actions Column */}
                    {activeStatusTab === 'upcoming' && (
                        <td className="action-item">
                            <Skeleton
                                variant="rectangular"
                                width={100}
                                height={32}
                                sx={{ borderRadius: '4px' }}
                            />
                        </td>
                    )}
                    {activeStatusTab !== 'upcoming' && <td></td>}
                </tr>
            ))}
        </>
    );
};

// Constants
const NO_APPOINTMENTS_MESSAGE = 'Không có lịch hẹn nào';
const PATIENT_DETAILS_PATH = '/doctors-patient-details';

const MyAppointments: React.FC = () => {
    // Get auth and doctor profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { doctorProfile } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    // API data states
    const [allAppointments, setAllAppointments] = useState<AppointmentCardData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardData | null>(
        null
    );
    const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);
    const [completionResult, setCompletionResult] = useState('');

    // Search and Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedSort, setSelectedSort] = useState<string>('CreatedAt_desc');

    // Client-side search filter on enriched data (patient name, phone, email)
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

                // Search in appointment ID
                const appointmentId = apt.appointmentId?.toLowerCase() || '';

                // Search in symptoms
                const symptoms = apt.symptoms?.toLowerCase() || '';

                return (
                    patientFullName.includes(searchLower) ||
                    patientPhone.includes(searchLower) ||
                    patientEmail.includes(searchLower) ||
                    relativeFullName.includes(searchLower) ||
                    relativePhone.includes(searchLower) ||
                    appointmentId.includes(searchLower) ||
                    symptoms.includes(searchLower)
                );
            });
        },
        []
    );

    // Filtered appointments based on search term
    const appointments = useMemo(() => {
        return filterAppointmentsBySearch(allAppointments, debouncedSearchTerm);
    }, [allAppointments, debouncedSearchTerm, filterAppointmentsBySearch]);

    // Filter states
    const [selectedTypes, setSelectedTypes] = useState<AppointmentType[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Status tab state
    const [activeStatusTab, setActiveStatusTab] = useState<AppointmentUITab>('upcoming');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Tab counts
    const [tabCounts, setTabCounts] = useState({
        upcoming: 0,
        cancelled: 0,
        completed: 0,
    });

    // File preview modal state
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        fileUrl: string;
        fileName: string;
    }>({
        isOpen: false,
        fileUrl: '',
        fileName: '',
    });

    // Validate doctor profile before fetching appointments
    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        // Check if doctor profile is loaded
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not loaded yet');
        }
    }, [roles, doctorProfile]);

    // Helper function to validate doctor profile
    const validateDoctorProfile = () => {
        const primaryRole = roles[0]?.toUpperCase();
        if (primaryRole === Role.DOCTOR && !doctorProfile) {
            console.warn('Doctor profile not available, skipping appointment fetch');
            return false;
        }
        if (!doctorProfile?.id) {
            console.warn('Doctor ID not available');
            toast.warning('Không tìm thấy thông tin bác sĩ');
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

    // Helper function to build query request
    const buildQueryRequest = useCallback((): AppointmentQueryRequest => {
        const { sortBy, sortDescending } = parseSortParam(selectedSort);

        const query: AppointmentQueryRequest = {
            doctorId: doctorProfile!.id,
            status: mapUITabToStatus(activeStatusTab),
            fromDate: formatLocalDate(selectedDateRange.start),
            toDate: formatLocalDate(selectedDateRange.end),
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            sortBy,
            sortDescending,
            includeStatusCounts: true,
        };

        if (selectedTypes.length > 0) {
            query.appointmentType = selectedTypes[0];
        }

        return query;
    }, [
        activeStatusTab,
        selectedDateRange,
        currentPage,
        itemsPerPage,
        selectedSort,
        doctorProfile?.id,
        selectedTypes,
    ]);

    // Fetch appointments from API
    const fetchAppointments = useCallback(async () => {
        if (!validateDoctorProfile()) return;

        setIsLoading(true);
        setApiError(null);

        const query = buildQueryRequest();

        // Call API for management
        await fetchAndTransformAppointments(query, transformToCardData, isNewAppointment, {
            setAppointments: setAllAppointments,
            setTotalCount,
            setTabCounts,
            setApiError,
            setIsLoading,
        });
    }, [buildQueryRequest, roles, doctorProfile]);

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

    const handleCompleteAppointment = (appointment: AppointmentCardData) => {
        setSelectedAppointment(appointment);
        setCompletionResult(''); // Reset result
        setShowCompleteModal(true);
    };

    const handleCompleteConfirm = async () => {
        if (!selectedAppointment) return;

        // Validate result
        if (!completionResult.trim()) {
            toast.warning('Vui lòng nhập kết quả khám trước khi khám xong');
            return;
        }

        setIsCompletingAppointment(true);
        try {
            await AppointmentService.updateAppointmentStatus({
                id: selectedAppointment.appointmentId,
                status: AppointmentStatus.COMPLETED,
                result: completionResult.trim(),
            });

            toast.success('Đã khám và lưu kết quả khám');

            // Refresh danh sách
            await fetchAppointments();
        } catch (error: any) {
            console.error('Error completing appointment:', error);
            toast.error(error.message || 'Không thể hoàn thành lịch hẹn');
        } finally {
            setIsCompletingAppointment(false);
            setShowCompleteModal(false);
            setSelectedAppointment(null);
            setCompletionResult('');
        }
    };

    const handlePreviewFile = (fileUrl: string, fileName: string) => {
        setPreviewModal({
            isOpen: true,
            fileUrl,
            fileName,
        });
    };

    const handleChatWithPatient = async (appointment: AppointmentCardData) => {
        const messagesPath = `${PATHS.DOCTOR.ROOT}/${PATHS.DOCTOR.MESSAGES}`;
        await createConversationAndNavigate(
            appointment,
            doctorProfile?.accountId,
            messagesPath,
            navigate,
            'MyAppointments'
        );
    };

    const handleClosePreview = () => {
        setPreviewModal({
            isOpen: false,
            fileUrl: '',
            fileName: '',
        });
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
        setShowFilterModal(false);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate total pages based on API response
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Get appointment counts for tabs - using tabCounts state
    const appointmentCounts = tabCounts;

    return (
        <>
            <div className="content">
                {/* Start Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Lịch hẹn của tôi</h4>
                        {doctorProfile && (
                            <p className="text-muted mb-0">
                                BS. {doctorProfile.firstName} {doctorProfile.lastName}
                            </p>
                        )}
                    </div>
                </div>
                {/* End Page Header */}

                {/* Status Tabs */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="d-flex gap-2 flex-wrap">
                        <StatusTabButton
                            label="Sắp khám"
                            count={appointmentCounts.upcoming}
                            isActive={activeStatusTab === 'upcoming'}
                            onClick={() => {
                                setActiveStatusTab('upcoming');
                                setCurrentPage(1);
                            }}
                        />
                        <StatusTabButton
                            label="Đã hủy"
                            count={appointmentCounts.cancelled}
                            isActive={activeStatusTab === 'cancelled'}
                            onClick={() => {
                                setActiveStatusTab('cancelled');
                                setCurrentPage(1);
                            }}
                        />
                        <StatusTabButton
                            label="Đã khám"
                            count={appointmentCounts.completed}
                            isActive={activeStatusTab === 'completed'}
                            onClick={() => {
                                setActiveStatusTab('completed');
                                setCurrentPage(1);
                            }}
                        />
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
                        <thead>
                            <tr>
                                <th className="no-sort">Ngày & giờ</th>
                                <th>Bệnh nhân</th>
                                <th>Người đại diện</th>
                                <th>Hình thức</th>
                                {activeStatusTab === 'upcoming' && <th>Triệu chứng</th>}
                                {activeStatusTab === 'upcoming' && <th>File đính kèm</th>}
                                {activeStatusTab === 'cancelled' && <th>Lý do hủy</th>}
                                {activeStatusTab === 'completed' && <th>Kết quả</th>}
                                <th>Trạng thái</th>
                                {activeStatusTab === 'upcoming' && <th>Thao tác</th>}
                                {activeStatusTab !== 'upcoming' && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            <AppointmentTableBody
                                isLoading={isLoading}
                                apiError={apiError}
                                appointments={appointments}
                                noAppointmentsMessage={NO_APPOINTMENTS_MESSAGE}
                                patientDetailsPath={PATIENT_DETAILS_PATH}
                                activeStatusTab={activeStatusTab}
                                onCompleteAppointment={handleCompleteAppointment}
                                onPreviewFile={handlePreviewFile}
                                onChatWithPatient={handleChatWithPatient}
                                skeletonComponent={
                                    <AppointmentTableSkeleton
                                        rows={itemsPerPage}
                                        activeStatusTab={activeStatusTab}
                                    />
                                }
                            />
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

            {/* Filter Modal */}
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

            {/* Complete Confirmation Modal */}
            <CompleteConfirmationModal
                isOpen={showCompleteModal}
                isLoading={isCompletingAppointment}
                appointmentInfo={selectedAppointment}
                result={completionResult}
                onResultChange={setCompletionResult}
                onClose={() => {
                    setShowCompleteModal(false);
                    setSelectedAppointment(null);
                    setCompletionResult('');
                }}
                onConfirm={handleCompleteConfirm}
            />

            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={previewModal.isOpen}
                fileUrl={previewModal.fileUrl}
                fileName={previewModal.fileName}
                onClose={handleClosePreview}
            />
        </>
    );
};

// Complete Confirmation Modal Component
interface CompleteConfirmationModalProps {
    isOpen: boolean;
    isLoading: boolean;
    appointmentInfo: AppointmentCardData | null;
    result: string;
    onResultChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

const CompleteConfirmationModal: React.FC<CompleteConfirmationModalProps> = ({
    isOpen,
    isLoading,
    appointmentInfo,
    result,
    onResultChange,
    onClose,
    onConfirm,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Xác nhận đã khám</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={isLoading}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {appointmentInfo && (
                            <div className="alert alert-info mb-3">
                                <strong>Thông tin lịch hẹn:</strong>
                                <div className="mt-2">
                                    <div>
                                        <strong>Bệnh nhân:</strong>{' '}
                                        {appointmentInfo.patientInfo?.firstName}{' '}
                                        {appointmentInfo.patientInfo?.lastName}
                                    </div>
                                    <div>
                                        <strong>Ngày:</strong>{' '}
                                        {new Date(
                                            appointmentInfo.appointmentDate
                                        ).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div>
                                        <strong>Giờ:</strong> {appointmentInfo.appointmentTime}
                                    </div>
                                    {appointmentInfo.symptoms && (
                                        <div className="mt-2 pt-2 border-top">
                                            <strong>Triệu chứng:</strong>
                                            <div className="text-muted small">
                                                {appointmentInfo.symptoms}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mb-3">
                            <label htmlFor="completionResult" className="form-label">
                                Kết quả khám <span className="text-danger">*</span>
                            </label>
                            <textarea
                                id="completionResult"
                                className="form-control"
                                rows={5}
                                placeholder="Nhập kết quả khám, chẩn đoán, đơn thuốc và lời khuyên cho bệnh nhân..."
                                value={result}
                                onChange={(e) => onResultChange(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <div className="form-text">
                                <i className="ti ti-info-circle me-1"></i> Vui lòng ghi rõ chẩn
                                đoán, kết quả khám và hướng điều trị
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={onConfirm}
                            disabled={isLoading || !result.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <output
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-label="Đang xử lý"
                                    ></output>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="ti ti-check me-2"></i> Xác nhận đã khám
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAppointments;
