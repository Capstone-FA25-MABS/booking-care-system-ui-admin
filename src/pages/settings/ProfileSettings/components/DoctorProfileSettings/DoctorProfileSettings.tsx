import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import DoctorFormFields from '@/pages/hospitals/Doctors/components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';
import { useDoctorFormOptions } from '@/hooks/useDoctorFormOptions';
import {
    prepareDoctorUpdatePayload,
    fetchDoctorDataForForm,
    handleDoctorFormError,
} from '@/utils/doctor.utils';
import { AppDispatch, RootState } from '@/store';
import { setDoctorProfile } from '@/store/slices/userSlice';
import { DoctorProfile } from '@/types/user.types';
import {
    getDoctorById,
    getDoctorPrices,
    updateDoctor,
    updateDoctorWithAvatar,
} from '@/services/doctor.service';

const DoctorProfileSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctorProfile } = useSelector((state: RootState) => state.user);

    const initialData: DoctorFormData = {
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
    };

    const {
        formData,
        errors,
        setFormData,
        setErrors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
        validateForm,
        prepareSubmitData,
    } = useDoctorFormLogic({ initialData, isEdit: true, doctorId: doctorProfile?.id });

    const {
        positions,
        specialties,
        languages,
        serviceTypes,
        isLoading: isLoadingOptions,
    } = useDoctorFormOptions();

    const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!doctorProfile?.id) return;
            try {
                setIsLoadingDoctor(true);
                const formMapped = await fetchDoctorDataForForm(
                    doctorProfile.id,
                    getDoctorById,
                    getDoctorPrices
                );
                setFormData(formMapped);
            } catch (error: any) {
                toast.error(error.message || 'Không thể tải thông tin bác sĩ');
            } finally {
                setIsLoadingDoctor(false);
            }
        };
        fetchDoctorData();
    }, [doctorProfile?.id, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !doctorProfile?.id) return;

        const { doctorData, doctorPrices } = prepareSubmitData();

        try {
            setIsSubmitting(true);

            const basePayload = prepareDoctorUpdatePayload({
                id: doctorProfile.id,
                doctorData,
                languageIds: formData.languageIds,
                doctorPrices,
            });

            let updatedProfile;
            if (doctorData.avatar && doctorData.avatar instanceof File) {
                const response = await updateDoctorWithAvatar(doctorProfile.id, {
                    ...basePayload,
                    avatarFile: doctorData.avatar,
                });
                updatedProfile = response.data;
            } else {
                // Use service directly instead of thunk to avoid type mismatch
                const response = await updateDoctor(doctorProfile.id, basePayload);
                updatedProfile = response.data;
            }

            // Update Redux store
            if (updatedProfile) {
                dispatch(setDoctorProfile(updatedProfile as DoctorProfile));
            }

            toast.success('Cập nhật thông tin bác sĩ thành công!');
        } catch (err: any) {
            try {
                handleDoctorFormError(err, setErrors, 'Cập nhật thông tin bác sĩ thất bại');
            } catch (error: any) {
                toast.error(error.message || 'Cập nhật thông tin bác sĩ thất bại');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset to current profile data
        if (doctorProfile?.id) {
            const fetchData = async () => {
                try {
                    const formMapped = await fetchDoctorDataForForm(
                        doctorProfile.id,
                        getDoctorById,
                        getDoctorPrices
                    );
                    setFormData(formMapped);
                    setErrors({});
                } catch {
                    // Silent fail - ignore errors when resetting form
                }
            };
            fetchData();
        }
    };

    if (isLoadingOptions || isLoadingDoctor) {
        return (
            <div className="card-header border-bottom px-0 mx-3">
                <h5 className="fw-bold">Thông tin bác sĩ</h5>
            </div>
        );
    }

    return (
        <>
            <div className="card-header border-bottom px-0 mx-3">
                <h5 className="fw-bold">Thông tin bác sĩ</h5>
            </div>
            <div className="card-body px-0 mx-3">
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
                    isEdit={true}
                    isLoading={isSubmitting}
                    positions={positions}
                    specialties={specialties}
                    languages={languages}
                    serviceTypes={serviceTypes}
                />
            </div>
        </>
    );
};

export default DoctorProfileSettings;
