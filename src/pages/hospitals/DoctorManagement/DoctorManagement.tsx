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
        : 'Tắt (Không hoạt động) - Click để bật';
};

const getLockTitle = (): string => 'Đang mở - Click để khóa tài khoản';
const getUnlockTitle = (): string => 'Đang khóa - Click để mở khóa';

// Skeleton cell component for loading state
interface SkeletonCellProps {
    height: string;
    width: string;
}

const SkeletonCell: React.FC<SkeletonCellProps> = ({ height, width }) => {
    const skeletonClass = 'bg-light rounded placeholder-glow';
    const skeletonStyle = {
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    return (
        <td>
            <div className={skeletonClass} style={{ height, width, ...skeletonStyle }} />
        </td>
    );
};

// Skeleton row component for loading state
const SkeletonRow: React.FC = () => {
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
                            className="bg-light rounded placeholder-glow mb-2"
                            style={{ height: '14px', width: '120px', ...skeletonStyle }}
                        />
                    </div>
                </div>
            </td>
            <SkeletonCell height="14px" width="180px" />
            <SkeletonCell height="14px" width="150px" />
            <SkeletonCell height="24px" width="50px" />
            <SkeletonCell height="24px" width="50px" />
            <SkeletonCell height="24px" width="80px" />
        </tr>
    );
};

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

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'badge badge-soft-success';
            case 'INACTIVE':
                return 'badge badge-soft-danger';
            default:
                return 'badge badge-soft-secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ACTIVE':
                return 'Hoạt động';
            case 'INACTIVE':
                return 'Không hoạt động';
            default:
                return 'Không xác định';
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
                        <SkeletonRow key={skeletonId} />
                    ))}
                </>
            );
        }

        if (accounts.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <div className="text-muted">
                            <i className="ti ti-database-off fs-48 mb-2 d-block" />
                            <p className="mb-0">Không có dữ liệu</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return accounts.map((account) => (
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
                                <span className="text-dark">{account.fullName}</span>
                            </h6>
                        </div>
                    </div>
                </td>
                <td>{account.email}</td>
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
                            onChange={() => handleToggleBanUnban(account.accountId)}
                            disabled={account.isLocked}
                            title={getToggleActiveTitle(account.isLocked, account.status)}
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
                            title={account.isLocked ? getUnlockTitle() : getLockTitle()}
                        />
                    </div>
                </td>
                <td>
                    <span className={getStatusBadgeClass(account.status)}>
                        {getStatusLabel(account.status)}
                    </span>
                </td>
            </tr>
        ));
    };

    if (!hospitalProfile?.id) {
        return (
            <div className="content">
                <div className="alert alert-danger" role="alert">
                    <i className="ti ti-alert-circle me-2" />
                    Không tìm thấy thông tin bệnh viện. Vui lòng đăng nhập lại.
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
                        Quản Lý Bác Sĩ
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

export default DoctorManagement;
