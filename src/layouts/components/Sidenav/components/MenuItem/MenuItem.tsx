import { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './MenuItem.module.scss';
import clsx from 'clsx';

interface MenuItemProps {
    label: string;
    iconClassName?: string;
    link?: string;
    subItems?: Array<{ label: string; link: string }>;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, iconClassName, link, subItems = [] }) => {
    const [open, setOpen] = useState(false);

    return (
        <li className="submenu">
            <Link
                to={link || '#'}
                onClick={() => setOpen(!open)}
                className={open ? 'active subdrop' : ''}
            >
                <i className={iconClassName}></i>
                <span>{label}</span>
                {subItems.length > 0 && <span className="menu-arrow"></span>}
            </Link>
            <ul className={clsx(styles.subMenuList, open ? styles.open : '')}>
                {subItems.map((item, index) => (
                    <li key={index}>
                        <Link to={item.link}>{item.label}</Link>
                    </li>
                ))}
            </ul>
        </li>
    );
};

export default MenuItem;
