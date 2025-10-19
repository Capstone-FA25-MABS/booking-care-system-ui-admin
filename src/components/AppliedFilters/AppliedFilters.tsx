import React from 'react';

interface AppliedFiltersProps {
    appliedItems: string[];
    appliedStatuses: string[];
    items: Array<{ id: string; name: string }>;
    onRemoveItem: (itemId: string) => void;
    onRemoveStatus: (status: string) => void;
    onClearAll: () => void;
    styles: {
        appliedFiltersContainer: string;
        appliedFiltersLabel: string;
        filterBadgeClose: string;
        clearAllButton: string;
    };
}

const AppliedFilters: React.FC<AppliedFiltersProps> = ({
    appliedItems,
    appliedStatuses,
    items,
    onRemoveItem,
    onRemoveStatus,
    onClearAll,
    styles,
}) => {
    if (appliedItems.length === 0 && appliedStatuses.length === 0) {
        return null;
    }

    return (
        <div className={styles.appliedFiltersContainer}>
            <span className={styles.appliedFiltersLabel}>Bộ lọc đang áp dụng:</span>
            {appliedItems.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                    <span key={itemId} className="badge badge-soft-primary fs-12">
                        {item.name}
                        <button
                            type="button"
                            className={`btn-close ms-1 ${styles.filterBadgeClose}`}
                            onClick={() => onRemoveItem(itemId)}
                            aria-label="Remove filter"
                        ></button>
                    </span>
                ) : null;
            })}
            {appliedStatuses.map((status) => (
                <span key={status} className="badge badge-soft-info fs-12">
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    <button
                        type="button"
                        className={`btn-close ms-1 ${styles.filterBadgeClose}`}
                        onClick={() => onRemoveStatus(status)}
                        aria-label="Remove filter"
                    ></button>
                </span>
            ))}
            <button
                type="button"
                className={`btn btn-sm btn-outline-secondary fs-12 ${styles.clearAllButton}`}
                onClick={onClearAll}
            >
                Xóa tất cả
            </button>
        </div>
    );
};

export default AppliedFilters;
