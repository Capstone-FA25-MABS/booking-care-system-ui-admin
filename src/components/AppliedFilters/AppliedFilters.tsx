import React from 'react';

interface AppliedFiltersProps {
    appliedItems: string[];
    appliedStatuses: string[];
    items: Array<{ id: string; name: string }>;
    onRemoveItem: (itemId: string) => void;
    onRemoveStatus: (status: string) => void;
    onClearAll: () => void;
    styles?: {
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
    const mergedStyles = {
        appliedFiltersContainer: styles?.appliedFiltersContainer || '',
        appliedFiltersLabel: styles?.appliedFiltersLabel || '',
        filterBadgeClose: styles?.filterBadgeClose || '',
        clearAllButton: styles?.clearAllButton || '',
    };

    if (appliedItems.length === 0 && appliedStatuses.length === 0) {
        return null;
    }

    return (
        <div className={mergedStyles.appliedFiltersContainer}>
            <span className={mergedStyles.appliedFiltersLabel}>Bộ lọc đang áp dụng:</span>
            {appliedItems.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                    <span key={itemId} className="badge badge-soft-primary fs-12">
                        {item.name}
                        <button
                            type="button"
                            className={`btn-close ms-1 ${mergedStyles.filterBadgeClose}`}
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
                        className={`btn-close ms-1 ${mergedStyles.filterBadgeClose}`}
                        onClick={() => onRemoveStatus(status)}
                        aria-label="Remove filter"
                    ></button>
                </span>
            ))}
            <button
                type="button"
                className={`btn btn-sm btn-outline-secondary fs-12 ${mergedStyles.clearAllButton}`}
                onClick={onClearAll}
            >
                Xóa tất cả
            </button>
        </div>
    );
};

export default AppliedFilters;
