import React from 'react';
import Banner from '@/assets/img/login-banner.png';
import clsx from 'clsx';
import styles from './AuthLayout.module.scss';
import '@/styles/_auth.scss'; // Importing auth styles

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showBanner?: boolean;
    maxWidth?: number;
    centerContent?: boolean;
    isTransitioning?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    showBanner = true,
    maxWidth,
    centerContent = false,
    isTransitioning = false,
}) => {
    return (
        <div className={styles.authLayoutContainer}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="account-content">
                            <div className="row align-items-center justify-content-center">
                                {/* Left side - Banner */}
                                {showBanner && (
                                    <div className="col-md-7 col-lg-6 login-left">
                                        <img
                                            src={Banner}
                                            className="img-fluid"
                                            alt="Authentication banner"
                                        />
                                    </div>
                                )}

                                {/* Right side - Form */}
                                <div
                                    className={clsx(
                                        showBanner
                                            ? 'col-md-12 col-lg-6 login-right'
                                            : 'col-12 col-lg-8 login-right',
                                        styles.authRight
                                    )}
                                    style={{
                                        maxWidth: maxWidth || undefined,
                                        margin: centerContent ? '0 auto' : undefined,
                                        opacity: isTransitioning ? 0.5 : 1,
                                        pointerEvents: isTransitioning ? 'none' : 'auto',
                                        transition: 'opacity .3s ease',
                                    }}
                                >
                                    {/* Header */}
                                    <div className="text-center mb-4">
                                        <h1 className={clsx('fw-bold mb-2', styles.title)}>
                                            {title}
                                        </h1>
                                        <p className={styles.subtitle}>{subtitle}</p>
                                    </div>

                                    {/* Content */}
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
