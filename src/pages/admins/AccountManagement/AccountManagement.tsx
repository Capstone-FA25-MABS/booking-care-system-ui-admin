import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
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
import { SkeletonTableRow } from '@/components/SkeletonLoading';
import { EmptyTableState, AccountTableRow } from '@/components/AccountTable';
import { sortOptions } from '@/utils/account-management.utils';

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

    // Helper function to render table body content
    const renderTableBody = () => {
        if (isLoading) {
            return (
                <>
                    {Array.from(
                        { length: 5 },
                        (_, index) => `skeleton-row-${Date.now()}-${index}`
                    ).map((skeletonId) => (
                        <SkeletonTableRow key={skeletonId} showPhoneColumn={true} />
                    ))}
                </>
            );
        }

        if (accounts.length === 0) {
            return <EmptyTableState colSpan={7} />;
        }

        return accounts.map((account) => (
            <AccountTableRow
                key={account.accountId}
                account={account}
                showPhoneColumn={true}
                onToggleBanUnban={handleToggleBanUnban}
                onLockAccount={handleLockAccount}
                onUnlockAccount={handleUnlockAccount}
            />
        ));
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
                    <tbody>{renderTableBody()}</tbody>
                </table>
            </div>
            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default AccountManagement;
