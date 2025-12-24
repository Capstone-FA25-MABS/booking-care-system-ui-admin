// src/pages/hospitals/Discounts/components/DiscountFilters.tsx
import React from 'react';
import { DiscountStatus } from '@/enums/discount.enums';
import styles from '../HospitalDiscountManagement.module.scss';

interface DiscountFiltersProps {
    searchTerm: string;
    statusFilter: DiscountStatus | '';
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: DiscountStatus | '') => void;
}

const DiscountFilters: React.FC<DiscountFiltersProps> = ({
    searchTerm,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
}) => {
    return (
        <div className={styles.filtersCard}>
            <div className={styles.searchWrapper}>
                <i className="ti ti-search"></i>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã hoặc tên..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.filterWrapper}>
                <i className="ti ti-filter"></i>
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value as DiscountStatus | '')}
                    className={styles.filterSelect}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value={DiscountStatus.ACTIVE}>Đang hoạt động</option>
                    <option value={DiscountStatus.INACTIVE}>Không hoạt động</option>
                    <option value={DiscountStatus.EXPIRED}>Đã hết hạn</option>
                </select>
            </div>
        </div>
    );
};

export default DiscountFilters;
