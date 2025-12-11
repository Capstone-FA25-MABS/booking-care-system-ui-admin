import SimpleBar from 'simplebar-react';
import GroupMenuItem from './components/GroupMenuItem';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import type { MenuConfig } from '@/types/menu.types';

import logo from '@/assets/img/logo.svg';
import logoSmall from '@/assets/img/logo-small.svg';
import logoWhite from '@/assets/img/logo-white.svg';
import sidebarIcon from '@/assets/img/icons/sidebar-icon.svg';
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
                        <img src={logo} alt="Logo" />
                    </Link>

                    {/* Logo Small */}
                    <Link to={'/'} className="logo-small">
                        <img src={logoSmall} alt="Logo" />
                    </Link>

                    {/* Logo Dark */}
                    <Link to={'/'} className="dark-logo">
                        <img src={logoWhite} alt="Logo" />
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
                <div className="sidebar-footer border-top mt-3">
                    <div className="trial-item mt-0 p-3 text-center">
                        <div className="trial-item-icon rounded-4 mb-3 p-2 text-center shadow-sm d-inline-flex">
                            <img src={sidebarIcon} alt="img" />
                        </div>
                        <div>
                            <h6 className="fs-14 fw-semibold mb-1">Upgrade To Pro</h6>
                            <p className="fs-13 mb-0">
                                Check 1 min video and begin use Preclinic like a pro
                            </p>
                        </div>
                        <a href="#" className="close-icon shadow-sm">
                            <i className="ti ti-x"></i>
                        </a>
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
};

export default Sidenav;
