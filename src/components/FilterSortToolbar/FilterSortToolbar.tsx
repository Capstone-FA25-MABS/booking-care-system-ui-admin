import React from 'react';
import Button from '@/components/Button';
import SortDropdown from '@/components/SortDropdown';

export interface SortOption {
    value: string;
    label: string;
}

interface FilterSortToolbarProps {
    onFilterClick: () => void;
    sortOptions: SortOption[];
    selectedSort: string;
    onSortChange: (value: string) => void;
    sortPlaceholder?: string;
    filterButtonText?: string;
}

const FilterSortToolbar: React.FC<FilterSortToolbarProps> = ({
    onFilterClick,
    sortOptions,
    selectedSort,
    onSortChange,
    sortPlaceholder = 'Sắp xếp theo:',
    filterButtonText = 'Lọc',
}) => {
    return (
        <>
            <Button
                variant="white"
                size="md"
                className="me-2 fs-14 py-1 border d-inline-flex text-dark align-items-center"
                icon="ti ti-filter text-gray-5"
                onClick={onFilterClick}
            >
                {filterButtonText}
            </Button>
            <SortDropdown
                options={sortOptions}
                selectedValue={selectedSort}
                onSelect={onSortChange}
                placeholder={sortPlaceholder}
            />
        </>
    );
};

export default FilterSortToolbar;
