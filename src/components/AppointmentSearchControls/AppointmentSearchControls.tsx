import React from 'react';
import ActionDropdown from '@/components/ActionDropdown';
import Button from '@/components/Button';

// ============================================================================
// Types
// ============================================================================

export interface SortOption {
    value: string;
    label: string;
}

export interface AppointmentSearchControlsProps {
    /** Current search term */
    searchTerm: string;
    /** Callback when search term changes */
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Currently selected sort value */
    selectedSort: string;
    /** Callback when sort changes */
    onSortChange: (value: string) => void;
    /** Available sort options */
    sortOptions: SortOption[];
    /** Callback when filter button is clicked */
    onFilterClick: () => void;
    /** Search input placeholder */
    searchPlaceholder?: string;
    /** Search input ID for accessibility */
    searchInputId?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Default sort options for appointments */
export const APPOINTMENT_SORT_OPTIONS: SortOption[] = [
    { value: 'CreatedAt_desc', label: 'Mới nhất' },
    { value: 'CreatedAt_asc', label: 'Cũ nhất' },
    { value: 'AppointmentDate_desc', label: 'Ngày hẹn (mới nhất)' },
    { value: 'AppointmentDate_asc', label: 'Ngày hẹn (cũ nhất)' },
    { value: 'UpdatedAt_desc', label: 'Cập nhật gần đây' },
];

// ============================================================================
// Component
// ============================================================================

const AppointmentSearchControls: React.FC<AppointmentSearchControlsProps> = ({
    searchTerm,
    onSearchChange,
    selectedSort,
    onSortChange,
    sortOptions,
    onFilterClick,
    searchPlaceholder = 'Tìm kiếm thông tin...',
    searchInputId = 'appointmentSearch',
}) => {
    return (
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
            {/* Search Input */}
            <div className="search-set">
                <div className="d-flex align-items-center flex-wrap gap-2">
                    <div className="table-search d-flex align-items-center mb-0">
                        <div className="search-input">
                            <label htmlFor={searchInputId} aria-label="Search appointments">
                                <input
                                    id={searchInputId}
                                    type="search"
                                    className="form-control form-control-sm"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={onSearchChange}
                                    aria-controls="DataTables_Table_0"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Sort */}
            <div className="d-flex align-items-center gap-2">
                <Button
                    variant="white"
                    size="md"
                    className="fs-14 py-1 border d-inline-flex text-dark align-items-center"
                    icon="ti ti-filter text-gray-5"
                    onClick={onFilterClick}
                >
                    Lọc
                </Button>
                <ActionDropdown
                    type="sort"
                    options={sortOptions}
                    selectedValue={selectedSort}
                    onSelect={onSortChange}
                    placeholder="Sắp xếp:"
                    size="sm"
                />
            </div>
        </div>
    );
};

export default AppointmentSearchControls;
