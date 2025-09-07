import SimpleBar from 'simplebar-react';
import GroupMenuItem from './components/GroupMenuItem';

import logo from '@/assets/img/logo.svg';
import logoSmall from '@/assets/img/logo-small.svg';
import logoWhite from '@/assets/img/logo-white.svg';
import trustcare from '@/assets/img/icons/trustcare.svg';
import clinic01 from '@/assets/img/icons/clinic-01.svg';
import clinic02 from '@/assets/img/icons/clinic-02.svg';
import clinic03 from '@/assets/img/icons/clinic-03.svg';
import clinic04 from '@/assets/img/icons/clinic-04.svg';
import sidebarIcon from '@/assets/img/icons/sidebar-icon.svg';

interface SidenavProps {
    listGroupMenuItem: Array<{
        title: string;
        items: Array<{
            label: string;
            link?: string;
            icon: string;
            subItems?: Array<{ label: string; link: string }>;
        }>;
    }>;
    handleClickCloseSidebar: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ listGroupMenuItem, handleClickCloseSidebar }) => {
    return (
        <div className="sidebar" id="sidebar">
            {/* Start Logo */}
            <div className="sidebar-logo">
                <div>
                    {/* Logo Normal */}
                    <a href="index.html" className="logo logo-normal">
                        <img src={logo} alt="Logo" />
                    </a>

                    {/* Logo Small */}
                    <a href="index.html" className="logo-small">
                        <img src={logoSmall} alt="Logo" />
                    </a>

                    {/* Logo Dark */}
                    <a href="index.html" className="dark-logo">
                        <img src={logoWhite} alt="Logo" />
                    </a>
                </div>

                {/* Sidebar Menu Close */}
                <button className="sidebar-close" onClick={handleClickCloseSidebar}>
                    <i className="ti ti-x align-middle"></i>
                </button>
            </div>
            {/* End Logo */}

            {/* Sidenav Menu */}
            <SimpleBar className="sidebar-inner">
                <div id="sidebar-menu" className="sidebar-menu">
                    <div className="sidebar-top shadow-sm p-2 rounded-1 mb-3 dropend">
                        <a
                            href="#"
                            className="drop-arrow-none"
                            data-bs-toggle="dropdown"
                            data-bs-auto-close="outside"
                            data-bs-offset="0,22"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <span className="avatar rounded-circle flex-shrink-0 p-2">
                                        <img src={trustcare} alt="img" />
                                    </span>
                                    <div className="ms-2">
                                        <h6 className="fs-14 fw-semibold mb-0">Trustcare Clinic</h6>
                                        <p className="fs-13 mb-0">Lasvegas</p>
                                    </div>
                                </div>
                                <i className="ti ti-arrows-transfer-up"></i>
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-lg">
                            <div className="p-2">
                                <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
                                    <span className="d-flex align-items-center">
                                        <span className="me-2">
                                            <img src={clinic01} alt="" />
                                        </span>
                                        <span className="fw-semibold text-dark">
                                            CureWell Medical Hub
                                            <small className="d-block text-muted fw-normal fs-13">
                                                Ohio
                                            </small>
                                        </span>
                                    </span>
                                    <input className="form-check-input m-0 me-2" type="checkbox" />
                                </label>
                                <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
                                    <span className="d-flex align-items-center">
                                        <span className="me-2">
                                            <img src={clinic02} alt="" />
                                        </span>
                                        <span className="fw-semibold text-dark">
                                            Trustcare Clinic
                                            <small className="d-block text-muted fw-normal fs-13">
                                                Lasvegas
                                            </small>
                                        </span>
                                    </span>
                                    <input className="form-check-input m-0 me-2" type="checkbox" />
                                </label>
                                <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
                                    <span className="d-flex align-items-center">
                                        <span className="me-2">
                                            <img src={clinic03} alt="" />
                                        </span>
                                        <span className="fw-semibold text-dark">
                                            NovaCare Medical
                                            <small className="d-block text-muted fw-normal fs-13">
                                                Washington
                                            </small>
                                        </span>
                                    </span>
                                    <input className="form-check-input m-0 me-2" type="checkbox" />
                                </label>
                                <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
                                    <span className="d-flex align-items-center">
                                        <span className="me-2">
                                            <img src={clinic04} alt="" />
                                        </span>
                                        <span className="fw-semibold text-dark">
                                            Greeny Medical Clinic
                                            <small className="d-block text-muted fw-normal fs-13">
                                                Illinios
                                            </small>
                                        </span>
                                    </span>
                                    <input className="form-check-input m-0 me-2" type="checkbox" />
                                </label>
                            </div>
                        </div>
                    </div>
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
