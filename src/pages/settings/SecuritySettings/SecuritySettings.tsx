import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import clsx from 'clsx';
import { RootState, AppDispatch } from '@/store';
import { AuthService } from '@/services/auth.service';
import { ChangePasswordRequest } from '@/types/auth.types';
import { clearMustChangePassword } from '@/store/slices/authSlice';
import { getRedirectPathByRole } from '@/utils/navigation';

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordRequirements {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    allMet: boolean;
}

const SecuritySettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { hasExternalProvider, mustChangePassword, roles } = useSelector(
        (state: RootState) => state.auth
    );

    const [isLoading, setIsLoading] = useState(false);

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRequirements: PasswordRequirements = useMemo(() => {
        const hasMinLength = passwordData.newPassword.length >= 8;
        const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowercase = /[a-z]/.test(passwordData.newPassword);
        const hasNumber = /\d/.test(passwordData.newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

        return {
            hasMinLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar,
            allMet: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
        };
    }, [passwordData.newPassword]);

    const passwordStrength = useMemo(() => {
        if (!passwordData.newPassword) return { score: 0, label: '', color: '', width: 0 };

        let score = 0;
        if (passwordRequirements.hasMinLength) score += 20;
        if (passwordRequirements.hasUppercase) score += 20;
        if (passwordRequirements.hasLowercase) score += 20;
        if (passwordRequirements.hasNumber) score += 20;
        if (passwordRequirements.hasSpecialChar) score += 20;

        if (score <= 20) return { score, label: 'Yếu', color: '#ef4444', width: 20 };
        if (score <= 40) return { score, label: 'Trung bình', color: '#f59e0b', width: 40 };
        if (score <= 60) return { score, label: 'Tốt', color: '#3b82f6', width: 60 };
        if (score <= 80) return { score, label: 'Mạnh', color: '#10b981', width: 80 };
        return { score, label: 'Rất mạnh', color: '#059669', width: 100 };
    }, [passwordData.newPassword, passwordRequirements]);

    const canSubmit = useMemo(() => {
        const hasNewPassword = passwordData.newPassword.trim() !== '';
        const hasConfirmPassword = passwordData.confirmPassword.trim() !== '';
        const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
        const newPasswordValid = passwordRequirements.allMet;

        if (hasExternalProvider) {
            return hasNewPassword && hasConfirmPassword && passwordsMatch && newPasswordValid;
        }

        const hasCurrentPassword = passwordData.currentPassword.trim() !== '';
        return (
            hasCurrentPassword &&
            hasNewPassword &&
            hasConfirmPassword &&
            passwordsMatch &&
            newPasswordValid
        );
    }, [passwordData, passwordRequirements.allMet, hasExternalProvider]);

    const handleInputChange = useCallback((field: keyof PasswordData, value: string) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit || isLoading) return;

        setIsLoading(true);
        try {
            const request: ChangePasswordRequest = {
                currentPassword: hasExternalProvider ? undefined : passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmNewPassword: passwordData.confirmPassword,
            };

            await AuthService.changePassword(request);
            toast.success('Thay đổi mật khẩu thành công!');

            // Clear mustChangePassword flag after successful password change
            if (mustChangePassword) {
                dispatch(clearMustChangePassword());
                // Redirect to dashboard after changing password
                const redirectPath = getRedirectPathByRole(roles);
                navigate(redirectPath);
                return;
            }

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = useCallback(() => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    }, []);

    const renderPasswordInput = (
        id: string,
        label: string,
        value: string,
        field: keyof PasswordData,
        showPassword: boolean,
        onToggle: () => void,
        isRequired: boolean = true
    ) => (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">
                {label}
                {isRequired && <span className="text-danger ms-1">*</span>}
            </label>
            <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                </span>
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0"
                    id={id}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                    value={value}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={onToggle}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                    {showPassword ? (
                        <EyeOff size={16} className="text-muted" />
                    ) : (
                        <Eye size={16} className="text-muted" />
                    )}
                </button>
            </div>
        </div>
    );

    const renderRequirementItem = (met: boolean, text: string) => (
        <div className="d-flex align-items-center gap-2">
            <CheckCircle size={14} className={met ? 'text-success' : 'text-muted'} />
            <span className={clsx('small', met ? 'text-success' : 'text-muted')}>{text}</span>
        </div>
    );

    return (
        <div className="content" id="securityPage">
            <div className="card">
                <div className="card-body p-0">
                    <div className="card w-100 mb-0 border-0 bg-light-500 shadow-none">
                        <div className="card-header border-bottom px-0 mx-3">
                            <div className="d-flex align-items-center gap-2">
                                <Shield size={20} className="text-primary" />
                                <h5 className="fw-bold mb-0">Bảo mật tài khoản</h5>
                            </div>
                        </div>
                        <div className="card-body px-0 mx-3">
                            <form onSubmit={handleSubmit}>
                                <div className="row justify-content-start">
                                    <div className="col-lg-8 col-xl-6">
                                        <h6 className="fw-semibold mb-2">Thay đổi mật khẩu</h6>

                                        {/* Warning alert when user must change password */}
                                        {mustChangePassword && (
                                            <div className="alert alert-warning d-flex align-items-start gap-2 mb-4">
                                                <AlertTriangle
                                                    size={20}
                                                    className="flex-shrink-0 mt-1"
                                                />
                                                <div>
                                                    <strong>Yêu cầu đổi mật khẩu</strong>
                                                    <p className="mb-0 small">
                                                        Bạn đang sử dụng mật khẩu tạm thời. Vui lòng
                                                        đổi mật khẩu để bảo mật tài khoản trước khi
                                                        tiếp tục sử dụng hệ thống.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!mustChangePassword && (
                                            <p className="text-muted small mb-4">
                                                Để bảo mật tài khoản, vui lòng không chia sẻ mật
                                                khẩu với người khác.
                                            </p>
                                        )}

                                        {/* Current Password */}
                                        {!hasExternalProvider &&
                                            renderPasswordInput(
                                                'currentPassword',
                                                'Mật khẩu hiện tại',
                                                passwordData.currentPassword,
                                                'currentPassword',
                                                showCurrentPassword,
                                                () => setShowCurrentPassword(!showCurrentPassword)
                                            )}

                                        {/* New Password */}
                                        {renderPasswordInput(
                                            'newPassword',
                                            'Mật khẩu mới',
                                            passwordData.newPassword,
                                            'newPassword',
                                            showNewPassword,
                                            () => setShowNewPassword(!showNewPassword)
                                        )}

                                        {/* Password Strength Indicator */}
                                        {passwordData.newPassword && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="text-muted">
                                                        Độ mạnh mật khẩu:
                                                    </small>
                                                    <small
                                                        className="fw-medium"
                                                        style={{ color: passwordStrength.color }}
                                                    >
                                                        {passwordStrength.label}
                                                    </small>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div
                                                        className="progress-bar"
                                                        role="progressbar"
                                                        style={{
                                                            width: `${passwordStrength.width}%`,
                                                            backgroundColor: passwordStrength.color,
                                                            transition: 'width 0.3s ease',
                                                        }}
                                                        aria-valuenow={passwordStrength.width}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirm Password */}
                                        {renderPasswordInput(
                                            'confirmPassword',
                                            'Xác nhận mật khẩu mới',
                                            passwordData.confirmPassword,
                                            'confirmPassword',
                                            showConfirmPassword,
                                            () => setShowConfirmPassword(!showConfirmPassword)
                                        )}

                                        {/* Password Match Indicator */}
                                        {passwordData.confirmPassword &&
                                            passwordData.newPassword ===
                                                passwordData.confirmPassword && (
                                                <div className="d-flex align-items-center gap-2 text-success mb-3">
                                                    <CheckCircle size={16} />
                                                    <span className="small">
                                                        Mật khẩu trùng khớp
                                                    </span>
                                                </div>
                                            )}

                                        {/* Password Requirements */}
                                        <div className="bg-light rounded-3 p-3 mb-4">
                                            <h6 className="fw-semibold mb-3 small">
                                                Yêu cầu mật khẩu
                                            </h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                {renderRequirementItem(
                                                    passwordRequirements.hasMinLength,
                                                    'Ít nhất 8 ký tự'
                                                )}
                                                {renderRequirementItem(
                                                    passwordRequirements.hasUppercase,
                                                    'Chữ hoa (A-Z)'
                                                )}
                                                {renderRequirementItem(
                                                    passwordRequirements.hasLowercase,
                                                    'Chữ thường (a-z)'
                                                )}
                                                {renderRequirementItem(
                                                    passwordRequirements.hasNumber,
                                                    'Số (0-9)'
                                                )}
                                                {renderRequirementItem(
                                                    passwordRequirements.hasSpecialChar,
                                                    'Ký tự đặc biệt'
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex justify-content-end gap-2">
                                            {!mustChangePassword && (
                                                <button
                                                    type="button"
                                                    className="btn btn-light"
                                                    onClick={handleCancel}
                                                    disabled={isLoading}
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                className={clsx(
                                                    'btn btn-primary',
                                                    (!canSubmit || isLoading) && 'disabled'
                                                )}
                                                disabled={!canSubmit || isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    'Thay đổi mật khẩu'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
