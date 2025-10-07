import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorFormFields from '../components/DoctorFormFields';
import { DoctorFormData, DoctorPrice } from '@/types/doctor.types';

const AddDoctor: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<DoctorFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
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

    const [errors, setErrors] = useState<
        Partial<
            Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
        >
    >({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'yearsOfExperience' ? Number(value) : value,
        }));
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
        field: keyof DoctorPrice,
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: prev.servicePrices.map((price, i) =>
                i === index ? { ...price, [field]: value } : price
            ),
        }));
        if (errors[`servicePrices_${index}_${field}`]) {
            setErrors((prev) => ({ ...prev, [`servicePrices_${index}_${field}`]: '' }));
        }
    };

    const addServicePrice = () => {
        setFormData((prev) => ({
            ...prev,
            servicePrices: [...prev.servicePrices, { serviceTypeId: '', amount: 0, note: '' }],
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
        const newErrors: Partial<
            Record<keyof DoctorFormData | `servicePrices_${number}_${keyof DoctorPrice}`, string>
        > = {};

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
                newErrors[field as keyof typeof newErrors] = 'Trường này là bắt buộc';
            }
        });

        if (
            formData.email &&
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
        ) {
            newErrors.email = 'Định dạng email không hợp lệ';
        }

        if (formData.yearsOfExperience < 0) {
            newErrors.yearsOfExperience = 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0';
        }

        if (formData.languageIds.length === 0) {
            newErrors.languageIds = 'Vui lòng chọn ít nhất một ngôn ngữ';
        }

        if (formData.servicePrices.length === 0) {
            newErrors.servicePrices = 'Vui lòng thêm ít nhất một loại dịch vụ';
        }

        formData.servicePrices.forEach((price, index) => {
            if (!price.serviceTypeId) {
                newErrors[`servicePrices_${index}_amount`] = 'Vui lòng chọn loại dịch vụ';
            }
            if (price.amount <= 0) {
                newErrors[`servicePrices_${index}_amount`] = 'Giá phải lớn hơn 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
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

            const doctorLanguages = formData.languageIds.map((languageId) => ({
                doctorId: '',
                languageId,
            }));

            const doctorPrices: DoctorPrice[] = formData.servicePrices.map((price) => ({
                serviceTypeId: price.serviceTypeId,
                amount: price.amount,
                note: price.note,
            }));

            console.log('=== DOCTOR DATA ===');
            console.log('Doctor Data:', doctorData);
            console.log('Doctor Languages:', doctorLanguages);
            console.log('Doctor Prices:', doctorPrices);
            console.log('==================');

            alert('Thêm bác sĩ thành công!');
            navigate('/hospitals/doctors');
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
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
            <div className="settings-wrapper">
                <div className="content">
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-bold mb-0">Thêm Bác Sĩ</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <DoctorFormFields
                                formData={formData}
                                errors={errors}
                                onInputChange={handleInputChange}
                                onLanguageToggle={handleLanguageToggle}
                                onServicePriceChange={handleServicePriceChange}
                                onAddServicePrice={addServicePrice}
                                onRemoveServicePrice={removeServicePrice}
                                onFileChange={handleFileChange}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isEdit={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDoctor;
