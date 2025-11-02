import React from 'react';
import { useAccountNotification } from '@/hooks/useAccountNotification';
import { useAppSelector } from '@/store/hooks';

interface AccountNotificationProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component to initialize SignalR connection for account notifications
 */
const AccountNotificationProvider: React.FC<AccountNotificationProviderProps> = ({ children }) => {
    const { accessToken } = useAppSelector((state) => state.auth);

    // Initialize SignalR connection
    useAccountNotification(accessToken);

    return <>{children}</>;
};

export default AccountNotificationProvider;
