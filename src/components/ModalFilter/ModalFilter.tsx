import React, { useState, useRef } from 'react';
import Select from 'react-select';
import DateRangePicker from '@/components/DateRangePicker';
import { selectCustomStyles } from '@/constants/select.styles';
import styles from './ModalFilter.module.scss';

interface FilterOption {
    value: string | number;
    label: string;
}

interface FilterField {
    name: string;
    label: string;
    type: 'select' | 'text' | 'date' | 'number' | 'multiselect' | 'daterange';
    options?: FilterOption[];
    placeholder?: string;
    value?: any;
    onChange: (value: any) => void;
    resetValue?: any;
}

interface ModalFilterProps {
    show: boolean;
    onHide: () => void;
    onApply: () => void;
    onReset: () => void;
    title?: string;
    fields: FilterField[];
    loading?: boolean;
    applyText?: string;
    resetText?: string;
    cancelText?: string;
}

export const ModalFilter: React.FC<ModalFilterProps> = ({
    show,
    onHide,
    onApply,
    onReset,
    title = 'Lọc dữ liệu',
    fields,
    loading = false,
    applyText = 'Lọc',
    resetText = 'Xóa tất cả',
    cancelText = 'Đóng',
}) => {
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const dateRangeAnchorRef = useRef<HTMLDivElement>(null);

    const getDateRangeDisplayValue = (field: FilterField) => {
        if (field.value?.start && field.value?.end) {
            return `${field.value.start.toLocaleDateString('vi-VN')} - ${field.value.end.toLocaleDateString('vi-VN')}`;
        }
        if (field.value?.start) {
            return `${field.value.start.toLocaleDateString('vi-VN')} - Chọn ngày kết thúc`;
        }
        return '';
    };

    const renderField = (field: FilterField) => {
        switch (field.type) {
            case 'select':
                return (
                    <Select
                        options={field.options}
                        value={field.options?.find((option) => option.value === field.value)}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                        placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}`}
                        classNamePrefix="select2"
                        styles={selectCustomStyles}
                        menuPortalTarget={document.body}
                        isClearable
                    />
                );
            case 'multiselect':
                return (
                    <Select
                        isMulti
                        options={field.options}
                        value={field.options?.filter((option) =>
                            Array.isArray(field.value)
                                ? field.value.includes(option.value)
                                : field.value === option.value
                        )}
                        onChange={(selectedOptions) =>
                            field.onChange(
                                selectedOptions ? selectedOptions.map((option) => option.value) : []
                            )
                        }
                        placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}...`}
                        classNamePrefix="select2"
                        styles={selectCustomStyles}
                        menuPortalTarget={document.body}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        className="form-control"
                        value={field.value || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(e.target.value)
                        }
                        placeholder={field.placeholder}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className="form-control"
                        value={field.value || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(e.target.value)
                        }
                        placeholder={field.placeholder}
                    />
                );
            case 'daterange':
                return (
                    <div ref={dateRangeAnchorRef} className="position-relative">
                        <input
                            type="text"
                            className="form-control"
                            placeholder={field.placeholder || 'Chọn khoảng thời gian...'}
                            value={getDateRangeDisplayValue(field)}
                            onClick={() => setShowDateRangePicker(true)}
                            readOnly
                        />
                        <DateRangePicker
                            value={field.value || { start: null, end: null }}
                            onChange={field.onChange}
                            anchorEl={dateRangeAnchorRef.current}
                            open={showDateRangePicker}
                            onClose={() => setShowDateRangePicker(false)}
                            placeholder={field.placeholder || 'Chọn khoảng thời gian...'}
                        />
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        className="form-control"
                        value={field.value || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(e.target.value)
                        }
                        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                    />
                );
        }
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', background: 'rgba(0,0,0,0.15)' }}
            tabIndex={-1}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className={`modal-content ${styles.modalContent}`}>
                    <div className={`modal-header ${styles.modalHeader}`}>
                        <h6 className={styles.modalTitle}>{title}</h6>
                        <div className="d-flex align-items-center">
                            <button
                                className={styles.clearAll}
                                onClick={onReset}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onReset();
                                    }
                                }}
                                type="button"
                            >
                                {resetText}
                            </button>
                        </div>
                    </div>
                    <div className={styles.modalBody}>
                        <form>
                            {fields.map((field) => (
                                <div className="mb-3" key={field.name}>
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>{field.label}</label>
                                        {field.resetValue && (
                                            <button
                                                className={styles.resetLink}
                                                onClick={field.resetValue}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        field.resetValue?.();
                                                    }
                                                }}
                                                type="button"
                                            >
                                                Đặt lại
                                            </button>
                                        )}
                                    </div>
                                    {renderField(field)}
                                </div>
                            ))}
                        </form>
                    </div>
                    <div className={`modal-footer ${styles.modalFooter}`}>
                        <button
                            type="button"
                            className={`btn btn-light btn-md me-2 ${styles.btn}`}
                            onClick={onHide}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary btn-md ${styles.btn}`}
                            onClick={onApply}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <output
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-hidden="true"
                                    ></output>
                                    Đang áp dụng...
                                </>
                            ) : (
                                applyText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalFilter;
