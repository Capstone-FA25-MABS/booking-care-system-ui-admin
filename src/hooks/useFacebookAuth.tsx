import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

interface FacebookAuthResponse {
    authResponse?: {
        accessToken: string;
        userID: string;
        expiresIn: number;
        signedRequest: string;
    };
    status: string;
}

interface FacebookUser {
    id: string;
    name: string;
    email: string;
    picture: {
        data: {
            url: string;
        };
    };
}

/**
 * Facebook OAuth hook for modern authentication
 * Uses Facebook SDK for JavaScript
 */
export const useFacebookAuth = (
    onSuccess?: (roles: string[]) => void,
    onError?: (error: string) => void
) => {
    const [isLoading, setIsLoading] = useState(false);
    const { facebookLogin } = useAuth();

    // Initialize Facebook SDK
    useEffect(() => {
        const initializeFacebookSDK = () => {
            // Check if Facebook App ID is configured
            if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
                toast.error('Facebook App ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
                return;
            }

            if (window.FB) {
                return; // Already initialized
            }

            // Load Facebook SDK
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);

            // Initialize when loaded
            window.fbAsyncInit = () => {
                window.FB.init({
                    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0',
                });

                // Success notification
                console.log('Facebook SDK initialized successfully');
            };

            // Handle script load error
            script.onerror = () => {
                toast.error('Không thể tải Facebook SDK. Vui lòng kiểm tra kết nối mạng.');
            };
        };

        initializeFacebookSDK();
    }, []);

    const handleFacebookResponse = useCallback(
        async (response: FacebookAuthResponse) => {
            try {
                if (!response.authResponse?.accessToken) {
                    throw new Error('No access token received from Facebook');
                }

                // Get user info from Facebook
                window.FB.api(
                    '/me',
                    { fields: 'id,name,email,picture' },
                    async (userInfo: FacebookUser) => {
                        if (!userInfo.email) {
                            setIsLoading(false);
                            toast.error('Cần quyền truy cập email để đăng nhập Facebook.');
                            onError?.('Email permission is required for Facebook login');
                            return;
                        }

                        try {
                            // Send access token to backend and get roles from response
                            const result = await facebookLogin({
                                accessToken: response.authResponse!.accessToken,
                            });
                            const roles = result?.roles || [];

                            setIsLoading(false);
                            toast.success('Đăng nhập Facebook thành công!');
                            onSuccess?.(roles);
                        } catch (error) {
                            setIsLoading(false);
                            toast.error('Xác thực Facebook thất bại. Vui lòng thử lại.');
                            console.error('Backend Facebook login failed:', error);
                            onError?.('Facebook authentication failed');
                        }
                    }
                );
            } catch (error) {
                setIsLoading(false);
                toast.error('Xử lý phản hồi Facebook thất bại. Vui lòng thử lại.');
                console.error('Facebook response handling error:', error);
                onError?.('Facebook login processing failed');
            }
        },
        [facebookLogin, onError, onSuccess]
    );

    const login = useCallback(async () => {
        if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
            toast.error('Facebook App ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
            onError?.('Facebook App ID not configured');
            return;
        }

        if (!window.FB) {
            toast.error('Facebook SDK chưa được tải. Vui lòng thử lại sau.');
            onError?.('Facebook SDK not loaded');
            return;
        }

        setIsLoading(true);

        try {
            // Get login status first
            window.FB.getLoginStatus((response: FacebookAuthResponse) => {
                if (response.status === 'connected') {
                    // User is already logged in
                    handleFacebookResponse(response);
                } else {
                    // Trigger Facebook login
                    window.FB.login(
                        (loginResponse: FacebookAuthResponse) => {
                            if (loginResponse.status === 'connected') {
                                handleFacebookResponse(loginResponse);
                            } else {
                                setIsLoading(false);
                                toast.error('Đăng nhập Facebook đã bị hủy hoặc thất bại.');
                                onError?.('Facebook login was cancelled or failed');
                            }
                        },
                        {
                            scope: 'email,public_profile',
                            return_scopes: true,
                        }
                    );
                }
            });
        } catch (error) {
            setIsLoading(false);
            toast.error('Đăng nhập Facebook thất bại. Vui lòng thử lại.');
            onError?.('Facebook login failed');
            console.error('Facebook login error:', error);
        }
    }, [handleFacebookResponse, onError]);

    return {
        login,
        isLoading,
    };
};
