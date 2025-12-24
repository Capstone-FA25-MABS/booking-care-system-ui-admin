/**
 * Shared styles for react-select components to avoid duplication
 */
export const selectCustomStyles = {
    control: (provided: any) => ({
        ...provided,
        minHeight: '40px',
        borderRadius: '8px',
        borderColor: '#E5E7EB',
        boxShadow: 'none',
        fontSize: '14px',
        padding: '1px 0',
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '1px 8px',
    }),
    multiValue: (provided: any) => ({
        ...provided,
        background: '#F3F4F6',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#111827',
        margin: '2px 4px',
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: '#111827',
        fontWeight: 400,
        padding: '2px 6px',
        fontSize: '13px',
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        color: '#6B7280',
        ':hover': { backgroundColor: '#E5E7EB', color: '#EF4444' },
    }),
    option: (provided: any, state: any) => {
        let backgroundColor = '#fff';
        if (state.isSelected) {
            backgroundColor = '#EEF2FF';
        } else if (state.isFocused) {
            backgroundColor = '#F3F4F6';
        }
        return {
            ...provided,
            backgroundColor,
            color: '#111827',
            fontSize: '14px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 400,
        };
    },
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        zIndex: 99999,
    }),
    menuList: (provided: any) => ({
        ...provided,
        padding: '4px 0',
    }),
    menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 99999,
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#9CA3AF',
        fontSize: '14px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#111827',
        fontSize: '14px',
    }),
    indicatorSeparator: (provided: any) => ({
        ...provided,
        display: 'none',
    }),
    dropdownIndicator: (provided: any) => ({
        ...provided,
        color: '#6B7280',
        padding: '8px',
        ':hover': {
            color: '#374151',
        },
    }),
    clearIndicator: (provided: any) => ({
        ...provided,
        color: '#6B7280',
        padding: '8px',
        ':hover': {
            color: '#EF4444',
        },
    }),
};
