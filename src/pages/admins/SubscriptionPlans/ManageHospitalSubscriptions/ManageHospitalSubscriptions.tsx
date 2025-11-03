import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import ActionDropdown from '@/components/ActionDropdown';
import Button from '@/components/Button';
import { SubscriptionService, HospitalSubscription } from '@/services/subscription.service';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HospitalWithSubscription {
    hospitalId: string;
    hospitalName: string;
    activeSubscription: HospitalSubscription | null;
    allSubscriptions: HospitalSubscription[];
}

const ManageHospitalSubscriptions: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [hospitals, setHospitals] = useState<HospitalWithSubscription[]>([]);
    const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Helper function to load hospitals into map
    const loadHospitalsIntoMap = async (
        hospitalMap: Map<string, HospitalWithSubscription>
    ): Promise<void> => {
        try {
            const hospitalsResponse = await SubscriptionService.getAllHospitals();
            const hospitalsList = hospitalsResponse?.data || [];

            for (const hospital of hospitalsList) {
                if (!hospital?.id) continue;

                hospitalMap.set(hospital.id, {
                    hospitalId: hospital.id,
                    hospitalName: hospital.name || hospital.hospitalName || 'Không có tên',
                    activeSubscription: null,
                    allSubscriptions: [],
                });
            }
        } catch (error: any) {
            console.error('Failed to load hospitals:', error);
            toast.error(error.message || 'Không thể tải danh sách bệnh viện');
        }
    };

    // Helper function to process subscriptions
    const processSubscriptions = (
        allSubscriptions: HospitalSubscription[],
        hospitalMap: Map<string, HospitalWithSubscription>
    ): void => {
        for (const subscription of allSubscriptions) {
            const hospitalId = subscription.hospitalId;

            if (!hospitalMap.has(hospitalId)) {
                const hospitalName =
                    (subscription as any).hospital?.name || 'Bệnh viện không xác định';
                hospitalMap.set(hospitalId, {
                    hospitalId,
                    hospitalName,
                    activeSubscription: null,
                    allSubscriptions: [],
                });
            }

            const hospital = hospitalMap.get(hospitalId)!;
            hospital.allSubscriptions.push(subscription);

            // Set active subscription if status is ACTIVE
            if (subscription.status === 'ACTIVE' && !hospital.activeSubscription) {
                hospital.activeSubscription = subscription;
            }
        }
    };

    // Load all hospital subscriptions
    const loadHospitalSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const hospitalsResponse: any = await SubscriptionService.getAllHospitalSubscriptions();
            const allSubscriptions: HospitalSubscription[] = hospitalsResponse?.data || [];
            const hospitalMap = new Map<string, HospitalWithSubscription>();

            await loadHospitalsIntoMap(hospitalMap);
            processSubscriptions(allSubscriptions, hospitalMap);

            setHospitals(Array.from(hospitalMap.values()));
        } catch (error: any) {
            console.error('Error loading hospital subscriptions:', error);
            toast.error(error.message || 'Không thể tải danh sách đăng ký gói của bệnh viện');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHospitalSubscriptions();
    }, [loadHospitalSubscriptions]);

    // Filter hospitals based on search and status
    const filteredHospitals = useMemo(() => {
        let filtered = hospitals;

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (hospital) =>
                    hospital.hospitalName.toLowerCase().includes(searchLower) ||
                    hospital.activeSubscription?.subscriptionPlan?.name
                        ?.toLowerCase()
                        .includes(searchLower)
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter((hospital) => {
                if (selectedStatus === 'with_subscription') {
                    return hospital.activeSubscription !== null;
                }
                if (selectedStatus === 'no_subscription') {
                    return hospital.activeSubscription === null;
                }
                return (
                    hospital.activeSubscription?.status?.toLowerCase() ===
                    selectedStatus.toLowerCase()
                );
            });
        }

        return filtered;
    }, [hospitals, searchTerm, selectedStatus]);

    // Pagination
    const paginatedHospitals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredHospitals.slice(startIndex, endIndex);
    }, [filteredHospitals, currentPage]);

    const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const toggleExpand = (hospitalId: string) => {
        const newExpanded = new Set(expandedHospitals);
        if (newExpanded.has(hospitalId)) {
            newExpanded.delete(hospitalId);
        } else {
            newExpanded.add(hospitalId);
        }
        setExpandedHospitals(newExpanded);
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatPrice = (price: number): string => {
        return `${price.toLocaleString('vi-VN')} VNĐ`;
    };

    const getBillingCycleText = (cycle: string): string => {
        switch (cycle) {
            case 'MONTHLY':
                return 'Tháng';
            case 'QUARTERLY':
                return 'Quý';
            case 'YEARLY':
                return 'Năm';
            default:
                return cycle;
        }
    };

    const getStatusColor = (
        status: string
    ): 'success' | 'danger' | 'warning' | 'info' | 'secondary' => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'EXPIRED':
                return 'danger';
            case 'CANCELLED':
                return 'secondary';
            case 'PENDING':
                return 'warning';
            case 'TRIAL':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang hoạt động';
            case 'EXPIRED':
                return 'Hết hạn';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'PENDING':
                return 'Đang chờ';
            case 'TRIAL':
                return 'Dùng thử';
            default:
                return status;
        }
    };

    // Helper function to render subscription history item
    const renderSubscriptionHistoryItem = (subscription: HospitalSubscription) => {
        const isActive = subscription.status === 'ACTIVE';
        const planName = subscription.subscriptionPlan?.name || 'Không xác định';
        const planPrice = subscription.subscriptionPlan?.price;
        const billingCycle = subscription.subscriptionPlan?.billingCycle || '';

        return (
            <div
                key={subscription.hospitalSubscriptionId}
                className="p-2 bg-light rounded border-start border-primary border-3"
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">
                        {planName}
                        {isActive && (
                            <span className="badge bg-success ms-2 fs-11">(Hiện tại)</span>
                        )}
                    </div>
                    <StatusBadge
                        status={subscription.status}
                        variant={getStatusColor(subscription.status)}
                        customText={getStatusText(subscription.status)}
                    />
                </div>
                <div className="row g-2 small">
                    <div className="col-md-3">
                        <strong>Giá:</strong>{' '}
                        {planPrice
                            ? formatPrice(planPrice) + ' / ' + getBillingCycleText(billingCycle)
                            : 'N/A'}
                    </div>
                    <div className="col-md-3">
                        <strong>Bắt đầu:</strong>{' '}
                        <span className="badge badge-soft-info fs-12">
                            {formatDate(subscription.startDate)}
                        </span>
                    </div>
                    <div className="col-md-3">
                        <strong>Hết hạn:</strong>{' '}
                        <span className="badge badge-soft-warning fs-12">
                            {formatDate(subscription.endDate)}
                        </span>
                    </div>
                    <div className="col-md-3">
                        <strong>Đăng ký:</strong>{' '}
                        <span className="badge badge-soft-secondary fs-12">
                            {formatDate(subscription.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to render subscription history list
    const renderSubscriptionHistory = (hospital: HospitalWithSubscription) => {
        const sortedSubscriptions = [...hospital.allSubscriptions].sort(
            (a: HospitalSubscription, b: HospitalSubscription) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return (
            <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td colSpan={6}>
                    <div className="p-3 bg-white rounded border">
                        <h6 className="fw-bold mb-3 pb-2 border-bottom">
                            Lịch Sử Đăng Ký/Nâng Cấp Gói
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            {sortedSubscriptions.map(renderSubscriptionHistoryItem)}
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Helper function to render main table row
    const renderHospitalRow = (hospital: HospitalWithSubscription) => {
        const isExpanded = expandedHospitals.has(hospital.hospitalId);
        const hasHistory =
            hospital.allSubscriptions.length > 1 ||
            (hospital.allSubscriptions.length === 1 &&
                hospital.allSubscriptions[0].status !== 'ACTIVE');
        const activeSubscription = hospital.activeSubscription;

        return (
            <React.Fragment key={hospital.hospitalId}>
                <tr>
                    <td style={{ width: '30px' }}>
                        {hasHistory && (
                            <button
                                onClick={() => toggleExpand(hospital.hospitalId)}
                                className="btn btn-sm btn-link p-0"
                                style={{ color: '#2e37a4' }}
                            >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                    </td>
                    <td style={{ minWidth: '250px' }}>
                        <div className="d-flex align-items-center">
                            <div className="avatar me-2">
                                <div className="avatar-title bg-primary-subtle text-primary rounded">
                                    <i className="ti ti-building-hospital fs-5"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="mb-0 fs-14 fw-semibold">{hospital.hospitalName}</h6>
                            </div>
                        </div>
                    </td>
                    <td style={{ minWidth: '200px' }}>
                        {activeSubscription ? (
                            <div>
                                <div className="fw-semibold mb-1">
                                    {activeSubscription.subscriptionPlan?.name || 'Không xác định'}
                                </div>
                                {activeSubscription.subscriptionPlan && (
                                    <div className="small text-muted">
                                        <span className="fw-bold text-primary">
                                            {formatPrice(activeSubscription.subscriptionPlan.price)}
                                        </span>{' '}
                                        /{' '}
                                        {getBillingCycleText(
                                            activeSubscription.subscriptionPlan.billingCycle
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-muted small">Chưa có gói</span>
                        )}
                    </td>
                    <td style={{ minWidth: '150px' }}>
                        {activeSubscription ? (
                            <div className="small">
                                <div className="mb-1">
                                    <strong>Bắt đầu:</strong> <br />
                                    <span className="badge badge-soft-info fs-12">
                                        {formatDate(activeSubscription.startDate)}
                                    </span>
                                </div>
                                <div>
                                    <strong>Hết hạn:</strong> <br />
                                    <span className="badge badge-soft-warning fs-12">
                                        {formatDate(activeSubscription.endDate)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-muted small fst-italic">Chưa đăng ký gói</span>
                        )}
                    </td>
                    <td style={{ minWidth: '120px' }}>
                        {activeSubscription ? (
                            <StatusBadge
                                status={activeSubscription.status}
                                variant={getStatusColor(activeSubscription.status)}
                                customText={getStatusText(activeSubscription.status)}
                            />
                        ) : (
                            <StatusBadge
                                status="NO_SUBSCRIPTION"
                                variant="secondary"
                                customText="Chưa đăng ký"
                            />
                        )}
                    </td>
                    <td className="action-item" style={{ minWidth: '100px' }}>
                        <button
                            onClick={() => toggleExpand(hospital.hospitalId)}
                            className="btn btn-sm btn-link p-0"
                            title="Xem lịch sử"
                            style={{ color: '#2e37a4', position: 'relative' }}
                        >
                            <i className="ti ti-eye fs-5"></i>
                            {hasHistory && (
                                <span
                                    className="badge bg-danger rounded-pill"
                                    style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        fontSize: '0.65rem',
                                        padding: '2px 5px',
                                    }}
                                >
                                    {hospital.allSubscriptions.length}
                                </span>
                            )}
                        </button>
                    </td>
                </tr>

                {/* History rows */}
                {isExpanded && hasHistory && renderSubscriptionHistory(hospital)}
            </React.Fragment>
        );
    };

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return (
                <TableSkeleton
                    columns={[
                        { type: 'actions', width: 30 },
                        { type: 'avatar', width: 200 },
                        { type: 'text', width: 200 },
                        { type: 'date', width: 150 },
                        { type: 'badge', width: 120 },
                        { type: 'actions', width: 100 },
                    ]}
                    rows={itemsPerPage}
                />
            );
        }

        if (paginatedHospitals.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <div className="text-muted">
                            <i className="ti ti-building-hospital fs-1 mb-3 d-block opacity-25"></i>
                            <h6 className="text-muted">Không có dữ liệu để hiển thị</h6>
                            <p className="small mb-0">Không có bệnh viện nào đăng ký gói dịch vụ</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return paginatedHospitals.map(renderHospitalRow);
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Đăng Ký Gói Của Bệnh Viện{' '}
                        <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                            Tổng Bệnh Viện: {filteredHospitals.length}
                        </span>
                    </h4>
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
                    <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                        <Link
                            to="/admin/subscription-plans/manage-hospital-subscriptions"
                            className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                        >
                            <i className="ti ti-list fs-14 text-body"></i>
                        </Link>
                        <Link
                            to="/admin/subscription-plans/manage-hospital-subscriptions"
                            className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                        >
                            <i className="ti ti-layout-grid fs-14 text-body"></i>
                        </Link>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        className="ms-2 fs-13"
                        icon="ti ti-refresh"
                        onClick={loadHospitalSubscriptions}
                    >
                        Làm Mới
                    </Button>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <div className="search-set mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <div className="table-search d-flex align-items-center mb-0">
                            <div className="search-input">
                                <label htmlFor="hospitalSearch" aria-label="Search hospitals">
                                    <input
                                        id="hospitalSearch"
                                        type="search"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm kiếm theo tên bệnh viện hoặc tên gói..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    ></input>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                    <ActionDropdown
                        type="sort"
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'with_subscription', label: 'Có gói đăng ký' },
                            { value: 'no_subscription', label: 'Chưa có gói' },
                            { value: 'ACTIVE', label: 'Đang hoạt động' },
                            { value: 'EXPIRED', label: 'Hết hạn' },
                            { value: 'CANCELLED', label: 'Đã hủy' },
                        ]}
                        selectedValue={selectedStatus}
                        onSelect={(value) => {
                            setSelectedStatus(value);
                            setCurrentPage(1);
                        }}
                        placeholder="Lọc theo trạng thái:"
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-nowrap datatable">
                    <thead className="thead-light">
                        <tr>
                            <th style={{ width: '30px' }}></th>
                            <th style={{ minWidth: '250px' }}>Bệnh Viện</th>
                            <th style={{ minWidth: '200px' }}>Gói Đang Sử Dụng</th>
                            <th style={{ minWidth: '150px' }}>Thời Gian</th>
                            <th style={{ minWidth: '120px' }}>Trạng Thái</th>
                            <th style={{ minWidth: '100px' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableBody()}</tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default ManageHospitalSubscriptions;
