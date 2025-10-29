import React from 'react';
import { NumericFormat } from 'react-number-format';

const CustomNumericInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>((props, ref) => {
    const { hasError, className, ...rest } = props;
    return (
        <input
            {...rest}
            ref={ref}
            className={`form-control ${hasError ? 'is-invalid' : ''} ${className || ''}`}
        />
    );
});
CustomNumericInput.displayName = 'CustomNumericInput';

interface YearsOfExperienceFieldProps {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
}

const YearsOfExperienceField: React.FC<YearsOfExperienceFieldProps> = ({
    value,
    onChange,
    error,
    required = true,
}) => {
    return (
        <div className="col-md-6 mb-3">
            <label htmlFor="yearsOfExperience" className="form-label">
                <i className="feather-award me-1"></i> Số năm kinh nghiệm{' '}
                {required && <span className="text-danger">*</span>}
            </label>
            <NumericFormat
                customInput={CustomNumericInput}
                hasError={!!error}
                value={value}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: 'yearsOfExperience',
                            value: values.floatValue || 0,
                        },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                thousandSeparator=""
                allowNegative={false}
                decimalScale={0}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default YearsOfExperienceField;
