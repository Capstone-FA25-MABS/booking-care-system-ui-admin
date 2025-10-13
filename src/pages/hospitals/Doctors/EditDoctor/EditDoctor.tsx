import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorFormFields from '../components/DoctorFormFields';
import { DoctorFormData } from '@/types/doctor.types';
import { useDoctorFormLogic } from '@/hooks/useDoctorFormLogic';

const EditDoctor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const mockDoctorData: DoctorFormData = {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        dateOfBirth: '1985-01-15',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        gender: 'MALE',
        bio: 'Bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực tim mạch.',
        yearsOfExperience: 10,
        avatar: null,
        positionId: '550e8400-e29b-41d4-a716-446655440001',
        specialtyId: '550e8400-e29b-41d4-a716-446655440011',
        hospitalId: '550e8400-e29b-41d4-a716-446655440041',
        languageIds: [
            '550e8400-e29b-41d4-a716-446655440021',
            '550e8400-e29b-41d4-a716-446655440022',
        ],
        servicePrices: [
            { serviceTypeId: '550e8400-e29b-41d4-a716-446655440031', amount: 200000, note: '' },
            { serviceTypeId: '550e8400-e29b-41d4-a716-446655440032', amount: 500000, note: '' },
        ],
    };

    const {
        formData,
        errors,
        handleInputChange,
        handleLanguageToggle,
        handleServicePriceChange,
        addServicePrice,
        removeServicePrice,
        handleFileChange,
        validateForm,
        resetForm,
        prepareSubmitData,
    } = useDoctorFormLogic({ initialData: mockDoctorData, isEdit: true, doctorId: id });

    useEffect(() => {
        // In real app, fetch doctor data by ID
        // For now, using mock data
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const { doctorData, doctorLanguages, doctorPrices } = prepareSubmitData();

        console.log('Updating doctor:', {
            doctorData,
            doctorLanguages,
            doctorPrices,
        });

        alert('Cập nhật bác sĩ thành công!');
        navigate('/hospitals/doctors');
    };

    const handleCancel = () => {
        resetForm();
        navigate('/hospitals/doctors');
    };

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Chỉnh sửa Bác Sĩ</h4>
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
                        isEdit={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditDoctor;
