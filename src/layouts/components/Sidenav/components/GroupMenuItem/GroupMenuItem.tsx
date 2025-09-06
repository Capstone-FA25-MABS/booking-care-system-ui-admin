import MenuItem from '../MenuItem';

interface GroupMenuItemProps {
    title: string;
    items: Array<{
        label: string;
        link?: string;
        icon: string;
        subItems?: Array<{ label: string; link: string }>;
    }>;
}

const GroupMenuItem: React.FC<GroupMenuItemProps> = ({ title, items }) => {
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
                            />
                        ))}
                </ul>
            </li>
        </>
    );
};

export default GroupMenuItem;
