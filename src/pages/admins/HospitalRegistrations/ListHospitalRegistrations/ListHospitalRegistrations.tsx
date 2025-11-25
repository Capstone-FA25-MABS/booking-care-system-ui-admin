import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import TableSkeleton, { type SkeletonColumn } from '@/components/TableSkeleton';
import ActionDropdown from '@/components/ActionDropdown';
import {
    HospitalRegistrationService,
    generateContract,
    deleteRegistration,
} from '@/services/hospital-registration.service';
import ApprovalConfirmModal from '@/pages/admins/HospitalRegistrations/Modals/ApprovalConfirmModal';
import RejectionModal from '@/pages/admins/HospitalRegistrations/Modals/RejectionModal';
import UpdateContractModal from '@/pages/admins/HospitalRegistrations/Modals/UpdateContractModal';
import ContractInfoModal from '@/pages/admins/HospitalRegistrations/Modals/ContractInfoModal';
import ModalDelete from '@/components/ModalDelete';
import type { GenerateContractResponse } from '@/types/contract.types';
import {
    HospitalRegistrationResponse,
    RegistrationStatus,
    RegistrationUITab,
    mapUITabToStatus,
    getStatusBadgeClass,
    getStatusText,
    type RegistrationTabCounts,
} from '@/types/hospital-registration.types';
import FilePreviewModal from '@/components/FilePreviewModal';
import { hospitalRegistrationSortOptions } from '@/utils/hospital-registration.utils';

