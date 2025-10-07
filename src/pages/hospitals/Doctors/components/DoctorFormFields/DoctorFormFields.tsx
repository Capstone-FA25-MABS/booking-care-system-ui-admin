import React from 'react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { DoctorFormData, DoctorPrice } from '@/types/doctor.types';
import {
    mockPositions,
    mockSpecialties,
    mockLanguages,
    mockServiceTypes,
    mockHospitals,
} from '@/data/doctor.mockData';
import { selectCustomStyles } from '@/constants/select.styles';
import styles from './DoctorFormFields.module.scss';

// Custom input component for NumericFormat (extracted to avoid inline component definition)
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

// Sub-components to reduce cognitive complexity
const AvatarSection: React.FC<{
    formData: DoctorFormData;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ formData, onFileChange }) => (
    <div className="col-md-3 mb-4">
        <div className="text-center">
            <div className="position-relative d-inline-block">
                <div
                    className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}
                >
                    {formData.avatar ? (
                        <img
                            src={
                                typeof formData.avatar === 'string'
                                    ? formData.avatar
                                    : URL.createObjectURL(formData.avatar)
                            }
                            alt="Profile"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%',
                            }}
                        />
                    ) : (
                        <i className="feather-user fs-1 text-muted"></i>
                    )}
                </div>
                <div
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '30px', height: '30px' }}
                >
                    <i className="feather-camera text-white" style={{ fontSize: '14px' }}></i>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    name="avatar"
                    id="profileImage"
                    onChange={onFileChange}
                    className="d-none"
                />
                <label
                    htmlFor="profileImage"
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ cursor: 'pointer' }}
                    aria-label="Upload profile image"
                ></label>
            </div>
            <p className="mt-2 mb-0 text-muted">Ảnh đại diện</p>
        </div>
    </div>
);

const BasicInfoFields: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ formData, errors, onInputChange }) => (
    <div className="col-md-9">
        <div className="row">
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Tên"
                icon="user"
                iconPrefix="feather"
                required
                name="firstName"
                value={formData.firstName}
                onChange={onInputChange}
                placeholder="Nhập tên"
                error={errors.firstName}
            />
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Họ"
                icon="user"
                iconPrefix="feather"
                required
                name="lastName"
                value={formData.lastName}
                onChange={onInputChange}
                placeholder="Nhập họ"
                error={errors.lastName}
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
                        { value: 'MALE', label: 'Nam' },
                        { value: 'FEMALE', label: 'Nữ' },
                    ]}
                    value={
                        formData.gender
                            ? {
                                  value: formData.gender,
                                  label: formData.gender === 'MALE' ? 'Nam' : 'Nữ',
                              }
                            : null
                    }
                    onChange={(selectedOption) => {
                        onInputChange({
                            target: {
                                name: 'gender',
                                value: selectedOption?.value || '',
                            },
                        } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="Chọn giới tính"
                    className={errors.gender ? 'is-invalid' : ''}
                    classNamePrefix="select2"
                    styles={selectCustomStyles}
                    menuPortalTarget={document.body}
                />
                {errors.gender && <div className="text-danger mt-1">{errors.gender}</div>}
            </div>
            <Input
                wrapperClassName="col-md-6 mb-3"
                label="Địa chỉ"
                icon="map-pin"
                iconPrefix="feather"
                required
                name="address"
                value={formData.address}
                onChange={onInputChange}
                placeholder="Nhập địa chỉ"
                error={errors.address}
            />
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
                    <div className="invalid-feedback">{errors.yearsOfExperience}</div>
                )}
            </div>
            <Textarea
                wrapperClassName="col-12 mb-3"
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
);

