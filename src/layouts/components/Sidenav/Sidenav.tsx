import SimpleBar from 'simplebar-react';
import GroupMenuItem from './components/GroupMenuItem';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import type { MenuConfig } from '@/types/menu.types';

import logo from '@/assets/img/logo_medcure.png';
import logoSmall from '@/assets/img/icons/icon_medcure.png';
import { Link } from 'react-router-dom';

interface SidenavProps {
    listGroupMenuItem: MenuConfig;
    handleClickCloseSidebar: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ listGroupMenuItem, handleClickCloseSidebar }) => {
    const { toggleMiniSidebar } = useSidebarToggle();

    return (
        <div className="sidebar" id="sidebar">
            {/* Start Logo */}
            <div className="sidebar-logo">
                <div>
                    {/* Logo Normal */}
                    <Link to={'/'} className="logo logo-normal">
                        <img src={logo} alt="Logo" style={{ marginTop: '-8px' }} />
                    </Link>

                    {/* Logo Small */}
                    <Link to={'/'} className="logo-small">
                        <img src={logoSmall} alt="Logo" style={{ marginTop: '-4px' }} />
                    </Link>

                    {/* Logo Dark */}
                    <Link to={'/'} className="dark-logo">
                        <img src={logo} alt="Logo" style={{ marginTop: '-8px' }} />
                    </Link>
                </div>

                {/* Sidebar Toggle Button */}
                <button
                    className="sidenav-toggle-btn btn border-0 p-0 active"
                    id="toggle_btn"
                    onClick={toggleMiniSidebar}
                    type="button"
                >
                    <i className="ti ti-arrow-left text-body"></i>
                </button>

                {/* Sidebar Menu Close */}
                <button className="sidebar-close" onClick={handleClickCloseSidebar}>
                    <i className="ti ti-x align-middle"></i>
                </button>
            </div>
            {/* End Logo */}

            {/* Sidenav Menu */}
            <SimpleBar className="sidebar-inner">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        {listGroupMenuItem?.map((group, index) => (
                            <GroupMenuItem key={index} title={group.title} items={group.items} />
                        ))}
                    </ul>
                </div>
            </SimpleBar>
        </div>
    );
};

export default Sidenav;
