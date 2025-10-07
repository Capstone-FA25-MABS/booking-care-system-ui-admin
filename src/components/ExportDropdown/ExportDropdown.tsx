import React from 'react';

interface ExportOption {
    value: string;
    label: string;
    icon?: string;
    format: 'excel' | 'pdf' | 'csv' | 'print';
}

interface ExportDropdownProps {
    options: ExportOption[];
    onExport: (format: string) => void;
    loading?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
    options,
    onExport,
    loading = false,
    className = '',
    size = 'md',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

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

    return (
        <div className={`dropdown me-1 ${className}`}>
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
                        ></output>{' '}
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
};

export default ExportDropdown;
