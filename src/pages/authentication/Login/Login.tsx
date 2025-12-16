import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { LoginFormData } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import ExternalAuthButtons from '@/components/ExternalAuthButtons';
import TwoFactorVerificationModal from '@/pages/authentication/TwoFactorAuthentication/Modal/TwoFactorVerificationModal';
import Input from '@/components/Input';
import { toast } from 'react-toastify';
import { getRedirectPathByRole, getSecuritySettingsPath } from '@/utils/navigation';
import { useAppDispatch } from '@/store/hooks';
import { complete2FALoginAsync } from '@/store/slices/authSlice';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, isAuthenticated, clearError, roles } = useAuth();
    const dispatch = useAppDispatch();

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
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [pending2FAAccountId, setPending2FAAccountId] = useState<string | null>(null);
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);

    // Get redirect path based on user roles and mustChangePassword flag
    const handleSuccessRedirect = (rolesFromAuth: string[], shouldChangePassword?: boolean) => {
        // Check if user must change password (from param or Redux state)
        if (shouldChangePassword) {
            const securityPath = getSecuritySettingsPath(rolesFromAuth);
            navigate(securityPath);
            return;
        }

        const redirectPath = getRedirectPathByRole(rolesFromAuth);
        navigate(redirectPath);
    };

    // Handle 2FA required from external auth
    const handle2FARequiredFromExternal = (accountId: string) => {
        setPending2FAAccountId(accountId);
        setShow2FAModal(true);
    };

    // Google Auth Hook
    const { isLoading: googleLoading, login: triggerGoogleLogin } = useGoogleAuth(
        handleSuccessRedirect, // onSuccess - receives roles from Google login
        () => setExternalAuthError('Đăng nhập Google thất bại. Vui lòng thử lại.'), // onError
        handle2FARequiredFromExternal // on2FARequired
    );

    // Facebook Auth Hook
    const { isLoading: facebookLoading, login: triggerFacebookLogin } = useFacebookAuth(
        handleSuccessRedirect, // onSuccess - receives roles from Facebook login
        () => setExternalAuthError('Đăng nhập Facebook thất bại. Vui lòng thử lại.'), // onError
        handle2FARequiredFromExternal // on2FARequired
    );

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && roles.length > 0) {
            const redirectPath = getRedirectPathByRole(roles);
            navigate(redirectPath);
        }
    }, [isAuthenticated, roles, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    // Clear form data when component mounts to prevent auto-submit
    useEffect(() => {
        // Clear form data to prevent browser auto-fill and auto-submit
        setFormData({
            email: '',
            password: '',
            rememberMe: false,
        });
    }, []); // Only run once on mount

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

        // Prevent submission if already authenticated (from useAuth hook)
        if (isAuthenticated && roles.length > 0) {
            const redirectPath = getRedirectPathByRole(roles);
            navigate(redirectPath);
            return;
        }

        // Prevent submission if 2FA modal is open or verifying
        if (show2FAModal || isVerifying2FA) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            const loginRequest = {
                email: formData.email,
                password: formData.password,
            };

            // Get roles from login result
            const result = await login(loginRequest);

            // Check if 2FA is required
            if (result?.requires2FA && result?.accountId) {
                setPending2FAAccountId(result.accountId);
                setShow2FAModal(true);
                return;
            }

            const rolesFromAuth = result?.roles || [];
            const shouldChangePassword = result?.mustChangePassword || false;

            // Show success toast only if not redirecting to change password
            // (toast for mustChangePassword will be shown in SecuritySettings)
            if (!shouldChangePassword) {
                toast.success('Đăng nhập thành công');
            }

            handleSuccessRedirect(rolesFromAuth, shouldChangePassword);
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

    const handle2FAVerification = async (code: string) => {
        if (!pending2FAAccountId) {
            setTwoFactorError('Không tìm thấy thông tin tài khoản');
            return;
        }

        setIsVerifying2FA(true);
        setTwoFactorError(null);

        try {
            // Dispatch complete2FALoginAsync thunk để xử lý verify và cập nhật auth state đầy đủ
            const result = await dispatch(
                complete2FALoginAsync({ accountId: pending2FAAccountId, code })
            ).unwrap();

            // Nếu thành công, result sẽ chứa roles, accessToken, emailConfirmed, etc.
            if (result.roles.length > 0) {
                setShow2FAModal(false);
                setPending2FAAccountId(null);

                // Đợi một chút để đảm bảo Redux state được cập nhật trước khi navigate
                // Điều này giúp ProtectedRoute có thể đọc được state đúng
                await new Promise((resolve) => setTimeout(resolve, 200));

                const shouldChangePassword = result.mustChangePassword || false;

                // Show success toast only if not redirecting to change password
                // (toast for mustChangePassword will be shown in SecuritySettings)
                if (!shouldChangePassword) {
                    toast.success('Đăng nhập thành công');
                }

                handleSuccessRedirect(result.roles, shouldChangePassword);
            } else {
                setTwoFactorError('Xác thực thất bại. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error('2FA verification failed:', err);
            setTwoFactorError(err || 'Mã xác thực không hợp lệ');
        } finally {
            setIsVerifying2FA(false);
        }
    };

    const handle2FAModalClose = () => {
        setShow2FAModal(false);
        setPending2FAAccountId(null);
        setTwoFactorError(null);
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

            <TwoFactorVerificationModal
                show={show2FAModal}
                onHide={handle2FAModalClose}
                onVerify={handle2FAVerification}
                isLoading={isVerifying2FA}
                error={twoFactorError}
            />
        </form>
    );
};

export default Login;
