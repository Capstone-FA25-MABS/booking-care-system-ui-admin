import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import DoctorFormFields from '@/pages/hospitals/Doctors/components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';
import { useDoctorFormOptions } from '@/hooks/useDoctorFormOptions';
import { prepareDoctorUpdatePayload } from '@/utils/doctor.utils';
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
                const [doctorRes, pricesRes] = await Promise.all([
                    getDoctorById(doctorProfile.id),
                    getDoctorPrices(doctorProfile.id),
                ]);

                const d = doctorRes.data as any;
                const formMapped: DoctorFormData = {
                    firstName: d.firstName || '',
                    lastName: d.lastName || '',
                    email: d.email || '',
                    phone: '',
                    dateOfBirth: '',
                    address: d.address || '',
                    gender: (d.gender as any) || '',
                    bio: d.bio || '',
                    yearsOfExperience: d.yearsOfExperience || 0,
                    avatar: d.avatarUrl || null,
                    positionId: d.position?.id || '',
                    specialtyId: d.specialty?.id || '',
                    hospitalId: d.hospital?.id || '',
                    languageIds: (d.languages || []).map((l: any) => l.id),
                    servicePrices: (pricesRes.data || []).map((p: any) => ({
                        id: p.id,
                        serviceTypeId: p.serviceTypeId,
                        amount: Number(p.amount),
                    })),
                };
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
            const server = err?.response?.data;
            const errorMessages: string[] = server?.errors || [];

            if (Array.isArray(errorMessages) && errorMessages.length) {
                const fieldErrorMap: Record<string, string> = {};
                errorMessages.forEach((msg: string) => {
                    const [field, ...rest] = msg.split(':');
                    const message = rest.join(':').trim() || msg;
                    const key = (field || '').trim().toLowerCase();
                    if (key.includes('email')) fieldErrorMap.email = message;
                    if (key.includes('firstname')) fieldErrorMap.firstName = message;
                    if (key.includes('lastname')) fieldErrorMap.lastName = message;
                    if (key.includes('address')) fieldErrorMap.address = message;
                    if (key.includes('gender')) fieldErrorMap.gender = message;
                    if (key.includes('bio')) fieldErrorMap.bio = message;
                    if (key.includes('years')) fieldErrorMap.yearsOfExperience = message;
                    if (key.includes('position')) fieldErrorMap.positionId = message;
                    if (key.includes('specialty')) fieldErrorMap.specialtyId = message;
                    if (key.includes('hospital')) fieldErrorMap.hospitalId = message;
                    if (key.includes('language')) fieldErrorMap.languageIds = message;
                    if (key.includes('price') || key.includes('amount'))
                        fieldErrorMap.servicePrices = message;
                });
                if (Object.keys(fieldErrorMap).length) {
                    setErrors(fieldErrorMap as any);
                }
                toast.error(server?.message || 'Cập nhật thất bại. Vui lòng kiểm tra dữ liệu.');
                return;
            }

            toast.error(err?.message || 'Cập nhật thông tin bác sĩ thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset to current profile data
        if (doctorProfile?.id) {
            const fetchData = async () => {
                try {
                    const [doctorRes, pricesRes] = await Promise.all([
                        getDoctorById(doctorProfile.id),
                        getDoctorPrices(doctorProfile.id),
                    ]);

                    const d = doctorRes.data as any;
                    const formMapped: DoctorFormData = {
                        firstName: d.firstName || '',
                        lastName: d.lastName || '',
                        email: d.email || '',
                        phone: '',
                        dateOfBirth: '',
                        address: d.address || '',
                        gender: (d.gender as any) || '',
                        bio: d.bio || '',
                        yearsOfExperience: d.yearsOfExperience || 0,
                        avatar: d.avatarUrl || null,
                        positionId: d.position?.id || '',
                        specialtyId: d.specialty?.id || '',
                        hospitalId: d.hospital?.id || '',
                        languageIds: (d.languages || []).map((l: any) => l.id),
                        servicePrices: (pricesRes.data || []).map((p: any) => ({
                            id: p.id,
                            serviceTypeId: p.serviceTypeId,
                            amount: Number(p.amount),
                        })),
                    };
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
