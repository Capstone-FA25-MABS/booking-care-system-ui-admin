import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { LoginFormData } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import ExternalAuthButtons from '@/components/ExternalAuthButtons';
import Input from '@/components/Input';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const [externalAuthError, setExternalAuthError] = useState<string | null>(null);

    // Google Auth Hook
    const { isLoading: googleLoading, login: triggerGoogleLogin } = useGoogleAuth(
        () => navigate('/dashboard'), // onSuccess
        () => setExternalAuthError('Đăng nhập Google thất bại. Vui lòng thử lại.') // onError
    );

    // Facebook Auth Hook
    const { isLoading: facebookLoading, login: triggerFacebookLogin } = useFacebookAuth(
        () => navigate('/dashboard'), // onSuccess
        () => setExternalAuthError('Đăng nhập Facebook thất bại. Vui lòng thử lại.') // onError
    );

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear validation error when user starts typing
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

        if (!formData.password) {
            errors.password = 'Mật khẩu là bắt buộc';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const loginRequest = {
                email: formData.email,
                password: formData.password,
            };

            await login(loginRequest);
            toast.success('Đăng nhập thành công');
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleGoogleLogin = () => {
        setExternalAuthError(null);
        setValidationErrors({});
        triggerGoogleLogin();
    };

    const handleFacebookLogin = () => {
        setExternalAuthError(null);
        setValidationErrors({});
        triggerFacebookLogin();
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex justify-content-center align-items-center">
            <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill w-100">
                <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                    <div className="card-body">
                        <div className="text-center mb-3">
                            <h5 className="mb-1 fs-20 fw-bold">Đăng nhập</h5>
                            <p className="mb-0">
                                Vui lòng nhập thông tin bên dưới để truy cập bảng điều khiển
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

                        <Input
                            label="Mật khẩu"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="****************"
                            icon="lock"
                            showPasswordToggle={true}
                            showPassword={showPassword}
                            onTogglePassword={togglePasswordVisibility}
                            error={validationErrors.password}
                            required={false}
                        />

                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                <div className="form-check form-check-md mb-0">
                                    <input
                                        className="form-check-input"
                                        id="remember_me"
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                    />
                                    <label
                                        htmlFor="remember_me"
                                        className="form-check-label mt-0 text-dark"
                                    >
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>
                            </div>
                            <div className="text-end">
                                <Link to="/forgot-password" className="text-danger">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>

                        {(error || externalAuthError) && (
                            <div className="alert alert-danger text-center" role="alert">
                                {error || externalAuthError}
                            </div>
                        )}

                        <div className="mb-2">
                            <button
                                type="submit"
                                className="btn bg-primary text-white w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>

                        <ExternalAuthButtons
                            externalAuthLoading={{
                                google: googleLoading,
                                facebook: facebookLoading,
                            }}
                            onGoogleLogin={handleGoogleLogin}
                            onFacebookLogin={handleFacebookLogin}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Login;
