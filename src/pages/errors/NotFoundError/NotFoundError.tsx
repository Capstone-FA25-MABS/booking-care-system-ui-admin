import { buildPath, PATHS } from '@/routes/paths';
import { Link } from 'react-router-dom';

import logo from '@/assets/img/logo.svg';
import errorNotFoundImg from '@/assets/img/error-404.svg';

const NotFoundError: React.FC = () => {
    const role = 'clinic'; // This should be dynamically determined based on the logged-in user
    let path = '/';

    switch (role) {
        // case 'admin':
        //     path = buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.DASHBOARD);
        //     break;
        // case 'doctor':
        //     path = buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.DASHBOARD);
        //     break;
        case 'clinic':
            path = buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DASHBOARD);
            break;
        default:
            path = PATHS.HOME;
            break;
    }
    return (
        <div className="main-wrapper auth-bg position-relative overflow-hidden">
            <div className="container-fuild">
                <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 z-1">
                    <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
                        <div className="col-lg-6">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                                <div className=" mx-auto mb-5 text-center">
                                    <img src={logo} className="img-fluid" alt="Logo" />
                                </div>
                                <div className="error-images mb-4">
                                    <img
                                        src={errorNotFoundImg}
                                        alt="Page not found"
                                        className="img-fluid"
                                    />
                                </div>
                                <div className="text-center">
                                    <h4 className="mb-2 fw-bold">Oops, something went wrong</h4>
                                    <p className="fs-14 text-center">
                                        Error 404 Page not found. Sorry the page you looking for
                                        does not exist or has been moved.
                                    </p>
                                    <div className="d-flex justify-content-center pb-3">
                                        <Link
                                            to={path}
                                            className="btn btn-primary d-flex align-items-center "
                                        >
                                            <i className="ti ti-chevron-left me-2"></i>Back to
                                            Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundError;
