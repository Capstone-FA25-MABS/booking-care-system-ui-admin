import React, { useState } from 'react';
import Select from 'react-select';
import styles from './AddDoctor.module.scss';

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
};

// Mock data for Doctor Management System
interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

interface Specialty {
    id: string;
    name: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

interface Language {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

interface ServiceType {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

interface Hospital {
    id: string;
    name: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

// Mock data
const mockPositions: Position[] = [
    {
        id: '1',
        name: 'Bác sĩ chính',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Bác sĩ phó',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Bác sĩ trưởng khoa',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '4',
        name: 'Bác sĩ thực tập',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockSpecialties: Specialty[] = [
    {
        id: '1',
        name: 'Tim mạch',
        imageUrl: 'https://bookingcaree.com/specialties/cardiology.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Thần kinh',
        imageUrl: 'https://bookingcaree.com/specialties/neurology.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Nhi khoa',
        imageUrl: 'https://bookingcaree.com/specialties/pediatrics.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '4',
        name: 'Sản phụ khoa',
        imageUrl: 'https://bookingcaree.com/specialties/gynecology.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '5',
        name: 'Da liễu',
        imageUrl: 'https://bookingcaree.com/specialties/dermatology.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '6',
        name: 'Mắt',
        imageUrl: 'https://bookingcaree.com/specialties/ophthalmology.jpg',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockLanguages: Language[] = [
    {
        id: '1',
        name: 'Tiếng Việt',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'English',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Français',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '4',
        name: '中文',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '5',
        name: '日本語',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockServiceTypes: ServiceType[] = [
    {
        id: '1',
        name: 'Khám trực tiếp',
        description: 'Khám bệnh trực tiếp tại bệnh viện',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Tư vấn trực tuyến',
        description: 'Tư vấn qua video call',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Khám tại nhà',
        description: 'Bác sĩ đến khám tại nhà bệnh nhân',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockHospitals: Hospital[] = [
    {
        id: '1',
        name: 'Bệnh viện Chợ Rẫy',
        address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Bệnh viện Bạch Mai',
        address: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Bệnh viện Vinmec',
        address: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

interface DoctorFormData {
    // Basic Information
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    gender: 'MALE' | 'FEMALE' | '';
    bio: string;
    yearsOfExperience: number;
    avatar: File | null;

    // Professional Information
    positionId: string;
    specialtyId: string;
    hospitalId: string;

    // Languages (multiple selection)
    languageIds: string[];

    // Service Prices (multiple services)
    servicePrices: {
        serviceTypeId: string;
        amount: number;
    }[];
}

interface DoctorLanguage {
    doctorId: string;
    languageId: string;
}

interface DoctorPrice {
    doctorId: string;
    serviceTypeId: string;
    amount: number;
}

const AddDoctor: React.FC = () => {
    const [formData, setFormData] = useState<DoctorFormData>({
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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            avatar: file,
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

        // Email validation - using a more secure regex pattern
        if (
            formData.email &&
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
        ) {
            newErrors.email = 'Định dạng email không hợp lệ';
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
            newErrors.servicePrices = 'Vui lòng thêm ít nhất một loại dịch vụ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Prepare data for API call
            const doctorData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                gender: formData.gender as 'MALE' | 'FEMALE',
                bio: formData.bio,
                yearsOfExperience: formData.yearsOfExperience,
                positionId: formData.positionId,
                specialtyId: formData.specialtyId,
                hospitalId: formData.hospitalId,
                avatar: formData.avatar,
            };

            const doctorLanguages: DoctorLanguage[] = formData.languageIds.map((languageId) => ({
                doctorId: '', // Will be set after doctor creation
                languageId,
            }));

            const doctorPrices: DoctorPrice[] = formData.servicePrices.map((price) => ({
                doctorId: '', // Will be set after doctor creation
                serviceTypeId: price.serviceTypeId,
                amount: price.amount,
            }));

            console.log('=== DOCTOR DATA ===');
            console.log('Doctor Data:', doctorData);
            console.log('Doctor Languages:', doctorLanguages);
            console.log('Doctor Prices:', doctorPrices);
            console.log('==================');

            alert('Dữ liệu đã được log ra console. Kiểm tra Developer Tools để xem chi tiết!');
        }
    };

    const handleCancel = () => {
        // Reset form
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
    };

    return (
        <div className="main-wrapper">
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-bold mb-0">Thêm Bác Sĩ </h4>
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
                                                            Họ{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập họ"
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
                                                            Tên{' '}
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên"
                                                        />
                                                        {errors.lastName && (
                                                            <div className="invalid-feedback">
                                                                {errors.lastName}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Email Address */}
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
                                                    options={mockPositions.map((position) => ({
                                                        value: position.id,
                                                        label: position.name,
                                                    }))}
                                                    value={
                                                        mockPositions.find(
                                                            (position) =>
                                                                position.id === formData.positionId
                                                        )
                                                            ? {
                                                                  value: formData.positionId,
                                                                  label:
                                                                      mockPositions.find(
                                                                          (position) =>
                                                                              position.id ===
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
                                                    options={mockSpecialties.map((specialty) => ({
                                                        value: specialty.id,
                                                        label: specialty.name,
                                                    }))}
                                                    value={
                                                        mockSpecialties.find(
                                                            (specialty) =>
                                                                specialty.id ===
                                                                formData.specialtyId
                                                        )
                                                            ? {
                                                                  value: formData.specialtyId,
                                                                  label:
                                                                      mockSpecialties.find(
                                                                          (specialty) =>
                                                                              specialty.id ===
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
                                                        mockHospitals.find(
                                                            (hospital) =>
                                                                hospital.id === formData.hospitalId
                                                        )
                                                            ? {
                                                                  value: formData.hospitalId,
                                                                  label:
                                                                      mockHospitals.find(
                                                                          (hospital) =>
                                                                              hospital.id ===
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
                                                                    <small className="text-muted">
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
                                                        <div className="card border">
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                                    <h6 className="card-title mb-0">
                                                                        Dịch vụ {index + 1}
                                                                    </h6>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={() =>
                                                                            removeServicePrice(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="fa-solid fa-xmark"></i>
                                                                    </button>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <label className="form-label">
                                                                        <i className="feather-list me-1"></i>
                                                                        Loại dịch vụ
                                                                    </label>
                                                                    <Select
                                                                        options={mockServiceTypes.map(
                                                                            (serviceType) => ({
                                                                                value: serviceType.id,
                                                                                label: serviceType.name,
                                                                            })
                                                                        )}
                                                                        value={
                                                                            mockServiceTypes.find(
                                                                                (serviceType) =>
                                                                                    serviceType.id ===
                                                                                    price.serviceTypeId
                                                                            )
                                                                                ? {
                                                                                      value: price.serviceTypeId,
                                                                                      label:
                                                                                          mockServiceTypes.find(
                                                                                              (
                                                                                                  serviceType
                                                                                              ) =>
                                                                                                  serviceType.id ===
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

                                                                <div>
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
                                                Lưu bác sĩ
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

export default AddDoctor;
