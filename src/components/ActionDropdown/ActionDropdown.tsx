import React from 'react';

interface BaseOption {
    value: string;
    label: string;
}

interface ExportOption extends BaseOption {
    icon?: string;
    format: 'excel' | 'pdf' | 'csv' | 'print';
}

interface SortOption extends BaseOption {
    direction?: 'asc' | 'desc';
}

type DropdownOption = ExportOption | SortOption;

interface BaseDropdownProps {
    options: DropdownOption[];
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

interface ExportDropdownProps extends BaseDropdownProps {
    type: 'export';
    options: ExportOption[];
    onExport: (format: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

interface SortDropdownProps extends BaseDropdownProps {
    type: 'sort';
    options: SortOption[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}

type ActionDropdownProps = ExportDropdownProps | SortDropdownProps;

export const ActionDropdown: React.FC<ActionDropdownProps> = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const getSizeClass = () => {
        switch (props.size) {
            case 'sm':
                return 'btn-sm';
            case 'lg':
                return 'btn-lg';
            default:
                return 'btn-md';
        }
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'excel':
                return 'ti ti-file-spreadsheet';
            case 'pdf':
                return 'ti ti-file-text';
            case 'csv':
                return 'ti ti-download';
            case 'print':
                return 'ti ti-printer';
            default:
                return 'ti ti-download';
        }
    };

    const isExportType = (props: ActionDropdownProps): props is ExportDropdownProps => {
        return props.type === 'export';
    };

    const isSortType = (props: ActionDropdownProps): props is SortDropdownProps => {
        return props.type === 'sort';
    };

    if (isExportType(props)) {
        const { options, onExport, loading = false, disabled = false } = props;

        return (
            <div className={`dropdown me-1 ${props.className || ''}`}>
                <button
                    className={`btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center ${getSizeClass()}`}
                    type="button"
                    data-bs-toggle="dropdown"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled || loading}
                    aria-expanded={isOpen}
                >
                    {loading ? (
                        <>
                            <output
                                className="spinner-border spinner-border-sm me-2"
                                aria-hidden="true"
                            ></output>
                            Đang xuất...
                        </>
                    ) : (
                        <>
                            Xuất Dữ Liệu <i className="ti ti-chevron-down ms-2"></i>
                        </>
                    )}
                </button>

                <ul
                    className={`dropdown-menu p-2 ${isOpen ? 'show' : ''}`}
                    aria-labelledby="export-dropdown"
                >
                    {options.map((option) => (
                        <li key={option.value}>
                            <button
                                className="dropdown-item d-flex align-items-center"
                                onClick={() => {
                                    onExport(option.value);
                                    setIsOpen(false);
                                }}
                                disabled={loading}
                                type="button"
                            >
                                <i
                                    className={`${option.icon || getFormatIcon(option.format)} me-2`}
                                ></i>
                                <span>{option.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (isSortType(props)) {
        const { options, selectedValue, onSelect, placeholder = 'Sắp xếp theo:' } = props;
        const selectedOption = options.find((option) => option.value === selectedValue);

        return (
            <div className={`dropdown ${props.className || ''}`}>
                <button
                    className={`dropdown-toggle btn bg-white ${getSizeClass()} d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14`}
                    type="button"
                    data-bs-toggle="dropdown"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <span className="me-1">{placeholder}</span>{' '}
                    {selectedOption
                        ? selectedOption.label
                        : options.find((option) => option.value === 'recent')?.label}
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
    }

    return null;
};

export default ActionDropdown;
