import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

interface UseGoogleAuthReturn {
    isLoading: boolean;
    login: () => void;
}

export const useGoogleAuth = (
    onSuccess?: () => void,
    onError?: (error: any) => void
): UseGoogleAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const { googleLogin } = useAuth();

    // Handle async Google login without returning Promise from callback
    const handleGoogleSuccess = (tokenResponse: any) => {
        void (async () => {
            try {
                setIsLoading(true);

                // Use auth hook's googleLogin method
                await googleLogin({ accessToken: tokenResponse.access_token });

                toast.success('Đăng nhập thành công');
                onSuccess?.();
            } catch (error) {
                console.error('Google authentication failed:', error);
                toast.error(error as string);
                onError?.(error);
            } finally {
                setIsLoading(false);
            }
        })();
    };

    // Always call useGoogleLogin hook - React hooks must be called in the same order
    const googleLoginFn = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => {
            console.error('Google OAuth error:', error);
            toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
            onError?.(error);
            setIsLoading(false);
        },
        scope: 'email profile',
    });

    const login = () => {
        try {
            googleLoginFn();
        } catch (error) {
            console.error('Google OAuth Provider not available:', error);
            toast.error('Google OAuth không khả dụng. Vui lòng kiểm tra cấu hình.');
            onError?.(new Error('Google OAuth Provider not available'));
        }
    };

    return {
        isLoading,
        login,
    };
};
