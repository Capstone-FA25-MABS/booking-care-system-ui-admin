interface MainHeaderProps {
    handleClickMenuButton: () => void;
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import logo from '@/assets/img/logo.svg';
import logoSmall from '@/assets/img/logo-small.svg';
import logoWhite from '@/assets/img/logo-white.svg';
import doctor01 from '@/assets/img/doctors/doctor-01.jpg';
import doctor02 from '@/assets/img/doctors/doctor-02.jpg';
import doctor06 from '@/assets/img/doctors/doctor-06.jpg';
import doctor07 from '@/assets/img/doctors/doctor-07.jpg';
import user01 from '@/assets/img/users/user-01.jpg';
import { RootState, AppDispatch } from '@/store';
import { logoutAsync } from '@/store/slices/authSlice';
import { fetchProfileByRole, clearAllUserProfiles } from '@/store/slices/userSlice';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Role } from '@/enums/common.enums';
import styles from './MainHeader.module.scss';

const MainHeader: React.FC<MainHeaderProps> = ({ handleClickMenuButton }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Use custom hook to get current user profile
    const { profile, role, displayName, roleDisplay, avatarUrl } = useCurrentUserProfile();

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

    // Handle logout
    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync()).unwrap();
            dispatch(clearAllUserProfiles()); // Clear all profiles
            toast.success('Đăng xuất thành công');
            navigate('/login');
        } catch (error: any) {
            toast.error(error?.message || 'Đăng xuất thất bại');
        }
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
                        >
                            <i className="ti ti-moon fs-16"></i>
                        </button>
                    </div>

                    <div className="header-item">
                        <div className="dropdown me-3">
                            <button
                                className="topbar-link btn btn-icon topbar-link dropdown-toggle drop-arrow-none"
                                data-bs-toggle="dropdown"
                                data-bs-offset="0,24"
                                type="button"
                                aria-haspopup="false"
                                aria-expanded="false"
                            >
                                <i className="ti ti-bell-check fs-16 animate-ring"></i>
                                <span className="notification-badge"></span>
                            </button>

                            <div
                                className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg"
                                style={{ minHeight: '300px' }}
                            >
                                <div className="p-2 border-bottom">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="m-0 fs-16 fw-semibold">
                                                {' '}
                                                Notifications
                                            </h6>
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Body */}
                                <div
                                    className="notification-body position-relative z-2 rounded-0"
                                    data-simplebar
                                >
                                    {/* Item*/}
                                    <div
                                        className="dropdown-item notification-item py-3 text-wrap border-bottom"
                                        id="notification-1"
                                    >
                                        <div className="d-flex">
                                            <div className="me-2 position-relative flex-shrink-0">
                                                <img
                                                    src={doctor01}
                                                    className="avatar-md rounded-circle"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-medium text-dark">
                                                    Dr. Smith
                                                </p>
                                                <p className="mb-1 text-wrap">
                                                    updated the{' '}
                                                    <span className="fw-medium text-dark">
                                                        surgery
                                                    </span>{' '}
                                                    schedule.
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fs-12">
                                                        <i className="ti ti-clock me-1"></i>4 min
                                                        ago
                                                    </span>
                                                    <div className="notification-action d-flex align-items-center float-end gap-2">
                                                        <a
                                                            href="#"
                                                            className="notification-read rounded-circle bg-danger"
                                                            data-bs-toggle="tooltip"
                                                            title=""
                                                            data-bs-original-title="Make as Read"
                                                            aria-label="Make as Read"
                                                        ></a>
                                                        <button
                                                            className="btn rounded-circle p-0"
                                                            data-dismissible="#notification-1"
                                                        >
                                                            <i className="ti ti-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item*/}
                                    <div
                                        className="dropdown-item notification-item py-3 text-wrap border-bottom"
                                        id="notification-2"
                                    >
                                        <div className="d-flex">
                                            <div className="me-2 position-relative flex-shrink-0">
                                                <img
                                                    src={doctor06}
                                                    className="avatar-md rounded-circle"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-medium text-dark">
                                                    Dr. Patel
                                                </p>
                                                <p className="mb-1 text-wrap">
                                                    completed a{' '}
                                                    <span className="fw-medium text-dark">
                                                        follow-up
                                                    </span>{' '}
                                                    report for patient{' '}
                                                    <span className="fw-medium text-dark">
                                                        Emily
                                                    </span>
                                                    .
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fs-12">
                                                        <i className="ti ti-clock me-1"></i>8 min
                                                        ago
                                                    </span>
                                                    <div className="notification-action d-flex align-items-center float-end gap-2">
                                                        <a
                                                            href="#"
                                                            className="notification-read rounded-circle bg-danger"
                                                            data-bs-toggle="tooltip"
                                                            title=""
                                                            data-bs-original-title="Make as Read"
                                                            aria-label="Make as Read"
                                                        ></a>
                                                        <button
                                                            className="btn rounded-circle p-0"
                                                            data-dismissible="#notification-2"
                                                        >
                                                            <i className="ti ti-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item*/}
                                    <div
                                        className="dropdown-item notification-item py-3 text-wrap border-bottom"
                                        id="notification-3"
                                    >
                                        <div className="d-flex">
                                            <div className="me-2 position-relative flex-shrink-0">
                                                <img
                                                    src={doctor02}
                                                    className="avatar-md rounded-circle"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-medium text-dark">Emily</p>
                                                <p className="mb-1 text-wrap">
                                                    booked an appointment with{' '}
                                                    <span className="fw-medium text-dark">
                                                        Dr. Patel
                                                    </span>{' '}
                                                    for{' '}
                                                    <span className="fw-medium text-dark">
                                                        April 15
                                                    </span>
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fs-12">
                                                        <i className="ti ti-clock me-1"></i>15 min
                                                        ago
                                                    </span>
                                                    <div className="notification-action d-flex align-items-center float-end gap-2">
                                                        <a
                                                            href="#"
                                                            className="notification-read rounded-circle bg-danger"
                                                            data-bs-toggle="tooltip"
                                                            title=""
                                                            data-bs-original-title="Make as Read"
                                                            aria-label="Make as Read"
                                                        ></a>
                                                        <button
                                                            className="btn rounded-circle p-0"
                                                            data-dismissible="#notification-3"
                                                        >
                                                            <i className="ti ti-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item*/}
                                    <div
                                        className="dropdown-item notification-item py-3 text-wrap"
                                        id="notification-4"
                                    >
                                        <div className="d-flex">
                                            <div className="me-2 position-relative flex-shrink-0">
                                                <img
                                                    src={doctor07}
                                                    className="avatar-md rounded-circle"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-medium text-dark">Amelia</p>
                                                <p className="mb-1 text-wrap">
                                                    completed the{' '}
                                                    <span className="fw-medium text-dark">
                                                        pre-visit
                                                    </span>{' '}
                                                    health questionnaire.
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fs-12">
                                                        <i className="ti ti-clock me-1"></i>20 min
                                                        ago
                                                    </span>
                                                    <div className="notification-action d-flex align-items-center float-end gap-2">
                                                        <a
                                                            href="#"
                                                            className="notification-read rounded-circle bg-danger"
                                                            data-bs-toggle="tooltip"
                                                            title=""
                                                            data-bs-original-title="Make as Read"
                                                            aria-label="Make as Read"
                                                        ></a>
                                                        <button
                                                            className="btn rounded-circle p-0"
                                                            data-dismissible="#notification-4"
                                                        >
                                                            <i className="ti ti-x"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* View All */}
                                <div className="p-2 rounded-bottom border-top text-center">
                                    <a
                                        href="notifications.html"
                                        className="text-center text-decoration-underline fs-14 mb-0"
                                    >
                                        View All Notifications
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

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