const ProfessionalInfoSection: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ formData, errors, onInputChange }) => (
    <div className="card mb-4">
        <div className={`card-body ${styles.sectionBorder}`}>
            <h5 className="card-title mb-4">Thông tin chuyên môn</h5>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <label htmlFor="positionId" className="form-label">
                        <i className="feather-briefcase me-1"></i> Chức vụ{' '}
                        <span className="text-danger">*</span>
                    </label>
                    <Select
                        inputId="positionId"
                        options={mockPositions.map((position) => ({
                            value: position.id,
                            label: position.name,
                        }))}
                        value={
                            formData.positionId
                                ? {
                                      value: formData.positionId,
                                      label: mockPositions.find((p) => p.id === formData.positionId)
                                          ?.name,
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
                <div className="col-md-4 mb-3">
                    <label htmlFor="specialtyId" className="form-label">
                        <i className="feather-heart me-1"></i> Chuyên khoa{' '}
                        <span className="text-danger">*</span>
                    </label>
                    <Select
                        inputId="specialtyId"
                        options={mockSpecialties.map((specialty) => ({
                            value: specialty.id,
                            label: specialty.name,
                        }))}
                        value={
                            formData.specialtyId
                                ? {
                                      value: formData.specialtyId,
                                      label: mockSpecialties.find(
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
                <div className="col-md-4 mb-3">
                    <label htmlFor="hospitalId" className="form-label">
                        <i className="feather-home me-1"></i> Bệnh viện{' '}
                        <span className="text-danger">*</span>
                    </label>
                    <Select
                        inputId="hospitalId"
                        options={mockHospitals.map((hospital) => ({
                            value: hospital.id,
                            label: hospital.name,
                        }))}
                        value={
                            formData.hospitalId
                                ? {
                                      value: formData.hospitalId,
                                      label: mockHospitals.find((h) => h.id === formData.hospitalId)
                                          ?.name,
                                  }
                                : null
                        }
                        onChange={(selectedOption) => {
                            onInputChange({
                                target: {
                                    name: 'hospitalId',
                                    value: selectedOption?.value || '',
                                },
                            } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        placeholder="Chọn bệnh viện"
                        className={errors.hospitalId ? 'is-invalid' : ''}
                        classNamePrefix="select2"
                        styles={selectCustomStyles}
                        menuPortalTarget={document.body}
                    />
                    {errors.hospitalId && (
                        <div className="text-danger mt-1">{errors.hospitalId}</div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const LanguagesSection: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onLanguageToggle: (languageId: string) => void;
}> = ({ formData, errors, onLanguageToggle }) => (
    <div className="card mb-4">
        <div className={`card-body ${styles.sectionBorder}`}>
            <h5 className="card-title mb-4">
                <i className="feather-globe me-2"></i> Ngôn ngữ
            </h5>
            <div className="row">
                <div className="col-12">
                    <div className="d-flex flex-wrap gap-2">
                        {mockLanguages.map((language) => (
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
);

const ServicePriceItem: React.FC<{
    price: DoctorPrice;
    index: number;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onServicePriceChange: (index: number, field: keyof DoctorPrice, value: string | number) => void;
    onRemoveServicePrice: (index: number) => void;
}> = ({ price, index, errors, onServicePriceChange, onRemoveServicePrice }) => (
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
                    <label htmlFor={`serviceType-${index}`} className="form-label">
                        <i className="feather-briefcase me-1"></i> Loại dịch vụ
                    </label>
                    <Select
                        inputId={`serviceType-${index}`}
                        options={mockServiceTypes.map((service) => ({
                            value: service.id,
                            label: service.name,
                        }))}
                        value={
                            price.serviceTypeId
                                ? {
                                      value: price.serviceTypeId,
                                      label:
                                          mockServiceTypes.find((s) => s.id === price.serviceTypeId)
                                              ?.name || '',
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
                    <label htmlFor={`serviceAmount-${index}`} className="form-label">
                        <i className="feather-dollar-sign me-1"></i> Giá (VNĐ)
                    </label>
                    <NumericFormat
                        id={`serviceAmount-${index}`}
                        customInput={CustomNumericInput}
                        hasError={!!errors[`servicePrices_${index}_amount` as keyof DoctorFormData]}
                        value={price.amount}
                        onValueChange={(values) =>
                            onServicePriceChange(index, 'amount', values.floatValue || 0)
                        }
                        thousandSeparator=","
                        allowNegative={false}
                        decimalScale={0}
                        suffix=" VNĐ"
                    />
                    {errors[`servicePrices_${index}_amount` as keyof DoctorFormData] && (
                        <div className="invalid-feedback">
                            {errors[`servicePrices_${index}_amount` as keyof DoctorFormData]}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const ServicePricesSection: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onServicePriceChange: (index: number, field: keyof DoctorPrice, value: string | number) => void;
    onAddServicePrice: () => void;
    onRemoveServicePrice: (index: number) => void;
}> = ({ formData, errors, onServicePriceChange, onAddServicePrice, onRemoveServicePrice }) => (
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
                        <ServicePriceItem
                            key={`${price.serviceTypeId}-${index}`}
                            price={price}
                            index={index}
                            errors={errors}
                            onServicePriceChange={onServicePriceChange}
                            onRemoveServicePrice={onRemoveServicePrice}
                        />
                    ))}
                </div>
            )}
            {errors.servicePrices && <div className="text-danger mt-2">{errors.servicePrices}</div>}
        </div>
    </div>
);

interface DoctorFormFieldsProps {
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onLanguageToggle: (languageId: string) => void;
    onServicePriceChange: (index: number, field: keyof DoctorPrice, value: string | number) => void;
    onAddServicePrice: () => void;
    onRemoveServicePrice: (index: number) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

const DoctorFormFields: React.FC<DoctorFormFieldsProps> = ({
    formData,
    errors,
    onInputChange,
    onLanguageToggle,
    onServicePriceChange,
    onAddServicePrice,
    onRemoveServicePrice,
    onFileChange,
    onSubmit,
    onCancel,
    isEdit = false,
}) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <h5 className="card-title mb-4">Thông tin cơ bản</h5>
                    <div className="row">
                        <AvatarSection formData={formData} onFileChange={onFileChange} />
                        <BasicInfoFields
                            formData={formData}
                            errors={errors}
                            onInputChange={onInputChange}
                        />
                    </div>
                </div>
            </div>

            <ProfessionalInfoSection
                formData={formData}
                errors={errors}
                onInputChange={onInputChange}
            />
            <LanguagesSection
                formData={formData}
                errors={errors}
                onLanguageToggle={onLanguageToggle}
            />
            <ServicePricesSection
                formData={formData}
                errors={errors}
                onServicePriceChange={onServicePriceChange}
                onAddServicePrice={onAddServicePrice}
                onRemoveServicePrice={onRemoveServicePrice}
            />

            <div className="text-end mb-4 mt-4">
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="btn btn-light btn-md me-2"
                    onClick={onCancel}
                >
                    Hủy
                </Button>
                <Button type="submit" variant="primary">
                    {isEdit ? 'Cập nhật bác sĩ' : 'Lưu bác sĩ'}
                </Button>
            </div>
        </form>
    );
};

export default DoctorFormFields;
