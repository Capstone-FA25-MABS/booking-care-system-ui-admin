import React from 'react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';
import { DoctorPrice } from '@/types/serviceType.types';
import { selectCustomStyles } from '@/constants/select.styles';

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

interface ServiceType {
    id: string;
    name: string;
}

interface ServicePricesSectionProps {
    servicePrices: DoctorPrice[];
    serviceTypes: ServiceType[];
    onServicePriceChange: (index: number, field: keyof DoctorPrice, value: string | number) => void;
    onAddServicePrice: () => void;
    onRemoveServicePrice: (index: number) => void;
    errors: Record<string, string>;
}

const ServicePricesSection: React.FC<ServicePricesSectionProps> = ({
    servicePrices,
    serviceTypes,
    onServicePriceChange,
    onAddServicePrice,
    onRemoveServicePrice,
    errors,
}) => {
    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0">
                        <i className="feather-dollar-sign me-2"></i> Dịch vụ và giá
                    </h5>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={onAddServicePrice}
                    >
                        Thêm dịch vụ
                    </Button>
                </div>
                {servicePrices.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="feather-plus-circle fs-1 mb-3"></i>
                        <p>Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.</p>
                    </div>
                ) : (
                    <div className="row">
                        {servicePrices.map((price, index) => (
                            <div key={`${price.serviceTypeId}-${index}`} className="col-md-6 mb-3">
                                <div className="border rounded p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">Dịch vụ {index + 1}</h6>
                                        <Button
                                            type="button"
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => onRemoveServicePrice(index)}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </Button>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label
                                                htmlFor={`serviceType-${index}`}
                                                className="form-label"
                                            >
                                                <i className="feather-briefcase me-1"></i> Loại dịch
                                                vụ
                                            </label>
                                            <Select
                                                inputId={`serviceType-${index}`}
                                                options={serviceTypes.map((service) => ({
                                                    value: service.id,
                                                    label: service.name,
                                                }))}
                                                value={
                                                    price.serviceTypeId
                                                        ? {
                                                              value: price.serviceTypeId,
                                                              label:
                                                                  serviceTypes.find(
                                                                      (s) =>
                                                                          s.id ===
                                                                          price.serviceTypeId
                                                                  )?.name || '',
                                                          }
                                                        : null
                                                }
                                                onChange={(selectedOption) =>
                                                    onServicePriceChange(
                                                        index,
                                                        'serviceTypeId',
                                                        selectedOption?.value || ''
                                                    )
                                                }
                                                placeholder="Chọn loại dịch vụ"
                                                classNamePrefix="select2"
                                                styles={selectCustomStyles}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label
                                                htmlFor={`serviceAmount-${index}`}
                                                className="form-label"
                                            >
                                                <i className="feather-dollar-sign me-1"></i> Giá
                                                (VNĐ)
                                            </label>
                                            <NumericFormat
                                                id={`serviceAmount-${index}`}
                                                customInput={CustomNumericInput}
                                                hasError={!!errors[`servicePrices_${index}_amount`]}
                                                value={price.amount}
                                                onValueChange={(values) =>
                                                    onServicePriceChange(
                                                        index,
                                                        'amount',
                                                        values.floatValue || 0
                                                    )
                                                }
                                                thousandSeparator=","
                                                allowNegative={false}
                                                decimalScale={0}
                                                suffix=" VNĐ"
                                            />
                                            {errors[`servicePrices_${index}_amount`] && (
                                                <div className="invalid-feedback">
                                                    {errors[`servicePrices_${index}_amount`]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {errors.servicePrices && (
                    <div className="text-danger mt-2">{errors.servicePrices}</div>
                )}
            </div>
        </div>
    );
};

export default ServicePricesSection;
