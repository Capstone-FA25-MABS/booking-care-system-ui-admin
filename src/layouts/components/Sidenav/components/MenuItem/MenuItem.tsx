import { NavLink, Link, useLocation } from 'react-router-dom';
import type { MenuSubItem } from '@/types/menu.types';

import styles from './MenuItem.module.scss';
import clsx from 'clsx';

interface MenuItemProps {
    label: string;
    iconClassName?: string;
    link?: string;
    subItems?: MenuSubItem[];
    isOpen?: boolean;
    onToggle?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
    label,
    iconClassName,
    link,
    subItems = [],
    isOpen = false,
    onToggle,
}) => {
    const location = useLocation();
    // Check if this menu item has sub-items
    const showArrow = subItems.length > 0;

    // Helper function to check if a link is active (including query params)
    const isLinkActive = (itemLink: string): boolean => {
        const currentPath = location.pathname + location.search;
        return currentPath === itemLink;
    };

    // Check if any sub-item is currently active
    const hasActiveSubItem = subItems.some((item) => isLinkActive(item.link));

    const handleClick = (e: React.MouseEvent) => {
        if (showArrow && onToggle) {
            e.preventDefault();
            onToggle();
        }
    };

    // Render different structure based on whether item has subItems
    if (showArrow) {
        // Item with submenu
        return (
            <li className={clsx('submenu', isOpen && 'subdrop')}>
                <a
                    href="#"
                    onClick={handleClick}
                    className={clsx(hasActiveSubItem && 'active', isOpen && 'subdrop')}
                >
                    <i className={iconClassName}></i>
                    <span>{label}</span>
                    <span className="menu-arrow"></span>
                </a>
                <ul className={clsx(styles.subMenuList, isOpen && styles.open)}>
                    {subItems.map((item) => (
                        <li
                            key={item.link}
                            className={isLinkActive(item.link) ? 'active-item' : ''}
                        >
                            <Link
                                to={item.link}
                                className={isLinkActive(item.link) ? 'active' : ''}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }

    // Item without submenu (use regular link if no valid route)
    if (!link || link === '#') {
        return (
            <li>
                <a href="#" onClick={(e) => e.preventDefault()}>
                    <i className={iconClassName}></i>
                    <span>{label}</span>
                </a>
            </li>
        );
    }

    return (
        <li>
            <NavLink to={link} end className={({ isActive }) => (isActive ? 'active' : '')}>
                <i className={iconClassName}></i>
                <span>{label}</span>
            </NavLink>
        </li>
    );
};

export default MenuItem;
