import React from 'react';
import Select from 'react-select';
import Button from '@/components/Button';
import Input from '@/components/Input';
import CKEditor from '@/components/CKEditor';
import Spinner from '@/components/Spinner';
import { DoctorFormData } from '@/types/doctor.types';
import { DoctorPrice } from '@/types/serviceType.types';
// Options are provided from parent via props instead of using mock data
import { selectCustomStyles } from '@/constants/select.styles';
import styles from './DoctorFormFields.module.scss';
// Shared components to reduce duplication
import YearsOfExperienceField from '../shared/YearsOfExperienceField';
import PositionSpecialtySelects from '../shared/PositionSpecialtySelects';
import LanguagesSection from '../shared/LanguagesSection';
import ServicePricesSection from '../shared/ServicePricesSection';
import { prepareBioForSave } from '@/utils/bioHtmlProcessor';
import AvatarUpload from '@/components/AvatarUpload';

const BasicInfoFields: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isEdit?: boolean;
}> = ({ formData, errors, onInputChange, isEdit = false }) => (
    <div className="col-md-9">
        <div className="row">
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
                disabled={isEdit}
                readOnly={isEdit}
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
            <YearsOfExperienceField
                value={formData.yearsOfExperience}
                onChange={onInputChange}
                error={errors.yearsOfExperience}
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
    positions: Array<{ id: string; name: string }>;
    specialties: Array<{ id: string; name: string }>;
}> = ({ formData, errors, onInputChange, positions, specialties }) => (
    <div className="card mb-4">
        <div className={`card-body ${styles.sectionBorder}`}>
            <h5 className="card-title mb-4">Thông tin chuyên môn</h5>
            <div className="row">
                <PositionSpecialtySelects
                    positionId={formData.positionId}
                    specialtyId={formData.specialtyId}
                    positions={positions}
                    specialties={specialties}
                    onChange={onInputChange}
                    positionError={errors.positionId}
                    specialtyError={errors.specialtyId}
                />
            </div>
        </div>
    </div>
);

// Local LanguagesSection and ServicePricesSection components removed
// Now using shared components from ../shared folder

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
    isLoading?: boolean;
    positions: Array<{ id: string; name: string }>;
    specialties: Array<{ id: string; name: string }>;
    languages: Array<{ id: string; name: string }>;
    serviceTypes: Array<{ id: string; name: string }>;
    hasChanges?: boolean;
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
    isLoading = false,
    positions,
    specialties,
    languages,
    serviceTypes,
    hasChanges = true,
}) => {
    const renderSubmitButtonText = (): React.ReactNode => {
        if (isLoading) {
            return (
                <>
                    <Spinner size="small" variant="primary" className="me-2" />
                    {isEdit ? 'Đang cập nhật...' : 'Đang lưu...'}
                </>
            );
        }
        return isEdit ? 'Cập nhật bác sĩ' : 'Lưu bác sĩ';
    };

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
                    <Spinner size="medium" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <h5 className="card-title mb-4">Thông tin cơ bản</h5>
                    <div className="row">
                        <AvatarUpload
                            avatar={formData.avatar}
                            onFileChange={onFileChange}
                            iconClassName="feather-user"
                            label="Ảnh đại diện"
                            placeholderText="Kéo thả hoặc nhấp để chọn ảnh"
                        />
                        <BasicInfoFields
                            formData={formData}
                            errors={errors}
                            onInputChange={onInputChange}
                            isEdit={isEdit}
                        />
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <CKEditor
                                wrapperClassName="mb-3"
                                label="Tiểu sử"
                                icon="file-text"
                                iconPrefix="feather"
                                required
                                name="bio"
                                value={formData.bio}
                                onChange={(data) => {
                                    // Process HTML to add responsive classes
                                    const processedHtml = prepareBioForSave(data);
                                    onInputChange({
                                        target: {
                                            name: 'bio',
                                            value: processedHtml,
                                        },
                                    } as React.ChangeEvent<HTMLTextAreaElement>);
                                }}
                                placeholder="Mô tả về bác sĩ"
                                error={errors.bio}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ProfessionalInfoSection
                formData={formData}
                errors={errors}
                onInputChange={onInputChange}
                positions={positions}
                specialties={specialties}
            />
            <LanguagesSection
                selectedLanguageIds={formData.languageIds}
                languages={languages}
                onLanguageToggle={onLanguageToggle}
                error={errors.languageIds}
            />
            <ServicePricesSection
                servicePrices={formData.servicePrices}
                serviceTypes={serviceTypes}
                onServicePriceChange={onServicePriceChange}
                onAddServicePrice={onAddServicePrice}
                onRemoveServicePrice={onRemoveServicePrice}
                errors={errors as Record<string, string>}
            />

            {hasChanges && (
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
                                {renderSubmitButtonText()}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default DoctorFormFields;
