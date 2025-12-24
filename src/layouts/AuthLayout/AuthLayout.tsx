import React from 'react';
import { Outlet } from 'react-router-dom';
import auth_bg_top from '@/assets/img/auth/auth-bg-top.png';
import auth_bg_bot from '@/assets/img/auth/auth-bg-bot.png';
import logo from '@/assets/img/logo_medcure.png';
interface AuthLayoutProps {
    children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="main-wrapper auth-bg position-relative overflow-hidden">
            {/* Start Content */}
            <div className="container-fuild position-relative z-1">
                <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
                    {/* Start Row */}
                    <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap py-3">
                        <div className="col-lg-4 mx-auto">
                            <div className="mx-auto mb-4 text-center">
                                <img
                                    src={logo}
                                    className="img-fluid"
                                    alt="Logo"
                                    style={{ width: '200px' }}
                                />
                            </div>
                            {children || <Outlet />}
                            <p className="text-dark text-center">Copyright &copy; 2025 - MedCure</p>
                        </div>
                    </div>
                    {/* End Row */}
                </div>
            </div>
            {/* End Content */}

            {/* Start Bg Content */}
            <img src={auth_bg_top} alt="" className="img-fluid element-01" />
            <img src={auth_bg_bot} alt="" className="img-fluid element-02" />
            {/* End Bg Content */}
        </div>
    );
};

export default AuthLayout;
