import React from 'react';
import Select from 'react-select';
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
// Import shared components to reduce duplication
import ServicePricesSection from '../components/shared/ServicePricesSection';
import LanguagesSection from '../components/shared/LanguagesSection';
import YearsOfExperienceField from '../components/shared/YearsOfExperienceField';

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
                                                    value: selectedOption?.value ?? Gender.MALE,
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

                                <YearsOfExperienceField
                                    value={formData.yearsOfExperience}
                                    onChange={onInputChange}
                                    error={errors.yearsOfExperience}
                                />
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
            <LanguagesSection
                selectedLanguageIds={formData.languageIds}
                languages={languages}
                onLanguageToggle={onLanguageToggle}
                error={errors.languageIds}
            />

            {/* Service Prices Card */}
            <ServicePricesSection
                servicePrices={formData.servicePrices}
                serviceTypes={serviceTypes}
                onServicePriceChange={onServicePriceChange}
                onAddServicePrice={onAddServicePrice}
                onRemoveServicePrice={onRemoveServicePrice}
                errors={errors as Record<string, string>}
            />

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
