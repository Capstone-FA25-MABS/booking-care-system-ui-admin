import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'react-toastify';

interface GoogleOAuthWrapperProps {
    children: React.ReactNode;
}

const GoogleOAuthWrapper: React.FC<GoogleOAuthWrapperProps> = ({ children }) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Show toast after component mounts để đảm bảo ToastContainer đã sẵn sàng
    useEffect(() => {
        if (!clientId) {
            toast.error('Biến môi trường VITE_GOOGLE_CLIENT_ID chưa được cấu hình');
        }
    }, [clientId]);

    // Nếu không có clientId, vẫn render children nhưng không wrap với GoogleOAuthProvider
    if (!clientId) {
        toast.error('Biến môi trường VITE_GOOGLE_CLIENT_ID chưa được cấu hình');
        return <>{children}</>;
    }

    return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
};

export default GoogleOAuthWrapper;
