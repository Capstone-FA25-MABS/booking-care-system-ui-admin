import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddDoctorFormFields from './AddDoctorFormFields';
import { AddDoctorFormData } from '@/types/doctor.types';
import { useAddDoctorForm } from '@/hooks/useAddDoctorForm';
import { useDoctorFormOptions } from '@/hooks/useDoctorFormOptions';
import { registerDoctor } from '@/services/auth.service';
import { RegisterDoctorRequest } from '@/types/auth.types';
import { Gender, Role } from '@/enums/common.enums';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const AddDoctor: React.FC = () => {
    const navigate = useNavigate();
    const { roles } = useSelector((state: RootState) => state.auth);
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const initialData: AddDoctorFormData = {
        fullName: '',
        email: '',
        address: '',
        gender: Gender.MALE,
        bio: '',
        yearsOfExperience: 0,
        avatar: null,
        positionId: '',
        specialtyId: '',
        hospitalId: '',
        languageIds: [],
        servicePrices: [],
    };

    const {
        formData,
        errors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        validateForm,
        resetForm,
        prepareSubmitData,
    } = useAddDoctorForm({ initialData });

    const {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading: isLoadingOptions,
    } = useDoctorFormOptions();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const primaryRole = roles[0]?.toUpperCase();

        // Check if doctor profile is loaded
        if (primaryRole === Role.STAFF && !hospitalProfile) {
            console.warn('Hospital profile not loaded yet');
        }
    }, [roles, hospitalProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setIsSubmitting(true);
            const { doctorData, doctorLanguages, doctorPrices } = prepareSubmitData();

            // Prepare RegisterDoctorRequest
            // Convert Gender enum to string for backend
            const genderString: 'MALE' | 'FEMALE' =
                doctorData.gender === Gender.MALE ? 'MALE' : 'FEMALE';

            const registerRequest: RegisterDoctorRequest = {
                email: doctorData.email,
                fullName: doctorData.fullName,
                gender: genderString,
                address: hospitalProfile?.address || '',
                doctorProfile: {
                    positionId: doctorData.positionId,
                    specialtyId: doctorData.specialtyId,
                    hospitalId: hospitalProfile?.id || '',
                    bio: doctorData.bio,
                    yearsOfExperience: doctorData.yearsOfExperience,
                    languageIds: doctorLanguages.map((lang) => lang.languageId),
                    servicePrices: doctorPrices.map((price) => ({
                        serviceTypeId: price.serviceTypeId,
                        amount: price.amount,
                    })),
                },
            };

            const response = await registerDoctor(registerRequest);

            if (response.success) {
                toast.success(
                    'Thêm bác sĩ thành công! Thông tin đăng nhập đã được gửi đến email của bác sĩ.',
                    { autoClose: 5000 }
                );
                navigate('/hospitals/doctors');
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi thêm bác sĩ');
            }
        } catch (error: any) {
            console.error('Error registering doctor:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm bác sĩ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        navigate('/hospitals/doctors');
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Thêm Bác Sĩ</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <AddDoctorFormFields
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onLanguageToggle={handleLanguageToggle}
                        onServicePriceChange={handleServicePriceChange}
                        onAddServicePrice={addServicePrice}
                        onRemoveServicePrice={removeServicePrice}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoadingOptions || isSubmitting}
                        positions={positions}
                        specialties={specialties}
                        languages={languages}
                        serviceTypes={serviceTypes}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddDoctor;
