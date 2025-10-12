import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import ExportDropdown from '@/components/ExportDropdown';
import FilterSortToolbar from '@/components/FilterSortToolbar';
import RefundTableSkeleton from '@/pages/hospitals/Refunds/RefundTableSkeleton/RefundTableSkeleton';
import { RefundService } from '@/services/refund.service';
import {
    RefundHistoryResponse,
    RefundStatus,
    getRefundStatusVariant,
    getRefundStatusText,
} from '@/types/refund.types';
import { RootState } from '@/store';
import { Role } from '@/enums/common.enums';

const ListRefunds: React.FC = () => {
    // Get auth and user profile from Redux
    const { roles } = useSelector((state: RootState) => state.auth);
    const { hospitalProfile } = useSelector((state: RootState) => state.user);

    // API data states
    const [refunds, setRefunds] = useState<RefundHistoryResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Filter states
    const [activeStatusTab, setActiveStatusTab] = useState<RefundStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<string>('Gần đây');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Tab counts
    const [tabCounts, setTabCounts] = useState({
        all: 0,
        waiting: 0,
        pending: 0,
        completed: 0,
        rejected: 0,
    });

    // Modal states
    const [selectedRefund, setSelectedRefund] = useState<RefundHistoryResponse | null>(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [transferNote, setTransferNote] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Validate user profile before fetching refunds
    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        if (primaryRole === Role.STAFF && !hospitalProfile) {
            console.warn('Hospital profile not loaded yet');
            return;
        }
    }, [roles, hospitalProfile]);

    // Fetch refunds from API
    useEffect(() => {
        const fetchRefunds = async () => {
            // Validate that user has required profile
            const primaryRole = roles[0]?.toUpperCase();
            if (primaryRole === Role.STAFF && !hospitalProfile) {
                console.warn('Hospital profile not available, skipping refund fetch');
                return;
            }

            setIsLoading(true);
            setApiError(null);

            try {
                const response = await RefundService.getRefundHistories({
                    hospitalId: hospitalProfile?.id,
                    status: activeStatusTab !== 'all' ? activeStatusTab : undefined,
                    page: currentPage,
                    pageSize: itemsPerPage,
                    sortBy: 'CreatedAt',
                    sortDescending: true,
                    includeStatusCounts: true,
                });

                if (response.success && response.data) {
                    setRefunds(response.data.refundHistories);
                    setTotalCount(response.data.totalCount || 0);

                    // Use status counts from API response
                    if (response.data.statusCounts) {
                        setTabCounts({
                            all: response.data.statusCounts.total,
                            waiting: response.data.statusCounts.waiting,
                            pending: response.data.statusCounts.pending,
                            completed: response.data.statusCounts.completed,
                            rejected: response.data.statusCounts.rejected,
                        });
                    }
                } else {
                    throw new Error(response.message || 'Không thể tải danh sách hoàn tiền');
                }
            } catch (error: any) {
                console.error('Error fetching refunds:', error);
                const errorMessage = error.message || 'Không thể tải danh sách hoàn tiền';
                setApiError(errorMessage);
                setRefunds([]);
                setTotalCount(0);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRefunds();
    }, [activeStatusTab, currentPage, itemsPerPage, roles, hospitalProfile?.id]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handler for marking refund as transferred
    const handleMarkAsTransferred = async () => {
        if (!selectedRefund) return;

        setIsProcessing(true);
        try {
            const response = await RefundService.markAsTransferred(
                selectedRefund.id,
                transferNote || undefined
            );

            if (response.success) {
                toast.success(
                    'Đã đánh dấu chuyển tiền thành công! Thông báo đã được gửi đến bệnh nhân.'
                );

                // Refresh refunds list with status counts
                const fetchResponse = await RefundService.getRefundHistories({
                    hospitalId: hospitalProfile?.id,
                    status: activeStatusTab !== 'all' ? activeStatusTab : undefined,
                    page: currentPage,
                    pageSize: itemsPerPage,
                    sortBy: 'CreatedAt',
                    sortDescending: true,
                    includeStatusCounts: true,
                });

                if (fetchResponse.success && fetchResponse.data) {
                    setRefunds(fetchResponse.data.refundHistories);
                    setTotalCount(fetchResponse.data.totalCount || 0);

                    // Update tab counts
                    if (fetchResponse.data.statusCounts) {
                        setTabCounts({
                            all: fetchResponse.data.statusCounts.total,
                            waiting: fetchResponse.data.statusCounts.waiting,
                            pending: fetchResponse.data.statusCounts.pending,
                            completed: fetchResponse.data.statusCounts.completed,
                            rejected: fetchResponse.data.statusCounts.rejected,
                        });
                    }
                }

                setShowTransferModal(false);
                setTransferNote('');
                setSelectedRefund(null);
            }
        } catch (error: any) {
            console.error('Error marking refund as transferred:', error);
            toast.error(error.message || 'Không thể đánh dấu chuyển tiền');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handler for reporting bank account issue
    const handleReportIssue = async () => {
        if (!selectedRefund || !issueDescription.trim()) {
            toast.warning('Vui lòng nhập mô tả sự cố');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await RefundService.reportBankIssue(
                selectedRefund.id,
                issueDescription
            );

            if (response.success) {
                toast.success('Đã gửi thông báo sự cố đến bệnh nhân');
                setShowIssueModal(false);
                setIssueDescription('');
                setSelectedRefund(null);
            }
        } catch (error: any) {
            console.error('Error reporting bank issue:', error);
            toast.error(error.message || 'Không thể gửi thông báo sự cố');
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate total pages based on API response
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <div className="content">
                {/* Start Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Danh Sách Hoàn Tiền</h4>
                    </div>
                    <div className="text-end d-flex">
                        <ExportDropdown
                            options={[
                                { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                { value: 'excel', label: 'Tải xuống dạng Excel', format: 'excel' },
                            ]}
                            onExport={(format: string) => {
                                console.log('Exporting:', format);
                            }}
                        />
                    </div>
                </div>
                {/* End Page Header */}

                {/* Start Filter */}
                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    {/* Status Tabs */}
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            className={`btn ${activeStatusTab === 'all' ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab('all');
                                setCurrentPage(1);
                            }}
                        >
                            Tất cả{' '}
                            <span
                                className={`badge ${activeStatusTab === 'all' ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {tabCounts.all}
                            </span>
                        </button>
                        <button
                            className={`btn ${activeStatusTab === RefundStatus.WAITING ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab(RefundStatus.WAITING);
                                setCurrentPage(1);
                            }}
                        >
                            Chờ thông tin{' '}
                            <span
                                className={`badge ${activeStatusTab === RefundStatus.WAITING ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {tabCounts.waiting}
                            </span>
                        </button>
                        <button
                            className={`btn ${activeStatusTab === RefundStatus.PENDING ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab(RefundStatus.PENDING);
                                setCurrentPage(1);
                            }}
                        >
                            Chờ xử lý{' '}
                            <span
                                className={`badge ${activeStatusTab === RefundStatus.PENDING ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {tabCounts.pending}
                            </span>
                        </button>
                        <button
                            className={`btn ${activeStatusTab === RefundStatus.COMPLETED ? 'btn-primary' : 'btn-light'}`}
                            onClick={() => {
                                setActiveStatusTab(RefundStatus.COMPLETED);
                                setCurrentPage(1);
                            }}
                        >
                            Đã hoàn tiền{' '}
                            <span
                                className={`badge ${activeStatusTab === RefundStatus.COMPLETED ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`}
                            >
                                {tabCounts.completed}
                            </span>
                        </button>
                    </div>

                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3">
                        <FilterSortToolbar
                            onFilterClick={() => {}}
                            sortOptions={[
                                { value: 'recent', label: 'Gần đây' },
                                { value: 'amount-desc', label: 'Số tiền giảm dần' },
                                { value: 'amount-asc', label: 'Số tiền tăng dần' },
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
                        <thead>
                            <tr>
                                <th>Mã Hoàn Tiền</th>
                                <th>Ngày Tạo</th>
                                <th>Số Tiền</th>
                                <th>Lý Do</th>
                                <th>Thông Tin Ngân Hàng</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
                                    {/* Skeleton Loading */}
                                    {Array.from({ length: itemsPerPage }, (_, index) => (
                                        <RefundTableSkeleton key={`skeleton-loading-${index}`} />
                                    ))}
                                </>
                            ) : apiError ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="text-danger">
                                            <i className="ti ti-alert-circle fs-1"></i>
                                            <p className="mt-2">{apiError}</p>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => window.location.reload()}
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : refunds.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <i className="ti ti-receipt-off fs-1 text-muted"></i>
                                        <p className="mt-2 text-muted">
                                            Không có yêu cầu hoàn tiền nào
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                refunds.map((refund) => (
                                    <tr key={refund.id}>
                                        <td>
                                            <span className="fw-semibold">
                                                #{refund.id.substring(0, 8)}
                                            </span>
                                        </td>
                                        <td>{formatDate(refund.createdAt)}</td>
                                        <td>
                                            <span className="fw-bold text-danger">
                                                {formatCurrency(refund.refundAmount)}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="text-truncate d-inline-block"
                                                style={{ maxWidth: '200px' }}
                                                title={refund.refundReason}
                                            >
                                                {refund.refundReason || 'Hủy lịch hẹn'}
                                            </span>
                                        </td>
                                        <td>
                                            {refund.bankAccount ? (
                                                <div>
                                                    <div className="fw-semibold">
                                                        {refund.bankAccount.bankName}
                                                    </div>
                                                    <small className="text-muted">
                                                        {refund.bankAccount.accountNumber} -{' '}
                                                        {refund.bankAccount.accountName}
                                                    </small>
                                                </div>
                                            ) : (
                                                <span className="text-warning">Chưa cập nhật</span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${getRefundStatusVariant(refund.status)}`}
                                            >
                                                {getRefundStatusText(refund.status)}
                                            </span>
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
                                                    >
                                                        <i className="ti ti-eye me-2"></i>
                                                        Xem chi tiết
                                                    </button>
                                                </li>
                                                {refund.status === RefundStatus.PENDING && (
                                                    <>
                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-success"
                                                                onClick={() => {
                                                                    setSelectedRefund(refund);
                                                                    setShowTransferModal(true);
                                                                }}
                                                            >
                                                                <i className="ti ti-check me-2"></i>
                                                                Đánh dấu đã chuyển tiền
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-warning"
                                                                onClick={() => {
                                                                    setSelectedRefund(refund);
                                                                    setShowIssueModal(true);
                                                                }}
                                                            >
                                                                <i className="ti ti-alert-triangle me-2"></i>
                                                                Báo cáo sự cố
                                                            </button>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </td>
                                    </tr>
                                ))
                            )}
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

            {/* Modal: Confirm Transfer */}
            {showTransferModal && selectedRefund && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title">Xác nhận đã chuyển tiền</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowTransferModal(false);
                                        setSelectedRefund(null);
                                        setTransferNote('');
                                    }}
                                    disabled={isProcessing}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <div className="d-flex align-items-start">
                                        <i className="ti ti-info-circle fs-5 me-2"></i>
                                        <div>
                                            <strong>Thông tin chuyển khoản:</strong>
                                            <ul className="mb-0 mt-2">
                                                <li>
                                                    <strong>Ngân hàng:</strong>{' '}
                                                    {selectedRefund.bankAccount?.bankName}
                                                </li>
                                                <li>
                                                    <strong>Số tài khoản:</strong>{' '}
                                                    {selectedRefund.bankAccount?.accountNumber}
                                                </li>
                                                <li>
                                                    <strong>Chủ tài khoản:</strong>{' '}
                                                    {selectedRefund.bankAccount?.accountName}
                                                </li>
                                                <li>
                                                    <strong>Số tiền:</strong>{' '}
                                                    <span className="text-danger fw-bold">
                                                        {formatCurrency(
                                                            selectedRefund.refundAmount
                                                        )}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú (không bắt buộc)</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="Nhập ghi chú về quá trình chuyển tiền..."
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        disabled={isProcessing}
                                    ></textarea>
                                </div>

                                <div className="alert alert-warning mb-0">
                                    <i className="ti ti-alert-triangle me-2"></i>
                                    Sau khi xác nhận, hệ thống sẽ:
                                    <ul className="mb-0 mt-2">
                                        <li>Cập nhật trạng thái hoàn tiền thành "Đã hoàn tiền"</li>
                                        <li>Cập nhật trạng thái thanh toán thành "Refunded"</li>
                                        <li>
                                            Gửi thông báo đến bệnh nhân về việc đã chuyển tiền thành
                                            công
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowTransferModal(false);
                                        setSelectedRefund(null);
                                        setTransferNote('');
                                    }}
                                    disabled={isProcessing}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleMarkAsTransferred}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-check me-2"></i>
                                            Xác nhận đã chuyển tiền
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Report Bank Account Issue */}
            {showIssueModal && selectedRefund && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title">Báo cáo sự cố tài khoản ngân hàng</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowIssueModal(false);
                                        setSelectedRefund(null);
                                        setIssueDescription('');
                                    }}
                                    disabled={isProcessing}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-warning">
                                    <div className="d-flex align-items-start">
                                        <i className="ti ti-alert-triangle fs-5 me-2"></i>
                                        <div>
                                            <strong>Thông tin tài khoản hiện tại:</strong>
                                            <ul className="mb-0 mt-2">
                                                <li>
                                                    <strong>Ngân hàng:</strong>{' '}
                                                    {selectedRefund.bankAccount?.bankName}
                                                </li>
                                                <li>
                                                    <strong>Số tài khoản:</strong>{' '}
                                                    {selectedRefund.bankAccount?.accountNumber}
                                                </li>
                                                <li>
                                                    <strong>Chủ tài khoản:</strong>{' '}
                                                    {selectedRefund.bankAccount?.accountName}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Mô tả sự cố <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder="Ví dụ: Không tìm thấy tài khoản này trong hệ thống ngân hàng, số tài khoản có thể bị nhập sai..."
                                        value={issueDescription}
                                        onChange={(e) => setIssueDescription(e.target.value)}
                                        disabled={isProcessing}
                                    ></textarea>
                                    <small className="text-muted">
                                        Hệ thống sẽ gửi thông báo này đến bệnh nhân qua email/số
                                        điện thoại
                                    </small>
                                </div>

                                <div className="alert alert-info mb-0">
                                    <i className="ti ti-info-circle me-2"></i>
                                    Sau khi gửi báo cáo, bệnh nhân sẽ nhận được thông báo để cập
                                    nhật lại thông tin tài khoản ngân hàng chính xác.
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowIssueModal(false);
                                        setSelectedRefund(null);
                                        setIssueDescription('');
                                    }}
                                    disabled={isProcessing}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleReportIssue}
                                    disabled={isProcessing || !issueDescription.trim()}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-send me-2"></i>
                                            Gửi báo cáo
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </>
    );
};

export default ListRefunds;
