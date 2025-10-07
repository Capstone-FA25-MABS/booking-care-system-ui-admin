import React from 'react';

interface SortOption {
    value: string;
    label: string;
    direction?: 'asc' | 'desc';
}

interface SortDropdownProps {
    options: SortOption[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = 'Sắp xếp theo:',
    className = '',
    size = 'md',
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedOption = options.find((option) => option.value === selectedValue);

    const getSizeClass = () => {
        switch (size) {
            case 'sm':
                return 'btn-sm';
            case 'lg':
                return 'btn-lg';
            default:
                return 'btn-md';
        }
    };

    return (
        <div className={`dropdown ${className}`}>
            <button
                className={`dropdown-toggle btn bg-white ${getSizeClass()} d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14`}
                type="button"
                data-bs-toggle="dropdown"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="me-1">{placeholder}</span>{' '}
                {selectedOption ? selectedOption.label : 'Mới Thêm Gần Đây'}
                {selectedOption?.direction && (
                    <i
                        className={`ti ti-arrow-${selectedOption.direction === 'asc' ? 'up' : 'down'} ms-2`}
                    ></i>
                )}
            </button>

            <ul
                className={`dropdown-menu dropdown-menu-end p-2 ${isOpen ? 'show' : ''}`}
                aria-labelledby="sort-dropdown"
            >
                {options.map((option) => (
                    <li key={option.value}>
                        <button
                            className={`dropdown-item rounded-1 ${selectedValue === option.value ? 'active' : ''}`}
                            onClick={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                            type="button"
                        >
                            {option.label}
                            {option.direction && (
                                <i
                                    className={`ti ti-arrow-${option.direction === 'asc' ? 'up' : 'down'} ms-2 text-muted`}
                                ></i>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SortDropdown;
