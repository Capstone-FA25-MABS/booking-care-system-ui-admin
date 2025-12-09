// src/pages/hospitals/Discounts/HospitalDiscountManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { DiscountService } from '@/services/discount.service';
import {
    Discount,
    CreateDiscountRequest,
    UpdateDiscountRequest,
    DiscountQueryParams,
} from '@/types/discount.types';
import { DiscountStatus, DiscountType } from '@/enums/discount.enums';
import { toast } from 'react-toastify';
import BaseModal from '@/components/Modal/BaseModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import DiscountStatistics from './components/DiscountStatistics';
import DiscountFilters from './components/DiscountFilters';
import DiscountTableRow from './components/DiscountTableRow';
import styles from './HospitalDiscountManagement.module.scss';

const HospitalDiscountManagement: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DiscountStatus | ''>('');
    const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateDiscountRequest>({
        code: '',
        name: '',
        description: '',
        hospitalId: hospitalProfile?.id || '',
        amount: 0,
        discountType: DiscountType.PERCENTAGE,
        startDate: '',
        endDate: '',
        maxUses: undefined,
    });

    useEffect(() => {
        if (hospitalProfile?.id) {
            fetchDiscounts();
        }
    }, [hospitalProfile, currentPage, searchTerm, statusFilter]);

    const fetchDiscounts = async () => {
        if (!hospitalProfile?.id) {
            toast.error('Không tìm thấy hồ sơ bệnh viện');
            return;
        }

        setLoading(true);
        try {
            const params: DiscountQueryParams = {
                hospitalId: hospitalProfile.id,
                page: currentPage,
                limit: pageSize,
                searchTerm: searchTerm || undefined,
                status: statusFilter || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            };

            const response = await DiscountService.getDiscounts(params);
            setDiscounts(response.data?.discounts || []);
            setTotalCount(response.data?.totalCount || 0);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const statistics = useMemo(() => {
        const activeCount = discounts.filter((d) => d.status === DiscountStatus.ACTIVE).length;
        const expiredCount = discounts.filter((d) => d.status === DiscountStatus.EXPIRED).length;
        const totalUsage = discounts.reduce((sum, d) => sum + d.usesCount, 0);

        return {
            total: totalCount,
            active: activeCount,
            expired: expiredCount,
            totalUsage,
        };
    }, [discounts, totalCount]);

    const handleCreateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalProfile?.id) return;

        setLoading(true);
        try {
            const request: CreateDiscountRequest = {
                ...formData,
                hospitalId: hospitalProfile.id,
            };

            await DiscountService.createDiscount(request);
            toast.success('Tạo mã giảm giá thành công');
            setIsModalOpen(false);
            resetForm();
            fetchDiscounts();
        } catch (error: any) {
            toast.error(error.message || 'Không thể tạo mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDiscount) return;

        setLoading(true);
        try {
            const request: UpdateDiscountRequest = {
                id: editingDiscount.id,
                ...formData,
            };

            await DiscountService.updateDiscount(request);
            toast.success('Cập nhật mã giảm giá thành công');
            setIsModalOpen(false);
            setEditingDiscount(null);
            resetForm();
            fetchDiscounts();
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDiscount = async (id: string) => {
        setLoading(true);
        try {
            await DiscountService.deleteDiscount(id);
            toast.success('Xóa mã giảm giá thành công');
            setDeletingDiscountId(null);
            fetchDiscounts();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (discount: Discount) => {
        setLoading(true);
        try {
            if (discount.status === DiscountStatus.ACTIVE) {
                await DiscountService.deactivateDiscount(discount.id);
                toast.success('Đã vô hiệu hóa mã giảm giá');
            } else {
                await DiscountService.activateDiscount(discount.id);
                toast.success('Đã kích hoạt mã giảm giá');
            }
            fetchDiscounts();
        } catch (error: any) {
            toast.error(error.message || 'Không thể thay đổi trạng thái mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setEditingDiscount(null);
        setIsModalOpen(true);
    };

    const openEditModal = (discount: Discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            name: discount.name,
            description: discount.description || '',
            hospitalId: discount.hospitalId,
            amount: discount.amount,
            discountType: discount.discountType,
            startDate: discount.startDate.split('T')[0],
            endDate: discount.endDate.split('T')[0],
            maxUses: discount.maxUses,
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            hospitalId: hospitalProfile?.id || '',
            amount: 0,
            discountType: DiscountType.PERCENTAGE,
            startDate: '',
            endDate: '',
            maxUses: undefined,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getDiscountTypeText = (type: DiscountType): string => {
        switch (type) {
            case DiscountType.PERCENTAGE:
                return 'Phần trăm';
            case DiscountType.FIXED_AMOUNT:
                return 'Số tiền cố định';
            default:
                return String(type);
        }
    };

    const getStatusText = (status: DiscountStatus): string => {
        switch (status) {
            case DiscountStatus.ACTIVE:
                return 'Đang hoạt động';
            case DiscountStatus.INACTIVE:
                return 'Không hoạt động';
            case DiscountStatus.EXPIRED:
                return 'Đã hết hạn';
            default:
                return String(status);
        }
    };

    const getStatusBadge = (status: DiscountStatus) => {
        const statusClasses = {
            [DiscountStatus.ACTIVE]: styles.statusActive,
            [DiscountStatus.INACTIVE]: styles.statusInactive,
            [DiscountStatus.EXPIRED]: styles.statusExpired,
        };

        return (
            <span className={`${styles.statusBadge} ${statusClasses[status]}`}>
                {getStatusText(status)}
            </span>
        );
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    if (!hospitalProfile) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <i className="fas fa-exclamation-circle"></i>
                    <span>Không tìm thấy hồ sơ bệnh viện</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <i className="fas fa-tags"></i>
                    </div>
                    <div>
                        <h1>Quản Lý Mã Giảm Giá</h1>
                        <p>Quản lý và theo dõi các mã giảm giá của bệnh viện</p>
                    </div>
                </div>
                <button className={styles.createBtn} onClick={openCreateModal}>
                    <i className="fas fa-plus-circle"></i>
                    <span>Tạo Mã Giảm Giá</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <DiscountStatistics statistics={statistics} />

            {/* Filters */}
            <DiscountFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={(value) => setStatusFilter(value)}
            />

            {/* Discount List */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>
                                        <i className="fas fa-barcode"></i> Mã Code
                                    </th>
                                    <th>
                                        <i className="fas fa-tag"></i> Tên Mã
                                    </th>
                                    <th>
                                        <i className="fas fa-percentage"></i> Loại
                                    </th>
                                    <th>
                                        <i className="fas fa-gift"></i> Giá Trị
                                    </th>
                                    <th>
                                        <i className="fas fa-chart-line"></i> Sử Dụng
                                    </th>
                                    <th>
                                        <i className="fas fa-calendar-alt"></i> Thời Gian
                                    </th>
                                    <th>
                                        <i className="fas fa-info-circle"></i> Trạng Thái
                                    </th>
                                    <th>
                                        <i className="fas fa-cog"></i> Hành Động
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.noData}>
                                            <div className={styles.noDataContent}>
                                                <i className="fas fa-inbox"></i>
                                                <p>Không có mã giảm giá nào</p>
                                                <button
                                                    onClick={openCreateModal}
                                                    className={styles.noDataBtn}
                                                >
                                                    Tạo mã giảm giá đầu tiên
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    discounts.map((discount) => (
                                        <DiscountTableRow
                                            key={discount.id}
                                            discount={discount}
                                            onEdit={openEditModal}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={(id) => setDeletingDiscountId(id)}
                                            formatDate={formatDate}
                                            getDiscountTypeText={getDiscountTypeText}
                                            getStatusBadge={getStatusBadge}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                <i className="fas fa-chevron-left"></i>
                                <span>Trước</span>
                            </button>
                            <div className={styles.pageNumbers}>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`${styles.pageNumber} ${
                                                currentPage === pageNum ? styles.active : ''
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                                className={styles.pageBtn}
                            >
                                <span>Tiếp</span>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            <BaseModal
                isOpen={isModalOpen}
                title={editingDiscount ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
                titleId="discount-modal-title"
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDiscount(null);
                }}
                size="lg"
            >
                <form onSubmit={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}>
                    <div
                        className="modal-body"
                        style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}
                    >
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountCode">
                                    <i className="fas fa-barcode me-2" aria-hidden="true"></i> Mã
                                    Code <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="discountCode"
                                    type="text"
                                    className="form-control"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            code: e.target.value.toUpperCase(),
                                        })
                                    }
                                    required
                                    placeholder="VD: SUMMER2025"
                                    disabled={!!editingDiscount}
                                    title={editingDiscount ? 'Mã Code không thể chỉnh sửa' : ''}
                                />
                                {editingDiscount && (
                                    <small className="text-muted d-block mt-1">
                                        <i
                                            className="fas fa-info-circle me-1"
                                            aria-hidden="true"
                                        ></i>{' '}
                                        Mã Code không thể chỉnh sửa
                                    </small>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountName">
                                    <i className="fas fa-tag me-2" aria-hidden="true"></i> Tên Mã
                                    Giảm Giá <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="discountName"
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    placeholder="VD: Giảm giá mùa hè"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountType">
                                    <i className="fas fa-percentage me-2" aria-hidden="true"></i>{' '}
                                    Loại Giảm Giá
                                </label>
                                <select
                                    id="discountType"
                                    className="form-select"
                                    value={formData.discountType}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discountType: e.target.value as unknown as DiscountType,
                                        })
                                    }
                                >
                                    <option value={DiscountType.PERCENTAGE}>Phần trăm (%)</option>
                                    <option value={DiscountType.FIXED_AMOUNT}>
                                        Số tiền cố định (VNĐ)
                                    </option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountAmount">
                                    <i className="fas fa-gift me-2" aria-hidden="true"></i> Giá Trị{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="discountAmount"
                                    type="number"
                                    className="form-control"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount: Number.parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                    min="0"
                                    step={
                                        formData.discountType === DiscountType.PERCENTAGE
                                            ? '0.01'
                                            : '1000'
                                    }
                                    max={
                                        formData.discountType === DiscountType.PERCENTAGE
                                            ? '100'
                                            : undefined
                                    }
                                    placeholder={
                                        formData.discountType === DiscountType.PERCENTAGE
                                            ? 'VD: 10'
                                            : 'VD: 50000'
                                    }
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountMaxUses">
                                    <i className="fas fa-users me-2" aria-hidden="true"></i> Giới
                                    Hạn Sử Dụng
                                </label>
                                <input
                                    id="discountMaxUses"
                                    type="number"
                                    className="form-control"
                                    value={formData.maxUses || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxUses: e.target.value
                                                ? Number.parseInt(e.target.value, 10)
                                                : undefined,
                                        })
                                    }
                                    min="1"
                                    placeholder="Không giới hạn"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountStartDate">
                                    <i className="fas fa-calendar-day me-2"></i> Ngày Bắt Đầu{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="discountStartDate"
                                    type="date"
                                    className="form-control"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startDate: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountEndDate">
                                    <i className="fas fa-calendar-check me-2"></i> Ngày Kết Thúc{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="discountEndDate"
                                    type="date"
                                    className="form-control"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endDate: e.target.value })
                                    }
                                    required
                                    min={formData.startDate}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label" htmlFor="discountDescription">
                                    <i className="fas fa-align-left me-2" aria-hidden="true"></i> Mô
                                    Tả
                                </label>
                                <textarea
                                    id="discountDescription"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    placeholder="Mô tả chi tiết về mã giảm giá (không bắt buộc)"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingDiscount(null);
                            }}
                        >
                            <i className="fas fa-times-circle me-2" aria-hidden="true"></i> Hủy Bỏ
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {(() => {
                                let iconClass;
                                let buttonText;

                                if (loading) {
                                    iconClass = 'fas fa-spinner fa-spin me-2';
                                    buttonText = 'Đang xử lý...';
                                } else if (editingDiscount) {
                                    iconClass = 'fas fa-save me-2';
                                    buttonText = 'Cập Nhật';
                                } else {
                                    iconClass = 'fas fa-plus-circle me-2';
                                    buttonText = 'Tạo Mã';
                                }

                                return (
                                    <>
                                        <i className={iconClass} aria-hidden="true"></i>{' '}
                                        {buttonText}
                                    </>
                                );
                            })()}
                        </button>
                    </div>
                </form>
            </BaseModal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={deletingDiscountId !== null}
                onClose={() => setDeletingDiscountId(null)}
                onConfirm={() => {
                    if (deletingDiscountId) {
                        handleDeleteDiscount(deletingDiscountId);
                    }
                }}
                title="Xác Nhận Xóa"
                message="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
};

export default HospitalDiscountManagement;
