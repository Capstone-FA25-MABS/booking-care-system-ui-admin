import { Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

interface HeaderProps {
    isHeaderMenu?: boolean;
}

const MainHeader: React.FC<HeaderProps> = ({ isHeaderMenu = true }) => {
    return (
        <header className="header header-custom header-fixed inner-header relative">
            <div className="container">
                <nav className="navbar navbar-expand-lg header-nav">
                    <div className="navbar-header">
                        <Link to={PATHS.HOME} className="navbar-brand logo">
                            <img src="/src/assets/img/logo.svg" className="img-fluid" alt="Logo" />
                        </Link>
                    </div>
                    {isHeaderMenu && (
                        <div className="header-menu">
                            <ul className="nav header-navbar-rht">
                                <li className="header-theme noti-nav">
                                    <a href="#" id="dark-mode-toggle" className="theme-toggle">
                                        <i className="isax isax-sun-1"></i>
                                    </a>
                                    <a
                                        href="#"
                                        id="light-mode-toggle"
                                        className="theme-toggle activate"
                                    >
                                        <i className="isax isax-moon"></i>
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        to={PATHS.LOGIN}
                                        className="btn btn-md btn-primary-gradient d-inline-flex align-items-center rounded-pill"
                                    >
                                        <i className="isax isax-lock-1 me-1"></i>
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={PATHS.REGISTER}
                                        className="btn btn-md btn-dark d-inline-flex align-items-center rounded-pill"
                                    >
                                        <i className="isax isax-user-tick me-1"></i>
                                        Register
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default MainHeader;
