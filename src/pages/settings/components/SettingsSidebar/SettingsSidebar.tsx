import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import clsx from 'clsx';
import styles from './SettingsSidebar.module.scss';
import { PATHS } from '@/routes/paths';

interface SettingsSidebarProps {
    activeMenu?: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const accountSettingsItems = [
        {
            label: 'Profile',
            path: PATHS.COMMON.ACCOUNT_SETTINGS.PROFILE,
            key: 'profile',
        },
        {
            label: 'Security',
            path: PATHS.COMMON.ACCOUNT_SETTINGS.SECURITY,
            key: 'security',
        },
        {
            label: 'Notifications',
            path: PATHS.COMMON.ACCOUNT_SETTINGS.NOTIFICATIONS,
            key: 'notifications',
        },
        {
            label: 'Integrations',
            path: PATHS.COMMON.ACCOUNT_SETTINGS.INTEGRATIONS,
            key: 'integrations',
        },
    ];

    // Check if any sub-item is active
    const hasActiveSubItem = accountSettingsItems.some((item) =>
        location.pathname.includes(item.path)
    );

    // Auto open if any sub-item is active (only run once on mount)
    useEffect(() => {
        if (hasActiveSubItem) {
            setIsOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    return (
        <div className="sidebars settings-sidebar" id="sidebar2">
            <SimpleBar className="sidebar-inner">
                <div id="sidebar-menu5" className="sidebar-menu mt-0 p-0">
                    <ul>
                        <li className={clsx('submenu', isOpen && 'subdrop')}>
                            <a
                                href="#"
                                className={clsx(hasActiveSubItem && 'active', isOpen && 'subdrop')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsOpen(!isOpen);
                                }}
                            >
                                <i className="ti ti-user-cog me-2"></i>
                                <span>Cài đặt tài khoản</span>
                                <span className="menu-arrow"></span>
                            </a>
                            <ul className={clsx(styles.subMenuList, isOpen && styles.open)}>
                                {accountSettingsItems.map((item) => (
                                    <li key={item.key}>
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) => (isActive ? 'active' : '')}
                                        >
                                            {item.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            </SimpleBar>
        </div>
    );
};

export default SettingsSidebar;
