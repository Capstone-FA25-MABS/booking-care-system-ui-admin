import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import styles from './EditDoctor.module.scss';

// Types for react-select styles
interface SelectStyles {
    control: (provided: any) => any;
    valueContainer: (provided: any) => any;
    multiValue: (provided: any) => any;
    multiValueLabel: (provided: any) => any;
    multiValueRemove: (provided: any) => any;
    option: (provided: any, state: any) => any;
    placeholder: (provided: any) => any;
    singleValue: (provided: any) => any;
    menu: (provided: any) => any;
    menuList: (provided: any) => any;
    menuPortal: (provided: any) => any;
}

// Custom styles for react-select (same as ListDoctors)
const selectCustomStyles: SelectStyles = {
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
};

// Mock data for Doctor Management System
interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface Specialty {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface Language {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface ServiceType {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface Hospital {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface DoctorFormData {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    gender: 'MALE' | 'FEMALE' | '';
    bio: string;
    yearsOfExperience: number;
    avatar: File | null;
    positionId: string;
    specialtyId: string;
    hospitalId: string;
    languageIds: string[];
    servicePrices: { serviceTypeId: string; amount: number }[];
}

const EditDoctor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Mock data
    const mockPositions: Position[] = [
        { id: '1', name: 'Bác sĩ chính', status: 'ACTIVE' },
        { id: '2', name: 'Bác sĩ phó', status: 'ACTIVE' },
        { id: '3', name: 'Bác sĩ trưởng khoa', status: 'ACTIVE' },
        { id: '4', name: 'Bác sĩ thực tập', status: 'ACTIVE' },
    ];

    const mockSpecialties: Specialty[] = [
        { id: '1', name: 'Tim mạch', status: 'ACTIVE' },
        { id: '2', name: 'Thần kinh', status: 'ACTIVE' },
        { id: '3', name: 'Nội khoa', status: 'ACTIVE' },
        { id: '4', name: 'Ngoại khoa', status: 'ACTIVE' },
        { id: '5', name: 'Sản phụ khoa', status: 'ACTIVE' },
    ];

    const mockLanguages: Language[] = [
        { id: '1', name: 'Tiếng Việt', status: 'ACTIVE' },
        { id: '2', name: 'Tiếng Anh', status: 'ACTIVE' },
        { id: '3', name: 'Tiếng Pháp', status: 'ACTIVE' },
        { id: '4', name: 'Tiếng Nhật', status: 'ACTIVE' },
        { id: '5', name: 'Tiếng Hàn', status: 'ACTIVE' },
    ];

    const mockServiceTypes: ServiceType[] = [
        { id: '1', name: 'Khám tổng quát', status: 'ACTIVE' },
        { id: '2', name: 'Khám chuyên khoa', status: 'ACTIVE' },
        { id: '3', name: 'Tư vấn sức khỏe', status: 'ACTIVE' },
        { id: '4', name: 'Khám định kỳ', status: 'ACTIVE' },
    ];

    const mockHospitals: Hospital[] = [
        { id: '1', name: 'Bệnh viện Chợ Rẫy', status: 'ACTIVE' },
        { id: '2', name: 'Bệnh viện 115', status: 'ACTIVE' },
        { id: '3', name: 'Bệnh viện Đại học Y Dược', status: 'ACTIVE' },
        { id: '4', name: 'Bệnh viện Nhi Đồng', status: 'ACTIVE' },
    ];

    // Mock doctor data for editing
    const mockDoctorData: DoctorFormData = {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: 'nguyenvana@example.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        gender: 'MALE',
        bio: 'Bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực tim mạch.',
        yearsOfExperience: 10,
        avatar: null,
        positionId: '1',
        specialtyId: '1',
        hospitalId: '1',
        languageIds: ['1', '2'],
        servicePrices: [
            { serviceTypeId: '1', amount: 200000 },
            { serviceTypeId: '2', amount: 500000 },
        ],
    };

    const [formData, setFormData] = useState<DoctorFormData>(mockDoctorData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load doctor data on component mount
    useEffect(() => {
        // In real app, fetch doctor data by ID
        setFormData(mockDoctorData);
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            avatar: file,
        }));
    };

    const handleLanguageToggle = (languageId: string) => {
        setFormData((prev) => ({
            ...prev,
            languageIds: prev.languageIds.includes(languageId)
                ? prev.languageIds.filter((id) => id !== languageId)
                : [...prev.languageIds, languageId],
        }));
    };

    const handleServicePriceChange = (
        index: number,
        field: 'serviceTypeId' | 'amount',
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: prev.servicePrices.map((price, i) =>
                i === index ? { ...price, [field]: value } : price
            ),
        }));
    };

    const addServicePrice = () => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: [...prev.servicePrices, { serviceTypeId: '', amount: 0 }],
        }));
    };

    const removeServicePrice = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: prev.servicePrices.filter((_, i) => i !== index),
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        const requiredFields = [
            'firstName',
            'lastName',
            'email',
            'address',
            'gender',
            'bio',
            'positionId',
            'specialtyId',
            'hospitalId',
        ];

        requiredFields.forEach((field) => {
            if (!formData[field as keyof DoctorFormData]) {
                newErrors[field] = 'Trường này là bắt buộc';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Years of experience validation
        if (formData.yearsOfExperience < 0) {
            newErrors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
        }

        // Language validation
        if (formData.languageIds.length === 0) {
            newErrors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
        }

        // Service prices validation
        if (formData.servicePrices.length === 0) {
            newErrors.servicePrices = 'Vui lòng thêm ít nhất một dịch vụ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare data for API
        const doctorData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            gender: formData.gender,
            bio: formData.bio,
            yearsOfExperience: formData.yearsOfExperience,
            positionId: formData.positionId,
            specialtyId: formData.specialtyId,
            hospitalId: formData.hospitalId,
        };

        const doctorLanguages = formData.languageIds.map((languageId) => ({
            doctorId: id,
            languageId: languageId,
        }));

        const doctorPrices = formData.servicePrices.map((price) => ({
            doctorId: id,
            serviceTypeId: price.serviceTypeId,
            amount: price.amount,
        }));

        console.log('Updating doctor:', {
            doctorData,
            doctorLanguages,
            doctorPrices,
        });

        // In real app, call API to update doctor
        alert('Cập nhật bác sĩ thành công!');
        navigate('/hospitals/doctors');
    };

    const handleCancel = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            gender: '',
            bio: '',
            yearsOfExperience: 0,
            avatar: null,
            positionId: '',
            specialtyId: '',
            hospitalId: '',
            languageIds: [],
            servicePrices: [],
        });
        setErrors({});
        navigate('/hospitals/doctors');
    };

    return (
        <div className="main-wrapper">
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-bold mb-0">Chỉnh sửa Bác Sĩ </h4>
                        </div>
                    </div>
                    {/* /Page Header */}

                    <div className="row">
                        <div className="col-sm-12">
                            <form onSubmit={handleSubmit}>
                                {/* Basic Information Section */}
                                <div className="card mb-4">
                                    <div className={`card-body ${styles.sectionBorder}`}>
                                        <h5 className="card-title mb-4">Thông tin cơ bản</h5>

                                        <div className="row">
                                            {/* Profile Image */}
                                            <div className="col-md-3 mb-4">
                                                <div className="text-center">
                                                    <div className="position-relative d-inline-block">
                                                        <div
                                                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '120px',
                                                                height: '120px',
                                                            }}
                                                        >
                                                            <i className="feather-user fs-1 text-muted"></i>
                                                        </div>
                                                        <div
                                                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '30px',
                                                                height: '30px',
                                                            }}
                                                        >
                                                            <i
                                                                className="feather-camera text-white"
                                                                style={{ fontSize: '14px' }}
                                                            ></i>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            name="avatar"
                                                            id="profileImage"
                                                            onChange={handleFileChange}
                                                            className="d-none"
                                                        />
                                                        <label
                                                            htmlFor="profileImage"
                                                            className="position-absolute top-0 start-0 w-100 h-100"
                                                            style={{ cursor: 'pointer' }}
                                                        ></label>
                                                    </div>
                                                    <p className="mt-2 mb-0 text-muted">
                                                        Ảnh đại diện
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="col-md-9">
                                                <div className="row">
                                                    {/* First Name */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-user me-1"></i>
                                                            Tên{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên"
                                                        />
                                                        {errors.firstName && (
                                                            <div className="invalid-feedback">
                                                                {errors.firstName}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Last Name */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-user me-1"></i>
                                                            Họ{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập họ"
                                                        />
                                                        {errors.lastName && (
                                                            <div className="invalid-feedback">
                                                                {errors.lastName}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Email */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-mail me-1"></i>
                                                            Email{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập email"
                                                        />
                                                        {errors.email && (
                                                            <div className="invalid-feedback">
                                                                {errors.email}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Gender */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-users me-1"></i>
                                                            Giới tính{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Select
                                                            options={[
                                                                { value: 'MALE', label: 'Nam' },
                                                                { value: 'FEMALE', label: 'Nữ' },
                                                            ]}
                                                            value={
                                                                formData.gender
                                                                    ? {
                                                                          value: formData.gender,
                                                                          label:
                                                                              formData.gender ===
                                                                              'MALE'
                                                                                  ? 'Nam'
                                                                                  : 'Nữ',
                                                                      }
                                                                    : null
                                                            }
                                                            onChange={(selectedOption) => {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    gender: selectedOption?.value as
                                                                        | 'MALE'
                                                                        | 'FEMALE'
                                                                        | '',
                                                                }));
                                                                if (errors.gender) {
                                                                    setErrors((prev) => ({
                                                                        ...prev,
                                                                        gender: '',
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="Chọn giới tính"
                                                            className={
                                                                errors.gender ? 'is-invalid' : ''
                                                            }
                                                            classNamePrefix="select2"
                                                            styles={selectCustomStyles}
                                                            menuPortalTarget={document.body}
                                                        />
                                                        {errors.gender && (
                                                            <div className="text-danger mt-1">
                                                                {errors.gender}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Address */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-map-pin me-1"></i>
                                                            Địa chỉ{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập địa chỉ"
                                                        />
                                                        {errors.address && (
                                                            <div className="invalid-feedback">
                                                                {errors.address}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Years of Experience */}
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-award me-1"></i>
                                                            Số năm kinh nghiệm{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className={`form-control ${errors.yearsOfExperience ? 'is-invalid' : ''}`}
                                                            name="yearsOfExperience"
                                                            value={formData.yearsOfExperience}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập số năm kinh nghiệm"
                                                            min="0"
                                                        />
                                                        {errors.yearsOfExperience && (
                                                            <div className="invalid-feedback">
                                                                {errors.yearsOfExperience}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bio */}
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">
                                                            <i className="feather-file-text me-1"></i>
                                                            Tiểu sử{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <textarea
                                                            className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                                                            name="bio"
                                                            value={formData.bio}
                                                            onChange={handleInputChange}
                                                            rows={4}
                                                            placeholder="Mô tả về bác sĩ"
                                                        ></textarea>
                                                        {errors.bio && (
                                                            <div className="invalid-feedback">
                                                                {errors.bio}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information Section */}
                                <div className="card mb-4">
                                    <div className={`card-body ${styles.sectionBorder}`}>
                                        <h5 className="card-title mb-4">Thông tin chuyên môn</h5>

                                        <div className="row">
                                            {/* Position */}
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">
                                                    <i className="feather-briefcase me-1"></i>
                                                    Chức vụ <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={mockPositions.map((pos) => ({
                                                        value: pos.id,
                                                        label: pos.name,
                                                    }))}
                                                    value={
                                                        formData.positionId
                                                            ? {
                                                                  value: formData.positionId,
                                                                  label:
                                                                      mockPositions.find(
                                                                          (p) =>
                                                                              p.id ===
                                                                              formData.positionId
                                                                      )?.name || '',
                                                              }
                                                            : null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            positionId: selectedOption?.value || '',
                                                        }));
                                                        if (errors.positionId) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                positionId: '',
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Chọn chức vụ"
                                                    className={
                                                        errors.positionId ? 'is-invalid' : ''
                                                    }
                                                    classNamePrefix="select2"
                                                    styles={selectCustomStyles}
                                                    menuPortalTarget={document.body}
                                                />
                                                {errors.positionId && (
                                                    <div className="text-danger mt-1">
                                                        {errors.positionId}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Specialty */}
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">
                                                    <i className="feather-heart me-1"></i>
                                                    Chuyên khoa{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={mockSpecialties.map((spec) => ({
                                                        value: spec.id,
                                                        label: spec.name,
                                                    }))}
                                                    value={
                                                        formData.specialtyId
                                                            ? {
                                                                  value: formData.specialtyId,
                                                                  label:
                                                                      mockSpecialties.find(
                                                                          (s) =>
                                                                              s.id ===
                                                                              formData.specialtyId
                                                                      )?.name || '',
                                                              }
                                                            : null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            specialtyId:
                                                                selectedOption?.value || '',
                                                        }));
                                                        if (errors.specialtyId) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                specialtyId: '',
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Chọn chuyên khoa"
                                                    className={
                                                        errors.specialtyId ? 'is-invalid' : ''
                                                    }
                                                    classNamePrefix="select2"
                                                    styles={selectCustomStyles}
                                                    menuPortalTarget={document.body}
                                                />
                                                {errors.specialtyId && (
                                                    <div className="text-danger mt-1">
                                                        {errors.specialtyId}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hospital */}
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">
                                                    <i className="feather-home me-1"></i>
                                                    Bệnh viện <span className="text-danger">*</span>
                                                </label>
                                                <Select
                                                    options={mockHospitals.map((hospital) => ({
                                                        value: hospital.id,
                                                        label: hospital.name,
                                                    }))}
                                                    value={
                                                        formData.hospitalId
                                                            ? {
                                                                  value: formData.hospitalId,
                                                                  label:
                                                                      mockHospitals.find(
                                                                          (h) =>
                                                                              h.id ===
                                                                              formData.hospitalId
                                                                      )?.name || '',
                                                              }
                                                            : null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            hospitalId: selectedOption?.value || '',
                                                        }));
                                                        if (errors.hospitalId) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                hospitalId: '',
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Chọn bệnh viện"
                                                    className={
                                                        errors.hospitalId ? 'is-invalid' : ''
                                                    }
                                                    classNamePrefix="select2"
                                                    styles={selectCustomStyles}
                                                    menuPortalTarget={document.body}
                                                />
                                                {errors.hospitalId && (
                                                    <div className="text-danger mt-1">
                                                        {errors.hospitalId}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Languages Section */}
                                <div className="card mb-4">
                                    <div className={`card-body ${styles.sectionBorder}`}>
                                        <h5 className="card-title mb-4">
                                            <i className="feather-globe me-2"></i>
                                            Ngôn ngữ
                                        </h5>

                                        <div className="row">
                                            <div className="col-12">
                                                <div className="d-flex flex-wrap gap-2">
                                                    {mockLanguages.map((language) => (
                                                        <div
                                                            key={language.id}
                                                            className={`border rounded p-3 ${formData.languageIds.includes(language.id) ? 'border-primary bg-light' : 'border-light bg-white'}`}
                                                            style={{
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                minWidth: '150px',
                                                                maxWidth: '200px',
                                                            }}
                                                            onClick={() =>
                                                                handleLanguageToggle(language.id)
                                                            }
                                                        >
                                                            <div className="form-check d-flex align-items-center">
                                                                <input
                                                                    className="form-check-input me-2"
                                                                    type="checkbox"
                                                                    id={`language-${language.id}`}
                                                                    checked={formData.languageIds.includes(
                                                                        language.id
                                                                    )}
                                                                    onChange={() =>
                                                                        handleLanguageToggle(
                                                                            language.id
                                                                        )
                                                                    }
                                                                />
                                                                <div>
                                                                    <label
                                                                        className="form-check-label fw-bold mb-0 d-block"
                                                                        htmlFor={`language-${language.id}`}
                                                                    >
                                                                        {language.name}
                                                                    </label>
                                                                    <small
                                                                        className={`text-muted ${formData.languageIds.includes(language.id) ? 'text-primary' : ''}`}
                                                                    >
                                                                        {formData.languageIds.includes(
                                                                            language.id
                                                                        )
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

                                {/* Service Prices Section */}
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="card-title mb-0">
                                                <i className="feather-dollar-sign me-2"></i>
                                                Dịch vụ và giá
                                            </h5>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={addServicePrice}
                                            >
                                                <i className="feather-plus me-1"></i>
                                                Thêm dịch vụ
                                            </button>
                                        </div>

                                        {formData.servicePrices.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                <i className="feather-plus-circle fs-1 mb-3"></i>
                                                <p>
                                                    Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt
                                                    đầu.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="row">
                                                {formData.servicePrices.map((price, index) => (
                                                    <div key={index} className="col-md-6 mb-3">
                                                        <div className="border rounded p-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <h6 className="mb-0">
                                                                    Dịch vụ {index + 1}
                                                                </h6>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() =>
                                                                        removeServicePrice(index)
                                                                    }
                                                                >
                                                                    <i className="fa-solid fa-xmark"></i>
                                                                </button>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-6 mb-3">
                                                                    <label className="form-label">
                                                                        <i className="feather-briefcase me-1"></i>
                                                                        Loại dịch vụ
                                                                    </label>
                                                                    <Select
                                                                        options={mockServiceTypes.map(
                                                                            (service) => ({
                                                                                value: service.id,
                                                                                label: service.name,
                                                                            })
                                                                        )}
                                                                        value={
                                                                            price.serviceTypeId
                                                                                ? {
                                                                                      value: price.serviceTypeId,
                                                                                      label:
                                                                                          mockServiceTypes.find(
                                                                                              (s) =>
                                                                                                  s.id ===
                                                                                                  price.serviceTypeId
                                                                                          )?.name ||
                                                                                          '',
                                                                                  }
                                                                                : null
                                                                        }
                                                                        onChange={(
                                                                            selectedOption
                                                                        ) =>
                                                                            handleServicePriceChange(
                                                                                index,
                                                                                'serviceTypeId',
                                                                                selectedOption?.value ||
                                                                                    ''
                                                                            )
                                                                        }
                                                                        placeholder="Chọn loại dịch vụ"
                                                                        classNamePrefix="select2"
                                                                        styles={selectCustomStyles}
                                                                        menuPortalTarget={
                                                                            document.body
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="col-md-6 mb-3">
                                                                    <label className="form-label">
                                                                        <i className="feather-dollar-sign me-1"></i>
                                                                        Giá (VNĐ)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        value={price.amount}
                                                                        onChange={(e) =>
                                                                            handleServicePriceChange(
                                                                                index,
                                                                                'amount',
                                                                                Number(
                                                                                    e.target.value
                                                                                )
                                                                            )
                                                                        }
                                                                        placeholder="Nhập giá"
                                                                        min="0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors.servicePrices && (
                                            <div className="text-danger mt-2">
                                                {errors.servicePrices}
                                            </div>
                                        )}

                                        {/* Submit Buttons */}
                                        <div className="text-end mb-4 mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-light btm-md me-2"
                                                onClick={handleCancel}
                                            >
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                Cập nhật bác sĩ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDoctor;
