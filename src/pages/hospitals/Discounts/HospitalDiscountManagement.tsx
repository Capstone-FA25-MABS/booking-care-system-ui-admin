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
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
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
        const statusVariants: Record<DiscountStatus, string> = {
            [DiscountStatus.ACTIVE]: 'badge-soft-success',
            [DiscountStatus.INACTIVE]: 'badge-soft-warning',
            [DiscountStatus.EXPIRED]: 'badge-soft-danger',
        };

        return <span className={`badge ${statusVariants[status]}`}>{getStatusText(status)}</span>;
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!hospitalProfile) {
        return (
            <div className="content">
                <div className="alert alert-danger d-flex align-items-center gap-2">
                    <i className="ti ti-alert-circle fs-4"></i>
                    <span>Không tìm thấy hồ sơ bệnh viện</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">Quản lý mã giảm giá</h4>
                        <p className="text-muted mb-0 mt-1">
                            Quản lý và theo dõi các mã giảm giá của bệnh viện
                        </p>
                    </div>
                    <div className="text-end d-flex gap-2">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={openCreateModal}
                            icon="ti ti-plus"
                        >
                            Tạo Mã Giảm Giá
                        </Button>
                    </div>
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

                {/* Discount Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th>Mã Code</th>
                                <th>Tên Mã</th>
                                <th>Loại</th>
                                <th>Giá Trị</th>
                                <th>Sử Dụng</th>
                                <th>Thời Gian</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`skeleton-${index}`}>
                                        {Array.from({ length: 8 }).map((_, colIndex) => (
                                            <td key={`skeleton-col-${colIndex}`}>
                                                <div className={styles.skeleton}></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : discounts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <i className="ti ti-discount-off fs-1 text-muted"></i>
                                        <p className="mt-2 text-muted">Không có mã giảm giá nào</p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={openCreateModal}
                                            icon="ti ti-plus"
                                        >
                                            Tạo mã giảm giá đầu tiên
                                        </Button>
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
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

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
                                    <i className="ti ti-barcode me-2" aria-hidden="true"></i> Mã
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
                                            className="ti ti-info-circle me-1"
                                            aria-hidden="true"
                                        ></i>{' '}
                                        Mã Code không thể chỉnh sửa
                                    </small>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="discountName">
                                    <i className="ti ti-tag me-2" aria-hidden="true"></i> Tên Mã
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
                                    <i className="ti ti-percentage me-2" aria-hidden="true"></i>{' '}
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
                                    <i className="ti ti-gift me-2" aria-hidden="true"></i> Giá Trị{' '}
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
                                    <i className="ti ti-users me-2" aria-hidden="true"></i> Giới Hạn
                                    Sử Dụng
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
                                    <i className="ti ti-calendar me-2"></i> Ngày Bắt Đầu{' '}
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
                                    <i className="ti ti-calendar-event me-2"></i> Ngày Kết Thúc{' '}
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
                                    <i className="ti ti-align-left me-2" aria-hidden="true"></i> Mô
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
                        <Button
                            type="button"
                            variant="light"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingDiscount(null);
                            }}
                        >
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            loading={loading}
                            icon={editingDiscount ? 'ti ti-device-floppy' : 'ti ti-plus'}
                        >
                            {editingDiscount ? 'Cập Nhật' : 'Tạo Mã'}
                        </Button>
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
        </>
    );
};

export default HospitalDiscountManagement;
