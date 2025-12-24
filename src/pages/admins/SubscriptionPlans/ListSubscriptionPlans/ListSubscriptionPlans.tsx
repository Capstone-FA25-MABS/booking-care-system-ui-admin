import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
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

    const [tab, setTab] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
    const [sortBy, setSortBy] = useState<string>('Mới thêm gần đây');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1); // Reset to page 1 when search changes
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Fetch plans when page, sort, or debounced search changes
    useEffect(() => {
        const sortParams = getSortParams(sortBy);
        if (debouncedSearchTerm.trim()) {
            loadFilteredSubscriptionPlans({
                name: debouncedSearchTerm,
                page: currentPage,
                pageSize: itemsPerPage,
            });
        } else {
            loadFilteredSubscriptionPlans({
                page: currentPage,
                pageSize: itemsPerPage,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, sortBy, debouncedSearchTerm]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Filter theo tab
    const tabs = [
        { key: 'MONTHLY', label: 'Gói theo tháng' },
        { key: 'QUARTERLY', label: 'Gói theo quý' },
        { key: 'YEARLY', label: 'Gói theo năm' },
    ];

    const tabbedPlans = subscriptionPlans.filter((p) => p.billingCycle === tab);
    const paginatedFilteredPlans = tabbedPlans.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate effective total pages
    const effectiveTotalPages = Math.ceil(tabbedPlans.length / itemsPerPage);

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

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return (
                <TableSkeleton
                    columns={[
                        { type: 'avatar', width: 150 }, // Tên & mô tả
                        { type: 'text', width: 100 }, // Giá
                        { type: 'text', width: 150, lines: 3 }, // Giới hạn
                        { type: 'text', width: 200, lines: 4 }, // Tính năng
                        { type: 'badge', width: 90 }, // Trạng thái
                        { type: 'actions', items: 2 }, // Thao tác
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
                            <div className="mb-1">
                                <i className="ti ti-medical-cross text-success me-1"></i>
                                <strong>Dịch vụ:</strong>{' '}
                                {plan.maxServices === null ? (
                                    <span className="badge badge-soft-success">Không giới hạn</span>
                                ) : (
                                    plan.maxServices
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
                            Danh sách gói dịch vụ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng gói dịch vụ: {subscriptionPlans.length}
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
                            Thêm gói dịch vụ
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
                        <ActionDropdown
                            type="sort"
                            options={SORT_OPTIONS}
                            selectedValue={sortBy}
                            onSelect={(newSortBy) => {
                                setSortBy(newSortBy);
                                setCurrentPage(1);
                                const sortParams = getSortParams(newSortBy);
                                loadFilteredSubscriptionPlans({
                                    page: 1,
                                    pageSize: itemsPerPage,
                                    sortBy: sortParams.sortBy,
                                    sortOrder: sortParams.sortOrder,
                                });
                            }}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th style={{ minWidth: '180px' }}>Tên gói</th>
                                <th style={{ minWidth: '140px' }}>Giá</th>
                                <th style={{ minWidth: '150px' }}>Giới hạn</th>
                                <th
                                    style={{ minWidth: '200px', width: '250px', maxWidth: '300px' }}
                                >
                                    Tính năng
                                </th>
                                <th style={{ minWidth: '100px' }}>Trạng thái</th>
                                <th style={{ minWidth: '80px' }}>Thao tác</th>
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
                confirmText="Có, xóa"
                cancelText="Hủy"
            />
        </>
    );
};

export default ListSubscriptionPlans;
