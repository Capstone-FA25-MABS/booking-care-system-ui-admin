import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { AppFooter } from '@/components/AppFooter';
import { Account } from '@/types/auth.types';
import {
    getAccountsByRole,
    toggleBanUnbanAccount,
    lockAccount,
    unlockAccount,
} from '@/services/auth.service';
import { Role } from '@/enums/common.enums';
import Pagination from '@/components/Pagination';
import ActionDropdown from '@/components/ActionDropdown';

// Map URL role param to Role enum
const getRoleFromParam = (roleParam: string | null): Role => {
    switch (roleParam) {
        case 'Patient':
            return Role.PATIENT;
        case 'Doctor':
            return Role.DOCTOR;
        case 'Staff':
            return Role.STAFF;
        default:
            return Role.PATIENT;
    }
};

// Get role label in Vietnamese
const getRoleLabel = (role: Role): string => {
    switch (role) {
        case Role.PATIENT:
            return 'Bệnh Nhân';
        case Role.DOCTOR:
            return 'Bác Sĩ';
        case Role.STAFF:
            return 'Bệnh Viện';
        default:
            return 'Tài Khoản';
    }
};

// Sort options for dropdown
const sortOptions = [
    { value: 'CreatedAt_desc', label: 'Mới nhất', direction: 'desc' as const },
    { value: 'CreatedAt_asc', label: 'Cũ nhất', direction: 'asc' as const },
    { value: 'FullName_asc', label: 'Tên A-Z', direction: 'asc' as const },
    { value: 'FullName_desc', label: 'Tên Z-A', direction: 'desc' as const },
    { value: 'Email_asc', label: 'Email A-Z', direction: 'asc' as const },
    { value: 'Email_desc', label: 'Email Z-A', direction: 'desc' as const },
];

// Helper function to get toggle active title
const getToggleActiveTitle = (isLocked: boolean, status: string): string => {
    if (isLocked) {
        return 'Không thể thay đổi trạng thái khi tài khoản đang bị khóa';
    }
    return status === 'ACTIVE'
        ? 'Bật (Hoạt động) - Click để tắt'
        : 'Tắt (Vô hiệu hóa) - Click để bật';
};

// Helper function to get toggle lock title
const getToggleLockTitle = (isLocked: boolean): string => {
    return isLocked ? 'Đang khóa - Click để mở khóa' : 'Đang mở - Click để khóa tài khoản';
};

// Skeleton row component for loading state
const SkeletonRow: React.FC = () => {
    const skeletonClass = 'bg-light rounded placeholder-glow';
    const skeletonStyle = {
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    return (
        <tr>
            {/* Column 1: Name with Avatar */}
            <td>
                <div className="d-flex align-items-center">
                    <div
                        className="avatar me-2 bg-light rounded-circle placeholder-glow"
                        style={{ width: '40px', height: '40px', ...skeletonStyle }}
                    />
                    <div className="flex-grow-1">
                        <div
                            className={`${skeletonClass} mb-2`}
                            style={{ height: '14px', width: '120px', ...skeletonStyle }}
                        />
                    </div>
                </div>
            </td>
            {/* Column 2: Email */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '14px', width: '180px', ...skeletonStyle }}
                />
            </td>
            {/* Column 3: Phone */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '14px', width: '100px', ...skeletonStyle }}
                />
            </td>
            {/* Column 4: Address */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '14px', width: '150px', ...skeletonStyle }}
                />
            </td>
            {/* Column 5: Toggle Active */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '24px', width: '50px', ...skeletonStyle }}
                />
            </td>
            {/* Column 6: Toggle Lock */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '24px', width: '50px', ...skeletonStyle }}
                />
            </td>
            {/* Column 7: Status Badge */}
            <td>
                <div
                    className={skeletonClass}
                    style={{ height: '24px', width: '80px', ...skeletonStyle }}
                />
            </td>
        </tr>
    );
};

const AccountManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const currentRole = getRoleFromParam(roleParam);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState('CreatedAt_desc');
    const pageSize = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch accounts by role
    const fetchAccounts = useCallback(
        async (role: Role, page: number = 1, search?: string, sort?: string) => {
            setIsLoading(true);
            try {
                // Parse sort value (format: "field_order")
                const [sortBy, sortOrder] = sort ? sort.split('_') : ['CreatedAt', 'desc'];

                const response = await getAccountsByRole(
                    role,
                    page,
                    pageSize,
                    search || undefined,
                    sortBy,
                    sortOrder as 'asc' | 'desc'
                );

                if (response.success && response.data) {
                    setAccounts(response.data.accounts);
                    setTotalCount(response.data.totalCount);
                    setTotalPages(response.data.totalPages);
                }
            } catch (error: any) {
                console.error('Error fetching accounts:', error);
                toast.error(error?.message || 'Không thể tải danh sách tài khoản');
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize]
    );

    // Effect to fetch accounts when dependencies change
    useEffect(() => {
        fetchAccounts(currentRole, currentPage, debouncedSearchTerm, selectedSort);
    }, [currentRole, currentPage, debouncedSearchTerm, selectedSort, fetchAccounts]);

    // Handlers
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

    // Handle ban/unban account
    const handleToggleBanUnban = async (accountId: string) => {
        try {
            const response = await toggleBanUnbanAccount(accountId);
            if (response.success) {
                toast.success(response.message || 'Cập nhật trạng thái tài khoản thành công');
                // Refresh accounts list
                fetchAccounts(currentRole, currentPage, debouncedSearchTerm, selectedSort);
            }
        } catch (error: any) {
            console.error('Error toggling ban/unban:', error);
            toast.error(error?.message || 'Không thể cập nhật trạng thái tài khoản');
        }
    };

    // Handle lock account
    const handleLockAccount = async (accountId: string) => {
        try {
            const response = await lockAccount(accountId);
            if (response.success) {
                toast.success(response.message || 'Khóa tài khoản thành công');
                // Refresh accounts list
                fetchAccounts(currentRole, currentPage, debouncedSearchTerm, selectedSort);
            }
        } catch (error: any) {
            console.error('Error locking account:', error);
            toast.error(error?.message || 'Không thể khóa tài khoản');
        }
    };

    // Handle unlock account
    const handleUnlockAccount = async (accountId: string) => {
        try {
            const response = await unlockAccount(accountId);
            if (response.success) {
                toast.success(response.message || 'Mở khóa tài khoản thành công');
                // Refresh accounts list
                fetchAccounts(currentRole, currentPage, debouncedSearchTerm, selectedSort);
            }
        } catch (error: any) {
            console.error('Error unlocking account:', error);
            toast.error(error?.message || 'Không thể mở khóa tài khoản');
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'badge badge-soft-success border border-success';
            case 'INACTIVE':
                return 'badge badge-soft-danger border border-danger';
            default:
                return 'badge badge-soft-secondary border border-secondary';
        }
    };

    // Get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Hoạt động';
            case 'INACTIVE':
                return 'Vô hiệu hóa';
            default:
                return 'Không xác định';
        }
    };

    return (
        <div className="content" id="profilePage">
            <style>
                {`
                    /* Custom toggle switch colors */
                    .form-check-input:checked {
                    background-color: #22C55E !important; /* Xanh tươi hơn */
                    border-color: #22C55E !important;
                    }

                    .form-check-input:not(:checked) {
                    background-color: #D1D5DB !important; /* Xám sáng hơn */
                    border-color: #9CA3AF !important;
                    }

                    .form-check-input:not(:checked):hover {
                    background-color: #E5E7EB !important;
                    }

                    .form-check-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    }
                `}
            </style>
            {/* Page Header */}
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">
                        Quản Lý Tài Khoản - {getRoleLabel(currentRole)}
                        <span className="badge badge-soft-primary border border-primary fs-13 fw-medium ms-2">
                            Tổng {getRoleLabel(currentRole)}: {totalCount}
                        </span>
                    </h4>
                </div>
            </div>

            {/* Search and Sort Controls */}
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                <div className="search-set">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <div className="table-search d-flex align-items-center mb-0">
                            <div className="search-input">
                                <label htmlFor="accountSearch" aria-label="Search accounts">
                                    <input
                                        id="accountSearch"
                                        type="search"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm kiếm tài khoản..."
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
                        options={sortOptions}
                        selectedValue={selectedSort}
                        onSelect={handleSortChange}
                        placeholder="Sắp xếp:"
                        size="sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-nowrap datatable">
                    <thead className="thead-light">
                        <tr>
                            <th>{getRoleLabel(currentRole)}</th>
                            <th>Email</th>
                            <th>Số Điện Thoại</th>
                            <th>Địa Chỉ</th>
                            <th>Kích Hoạt</th>
                            <th>Khóa Tài Khoản</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <SkeletonRow key={`skeleton-${index}`} />
                                ))}
                            </>
                        ) : accounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-5">
                                    <div className="text-muted">
                                        <i className="ti ti-database-off fs-48 mb-2 d-block" />
                                        <p className="mb-0">Không có dữ liệu</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            accounts.map((account) => (
                                <tr key={account.accountId}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="avatar me-2">
                                                {account.avatarUrl ? (
                                                    <img
                                                        src={account.avatarUrl}
                                                        alt={account.fullName}
                                                        className="rounded-circle"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                                                        {account.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </span>
                                            <div>
                                                <h6 className="mb-1 fs-14 fw-semibold">
                                                    <span className="text-dark">
                                                        {account.fullName}
                                                    </span>
                                                </h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{account.email}</td>
                                    <td>{account.phone || '-'}</td>
                                    <td>{account.address || '-'}</td>

                                    {/* Toggle Active/Inactive */}
                                    <td>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id={`switch-active-${account.accountId}`}
                                                checked={account.status === 'ACTIVE'}
                                                onChange={() =>
                                                    handleToggleBanUnban(account.accountId)
                                                }
                                                disabled={account.isLocked}
                                                title={getToggleActiveTitle(
                                                    account.isLocked,
                                                    account.status
                                                )}
                                            />
                                        </div>
                                    </td>
                                    {/* Toggle Lock/Unlock */}
                                    <td>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id={`switch-lock-${account.accountId}`}
                                                checked={account.isLocked}
                                                onChange={() =>
                                                    account.isLocked
                                                        ? handleUnlockAccount(account.accountId)
                                                        : handleLockAccount(account.accountId)
                                                }
                                                title={getToggleLockTitle(account.isLocked)}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(account.status)}>
                                            {getStatusLabel(account.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            {/* Footer Start */}
            <AppFooter />
            {/* Footer End */}

            {/* Skeleton Loading Animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default AccountManagement;
