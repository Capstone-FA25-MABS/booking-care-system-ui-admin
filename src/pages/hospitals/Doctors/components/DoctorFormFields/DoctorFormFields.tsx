import React from 'react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import Button from '@/components/Button';
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

// Sub-components to reduce cognitive complexity
const BasicInfoSection: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ formData, errors, onInputChange, onFileChange }) => (
    <div className="card mb-4">
        <div className={`card-body ${styles.sectionBorder}`}>
            <h5 className="card-title mb-4">Thông tin cơ bản</h5>
            <div className="row">
                <div className="col-md-3 mb-4">
                    <div className="text-center">
                        <div className="position-relative d-inline-block">
                            <div
                                className={`${styles.avatarContainer} ${styles.avatarLarge} ${styles.avatarBorder}`}
                            >
                                {formData.avatar ? (
                                    <img
                                        src={
                                            typeof formData.avatar === 'string'
                                                ? formData.avatar
                                                : URL.createObjectURL(formData.avatar)
                                        }
                                        alt="Avatar"
                                        className={`${styles.avatarImage} ${styles.avatarLarge}`}
                                    />
                                ) : (
                                    <i
                                        className={`${styles.avatarIcon} ${styles.avatarLarge} ti ti-user`}
                                    ></i>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="profileImage"
                                    onChange={onFileChange}
                                    className="d-none"
                                />
                                <label
                                    htmlFor="profileImage"
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{ cursor: 'pointer' }}
                                ></label>
                            </div>
                            <p className="mt-2 mb-0 text-muted">Ảnh đại diện</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-9">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">
                                <i className="feather-user me-1"></i>
                                Tên <span className="text-danger">*</span>
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                name="firstName"
                                value={formData.firstName}
                                onChange={onInputChange}
                                placeholder="Nhập tên"
                            />
                            {errors.firstName && (
                                <div className="invalid-feedback">{errors.firstName}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="lastName" className="form-label">
                                <i className="feather-user me-1"></i>
                                Họ <span className="text-danger">*</span>
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                name="lastName"
                                value={formData.lastName}
                                onChange={onInputChange}
                                placeholder="Nhập họ"
                            />
                            {errors.lastName && (
                                <div className="invalid-feedback">{errors.lastName}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">
                                <i className="feather-mail me-1"></i>
                                Email <span className="text-danger">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                name="email"
                                value={formData.email}
                                onChange={onInputChange}
                                placeholder="Nhập email"
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label">
                                <i className="feather-phone me-1"></i>
                                Số điện thoại <span className="text-danger">*</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                name="phone"
                                value={formData.phone}
                                onChange={onInputChange}
                                placeholder="Nhập số điện thoại"
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="dateOfBirth" className="form-label">
                                <i className="feather-calendar me-1"></i>
                                Ngày sinh <span className="text-danger">*</span>
                            </label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={onInputChange}
                            />
                            {errors.dateOfBirth && (
                                <div className="invalid-feedback">{errors.dateOfBirth}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="gender" className="form-label">
                                <i className="feather-users me-1"></i>
                                Giới tính <span className="text-danger">*</span>
                            </label>
                            <select
                                id="gender"
                                className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                                name="gender"
                                value={formData.gender}
                                onChange={onInputChange}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                            </select>
                            {errors.gender && (
                                <div className="invalid-feedback">{errors.gender}</div>
                            )}
                        </div>
                        <div className="col-12 mb-3">
                            <label htmlFor="address" className="form-label">
                                <i className="feather-map-pin me-1"></i>
                                Địa chỉ <span className="text-danger">*</span>
                            </label>
                            <textarea
                                id="address"
                                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                name="address"
                                value={formData.address}
                                onChange={onInputChange}
                                placeholder="Nhập địa chỉ"
                                rows={3}
                            />
                            {errors.address && (
                                <div className="invalid-feedback">{errors.address}</div>
                            )}
                        </div>
                        <div className="col-12 mb-3">
                            <label htmlFor="bio" className="form-label">
                                <i className="feather-file-text me-1"></i>
                                Giới thiệu <span className="text-danger">*</span>
                            </label>
                            <textarea
                                id="bio"
                                className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                                name="bio"
                                value={formData.bio}
                                onChange={onInputChange}
                                placeholder="Nhập giới thiệu về bác sĩ"
                                rows={4}
                            />
                            {errors.bio && <div className="invalid-feedback">{errors.bio}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProfessionalInfoSection: React.FC<{
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
}> = ({ formData, errors, onInputChange }) => (
    <div className="card mb-4">
        <div className={`card-body ${styles.sectionBorder}`}>
            <h5 className="card-title mb-4">Thông tin chuyên môn</h5>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="yearsOfExperience" className="form-label">
                        <i className="feather-award me-1"></i>
                        Số năm kinh nghiệm <span className="text-danger">*</span>
                    </label>
                    <NumericFormat
                        id="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onValueChange={(values) => {
                            const syntheticEvent = {
                                target: {
                                    name: 'yearsOfExperience',
                                    value: values.floatValue || 0,
                                },
                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                            onInputChange(syntheticEvent);
                        }}
                        className={`form-control ${errors.yearsOfExperience ? 'is-invalid' : ''}`}
                        placeholder="Nhập số năm kinh nghiệm"
                        allowNegative={false}
                        decimalScale={0}
                    />
                    {errors.yearsOfExperience && (
                        <div className="invalid-feedback">{errors.yearsOfExperience}</div>
                    )}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="positionId" className="form-label">
                        <i className="feather-briefcase me-1"></i>
                        Chức vụ <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="positionId"
                        value={
                            mockPositions.find((pos) => pos.id === formData.positionId)
                                ? {
                                      value: mockPositions.find(
                                          (pos) => pos.id === formData.positionId
                                      )!.id,
                                      label: mockPositions.find(
                                          (pos) => pos.id === formData.positionId
                                      )!.name,
                                  }
                                : null
                        }
                        onChange={(option) => {
                            onInputChange({
                                target: {
                                    name: 'positionId',
                                    value: option?.value || '',
                                },
                            } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        options={mockPositions.map((pos) => ({ value: pos.id, label: pos.name }))}
                        styles={selectCustomStyles}
                        placeholder="Chọn chức vụ"
                        isSearchable
                    />
                    {errors.positionId && (
                        <div className="invalid-feedback">{errors.positionId}</div>
                    )}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="specialtyId" className="form-label">
                        <i className="feather-activity me-1"></i>
                        Chuyên khoa <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="specialtyId"
                        value={
                            mockSpecialties.find((spec) => spec.id === formData.specialtyId)
                                ? {
                                      value: mockSpecialties.find(
                                          (spec) => spec.id === formData.specialtyId
                                      )!.id,
                                      label: mockSpecialties.find(
                                          (spec) => spec.id === formData.specialtyId
                                      )!.name,
                                  }
                                : null
                        }
                        onChange={(option) => {
                            onInputChange({
                                target: {
                                    name: 'specialtyId',
                                    value: option?.value || '',
                                },
                            } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        options={mockSpecialties.map((spec) => ({
                            value: spec.id,
                            label: spec.name,
                        }))}
                        styles={selectCustomStyles}
                        placeholder="Chọn chuyên khoa"
                        isSearchable
                    />
                    {errors.specialtyId && (
                        <div className="invalid-feedback">{errors.specialtyId}</div>
                    )}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="hospitalId" className="form-label">
                        <i className="feather-home me-1"></i>
                        Bệnh viện <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="hospitalId"
                        value={
                            mockHospitals.find((hosp) => hosp.id === formData.hospitalId)
                                ? {
                                      value: mockHospitals.find(
                                          (hosp) => hosp.id === formData.hospitalId
                                      )!.id,
                                      label: mockHospitals.find(
                                          (hosp) => hosp.id === formData.hospitalId
                                      )!.name,
                                  }
                                : null
                        }
                        onChange={(option) => {
                            onInputChange({
                                target: {
                                    name: 'hospitalId',
                                    value: option?.value || '',
                                },
                            } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        options={mockHospitals.map((hosp) => ({
                            value: hosp.id,
                            label: hosp.name,
                        }))}
                        styles={selectCustomStyles}
                        placeholder="Chọn bệnh viện"
                        isSearchable
                    />
                    {errors.hospitalId && (
                        <div className="invalid-feedback">{errors.hospitalId}</div>
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
            <h5 className="card-title mb-4">Ngôn ngữ</h5>
            <div className="row">
                {mockLanguages.map((language) => (
                    <div key={language.id} className="col-md-4 mb-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`language-${language.id}`}
                                checked={formData.languageIds.includes(language.id)}
                                onChange={() => onLanguageToggle(language.id)}
                            />
                            <label className="form-check-label" htmlFor={`language-${language.id}`}>
                                <img
                                    src={language.flag}
                                    alt={language.name}
                                    className="me-2"
                                    style={{ width: '20px', height: '15px' }}
                                />
                                {language.name}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            {errors.languageIds && <div className="text-danger mt-2">{errors.languageIds}</div>}
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
        <div className={`card-body ${styles.sectionBorder}`}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Giá dịch vụ</h5>
                <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    onClick={onAddServicePrice}
                >
                    <i className="ti ti-plus me-1"></i>
                    Thêm dịch vụ
                </Button>
            </div>
            {formData.servicePrices.map((price, index) => (
                <div key={index} className="row mb-3 p-3 border rounded">
                    <div className="col-md-5 mb-3">
                        <label className="form-label">Loại dịch vụ</label>
                        <Select
                            value={
                                mockServiceTypes.find((type) => type.id === price.serviceTypeId)
                                    ? {
                                          value: mockServiceTypes.find(
                                              (type) => type.id === price.serviceTypeId
                                          )!.id,
                                          label: mockServiceTypes.find(
                                              (type) => type.id === price.serviceTypeId
                                          )!.name,
                                      }
                                    : null
                            }
                            onChange={(option) => {
                                onServicePriceChange(index, 'serviceTypeId', option?.value || '');
                            }}
                            options={mockServiceTypes.map((type) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                            styles={selectCustomStyles}
                            placeholder="Chọn loại dịch vụ"
                            isSearchable
                        />
                        {errors[`servicePrices_${index}_serviceTypeId`] && (
                            <div className="text-danger mt-1">
                                {errors[`servicePrices_${index}_serviceTypeId`]}
                            </div>
                        )}
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Giá (VNĐ)</label>
                        <NumericFormat
                            value={price.amount}
                            onValueChange={(values) => {
                                onServicePriceChange(index, 'amount', values.floatValue || 0);
                            }}
                            className="form-control"
                            placeholder="Nhập giá"
                            thousandSeparator=","
                            allowNegative={false}
                        />
                        {errors[`servicePrices_${index}_amount`] && (
                            <div className="text-danger mt-1">
                                {errors[`servicePrices_${index}_amount`]}
                            </div>
                        )}
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label">Ghi chú</label>
                        <input
                            type="text"
                            className="form-control"
                            value={price.note}
                            onChange={(e) => onServicePriceChange(index, 'note', e.target.value)}
                            placeholder="Ghi chú"
                        />
                    </div>
                    <div className="col-md-1 mb-3 d-flex align-items-end">
                        <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onRemoveServicePrice(index)}
                        >
                            <i className="ti ti-trash"></i>
                        </Button>
                    </div>
                </div>
            ))}
            {errors.servicePrices && <div className="text-danger mt-2">{errors.servicePrices}</div>}
        </div>
    </div>
);

interface DoctorFormFieldsProps {
    formData: DoctorFormData;
    errors: Partial<
        Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
    >;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
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
            <BasicInfoSection
                formData={formData}
                errors={errors}
                onInputChange={onInputChange}
                onFileChange={onFileChange}
            />

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

            <div className="d-flex justify-content-end gap-2">
                <Button type="button" variant="outline-secondary" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" variant="primary">
                    {isEdit ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </div>
        </form>
    );
};

export default DoctorFormFields;
