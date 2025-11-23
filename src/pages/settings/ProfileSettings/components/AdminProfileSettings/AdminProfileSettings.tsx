import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Spinner from '@/components/Spinner';
import AvatarUpload from '@/components/AvatarUpload';
import { AppDispatch, RootState } from '@/store';
import { updateAdminProfile, setAdminProfile } from '@/store/slices/userSlice';
import { UpdateAdminRequest, AdminProfile } from '@/types/user.types';
import { UserService } from '@/services/user.service';
import { Gender } from '@/enums/common.enums';

const AdminProfileSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { adminProfile, isLoading } = useSelector((state: RootState) => state.user);

    const [formData, setFormData] = useState<UpdateAdminRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: undefined,
        dateOfBirth: '',
        address: '',
        avatarUrl: '',
    });

    const [initialFormData, setInitialFormData] = useState<UpdateAdminRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: undefined,
        dateOfBirth: '',
        address: '',
        avatarUrl: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateAdminRequest, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when profile loaded from Redux
    useEffect(() => {
        if (adminProfile) {
            const profileData = {
                firstName: adminProfile.firstName || '',
                lastName: adminProfile.lastName || '',
                email: adminProfile.email || '',
                phone: adminProfile.phone || '',
                gender: adminProfile.gender,
                dateOfBirth: adminProfile.dateOfBirth || '',
                address: adminProfile.address || '',
                avatarUrl: adminProfile.avatarUrl || '',
            };
            setFormData(profileData);
            setInitialFormData(profileData);
        }
    }, [adminProfile]);

    // Check if form has changes
    const hasChanges = (): boolean => {
        // Check basic form fields
        const formChanged = Object.keys(formData).some(
            (key) =>
                formData[key as keyof UpdateAdminRequest] !==
                initialFormData[key as keyof UpdateAdminRequest]
        );

        // Check files
        const filesChanged = avatarFile !== null;

        return formChanged || filesChanged;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name as keyof UpdateAdminRequest]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    // Validate form data
    const validateForm = (): Partial<Record<keyof UpdateAdminRequest, string>> | null => {
        const newErrors: Partial<Record<keyof UpdateAdminRequest, string>> = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'Họ là bắt buộc! Vui lòng nhập họ';
        }
        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Tên là bắt buộc! Vui lòng nhập tên';
        }
        if (!formData.email?.trim()) {
            newErrors.email = 'Email là bắt buộc! Vui lòng nhập email';
        } else {
            // Simple email validation with length limit to prevent ReDoS
            const email = formData.email.trim();
            if (email.length > 254) {
                newErrors.email = 'Email quá dài! Vui lòng nhập email hợp lệ';
            } else {
                // Simplified regex without backtracking vulnerability
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(email)) {
                    newErrors.email = 'Email không hợp lệ! Vui lòng nhập email đúng định dạng';
                }
            }
        }

        return Object.keys(newErrors).length > 0 ? newErrors : null;
    };

    // Update admin profile with files
    const updateProfileWithFiles = async (): Promise<AdminProfile | null> => {
        if (avatarFile) {
            console.log('Uploading avatar file:', avatarFile.name);
            try {
                // Upload avatar first (backend will auto-update avatarUrl in database)
                await UserService.uploadAdminAvatar(avatarFile);
                console.log('Avatar uploaded successfully');

                // Then update profile with other fields (avatarUrl is already updated by backend)
                const updatePayload = { ...formData };
                // Remove avatarUrl from payload since backend already updated it
                delete updatePayload.avatarUrl;

                const response = await dispatch(updateAdminProfile(updatePayload)).unwrap();
                setAvatarFile(null);

                // Refresh profile to get updated avatarUrl
                const refreshedProfile = await UserService.getAdminProfile();
                return refreshedProfile.data || response;
            } catch (error: any) {
                console.error('Error uploading avatar:', error);
                throw error;
            }
        }

        // No avatar file, just update profile
        return await dispatch(updateAdminProfile(formData)).unwrap();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminProfile?.id) {
            toast.error('Không tìm thấy thông tin admin');
            return;
        }

        const validationErrors = validateForm();
        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedProfile = await updateProfileWithFiles();

            if (updatedProfile) {
                dispatch(setAdminProfile(updatedProfile));
                toast.success('Cập nhật thông tin admin thành công!');

                // Reset change tracking
                setAvatarFile(null);

                // Update initial data to match current data
                const newInitialData = {
                    firstName: updatedProfile.firstName || '',
                    lastName: updatedProfile.lastName || '',
                    email: updatedProfile.email || '',
                    phone: updatedProfile.phone || '',
                    gender: updatedProfile.gender,
                    dateOfBirth: updatedProfile.dateOfBirth || '',
                    address: updatedProfile.address || '',
                    avatarUrl: updatedProfile.avatarUrl || '',
                };
                setFormData(newInitialData);
                setInitialFormData(newInitialData);
            }
        } catch (error: any) {
            console.error('Error updating admin profile:', error);
            // Handle 401 Unauthorized specifically
            if (
                error?.response?.status === 401 ||
                error?.message?.includes('401') ||
                error?.message?.includes('Unauthorized')
            ) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                toast.error(error.message || 'Không thể cập nhật thông tin admin');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form to initial state
        if (adminProfile) {
            setFormData(initialFormData);
            setAvatarFile(null);
            setErrors({});
        }
    };

    const renderSubmitButtonText = (): React.ReactNode => {
        if (isSubmitting) {
            return (
                <>
                    <Spinner size="small" variant="primary" className="me-2" />
                    Đang cập nhật...
                </>
            );
        }
        return 'Cập nhật thông tin';
    };

    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '400px' }}
            >
                <Spinner size="large" variant="primary" />
            </div>
        );
    }

    return (
        <>
            <div className="card-header border-bottom px-0 mx-3">
                <h5 className="fw-bold">Thông tin quản trị viên</h5>
            </div>
            <div className="card-body px-0 mx-3">
                <form onSubmit={handleSubmit}>
                    <div className="card mb-4">
                        <div className="card-body border-bottom">
                            <h5 className="card-title mb-4">Thông tin cơ bản</h5>
                            <div className="row">
                                <AvatarUpload
                                    avatarUrl={formData.avatarUrl || ''}
                                    avatarFile={avatarFile}
                                    onFileChange={handleAvatarFileChange}
                                    iconClassName="feather-user"
                                    label="Ảnh đại diện"
                                    placeholderText="Kéo thả hoặc nhấp để chọn ảnh"
                                    wrapperProps={
                                        {
                                            ['data-tour-id']: 'admin-avatar-upload',
                                        } as React.HTMLAttributes<HTMLDivElement>
                                    }
                                />
                                <div className="col-md-9">
                                    <div className="row">
                                        <Input
                                            wrapperClassName="col-md-6 mb-3"
                                            label="Họ"
                                            icon="user"
                                            iconPrefix="feather"
                                            required
                                            name="firstName"
                                            value={formData.firstName || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ"
                                            error={errors.firstName}
                                        />
                                        <Input
                                            wrapperClassName="col-md-6 mb-3"
                                            label="Tên"
                                            icon="user"
                                            iconPrefix="feather"
                                            required
                                            name="lastName"
                                            value={formData.lastName || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên"
                                            error={errors.lastName}
                                        />
                                        <Input
                                            wrapperClassName="col-md-6 mb-3"
                                            label="Email"
                                            icon="mail"
                                            iconPrefix="feather"
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập email"
                                            error={errors.email}
                                            disabled={true}
                                            readOnly={true}
                                        />
                                        <Input
                                            wrapperClassName="col-md-6 mb-3"
                                            label="Số điện thoại"
                                            icon="phone"
                                            iconPrefix="feather"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                            error={errors.phone}
                                        />
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="gender" className="form-label">
                                                Giới tính <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="gender"
                                                className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                                                name="gender"
                                                value={
                                                    formData.gender !== undefined
                                                        ? formData.gender
                                                        : ''
                                                }
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Chọn giới tính</option>
                                                <option value={Gender.MALE}>Nam</option>
                                                <option value={Gender.FEMALE}>Nữ</option>
                                                <option value={Gender.OTHER}>Khác</option>
                                            </select>
                                            {errors.gender && (
                                                <div className="invalid-feedback">
                                                    {errors.gender}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="dateOfBirth" className="form-label">
                                                Ngày sinh{' '}
                                                {errors.dateOfBirth && (
                                                    <span className="text-danger">*</span>
                                                )}
                                            </label>
                                            <LocalizationProvider
                                                dateAdapter={AdapterDateFns}
                                                adapterLocale={vi}
                                            >
                                                <DatePicker
                                                    value={
                                                        formData.dateOfBirth
                                                            ? new Date(formData.dateOfBirth)
                                                            : null
                                                    }
                                                    onChange={(newValue: Date | null) => {
                                                        if (newValue) {
                                                            // Format to YYYY-MM-DD for backend
                                                            const formattedDate = format(
                                                                newValue,
                                                                'yyyy-MM-dd'
                                                            );
                                                            handleInputChange({
                                                                target: {
                                                                    name: 'dateOfBirth',
                                                                    value: formattedDate,
                                                                },
                                                            } as React.ChangeEvent<HTMLInputElement>);
                                                        } else {
                                                            handleInputChange({
                                                                target: {
                                                                    name: 'dateOfBirth',
                                                                    value: '',
                                                                },
                                                            } as React.ChangeEvent<HTMLInputElement>);
                                                        }
                                                    }}
                                                    format="dd/MM/yyyy"
                                                    maxDate={new Date()}
                                                    dayOfWeekFormatter={(
                                                        day: Date | string
                                                    ): string => {
                                                        if (day instanceof Date) {
                                                            const dayIndex = day.getDay();
                                                            const dayNames = [
                                                                'Chủ nhật',
                                                                'Thứ 2',
                                                                'Thứ 3',
                                                                'Thứ 4',
                                                                'Thứ 5',
                                                                'Thứ 6',
                                                                'Thứ 7',
                                                            ];
                                                            return (
                                                                dayNames[dayIndex] ||
                                                                format(day, 'EEEE', { locale: vi })
                                                            );
                                                        }
                                                        const dayStr = String(day);
                                                        const dayMap: Record<string, string> = {
                                                            Mon: 'Thứ 2',
                                                            Tue: 'Thứ 3',
                                                            Wed: 'Thứ 4',
                                                            Thu: 'Thứ 5',
                                                            Fri: 'Thứ 6',
                                                            Sat: 'Thứ 7',
                                                            Sun: 'Chủ nhật',
                                                        };
                                                        return dayMap[dayStr] || dayStr;
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            id: 'dateOfBirth',
                                                            size: 'small' as const,
                                                            placeholder: 'Chọn ngày sinh',
                                                            error: !!errors.dateOfBirth,
                                                            helperText: errors.dateOfBirth,
                                                            fullWidth: true,
                                                            InputProps: {
                                                                startAdornment: (
                                                                    <i
                                                                        className="feather-calendar"
                                                                        style={{
                                                                            marginRight: '8px',
                                                                            color: errors.dateOfBirth
                                                                                ? '#dc3545'
                                                                                : '#6b7280',
                                                                        }}
                                                                    />
                                                                ),
                                                            },
                                                        },
                                                        day: {
                                                            sx: {
                                                                '&.Mui-selected': {
                                                                    backgroundColor: '#6366f1',
                                                                    '&:hover': {
                                                                        backgroundColor: '#4f46e5',
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    }}
                                                    sx={{
                                                        width: '100%',
                                                        '& .MuiInputBase-root, & .MuiPickersInputBase-root, & .MuiPickersOutlinedInput-root':
                                                            {
                                                                height: '38px !important',
                                                                minHeight: '38px',
                                                                fontSize: '0.875rem',
                                                                lineHeight: '1.5',
                                                                borderRadius: '0.375rem',
                                                                border: errors.dateOfBirth
                                                                    ? '1px solid #dc3545'
                                                                    : '1px solid #dee2e6',
                                                                background: '#fff',
                                                                padding: 0,
                                                                '&:hover': {
                                                                    borderColor: errors.dateOfBirth
                                                                        ? '#dc3545'
                                                                        : '#ced4da',
                                                                },
                                                                '&.Mui-focused': {
                                                                    borderColor: errors.dateOfBirth
                                                                        ? '#dc3545'
                                                                        : '#6366f1',
                                                                    boxShadow: errors.dateOfBirth
                                                                        ? '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
                                                                        : '0 0 0 0.2rem rgba(99, 102, 241, 0.25)',
                                                                },
                                                            },
                                                        '& .MuiInputBase-input': {
                                                            padding: '0.375rem 0.75rem',
                                                            height: '38px',
                                                            boxSizing: 'border-box',
                                                            fontWeight: 400,
                                                            color: '#212529',
                                                            fontSize: '0.875rem',
                                                            lineHeight: '1.5',
                                                        },
                                                        '& .MuiInputAdornment-root': {
                                                            marginLeft: 0,
                                                        },
                                                        '& .MuiSvgIcon-root': {
                                                            marginRight: '10px',
                                                        },
                                                    }}
                                                />
                                            </LocalizationProvider>
                                            {errors.dateOfBirth && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.dateOfBirth}
                                                </div>
                                            )}
                                        </div>
                                        <Input
                                            wrapperClassName="col-12 mb-3"
                                            label="Địa chỉ"
                                            icon="map-pin"
                                            iconPrefix="feather"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleInputChange}
                                            placeholder="Nhập địa chỉ"
                                            error={errors.address}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasChanges() && (
                        <div className="card mb-4">
                            <div className="card-body border-bottom">
                                <div className="text-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="md"
                                        className="btn btn-light btn-md me-2"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                                        {renderSubmitButtonText()}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default AdminProfileSettings;
