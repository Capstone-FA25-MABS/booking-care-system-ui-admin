import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ResetPasswordFormData } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import { AppDispatch, RootState } from '@/store';
import { resetPasswordAsync, clearError } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { VALIDATION_MESSAGES } from '@/constants/validation';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error: authError } = useSelector((state: RootState) => state.auth);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const resetToken = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState<ResetPasswordFormData>({
        email: email || '',
        resetToken: resetToken || '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [validationErrors, setValidationErrors] = useState<{
        newPassword?: string;
        confirmNewPassword?: string;
        token?: string;
    }>({});

    const [showPasswords, setShowPasswords] = useState({
        newPassword: false,
        confirmNewPassword: false,
    });

    const [localError, setLocalError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        // Clear any previous errors when component mounts
        dispatch(clearError());

        // Validate token and email are present
        if (!resetToken || !email) {
            setLocalError(
                'Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.'
            );
            return;
        }

        setFormData((prev) => ({
            ...prev,
            email: email,
            resetToken: resetToken,
        }));
    }, [resetToken, email, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const togglePasswordVisibility = (field: 'newPassword' | 'confirmNewPassword') => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validateForm = (): boolean => {
        const errors: typeof validationErrors = {};

        // Validate new password
        if (!formData.newPassword) {
            errors.newPassword = VALIDATION_MESSAGES.PASSWORD_NEW_REQUIRED;
        } else if (!AuthService.validatePassword(formData.newPassword)) {
            errors.newPassword = VALIDATION_MESSAGES.PASSWORD_STRENGTH_REQUIREMENT;
        }

        // Validate confirm password
        if (!formData.confirmNewPassword) {
            errors.confirmNewPassword = VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED;
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            errors.confirmNewPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
        }

        // Validate token
        if (!formData.resetToken) {
            errors.token = VALIDATION_MESSAGES.RESET_TOKEN_MISSING;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLocalError(null);

            await dispatch(
                resetPasswordAsync({
                    email: formData.email,
                    resetToken: formData.resetToken,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword,
                })
            ).unwrap();

            setIsSuccess(true);
        } catch (err: any) {
            setLocalError(
                err || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn hoặc không hợp lệ.'
            );
            console.error('Password reset failed:', err);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill w-100">
                    <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                        <div className="card-body">
                            <div className="mb-3 text-center">
                                <span>
                                    <i className="ti ti-circle-check-filled fs-48 text-success"></i>
                                </span>
                            </div>
                            <div className="text-center mb-3">
                                <h5 className="mb-1 fs-20 fw-bold">Đặt lại mật khẩu thành công!</h5>
                                <p className="mb-0">
                                    Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập
                                    bằng mật khẩu mới.
                                </p>
                            </div>
                            <div className="mt-3">
                                <Link to="/login" className="btn bg-primary text-white w-100">
                                    Tiếp tục đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Combined error state
    const displayError = localError || authError;

    // Error state for invalid/missing token
    if (displayError && (!resetToken || !email)) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill w-100">
                    <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                        <div className="card-body">
                            <div className="mb-3 text-center">
                                <span>
                                    <i className="ti ti-circle-x-filled fs-48 text-danger"></i>
                                </span>
                            </div>
                            <div className="text-center mb-3">
                                <h5 className="mb-1 fs-20 fw-bold">Link đặt lại không hợp lệ</h5>
                                <p className="mb-0">
                                    Link đặt lại này không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu
                                    đặt lại mật khẩu mới.
                                </p>
                            </div>
                            <div className="mt-3">
                                <Link
                                    to="/forgot-password"
                                    className="btn bg-primary text-white w-100"
                                >
                                    Yêu cầu đặt lại mới
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="d-flex justify-content-center align-items-center">
            <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill w-100">
                <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                    <div className="card-body">
                        <div className="text-center mb-3">
                            <h5 className="mb-1 fs-20 fw-bold">Đặt lại mật khẩu</h5>
                            <p className="mb-0">
                                Mật khẩu mới của bạn phải khác với những mật khẩu đã sử dụng trước
                                đó.
                            </p>
                        </div>

                        {/* New Password Field */}
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                                Mật khẩu
                            </label>
                            <div className="position-relative">
                                <div className="pass-group input-group position-relative border rounded">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="ti ti-lock text-dark fs-14"></i>
                                    </span>
                                    <input
                                        id="newPassword"
                                        type={showPasswords.newPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={`form-control ps-0 border-0 ${validationErrors.newPassword ? 'is-invalid' : ''}`}
                                        placeholder="Nhập mật khẩu mới"
                                        disabled={isLoading}
                                        aria-describedby={
                                            validationErrors.newPassword
                                                ? 'newPassword-error'
                                                : undefined
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="input-group-text bg-white border-0"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => togglePasswordVisibility('newPassword')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                togglePasswordVisibility('newPassword');
                                            }
                                        }}
                                        aria-label={
                                            showPasswords.newPassword
                                                ? 'Ẩn mật khẩu'
                                                : 'Hiển thị mật khẩu'
                                        }
                                        tabIndex={0}
                                    >
                                        <i
                                            className={`ti ${showPasswords.newPassword ? 'ti-eye' : 'ti-eye-off'} text-dark fs-14`}
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            {validationErrors.newPassword && (
                                <div id="newPassword-error" className="invalid-feedback d-block">
                                    {validationErrors.newPassword}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-3">
                            <label htmlFor="confirmNewPassword" className="form-label">
                                Xác nhận mật khẩu
                            </label>
                            <div className="position-relative">
                                <div className="pass-group input-group position-relative border rounded">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="ti ti-lock text-dark fs-14"></i>
                                    </span>
                                    <input
                                        id="confirmNewPassword"
                                        type={
                                            showPasswords.confirmNewPassword ? 'text' : 'password'
                                        }
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleInputChange}
                                        className={`form-control ps-0 border-0 ${validationErrors.confirmNewPassword ? 'is-invalid' : ''}`}
                                        placeholder="Xác nhận mật khẩu mới"
                                        disabled={isLoading}
                                        aria-describedby={
                                            validationErrors.confirmNewPassword
                                                ? 'confirmNewPassword-error'
                                                : undefined
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="input-group-text bg-white border-0"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            togglePasswordVisibility('confirmNewPassword')
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                togglePasswordVisibility('confirmNewPassword');
                                            }
                                        }}
                                        aria-label={
                                            showPasswords.confirmNewPassword
                                                ? 'Ẩn mật khẩu xác nhận'
                                                : 'Hiển thị mật khẩu xác nhận'
                                        }
                                        tabIndex={0}
                                    >
                                        <i
                                            className={`ti ${showPasswords.confirmNewPassword ? 'ti-eye' : 'ti-eye-off'} text-dark fs-14`}
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            {validationErrors.confirmNewPassword && (
                                <div
                                    id="confirmNewPassword-error"
                                    className="invalid-feedback d-block"
                                >
                                    {validationErrors.confirmNewPassword}
                                </div>
                            )}
                        </div>

                        {/* General Error */}
                        {displayError && (
                            <div className="alert alert-danger text-center" role="alert">
                                {displayError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="mb-3">
                            <button
                                type="submit"
                                className="btn bg-primary text-white w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đặt lại mật khẩu...' : 'Xác nhận'}
                            </button>
                        </div>

                        {/* Return to Login */}
                        <div className="text-center">
                            <h6 className="fw-normal fs-14 text-dark mb-0">
                                Quay lại
                                <Link to="/login" className="hover-a">
                                    {' '}
                                    Đăng nhập
                                </Link>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ResetPassword;
