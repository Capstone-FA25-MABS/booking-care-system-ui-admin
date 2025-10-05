import { useState } from 'react';
import MenuItem from '../MenuItem';
import type { MenuItem as MenuItemType } from '@/types/menu.types';

interface GroupMenuItemProps {
    title: string;
    items: MenuItemType[];
}

const GroupMenuItem: React.FC<GroupMenuItemProps> = ({ title, items }) => {
    const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        // If clicking the same item, close it. Otherwise, open the new one
        setOpenItemIndex((prev) => (prev === index ? null : index));
    };

    return (
        <>
            <li className="menu-title">
                <span>{title}</span>
            </li>
            <li>
                <ul>
                    {items.length > 0 &&
                        items.map((item, index) => (
                            <MenuItem
                                key={index}
                                label={item.label}
                                iconClassName={item.icon}
                                subItems={item.subItems}
                                link={item.link}
                                isOpen={openItemIndex === index}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                </ul>
            </li>
        </>
    );
};

export default GroupMenuItem;
