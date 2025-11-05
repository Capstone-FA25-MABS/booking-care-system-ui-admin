import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Account } from '@/types/auth.types';
import {
    getDoctorsByHospital,
    toggleBanUnbanAccount,
    lockAccount,
    unlockAccount,
} from '@/services/auth.service';
import Pagination from '@/components/Pagination';
import ActionDropdown from '@/components/ActionDropdown';
import { SkeletonTableRow } from '@/components/SkeletonLoading';
import { EmptyTableState, AccountTableRow } from '@/components/AccountTable';
import { sortOptions } from '@/utils/account-management.utils';

const DoctorManagement: React.FC = () => {
    // Get hospital profile from Redux
    const { hospitalProfile } = useSelector((state: RootState) => state.user);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState('CreatedAt_desc');
    const pageSize = 10;

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1); // Reset to page 1 when search changes
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    // Fetch doctors by hospital
    const fetchDoctors = useCallback(
        async (page: number = 1, search?: string, sort?: string) => {
            if (!hospitalProfile?.id) {
                toast.error('Không tìm thấy thông tin bệnh viện');
                return;
            }

            setIsLoading(true);
            try {
                // Parse sort value (format: "field_order")
                const [sortField, sortOrder] = sort ? sort.split('_') : ['CreatedAt', 'desc'];

                const response = await getDoctorsByHospital(
                    hospitalProfile.id,
                    page,
                    pageSize,
                    search || undefined,
                    sortField,
                    sortOrder as 'asc' | 'desc'
                );

                if (response.success && response.data) {
                    setAccounts(response.data.accounts);
                    setTotalCount(response.data.totalCount);
                    setTotalPages(response.data.totalPages);
                }
            } catch (error: any) {
                console.error('Error fetching doctors:', error);
                toast.error(error?.message || 'Không thể tải danh sách bác sĩ');
            } finally {
                setIsLoading(false);
            }
        },
        [hospitalProfile?.id, pageSize]
    );

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchDoctors(currentPage, searchTerm, sortBy);
    }, [currentPage, searchTerm, sortBy, fetchDoctors]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1); // Reset to page 1 when sort changes
    };

    const handleToggleBanUnban = async (accountId: string) => {
        try {
            await toggleBanUnbanAccount(accountId);
            toast.success('Cập nhật trạng thái tài khoản thành công');
            fetchDoctors(currentPage, searchTerm, sortBy);
        } catch (error: any) {
            toast.error(error?.message || 'Không thể cập nhật trạng thái tài khoản');
        }
    };

    const handleLockAccount = async (accountId: string) => {
        try {
            await lockAccount(accountId);
            toast.success('Khóa tài khoản thành công');
            fetchDoctors(currentPage, searchTerm, sortBy);
        } catch (error: any) {
            toast.error(error?.message || 'Không thể khóa tài khoản');
        }
    };

    const handleUnlockAccount = async (accountId: string) => {
        try {
            await unlockAccount(accountId);
            toast.success('Mở khóa tài khoản thành công');
            fetchDoctors(currentPage, searchTerm, sortBy);
        } catch (error: any) {
            toast.error(error?.message || 'Không thể mở khóa tài khoản');
        }
    };

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <>
                    {Array.from(
                        { length: 5 },
                        (_, index) => `skeleton-row-${Date.now()}-${index}`
                    ).map((skeletonId) => (
                        <SkeletonTableRow key={skeletonId} showPhoneColumn={false} />
                    ))}
                </>
            );
        }

        if (accounts.length === 0) {
            return <EmptyTableState colSpan={6} />;
        }

        return accounts.map((account) => (
            <AccountTableRow
                key={account.accountId}
                account={account}
                showPhoneColumn={false}
                onToggleBanUnban={handleToggleBanUnban}
                onLockAccount={handleLockAccount}
                onUnlockAccount={handleUnlockAccount}
            />
        ));
    };

    if (!hospitalProfile?.id) {
        return (
            <div className="content">
                <div className="alert alert-danger" role="alert">
                    <i className="ti ti-alert-circle me-2" /> Không tìm thấy thông tin bệnh viện.
                    Vui lòng đăng nhập lại.
                </div>
            </div>
        );
    }

    return (
        <div className="content" id="doctorManagementPage">
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
                        Quản lý tài khoản{' '}
                        <span className="badge badge-soft-primary border border-primary fs-13 fw-medium ms-2">
                            Tổng Bác Sĩ: {totalCount}
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
                                <label htmlFor="doctorSearch" aria-label="Search doctors">
                                    <input
                                        id="doctorSearch"
                                        type="search"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm kiếm bác sĩ..."
                                        value={searchInput}
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
                        selectedValue={sortBy}
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
                            <th>Bác Sĩ</th>
                            <th>Email</th>
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

export default DoctorManagement;
