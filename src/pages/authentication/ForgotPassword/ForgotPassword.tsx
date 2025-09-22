import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { forgotPasswordAsync, clearError } from '@/store/slices/authSlice';
import { ForgotPasswordFormData } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/Input';

const ForgotPassword: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error: authError } = useSelector((state: RootState) => state.auth);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ForgotPasswordFormData>({
        email: '',
    });

    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
    }>({});

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        dispatch(clearError());
        setLocalError(null);
    }, [dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: typeof validationErrors = {};

        if (!formData.email) {
            errors.email = 'Email là bắt buộc';
        } else if (!AuthService.validateEmail(formData.email)) {
            errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLocalError(null);

            await dispatch(forgotPasswordAsync({ email: formData.email })).unwrap();
            setIsSubmitted(true);
        } catch (err: any) {
            setLocalError(err || 'Yêu cầu quên mật khẩu thất bại');
            console.error('Forgot password request failed:', err);
        }
    };

    if (isSubmitted) {
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
                                <h5 className="mb-1 fs-20 fw-bold">Email đã được gửi!</h5>
                                <p className="mb-0">
                                    Kiểm tra email của bạn và làm theo hướng dẫn để đặt lại mật
                                    khẩu.
                                </p>
                            </div>
                            <div className="mt-3">
                                <Link to="/login" className="btn bg-primary text-white w-100">
                                    Quay lại đăng nhập
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
                            <h5 className="mb-1 fs-20 fw-bold">Quên mật khẩu</h5>
                            <p className="mb-0">
                                Đừng lo, chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu
                            </p>
                        </div>

                        <Input
                            label="Địa chỉ Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ Email"
                            icon="mail"
                            error={validationErrors.email}
                            required={false}
                        />

                        {(localError || authError) && (
                            <div className="alert alert-danger text-center" role="alert">
                                {localError || authError}
                            </div>
                        )}

                        <div className="mb-3">
                            <button
                                type="submit"
                                className="btn bg-primary text-white w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang gửi...' : 'Đặt lại mật khẩu'}
                            </button>
                        </div>
                        <div className="text-center">
                            <h6 className="fw-normal fs-14 text-dark mb-0">
                                Quay lại
                                <Link to="/login" className="hover-a">
                                    {' '}
                                    đăng nhập
                                </Link>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ForgotPassword;
