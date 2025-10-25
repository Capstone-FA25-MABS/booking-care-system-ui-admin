import React from 'react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Spinner from '@/components/Spinner';
import { AddDoctorFormData } from '@/types/doctor.types';
import { DoctorPrice } from '@/types/serviceType.types';
import { selectCustomStyles } from '@/constants/select.styles';
import styles from '../components/DoctorFormFields/DoctorFormFields.module.scss';
import FullScreenSpinner from '@/components/FullScreenSpinner';
import { Gender } from '@/enums/common.enums';

// Custom input component for NumericFormat
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

interface AddDoctorFormFieldsProps {
    formData: AddDoctorFormData;
    errors: Partial<
        Record<keyof AddDoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onLanguageToggle: (languageId: string) => void;
    onServicePriceChange: (index: number, field: keyof DoctorPrice, value: string | number) => void;
    onAddServicePrice: () => void;
    onRemoveServicePrice: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
    positions: Array<{ id: string; name: string }>;
    specialties: Array<{ id: string; name: string }>;
    languages: Array<{ id: string; name: string }>;
    serviceTypes: Array<{ id: string; name: string }>;
}

const AddDoctorFormFields: React.FC<AddDoctorFormFieldsProps> = ({
    formData,
    errors,
    onInputChange,
    onLanguageToggle,
    onServicePriceChange,
    onAddServicePrice,
    onRemoveServicePrice,
    onSubmit,
    onCancel,
    isLoading = false,
    positions,
    specialties,
    languages,
    serviceTypes,
}) => {
    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: 'calc(100vh - 300px)',
                    width: '100%',
                }}
            >
                <div className="text-center">
                    <Spinner size="large" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit}>
            {/* Basic Info Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <h5 className="card-title mb-3">Thông tin cơ bản</h5>
                    <div className="alert alert-info d-flex align-items-center mb-4">
                        <i className="feather-info fs-5 me-2"></i>
                        <small>
                            <strong>Lưu ý:</strong> Mật khẩu sẽ được hệ thống tự động tạo và gửi đến
                            email của bác sĩ. Bác sĩ sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần
                            đầu tiên.
                        </small>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <Input
                                    wrapperClassName="col-md-6 mb-3"
                                    label="Họ và tên"
                                    icon="user"
                                    iconPrefix="feather"
                                    required
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={onInputChange}
                                    placeholder="Nhập họ và tên đầy đủ"
                                    error={errors.fullName}
                                />
                                <Input
                                    wrapperClassName="col-md-6 mb-3"
                                    label="Email"
                                    icon="mail"
                                    iconPrefix="feather"
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onInputChange}
                                    placeholder="Nhập email"
                                    error={errors.email}
                                />
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="gender" className="form-label">
                                        <i className="feather-users me-1"></i> Giới tính{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        inputId="gender"
                                        options={[
                                            { value: Gender.MALE, label: 'Nam' },
                                            { value: Gender.FEMALE, label: 'Nữ' },
                                        ]}
                                        value={
                                            formData.gender !== null &&
                                            formData.gender !== undefined
                                                ? {
                                                      value: formData.gender,
                                                      label:
                                                          formData.gender === Gender.MALE
                                                              ? 'Nam'
                                                              : 'Nữ',
                                                  }
                                                : null
                                        }
                                        onChange={(selectedOption) => {
                                            onInputChange({
                                                target: {
                                                    name: 'gender',
                                                    value:
                                                        selectedOption?.value !== undefined
                                                            ? selectedOption.value
                                                            : Gender.MALE,
                                                },
                                            } as any);
                                        }}
                                        placeholder="Chọn giới tính"
                                        className={errors.gender ? 'is-invalid' : ''}
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        menuPortalTarget={document.body}
                                    />
                                    {errors.gender && (
                                        <div className="text-danger mt-1">{errors.gender}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="yearsOfExperience" className="form-label">
                                        <i className="feather-award me-1"></i> Số năm kinh nghiệm{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <NumericFormat
                                        customInput={CustomNumericInput}
                                        hasError={!!errors.yearsOfExperience}
                                        value={formData.yearsOfExperience}
                                        onValueChange={(values) => {
                                            onInputChange({
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
                                    {errors.yearsOfExperience && (
                                        <div className="invalid-feedback">
                                            {errors.yearsOfExperience}
                                        </div>
                                    )}
                                </div>
                                <Textarea
                                    wrapperClassName="col-6 mb-3"
                                    label="Tiểu sử"
                                    icon="file-text"
                                    iconPrefix="feather"
                                    required
                                    name="bio"
                                    value={formData.bio}
                                    onChange={onInputChange}
                                    rows={4}
                                    placeholder="Mô tả về bác sĩ"
                                    error={errors.bio}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Info Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <h5 className="card-title mb-4">Thông tin chuyên môn</h5>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="positionId" className="form-label">
                                <i className="feather-briefcase me-1"></i> Chức vụ{' '}
                                <span className="text-danger">*</span>
                            </label>
                            <Select
                                inputId="positionId"
                                options={positions.map((position) => ({
                                    value: position.id,
                                    label: position.name,
                                }))}
                                value={
                                    formData.positionId
                                        ? {
                                              value: formData.positionId,
                                              label: positions.find(
                                                  (p) => p.id === formData.positionId
                                              )?.name,
                                          }
                                        : null
                                }
                                onChange={(selectedOption) => {
                                    onInputChange({
                                        target: {
                                            name: 'positionId',
                                            value: selectedOption?.value || '',
                                        },
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                placeholder="Chọn chức vụ"
                                className={errors.positionId ? 'is-invalid' : ''}
                                classNamePrefix="select2"
                                styles={selectCustomStyles}
                                menuPortalTarget={document.body}
                            />
                            {errors.positionId && (
                                <div className="text-danger mt-1">{errors.positionId}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="specialtyId" className="form-label">
                                <i className="feather-heart me-1"></i> Chuyên khoa{' '}
                                <span className="text-danger">*</span>
                            </label>
                            <Select
                                inputId="specialtyId"
                                options={specialties.map((specialty) => ({
                                    value: specialty.id,
                                    label: specialty.name,
                                }))}
                                value={
                                    formData.specialtyId
                                        ? {
                                              value: formData.specialtyId,
                                              label: specialties.find(
                                                  (s) => s.id === formData.specialtyId
                                              )?.name,
                                          }
                                        : null
                                }
                                onChange={(selectedOption) => {
                                    onInputChange({
                                        target: {
                                            name: 'specialtyId',
                                            value: selectedOption?.value || '',
                                        },
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                placeholder="Chọn chuyên khoa"
                                className={errors.specialtyId ? 'is-invalid' : ''}
                                classNamePrefix="select2"
                                styles={selectCustomStyles}
                                menuPortalTarget={document.body}
                            />
                            {errors.specialtyId && (
                                <div className="text-danger mt-1">{errors.specialtyId}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Languages Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <h5 className="card-title mb-4">
                        <i className="feather-globe me-2"></i> Ngôn ngữ
                    </h5>
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex flex-wrap gap-2">
                                {languages.map((language) => (
                                    <div
                                        key={language.id}
                                        className={`border rounded p-3 ${formData.languageIds.includes(language.id) ? 'border-primary bg-light' : 'border-light bg-white'}`}
                                        style={{
                                            transition: 'all 0.3s ease',
                                            minWidth: '150px',
                                            maxWidth: '200px',
                                        }}
                                    >
                                        <div className="form-check d-flex align-items-center">
                                            <input
                                                className="form-check-input me-2"
                                                type="checkbox"
                                                id={`language-${language.id}`}
                                                checked={formData.languageIds.includes(language.id)}
                                                onChange={() => onLanguageToggle(language.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div>
                                                <label
                                                    className="form-check-label fw-bold mb-0 d-block"
                                                    htmlFor={`language-${language.id}`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {language.name}
                                                </label>
                                                <small
                                                    className={`text-muted ${formData.languageIds.includes(language.id) ? 'text-primary' : ''}`}
                                                >
                                                    {formData.languageIds.includes(language.id)
                                                        ? 'Đã chọn'
                                                        : 'Chưa chọn'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.languageIds && (
                                <div className="alert alert-danger mt-3 mb-0">
                                    <i className="feather-alert-circle me-1"></i>
                                    {errors.languageIds}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Prices Card */}
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
                    {formData.servicePrices.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            <i className="feather-plus-circle fs-1 mb-3"></i>
                            <p>Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {formData.servicePrices.map((price, index) => (
                                <div
                                    key={`${price.serviceTypeId}-${index}`}
                                    className="col-md-6 mb-3"
                                >
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
                                                    <i className="feather-briefcase me-1"></i> Loại
                                                    dịch vụ
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
                                                    hasError={
                                                        !!errors[
                                                            `servicePrices_${index}_amount` as keyof AddDoctorFormData
                                                        ]
                                                    }
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
                                                {errors[
                                                    `servicePrices_${index}_amount` as keyof AddDoctorFormData
                                                ] && (
                                                    <div className="invalid-feedback">
                                                        {
                                                            errors[
                                                                `servicePrices_${index}_amount` as keyof AddDoctorFormData
                                                            ]
                                                        }
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

            {/* Form Actions */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className="text-end">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            className="btn btn-light btn-md me-2"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <FullScreenSpinner isVisible={isLoading} />
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu bác sĩ'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddDoctorFormFields;
