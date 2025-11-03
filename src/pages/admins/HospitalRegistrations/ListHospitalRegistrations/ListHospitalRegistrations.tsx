import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import TableSkeleton from '@/components/TableSkeleton';
import { AppFooter } from '@/components/AppFooter';
import { HospitalRegistrationService } from '@/services/hospital-registration.service';
import ApprovalModal from '@/pages/admins/HospitalRegistrations/Modals/ApprovalModal';
import RejectionModal from '@/pages/admins/HospitalRegistrations/Modals/RejectionModal';
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

    // Tab counts
    const [tabCounts, setTabCounts] = useState<RegistrationTabCounts>({
        pending: 0,
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
    }>({
        isOpen: false,
        registrationId: '',
        hospitalName: '',
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

    const handleOpenApproval = (registrationId: string, hospitalName: string) => {
        setApprovalModal({
            isOpen: true,
            registrationId,
            hospitalName,
        });
    };

    const handleCloseApproval = () => {
        setApprovalModal({
            isOpen: false,
            registrationId: '',
            hospitalName: '',
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

    // Fetch registrations
    const fetchRegistrations = async () => {
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await HospitalRegistrationService.getAllRegistrations({
                status: mapUITabToStatus(activeStatusTab),
                page: currentPage,
                pageSize: itemsPerPage,
                sortBy: 'CreatedAt',
                sortOrder: 'DESC',
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
    };

    // Fetch tab counts
    const fetchTabCounts = async () => {
        try {
            // Fetch all statuses to get counts
            const [pendingResp, confirmedResp, cancelledResp] = await Promise.all([
                HospitalRegistrationService.getAllRegistrations({
                    status: RegistrationStatus.PENDING,
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
    }, [activeStatusTab, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            return (
                <TableSkeleton
                    rows={itemsPerPage}
                    columns={[
                        { type: 'text', width: 200, lines: 2 }, // Hospital Name + Address
                        { type: 'text', width: 180, lines: 2 }, // Email + Phone
                        { type: 'text', width: 120 }, // Tax Code
                        { type: 'actions', width: 120, items: 3 }, // Files
                        { type: 'actions', width: 100, items: 1 }, // Contract File
                        { type: 'date', width: 140 }, // Submitted Date
                        { type: 'badge', width: 100 }, // Status
                        { type: 'actions', width: 200, items: 2 }, // Actions
                    ]}
                />
            );
        }

        if (apiError) {
            return (
                <tr>
                    <td colSpan={8} className="text-center py-5">
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
                    <td colSpan={8} className="text-center py-5">
                        <i className="ti ti-clipboard-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có đơn đăng ký nào</p>
                    </td>
                </tr>
            );
        }

        return registrations.map((registration) => (
            <tr key={registration.id}>
                <td>
                    <div className="fw-semibold">{registration.hospitalName}</div>
                    <div className="text-muted small">{registration.address}</div>
                </td>
                <td>
                    <div>{registration.email}</div>
                    <div className="text-muted small">{registration.phone}</div>
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
                    {registration.contractFile &&
                    registration.status === RegistrationStatus.CONFIRMED ? (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                                handlePreviewFile(registration.contractFile!, 'Hợp đồng hợp tác')
                            }
                            title="Xem hợp đồng hợp tác"
                        >
                            <i className="ti ti-file-text me-1"></i> Hợp đồng
                        </button>
                    ) : (
                        <span className="badge badge-outline-info">Chưa cập nhập</span>
                    )}
                </td>
                <td>{new Date(registration.createdAt).toLocaleString('vi-VN')}</td>
                {activeStatusTab === 'cancelled' && <td>{registration.reason}</td>}
                <td>
                    <span className={getStatusBadgeClass(registration.status)}>
                        {getStatusText(registration.status)}
                    </span>
                </td>
                <td>
                    {registration.status === 'PENDING' && (
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() =>
                                    handleOpenApproval(registration.id, registration.hospitalName)
                                }
                                title="Phê duyệt"
                            >
                                <i className="ti ti-check me-1"></i> Phê duyệt
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
                    )}
                </td>
            </tr>
        ));
    };

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Đăng Ký Hợp Tác Bệnh Viện</h4>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="d-flex gap-2">
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

                {/* Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th>Tên Bệnh Viện</th>
                                <th>Liên Hệ</th>
                                <th>Mã Số Thuế</th>
                                <th>Hồ Sơ Đính Kèm</th>
                                <th>Hợp Đồng</th>
                                <th>Ngày Gửi</th>
                                {activeStatusTab === 'cancelled' && <th>Nguyên nhân</th>}
                                <th>Trạng Thái</th>
                                {activeStatusTab === 'pending' && <th>Thao Tác</th>}
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
            <ApprovalModal
                isOpen={approvalModal.isOpen}
                hospitalName={approvalModal.hospitalName}
                registrationId={approvalModal.registrationId}
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

            {/* Footer */}
            <AppFooter />
        </>
    );
};

export default ListHospitalRegistrations;
