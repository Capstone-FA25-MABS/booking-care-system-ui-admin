interface MainHeaderProps {
    handleClickMenuButton: () => void;
}

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import logo from '@/assets/img/logo.svg';
import logoSmall from '@/assets/img/logo-small.svg';
import logoWhite from '@/assets/img/logo-white.svg';
import user01 from '@/assets/img/users/user-01.jpg';
import { RootState, AppDispatch } from '@/store';
import { logoutAsync } from '@/store/slices/authSlice';
import { fetchProfileByRole, clearAllUserProfiles } from '@/store/slices/userSlice';
import {
    fetchNotifications,
    fetchNotificationSummary,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    fetchNotificationCountsByType,
} from '@/store/slices/notificationSlice';
import { getLocalizedNotification, Notification } from '@/types/notification.types';
import { signalRService } from '@/services/signalr.service';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useTheme } from '@/hooks/useTheme';
import { Role } from '@/enums/common.enums';
import { PATHS, buildPath } from '@/routes/paths';
import styles from './MainHeader.module.scss';

const MainHeader: React.FC<MainHeaderProps> = ({ handleClickMenuButton }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
    const { notifications, unreadCount } = useSelector((state: RootState) => state.notification);

    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const currentLanguage: 'vi' | 'en' = 'vi'; // Default to Vietnamese for admin panel

    // Use custom hook to get current user profile
    const { profile, role, displayName, roleDisplay, avatarUrl } = useCurrentUserProfile();

    // Use theme hook for light/dark mode
    const { toggleTheme, isDark } = useTheme();

    // Auto-fetch user profile on component mount if authenticated and no profile exists
    useEffect(() => {
        if (isAuthenticated && role && !profile && role !== Role.PATIENT) {
            // Dispatch smart fetch based on role (only for management roles)
            dispatch(
                fetchProfileByRole({
                    role,
                })
            );
        }
    }, [isAuthenticated, role, profile, dispatch]);

    // Initialize SignalR and fetch notifications when authenticated
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Initialize SignalR connection
            signalRService
                .initialize(dispatch, accessToken)
                .then(() => {
                    console.log('[MainHeader] SignalR connected');
                })
                .catch((error) => {
                    console.error('[MainHeader] SignalR connection failed:', error);
                });

            // Fetch 5 unread notifications for dropdown
            dispatch(fetchNotifications({ pageNumber: 1, pageSize: 5, isRead: false }));
            dispatch(fetchNotificationSummary());

            return () => {
                // Cleanup: disconnect SignalR when component unmounts or user logs out
                signalRService.stop().then(() => {
                    console.log('[MainHeader] SignalR disconnected');
                });
            };
        } else {
            // Clear notifications when user logs out
            dispatch(clearNotifications());
        }
    }, [isAuthenticated, accessToken, dispatch]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync()).unwrap();
            dispatch(clearAllUserProfiles()); // Clear all profiles
            dispatch(clearNotifications()); // Clear notifications
            toast.success('Đăng xuất thành công');
            navigate('/login');
        } catch (error: any) {
            toast.error(error?.message || 'Đăng xuất thất bại');
        }
    };

    const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
            await dispatch(fetchNotificationCountsByType(false)).unwrap();
            setShowNotifications(false);

            if (actionUrl) {
                navigate(actionUrl);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            await dispatch(fetchNotificationCountsByType(false)).unwrap();
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Không thể đánh dấu tất cả');
        }
    };

    const formatNotificationTime = (createdAt: string) => {
        const locale = vi; // Always use Vietnamese for admin panel
        const formatted = formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale,
        });
        // Remove "about" prefix for Vietnamese
        return formatted.replace('khoảng ', '');
    };

    // Get avatar URL with fallback
    const getAvatarUrl = () => {
        return avatarUrl || user01;
    };

    return (
        <header className="navbar-header">
            <div className="page-container topbar-menu">
                <div className="d-flex align-items-center gap-2">
                    <a href="index.html" className="logo">
                        <span className="logo-light">
                            <span className="logo-lg">
                                <img src={logo} alt="logo" />
                            </span>
                            <span className="logo-sm">
                                <img src={logoSmall} alt="small logo" />
                            </span>
                        </span>

                        <span className="logo-dark">
                            <span className="logo-lg">
                                <img src={logoWhite} alt="dark logo" />
                            </span>
                        </span>
                    </a>

                    <a id="mobile_btn" className="mobile-btn" onClick={handleClickMenuButton}>
                        <i className="ti ti-menu-deep fs-24"></i>
                    </a>

                    <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn2">
                        <i className="ti ti-arrow-right"></i>
                    </button>

                    <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
                        <div className="input-icon-start position-relative me-2">
                            <span className="input-icon-addon">
                                <i className="ti ti-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                placeholder="Search"
                            />
                            <span className="input-icon-addon text-dark shadow fs-18 d-inline-flex p-0 header-search-icon">
                                <i className="ti ti-command"></i>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    <div className="header-item d-flex d-lg-none me-2">
                        <button
                            className="topbar-link btn btn-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#searchModal"
                            type="button"
                        >
                            <i className="ti ti-search fs-16"></i>
                        </button>
                    </div>

                    <a href="#" className="btn btn-liner-gradient me-3 d-lg-flex d-none">
                        AI Assistance<i className="ti ti-chart-bubble-filled ms-1"></i>
                    </a>

                    <div className="header-item">
                        <div className="dropdown me-2">
                            <a href="new-appointment.html" className="btn topbar-link">
                                <i className="ti ti-calendar-due"></i>
                            </a>
                        </div>
                    </div>

                    <div className="header-item">
                        <div className="dropdown me-2">
                            <a href="profile-settings.html" className="btn topbar-link">
                                <i className="ti ti-settings-2"></i>
                            </a>
                        </div>
                    </div>

                    <div className="header-item d-none d-sm-flex me-2">
                        <button
                            className="topbar-link btn btn-icon topbar-link"
                            id="light-dark-mode"
                            type="button"
                            onClick={toggleTheme}
                            title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                        >
                            <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} fs-16`}></i>
                        </button>
                    </div>

                    {isAuthenticated && (
                        <div className="header-item" ref={notificationRef}>
                            <div className="dropdown me-3">
                                <button
                                    className="topbar-link btn btn-icon topbar-link dropdown-toggle drop-arrow-none"
                                    data-bs-toggle="dropdown"
                                    data-bs-offset="0,24"
                                    type="button"
                                    aria-haspopup="false"
                                    aria-expanded="false"
                                    style={{ position: 'relative' }}
                                >
                                    <i className="ti ti-bell-check fs-16 animate-ring"></i>
                                    {unreadCount > 0 && (
                                        <span
                                            className="notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                            style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                minWidth: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div
                                    className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg"
                                    style={{ minHeight: '300px', maxWidth: '400px' }}
                                >
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="m-0 fs-16 fw-semibold">Thông báo</h6>
                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleMarkAllAsRead();
                                                    }}
                                                    style={{
                                                        fontSize: '12px',
                                                        padding: '4px 8px',
                                                    }}
                                                >
                                                    Đọc tất cả
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notification Body */}
                                    <div
                                        className="notification-body position-relative z-2 rounded-0"
                                        data-simplebar
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                                    >
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-4">
                                                <i className="ti ti-bell-off fs-48 text-muted mb-2"></i>
                                                <p className="text-muted mb-0">
                                                    Chưa có thông báo nào
                                                </p>
                                            </div>
                                        ) : (
                                            notifications.map((notification: Notification) => {
                                                const localizedNotification =
                                                    getLocalizedNotification(
                                                        notification,
                                                        currentLanguage as 'vi' | 'en'
                                                    );
                                                return (
                                                    <div
                                                        key={notification.id}
                                                        className="dropdown-item notification-item py-3 text-wrap border-bottom"
                                                        style={{ cursor: 'pointer' }}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification.id,
                                                                notification.actionUrl
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === 'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault();
                                                                handleNotificationClick(
                                                                    notification.id,
                                                                    notification.actionUrl
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="d-flex">
                                                            <div className="me-3 position-relative flex-shrink-0">
                                                                <div
                                                                    className="avatar-md rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        backgroundColor: '#e3f2fd',
                                                                        width: '40px',
                                                                        height: '40px',
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={
                                                                            notification.icon ||
                                                                            'ti ti-bell fs-18'
                                                                        }
                                                                        style={{ color: '#1976d2' }}
                                                                    ></i>
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                                    <p className="mb-0 fw-medium text-dark fs-14">
                                                                        {
                                                                            localizedNotification.title
                                                                        }
                                                                    </p>
                                                                    {!notification.isRead && (
                                                                        <span className="badge bg-danger ms-2">
                                                                            Mới
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="mb-2 text-wrap fs-13 text-muted">
                                                                    {localizedNotification.content}
                                                                </p>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="fs-12 text-muted">
                                                                        <i className="ti ti-clock me-1"></i>
                                                                        {formatNotificationTime(
                                                                            notification.createdAt
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* View All */}
                                    <div className="p-2 rounded-bottom border-top text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNotifications(false);
                                                // Navigate based on current user role
                                                switch (role) {
                                                    case Role.ADMIN:
                                                        navigate(
                                                            buildPath(
                                                                PATHS.ADMIN.ROOT,
                                                                PATHS.ADMIN.NOTIFICATIONS.ROOT
                                                            )
                                                        );
                                                        break;
                                                    case Role.STAFF:
                                                        navigate(
                                                            buildPath(
                                                                PATHS.HOSPITAL.ROOT,
                                                                PATHS.HOSPITAL.NOTIFICATIONS.ROOT
                                                            )
                                                        );
                                                        break;
                                                    case Role.DOCTOR:
                                                        navigate(
                                                            buildPath(
                                                                PATHS.DOCTOR.ROOT,
                                                                PATHS.DOCTOR.NOTIFICATIONS.ROOT
                                                            )
                                                        );
                                                        break;
                                                    default:
                                                        navigate(
                                                            buildPath(
                                                                PATHS.ADMIN.ROOT,
                                                                PATHS.ADMIN.NOTIFICATIONS.ROOT
                                                            )
                                                        );
                                                        break;
                                                }
                                            }}
                                            className="btn btn-link text-decoration-none fs-14 mb-0 w-100"
                                            style={{ color: '#0d6efd' }}
                                        >
                                            Xem tất cả thông báo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Dropdown */}
                    <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
                        <a
                            href="#"
                            className="topbar-link dropdown-toggle drop-arrow-none position-relative"
                            data-bs-toggle="dropdown"
                            data-bs-offset="0,22"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <img
                                src={getAvatarUrl()}
                                className={`${styles.headerAvatar} rounded-circle d-flex`}
                                alt="user-image"
                            />
                            <span className="online text-success">
                                <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"></i>
                            </span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                            <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                                <img
                                    src={getAvatarUrl()}
                                    className={`${styles.dropdownAvatar} rounded-circle`}
                                    alt=""
                                />
                                <div className="ms-2">
                                    <p className="fw-medium text-dark mb-0">{displayName}</p>
                                    <span className="d-block fs-13">{roleDisplay}</span>
                                </div>
                            </div>

                            {/* Item */}
                            <a href="profile-settings.html" className="dropdown-item">
                                <i className="ti ti-user-circle me-1 align-middle"></i>
                                <span className="align-middle">Profile Settings</span>
                            </a>

                            {/* Item */}
                            <a href="account-settings.html" className="dropdown-item">
                                <i className="ti ti-settings me-1 align-middle"></i>
                                <span className="align-middle">Cài đặt tài khoản</span>
                            </a>

                            {/* Item */}
                            <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                                <label className="form-check-label" htmlFor="notify">
                                    <i className="ti ti-bell me-1"></i>Notifications
                                </label>
                                <input
                                    className="form-check-input me-0"
                                    type="checkbox"
                                    role="switch"
                                    id="notify"
                                />
                            </div>

                            {/* Item */}
                            <a href="transactions.html" className="dropdown-item">
                                <i className="ti ti-transition-right me-1 align-middle"></i>
                                <span className="align-middle">Transactions</span>
                            </a>

                            {/* Item */}
                            <div className="pt-2 mt-2 border-top">
                                <button
                                    onClick={handleLogout}
                                    className="dropdown-item text-danger"
                                    type="button"
                                >
                                    <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                                    <span className="align-middle">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;