const ListHospitalRegistrations: React.FC = () => {
    // States
    const [registrations, setRegistrations] = useState<HospitalRegistrationResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Tab state
    const [activeStatusTab, setActiveStatusTab] = useState<RegistrationUITab>('pending');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Search and Sort
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState('CreatedAt_desc');

    // Tab counts
    const [tabCounts, setTabCounts] = useState<RegistrationTabCounts>({
        pending: 0,
        contractGenerated: 0,
        contractSigned: 0,
        confirmed: 0,
        cancelled: 0,
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

    // Approval modal state
    const [approvalModal, setApprovalModal] = useState<{
        isOpen: boolean;
        registrationId: string;
        hospitalName: string;
        contractUrl?: string;
    }>({
        isOpen: false,
        registrationId: '',
        hospitalName: '',
        contractUrl: undefined,
    });

    // Rejection modal state
    const [rejectionModal, setRejectionModal] = useState<{
        isOpen: boolean;
        registrationId: string;
        hospitalName: string;
    }>({
        isOpen: false,
        registrationId: '',
        hospitalName: '',
    });

    // Update contract modal state
    const [updateContractModal, setUpdateContractModal] = useState<{
        isOpen: boolean;
        registrationId: string;
        hospitalName: string;
    }>({
        isOpen: false,
        registrationId: '',
        hospitalName: '',
    });

    // Contract info modal state
    const [contractInfoModal, setContractInfoModal] = useState<{
        isOpen: boolean;
        contractData: GenerateContractResponse | null;
    }>({
        isOpen: false,
        contractData: null,
    });

    // Generate contract loading
    const [isGeneratingContract, setIsGeneratingContract] = useState<string | null>(null);

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        registrationId: string;
        hospitalName: string;
    }>({
        isOpen: false,
        registrationId: '',
        hospitalName: '',
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePreviewFile = (fileUrl: string, fileName: string) => {
        setPreviewModal({
            isOpen: true,
            fileUrl,
            fileName,
        });
    };

    const handleClosePreview = () => {
        setPreviewModal({
            isOpen: false,
            fileUrl: '',
            fileName: '',
        });
    };

    const handleOpenApproval = (
        registrationId: string,
        hospitalName: string,
        contractUrl?: string
    ) => {
        setApprovalModal({
            isOpen: true,
            registrationId,
            hospitalName,
            contractUrl,
        });
    };

    const handleCloseApproval = () => {
        setApprovalModal({
            isOpen: false,
            registrationId: '',
            hospitalName: '',
            contractUrl: undefined,
        });
    };

    const handleApprovalSuccess = () => {
        fetchRegistrations();
        fetchTabCounts(); // Re-count after approval
    };

    const handleOpenRejection = (registrationId: string, hospitalName: string) => {
        setRejectionModal({
            isOpen: true,
            registrationId,
            hospitalName,
        });
    };

    const handleCloseRejection = () => {
        setRejectionModal({
            isOpen: false,
            registrationId: '',
            hospitalName: '',
        });
    };

    const handleRejectionSuccess = () => {
        fetchRegistrations();
        fetchTabCounts(); // Re-count after rejection
    };

    // Update contract modal handlers
    const handleOpenUpdateContract = (registrationId: string, hospitalName: string) => {
        setUpdateContractModal({
            isOpen: true,
            registrationId,
            hospitalName,
        });
    };

    const handleCloseUpdateContract = () => {
        setUpdateContractModal({
            isOpen: false,
            registrationId: '',
            hospitalName: '',
        });
    };

    const handleUpdateContractSuccess = () => {
        fetchRegistrations();
    };

    // Contract info modal handlers
    const handleOpenContractInfo = (contractData: GenerateContractResponse) => {
        setContractInfoModal({
            isOpen: true,
            contractData,
        });
    };

    const handleCloseContractInfo = () => {
        setContractInfoModal({
            isOpen: false,
            contractData: null,
        });
    };

    // Generate contract handler
    const handleGenerateContract = async (registrationId: string) => {
        setIsGeneratingContract(registrationId);
        try {
            const response = await generateContract(registrationId);
            if (response.success && response.data) {
                toast.success('Tạo hợp đồng thành công');
                handleOpenContractInfo(response.data);
                fetchRegistrations();
                fetchTabCounts();
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo hợp đồng');
        } finally {
            setIsGeneratingContract(null);
        }
    };

    // Delete modal handlers
    const handleOpenDelete = (registrationId: string, hospitalName: string) => {
        setDeleteModal({
            isOpen: true,
            registrationId,
            hospitalName,
        });
    };

    const handleCloseDelete = () => {
        setDeleteModal({
            isOpen: false,
            registrationId: '',
            hospitalName: '',
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await deleteRegistration(deleteModal.registrationId);
            if (response.success) {
                toast.success(response.message || 'Xóa đơn đăng ký thành công');
                fetchRegistrations();
                fetchTabCounts();
                handleCloseDelete();
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa đơn đăng ký');
        }
    };

    // Fetch registrations
    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);

        try {
            // Parse sort value (format: "field_order")
            const [sortBy, sortOrder] = selectedSort
                ? selectedSort.split('_')
                : ['CreatedAt', 'desc'];

            const response = await HospitalRegistrationService.getAllRegistrations({
                status: mapUITabToStatus(activeStatusTab),
                page: currentPage,
                pageSize: itemsPerPage,
                searchTerm: debouncedSearchTerm || undefined,
                sortBy: sortBy,
                sortOrder: sortOrder.toUpperCase(),
            });

            setRegistrations(response.registrations || []);
            setTotalCount(response.totalCount || 0);
        } catch (error: any) {
            console.error('Error fetching hospital registrations:', error);
            setApiError(error.message || 'Không thể tải danh sách đăng ký');
            toast.error('Không thể tải danh sách đăng ký');
        } finally {
            setIsLoading(false);
        }
    }, [activeStatusTab, currentPage, debouncedSearchTerm, selectedSort]);

    // Fetch tab counts
    const fetchTabCounts = async () => {
        try {
            // Fetch all statuses to get counts
            const [
                pendingResp,
                contractGeneratedResp,
                contractSignedResp,
                confirmedResp,
                cancelledResp,
            ] = await Promise.all([
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.PENDING,
                    page: 1,
                    pageSize: 1,
                }),
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.CONTRACT_GENERATED,
                    page: 1,
                    pageSize: 1,
                }),
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.CONTRACT_SIGNED,
                    page: 1,
                    pageSize: 1,
                }),
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.CONFIRMED,
                    page: 1,
                    pageSize: 1,
                }),
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.CANCELLED,
                    page: 1,
                    pageSize: 1,
                }),
            ]);

            setTabCounts({
                pending: pendingResp.totalCount || 0,
                contractGenerated: contractGeneratedResp.totalCount || 0,
                contractSigned: contractSignedResp.totalCount || 0,
                confirmed: confirmedResp.totalCount || 0,
                cancelled: cancelledResp.totalCount || 0,
            });
        } catch (error) {
            console.error('Error fetching tab counts:', error);
        }
    };

    useEffect(() => {
        fetchRegistrations();
        fetchTabCounts(); // Re-count when tab changes
    }, [fetchRegistrations, activeStatusTab, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (value: string) => {
        setSelectedSort(value);
        setCurrentPage(1); // Reset to first page when sorting
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Helper: Get button class names for status tabs
    const getStatusTabClass = (tab: RegistrationUITab) => {
        return `btn ${activeStatusTab === tab ? 'btn-primary' : 'btn-light'}`;
    };

    // Helper: Get badge class names for status tabs
    const getStatusBadgeClassForTab = (tab: RegistrationUITab) => {
        return `badge ${activeStatusTab === tab ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`;
    };

    const renderTableBody = () => {
        if (isLoading) {
            // Base columns that are always present
            const baseColumns: SkeletonColumn[] = [
                { type: 'text', width: 180, lines: 2 }, // Representative Info
                { type: 'text', width: 200, lines: 2 }, // Hospital Name + Address
                { type: 'text', width: 180, lines: 2 }, // Hospital Contact
                { type: 'text', width: 120 }, // Tax Code
                { type: 'actions', width: 120, items: 3 }, // Files
                { type: 'actions', width: 100, items: 1 }, // Contract File
                { type: 'date', width: 140 }, // Submitted Date
            ];

            // Add conditional columns based on status
            const columns: SkeletonColumn[] = [...baseColumns];

            // Add reason column for cancelled status
            if (activeStatusTab === 'cancelled') {
                columns.push({ type: 'text', width: 150, lines: 2 }); // Reason
            }

            // Add status column (always present)
            columns.push({ type: 'badge', width: 100 }); // Status

            // Add actions column for all status tabs (different actions per status)
            if (activeStatusTab === 'pending') {
                columns.push({ type: 'actions', width: 250, items: 2 }); // Generate Contract + Reject
            } else if (activeStatusTab === 'contract-generated') {
                columns.push({ type: 'actions', width: 100, items: 1 }); // Reject
            } else if (activeStatusTab === 'contract-signed') {
                columns.push({ type: 'actions', width: 200, items: 2 }); // Approve + Reject
            } else if (activeStatusTab === 'confirmed') {
                columns.push({ type: 'actions', width: 180, items: 1 }); // Update Contract
            } else if (activeStatusTab === 'cancelled') {
                columns.push({ type: 'actions', width: 100, items: 1 }); // Delete
            }

            return <TableSkeleton rows={itemsPerPage} columns={columns} />;
        }

        // Calculate colSpan based on status tab
        // Base columns: 8 (Representative, Hospital Name, Hospital Contact, Tax Code, Files, Contract, Date, Status)
        // + 1 for Reason (cancelled only)
        // + 1 for Actions (all status tabs)
        let colSpan = 8; // Base columns
        if (activeStatusTab === 'cancelled') colSpan += 1; // Add reason column
        colSpan += 1; // Add actions column (present in all status tabs)

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
                                onClick={() => fetchRegistrations()}
                            >
                                Thử lại
                            </button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (registrations.length === 0) {
            return (
                <tr>
                    <td colSpan={colSpan} className="text-center py-5">
                        <i className="ti ti-clipboard-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có đơn đăng ký nào</p>
                    </td>
                </tr>
            );
        }

        return registrations.map((registration) => (
            <tr key={registration.id}>
                <td>
                    <div className="fw-semibold">{registration.representativeName}</div>
                    <div className="text-muted small">{registration.representativeEmail}</div>
                    <div className="text-muted small">{registration.representativePhone}</div>
                </td>
                <td>
                    <div className="fw-semibold">{registration.hospitalName}</div>
                    <div className="text-muted small">{registration.address}</div>
                </td>
                <td>
                    <div>{registration.hospitalEmail}</div>
                    <div className="text-muted small">{registration.hospitalPhone}</div>
                </td>
                <td>{registration.taxCode}</td>
                <td>
                    <div className="d-flex gap-2 flex-wrap">
                        {registration.licenseFile &&
                            registration.licenseFile !== 'PENDING_UPLOAD' &&
                            registration.licenseFile !== 'UPLOAD_FAILED' && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                        handlePreviewFile(
                                            registration.licenseFile,
                                            'Giấy phép hoạt động'
                                        )
                                    }
                                    title="Xem giấy phép hoạt động"
                                >
                                    <i className="ti ti-license me-1"></i> GP
                                </button>
                            )}
                        {registration.businessCertificateFile &&
                            registration.businessCertificateFile !== 'PENDING_UPLOAD' &&
                            registration.businessCertificateFile !== 'UPLOAD_FAILED' && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                        handlePreviewFile(
                                            registration.businessCertificateFile,
                                            'Giấy chứng nhận ĐKKD'
                                        )
                                    }
                                    title="Xem giấy chứng nhận ĐKKD"
                                >
                                    <i className="ti ti-certificate me-1"></i> ĐKKD
                                </button>
                            )}
                        {registration.identityCardFile &&
                            registration.identityCardFile !== 'PENDING_UPLOAD' &&
                            registration.identityCardFile !== 'UPLOAD_FAILED' && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() =>
                                        handlePreviewFile(
                                            registration.identityCardFile,
                                            'CMND/CCCD'
                                        )
                                    }
                                    title="Xem CMND/CCCD"
                                >
                                    <i className="ti ti-id me-1"></i> CMND
                                </button>
                            )}
                        {(registration.licenseFile === 'PENDING_UPLOAD' ||
                            registration.businessCertificateFile === 'PENDING_UPLOAD' ||
                            registration.identityCardFile === 'PENDING_UPLOAD') && (
                            <span className="badge bg-warning text-dark">
                                <i className="ti ti-clock me-1"></i> Đang tải...
                            </span>
                        )}
                        {(registration.licenseFile === 'UPLOAD_FAILED' ||
                            registration.businessCertificateFile === 'UPLOAD_FAILED' ||
                            registration.identityCardFile === 'UPLOAD_FAILED') && (
                            <span className="badge bg-danger">
                                <i className="ti ti-alert-triangle me-1"></i> Lỗi tải file
                            </span>
                        )}
                    </div>
                </td>
                <td>
                    {(() => {
                        // Determine which file to show based on status
                        // CONTRACT_GENERATED: Draft only (not signed yet)
                        const isDraft =
                            registration.status === RegistrationStatus.CONTRACT_GENERATED;
                        // CONTRACT_SIGNED or CONFIRMED: Signed contract
                        const isSigned =
                            registration.status === RegistrationStatus.CONTRACT_SIGNED ||
                            registration.status === RegistrationStatus.CONFIRMED;

                        const fileUrl = isDraft
                            ? registration.contractDraftFile
                            : registration.contractFile;

                        if (fileUrl && (isDraft || isSigned)) {
                            return (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                        handlePreviewFile(
                                            fileUrl,
                                            isDraft ? 'Bản nháp hợp đồng' : 'Hợp đồng hợp tác'
                                        )
                                    }
                                    title={
                                        isDraft ? 'Xem bản nháp hợp đồng' : 'Xem hợp đồng hợp tác'
                                    }
                                >
                                    <i className="ti ti-file-text me-1"></i>{' '}
                                    {isDraft ? 'Bản nháp' : 'Hợp đồng'}
                                </button>
                            );
                        }

                        return <span className="badge badge-outline-info">Chưa cập nhập</span>;
                    })()}
                </td>
                <td>{new Date(registration.createdAt).toLocaleString('vi-VN')}</td>
                {activeStatusTab === 'cancelled' && <td>{registration.reason}</td>}
                <td>
                    <span className={getStatusBadgeClass(registration.status)}>
                        {getStatusText(registration.status)}
                    </span>
                </td>
                {/* Actions column - conditional based on status */}
                {activeStatusTab === 'pending' && (
                    <td>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => handleGenerateContract(registration.id)}
                                disabled={isGeneratingContract === registration.id}
                                title="Tạo hợp đồng"
                            >
                                {isGeneratingContract === registration.id ? (
                                    <>
                                        <output className="spinner-border spinner-border-sm me-1" />{' '}
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-file-plus me-1"></i> Tạo hợp đồng
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() =>
                                    handleOpenRejection(registration.id, registration.hospitalName)
                                }
                                title="Từ chối"
                            >
                                <i className="ti ti-x me-1"></i> Từ chối
                            </button>
                        </div>
                    </td>
                )}
                {activeStatusTab === 'contract-generated' && (
                    <td>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() =>
                                handleOpenRejection(registration.id, registration.hospitalName)
                            }
                            title="Từ chối"
                        >
                            <i className="ti ti-x me-1"></i> Từ chối
                        </button>
                    </td>
                )}
                {activeStatusTab === 'contract-signed' && (
                    <td>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() =>
                                    handleOpenApproval(
                                        registration.id,
                                        registration.hospitalName,
                                        registration.contractFile
                                    )
                                }
                                title="Xét duyệt"
                            >
                                <i className="ti ti-check me-1"></i> Xét duyệt
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() =>
                                    handleOpenRejection(registration.id, registration.hospitalName)
                                }
                                title="Từ chối"
                            >
                                <i className="ti ti-x me-1"></i> Từ chối
                            </button>
                        </div>
                    </td>
                )}
                {activeStatusTab === 'confirmed' && (
                    <td>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() =>
                                handleOpenUpdateContract(registration.id, registration.hospitalName)
                            }
                            title="Cập nhật file hợp đồng"
                        >
                            <i className="ti ti-edit me-1"></i> Cập nhật hợp đồng
                        </button>
                    </td>
                )}
                {activeStatusTab === 'cancelled' && (
                    <td>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() =>
                                handleOpenDelete(registration.id, registration.hospitalName)
                            }
                            title="Xóa đơn đăng ký"
                        >
                            <i className="ti ti-trash me-1"></i> Xóa
                        </button>
                    </td>
                )}
            </tr>
        ));
    };

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Đăng ký hợp tác bệnh viện</h4>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            className={getStatusTabClass('pending')}
                            onClick={() => {
                                setActiveStatusTab('pending');
                                setCurrentPage(1);
                            }}
                        >
                            Chờ xử lý{' '}
                            <span className={getStatusBadgeClassForTab('pending')}>
                                {tabCounts.pending}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('contract-generated')}
                            onClick={() => {
                                setActiveStatusTab('contract-generated');
                                setCurrentPage(1);
                            }}
                        >
                            Đã tạo hợp đồng{' '}
                            <span className={getStatusBadgeClassForTab('contract-generated')}>
                                {tabCounts.contractGenerated}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('contract-signed')}
                            onClick={() => {
                                setActiveStatusTab('contract-signed');
                                setCurrentPage(1);
                            }}
                        >
                            Đã ký hợp đồng{' '}
                            <span className={getStatusBadgeClassForTab('contract-signed')}>
                                {tabCounts.contractSigned}
                            </span>
                        </button>
                        <button
                            className={getStatusTabClass('confirmed')}
                            onClick={() => {
                                setActiveStatusTab('confirmed');
                                setCurrentPage(1);
                            }}
                        >
                            Đã xác nhận{' '}
                            <span className={getStatusBadgeClassForTab('confirmed')}>
                                {tabCounts.confirmed}
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
                            <span className={getStatusBadgeClassForTab('cancelled')}>
                                {tabCounts.cancelled}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="search-set">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label
                                        htmlFor="registrationSearch"
                                        aria-label="Search registrations"
                                    >
                                        <input
                                            id="registrationSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm đăng ký..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            aria-controls="DataTables_Table_0"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="d-flex align-items-center gap-2">
                        <ActionDropdown
                            type="sort"
                            options={hospitalRegistrationSortOptions}
                            selectedValue={selectedSort}
                            onSelect={handleSortChange}
                            placeholder="Sắp xếp:"
                            size="sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th>Người đại diện</th>
                                <th>Tên bệnh viện</th>
                                <th>Liên hệ bệnh viện</th>
                                <th>Mã số thuế</th>
                                <th>Hồ sơ đính kèm</th>
                                <th>Hợp đồng</th>
                                <th>Ngày gửi</th>
                                {activeStatusTab === 'cancelled' && <th>Nguyên nhân</th>}
                                <th>Trạng thái</th>
                                {(activeStatusTab === 'pending' ||
                                    activeStatusTab === 'contract-generated' ||
                                    activeStatusTab === 'contract-signed' ||
                                    activeStatusTab === 'confirmed' ||
                                    activeStatusTab === 'cancelled') && <th>Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={previewModal.isOpen}
                fileUrl={previewModal.fileUrl}
                fileName={previewModal.fileName}
                onClose={handleClosePreview}
            />

            {/* Approval Modal */}
            <ApprovalConfirmModal
                isOpen={approvalModal.isOpen}
                hospitalName={approvalModal.hospitalName}
                registrationId={approvalModal.registrationId}
                contractUrl={approvalModal.contractUrl}
                onClose={handleCloseApproval}
                onSuccess={handleApprovalSuccess}
            />

            {/* Rejection Modal */}
            <RejectionModal
                isOpen={rejectionModal.isOpen}
                hospitalName={rejectionModal.hospitalName}
                registrationId={rejectionModal.registrationId}
                onClose={handleCloseRejection}
                onSuccess={handleRejectionSuccess}
            />

            {/* Update Contract Modal */}
            <UpdateContractModal
                isOpen={updateContractModal.isOpen}
                hospitalName={updateContractModal.hospitalName}
                registrationId={updateContractModal.registrationId}
                onClose={handleCloseUpdateContract}
                onSuccess={handleUpdateContractSuccess}
            />

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={deleteModal.isOpen}
                onHide={handleCloseDelete}
                onConfirm={handleDeleteConfirm}
                title="Xóa đơn đăng ký"
                message="Bạn có chắc chắn muốn xóa đơn đăng ký của bệnh viện"
                itemName={deleteModal.hospitalName}
                confirmText="Có, xóa"
                cancelText="Hủy"
            />

            {/* Contract Info Modal */}
            <ContractInfoModal
                show={contractInfoModal.isOpen}
                onHide={handleCloseContractInfo}
                contractInfo={contractInfoModal.contractData}
            />
        </>
    );
};

export default ListHospitalRegistrations;
