import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import TableActions from '@/components/TableActions';
import useSubscription from '@/hooks/useSubscription';
import { SubscriptionPlan, deleteSubscriptionPlan } from '@/services/subscription.service';
import { getSortParams, SORT_OPTIONS } from '@/utils/sortUtils';

const ListSubscriptionPlans: React.FC = () => {
    const navigate = useNavigate();

    // Use subscription hook
    const { subscriptionPlans, loading, error, loadFilteredSubscriptionPlans, clearError } =
        useSubscription();

    // Local state for UI
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedBillingCycles, setSelectedBillingCycles] = useState<string[]>([]);
    const [tab, setTab] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');

    // Applied filters (after clicking "Lọc" button)
    const [appliedPlans, setAppliedPlans] = useState<string[]>([]);
    const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
    const [appliedBillingCycles, setAppliedBillingCycles] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for all plans (for filter modal)
    const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch plans on component mount
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        loadFilteredSubscriptionPlans({
            page: currentPage,
            pageSize: itemsPerPage,
            sortBy: sortParams.sortBy,
            sortOrder: sortParams.sortOrder,
        });
    }, [loadFilteredSubscriptionPlans, currentPage, itemsPerPage, sortBy]);

    // Handle search term changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                loadFilteredSubscriptionPlans({
                    name: searchTerm,
                    page: 1,
                    pageSize: itemsPerPage,
                });
                setCurrentPage(1);
            } else if (searchTerm.trim() === '') {
                const sortParams = getSortParams(sortBy);
                loadFilteredSubscriptionPlans({
                    page: 1,
                    pageSize: itemsPerPage,
                    sortBy: sortParams.sortBy,
                    sortOrder: sortParams.sortOrder,
                });
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, loadFilteredSubscriptionPlans, itemsPerPage, sortBy]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Fetch all plans for filter modal
    const fetchAllPlansForFilter = async () => {
        try {
            await loadFilteredSubscriptionPlans({
                page: 1,
                pageSize: 1000, // Get all plans for filter
            });
            setAllPlans(subscriptionPlans);
        } catch (error) {
            console.error('Error fetching plans for filter:', error);
        }
    };

    // Filtered plans based on applied filters
    const filteredPlans = useMemo(() => {
        let filtered = subscriptionPlans || [];

        if (appliedPlans.length > 0) {
            filtered = filtered.filter((plan) => appliedPlans.includes(plan.id));
        }

        if (appliedStatuses.length > 0) {
            filtered = filtered.filter((plan) => appliedStatuses.includes(plan.status));
        }

        if (appliedBillingCycles.length > 0) {
            filtered = filtered.filter((plan) => appliedBillingCycles.includes(plan.billingCycle));
        }

        return filtered;
    }, [subscriptionPlans, appliedPlans, appliedStatuses, appliedBillingCycles]);

    // Filter theo tab
    const tabs = [
        { key: 'MONTHLY', label: 'Gói theo Tháng' },
        { key: 'QUARTERLY', label: 'Gói theo Quý' },
        { key: 'YEARLY', label: 'Gói theo Năm' },
    ];

    const tabbedPlans = filteredPlans.filter((p) => p.billingCycle === tab);
    const paginatedFilteredPlans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tabbedPlans.slice(startIndex, startIndex + itemsPerPage);
    }, [tabbedPlans, currentPage, itemsPerPage]);

    // Calculate effective total pages
    const effectiveTotalPages = Math.ceil(filteredPlans.length / itemsPerPage);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Handle add click
    const handleAddClick = useCallback(() => {
        navigate('/admin/subscription-plans/add');
    }, [navigate]);

    // Handle edit click
    const handleEditClickWithPlan = useCallback(
        (plan: SubscriptionPlan) => {
            navigate(`/admin/subscription-plans/edit/${plan.id}`);
        },
        [navigate]
    );

    // Handle delete click
    const handleDeleteClick = useCallback((plan: SubscriptionPlan) => {
        setPlanToDelete(plan);
        setShowDeleteModal(true);
    }, []);

    // Handle delete confirm
    const handleDeleteConfirm = useCallback(async () => {
        if (planToDelete) {
            try {
                const response = await deleteSubscriptionPlan(planToDelete.id);

                if (response.success) {
                    toast.success(`Đã xóa gói dịch vụ "${planToDelete.name}"`);
                    setShowDeleteModal(false);
                    setPlanToDelete(null);
                    // Refresh the list
                    const sortParams = getSortParams(sortBy);
                    loadFilteredSubscriptionPlans({
                        page: currentPage,
                        pageSize: itemsPerPage,
                        sortBy: sortParams.sortBy,
                        sortOrder: sortParams.sortOrder,
                    });
                }
            } catch (error: any) {
                toast.error(error.message || 'Có lỗi xảy ra khi xóa gói dịch vụ');
            }
        }
    }, [planToDelete, sortBy, currentPage, itemsPerPage, loadFilteredSubscriptionPlans]);

    // Handle delete cancel
    const handleDeleteCancel = useCallback(() => {
        setShowDeleteModal(false);
        setPlanToDelete(null);
    }, []);

    // Handle filter submit
    const handleFilterSubmit = useCallback(() => {
        setAppliedPlans([...selectedPlans]);
        setAppliedStatuses([...selectedStatuses]);
        setAppliedBillingCycles([...selectedBillingCycles]);
        setCurrentPage(1);
        setShowFilterModal(false);
    }, [selectedPlans, selectedStatuses, selectedBillingCycles]);

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setAppliedPlans([]);
        setAppliedStatuses([]);
        setAppliedBillingCycles([]);
        setSelectedPlans([]);
        setSelectedStatuses([]);
        setSelectedBillingCycles([]);
        setCurrentPage(1);
    }, []);

    // Handle reset filter
    const handleResetFilter = useCallback((filterType: string) => {
        switch (filterType) {
            case 'plans':
                setSelectedPlans([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
                break;
            case 'billingCycles':
                setSelectedBillingCycles([]);
                break;
        }
    }, []);

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return (
                <TableSkeleton
                    columns={[
                        { type: 'avatar', width: 150 }, // Tên & Mô tả
                        { type: 'text', width: 100 }, // Giá
                        { type: 'text', width: 150, lines: 3 }, // Giới Hạn
                        { type: 'text', width: 200, lines: 4 }, // Tính Năng
                        { type: 'badge', width: 90 }, // Trạng Thái
                        { type: 'actions', items: 2 }, // Thao Tác
                    ]}
                    rows={itemsPerPage}
                />
            );
        }

        if (paginatedFilteredPlans.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <div className="text-muted">
                            <i className="ti ti-package fs-1 mb-3 d-block opacity-25"></i>
                            <h6 className="text-muted">Không có gói dịch vụ nào</h6>
                            <p className="small mb-0">Hãy thêm gói dịch vụ mới để bắt đầu</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return paginatedFilteredPlans.map((plan) => {
            // Parse features JSON
            let features: { text: string; description?: string }[] = [];
            try {
                if (plan.features) {
                    features = JSON.parse(plan.features);
                }
            } catch (e) {
                console.error('Error parsing features:', e);
            }

            return (
                <tr key={plan.id}>
                    <td style={{ minWidth: '180px' }}>
                        <div className="d-flex align-items-start">
                            <div className="avatar me-2">
                                <div className="avatar-title bg-primary-subtle text-primary rounded">
                                    <i className="ti ti-package fs-5"></i>
                                </div>
                            </div>
                            <div>
                                <h6 className="mb-1 fs-14">{plan.name}</h6>
                                <span className="badge badge-soft-info fs-12">
                                    {plan.billingCycle === 'MONTHLY' && 'Theo tháng'}
                                    {plan.billingCycle === 'QUARTERLY' && 'Theo quý'}
                                    {plan.billingCycle === 'YEARLY' && 'Theo năm'}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td style={{ minWidth: '140px' }}>
                        <span className="fw-bold text-primary fs-6 text-nowrap">
                            {plan.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                    </td>
                    <td style={{ minWidth: '150px' }}>
                        <div className="small">
                            <div className="mb-1">
                                <i className="ti ti-users text-info me-1"></i>
                                <strong>Bác sĩ:</strong>{' '}
                                {plan.maxDoctors === null ? (
                                    <span className="badge badge-soft-success">Không giới hạn</span>
                                ) : (
                                    plan.maxDoctors
                                )}
                            </div>
                            <div className="mb-1">
                                <i className="ti ti-stethoscope text-warning me-1"></i>
                                <strong>Chuyên khoa:</strong>{' '}
                                {plan.maxSpecialties === null ? (
                                    <span className="badge badge-soft-success">Không giới hạn</span>
                                ) : (
                                    plan.maxSpecialties
                                )}
                            </div>
                            <div>
                                <i className="ti ti-calendar text-danger me-1"></i>
                                <strong>Lịch hẹn:</strong>{' '}
                                {plan.maxAppointments === null ? (
                                    <span className="badge badge-soft-success">Không giới hạn</span>
                                ) : (
                                    plan.maxAppointments
                                )}
                            </div>
                        </div>
                    </td>
                    <td
                        style={{
                            minWidth: '200px',
                            maxWidth: '300px',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                        }}
                    >
                        {features.length > 0 ? (
                            <ul className="list-unstyled mb-0 small" style={{ maxWidth: '280px' }}>
                                {features.slice(0, 3).map((feature, idx) => (
                                    <li
                                        key={`feature-${idx}-${feature.text || ''}`}
                                        className="mb-1"
                                        style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                                    >
                                        <i className="ti ti-check text-success me-1"></i>
                                        <span
                                            style={{
                                                display: 'inline',
                                                wordWrap: 'break-word',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                                {features.length > 3 && (
                                    <li className="text-muted">
                                        <i className="ti ti-dots me-1"></i>
                                        <span>+{features.length - 3} tính năng khác</span>
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <span className="text-muted small">Chưa có tính năng</span>
                        )}
                    </td>
                    <td style={{ minWidth: '100px' }}>
                        <StatusBadge status={plan.status} />
                    </td>
                    <td className="action-item" style={{ minWidth: '80px' }}>
                        <TableActions
                            id={plan.id}
                            onEdit={() => handleEditClickWithPlan(plan)}
                            onDelete={() => handleDeleteClick(plan)}
                            showEdit={true}
                            showDelete={true}
                            showHide={false}
                            showView={false}
                        />
                    </td>
                </tr>
            );
        });
    };

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Gói Dịch Vụ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Gói Dịch Vụ:{' '}
                                {appliedPlans.length > 0
                                    ? filteredPlans.length
                                    : subscriptionPlans.length}
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
                                to="/admins/subscription-plans"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/admins/subscription-plans"
                                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-layout-grid fs-14 text-body"></i>
                            </Link>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            className="ms-2 fs-13"
                            icon="ti ti-plus"
                            onClick={handleAddClick}
                        >
                            Thêm Gói Dịch Vụ
                        </Button>
                    </div>
                </div>

                {/* Tabs hiển thị dạng nav */}
                <ul className="nav nav-tabs mb-3">
                    {tabs.map((t) => (
                        <li className="nav-item" key={t.key}>
                            <button
                                className={`nav-link${tab === t.key ? ' active' : ''}`}
                                onClick={() => setTab(t.key as any)}
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label
                                        htmlFor="planSearch"
                                        aria-label="Search subscription plans"
                                    >
                                        <input
                                            id="planSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm gói dịch vụ"
                                            aria-controls="DataTables_Table_0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        ></input>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                        <Button
                            variant="white"
                            size="md"
                            className="me-2 fs-14 py-1 border d-inline-flex text-dark align-items-center"
                            icon="ti ti-filter text-gray-5"
                            onClick={async () => {
                                // Sync selected filters with applied filters when opening modal
                                setSelectedPlans([...appliedPlans]);
                                setSelectedStatuses([...appliedStatuses]);
                                setSelectedBillingCycles([...appliedBillingCycles]);
                                // Fetch all plans for filter modal
                                await fetchAllPlansForFilter();
                                setShowFilterModal(true);
                            }}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={SORT_OPTIONS}
                            selectedValue={sortBy}
                            onSelect={(newSortBy) => {
                                setSortBy(newSortBy);
                                setCurrentPage(1);

                                // Fetch plans with new sort parameters
                                if (appliedPlans.length === 0) {
                                    const sortParams = getSortParams(newSortBy);
                                    loadFilteredSubscriptionPlans({
                                        page: 1,
                                        pageSize: itemsPerPage,
                                        sortBy: sortParams.sortBy,
                                        sortOrder: sortParams.sortOrder,
                                    });
                                }
                            }}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                {/* Applied Filters */}
                {(appliedPlans.length > 0 ||
                    appliedStatuses.length > 0 ||
                    appliedBillingCycles.length > 0) && (
                    <div className="applied-filters mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <span className="text-muted fs-14">Bộ lọc đã áp dụng:</span>

                            {appliedPlans.map((planId) => {
                                const plan = subscriptionPlans.find((p) => p.id === planId);
                                return plan ? (
                                    <span key={planId} className="badge badge-soft-primary fs-12">
                                        {plan.name}
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white ms-1"
                                            onClick={() => {
                                                const newAppliedPlans = appliedPlans.filter(
                                                    (id) => id !== planId
                                                );
                                                setAppliedPlans(newAppliedPlans);
                                                setSelectedPlans(newAppliedPlans);
                                            }}
                                        />
                                    </span>
                                ) : null;
                            })}

                            {appliedStatuses.map((status) => (
                                <span key={status} className="badge badge-soft-secondary fs-12">
                                    {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white ms-1"
                                        onClick={() => {
                                            const newAppliedStatuses = appliedStatuses.filter(
                                                (s) => s !== status
                                            );
                                            setAppliedStatuses(newAppliedStatuses);
                                            setSelectedStatuses(newAppliedStatuses);
                                        }}
                                    />
                                </span>
                            ))}

                            {appliedBillingCycles.map((cycle) => {
                                const getCycleLabel = () => {
                                    if (cycle === 'MONTHLY') return 'Hàng tháng';
                                    if (cycle === 'QUARTERLY') return 'Hàng quý';
                                    return 'Hàng năm';
                                };
                                return (
                                    <span key={cycle} className="badge badge-soft-info fs-12">
                                        {getCycleLabel()}
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white ms-1"
                                            onClick={() => {
                                                const newAppliedCycles =
                                                    appliedBillingCycles.filter((c) => c !== cycle);
                                                setAppliedBillingCycles(newAppliedCycles);
                                                setSelectedBillingCycles(newAppliedCycles);
                                            }}
                                        />
                                    </span>
                                );
                            })}

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary fs-12"
                                onClick={handleClearFilters}
                            >
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th style={{ minWidth: '180px' }}>Tên Gói</th>
                                <th style={{ minWidth: '140px' }}>Giá</th>
                                <th style={{ minWidth: '150px' }}>Giới Hạn</th>
                                <th
                                    style={{ minWidth: '200px', width: '250px', maxWidth: '300px' }}
                                >
                                    Tính Năng
                                </th>
                                <th style={{ minWidth: '100px' }}>Trạng Thái</th>
                                <th style={{ minWidth: '80px' }}>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>

                {/* Pagination */}
                {effectiveTotalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={effectiveTotalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xóa gói dịch vụ"
                message={`Bạn có chắc chắn muốn xóa gói dịch vụ "${planToDelete?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Có, Xóa"
                cancelText="Hủy"
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Bộ lọc gói dịch vụ"
                fields={[
                    {
                        name: 'plans',
                        label: 'Gói Dịch Vụ',
                        type: 'multiselect',
                        options: (allPlans || []).map((plan) => ({
                            value: plan.id,
                            label: plan.name,
                        })),
                        value: selectedPlans,
                        onChange: setSelectedPlans,
                        resetValue: () => handleResetFilter('plans'),
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng Thái',
                        type: 'multiselect',
                        options: [
                            { value: 'ACTIVE', label: 'Hoạt động' },
                            { value: 'INACTIVE', label: 'Không hoạt động' },
                        ],
                        value: selectedStatuses,
                        onChange: setSelectedStatuses,
                        resetValue: () => handleResetFilter('statuses'),
                    },
                    {
                        name: 'billingCycles',
                        label: 'Chu Kỳ Thanh Toán',
                        type: 'multiselect',
                        options: [
                            { value: 'MONTHLY', label: 'Hàng tháng' },
                            { value: 'QUARTERLY', label: 'Hàng quý' },
                            { value: 'YEARLY', label: 'Hàng năm' },
                        ],
                        value: selectedBillingCycles,
                        onChange: setSelectedBillingCycles,
                        resetValue: () => handleResetFilter('billingCycles'),
                    },
                ]}
            />
        </>
    );
};

export default ListSubscriptionPlans;
