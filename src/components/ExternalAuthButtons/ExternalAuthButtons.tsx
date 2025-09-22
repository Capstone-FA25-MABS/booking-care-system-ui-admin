import React from 'react';
import FullScreenSpinner from '@/components/FullScreenSpinner';
import facebook_logo from '@/assets/img/icons/facebook-logo.svg';
import google_logo from '@/assets/img/icons/google-logo.svg';
import styles from './ExternalAuthButtons.module.scss';

interface ExternalAuthButtonsProps {
    externalAuthLoading: {
        google: boolean;
        facebook: boolean;
    };
    onGoogleLogin: () => void;
    onFacebookLogin: () => void;
}

const ExternalAuthButtons: React.FC<ExternalAuthButtonsProps> = ({
    externalAuthLoading,
    onGoogleLogin,
    onFacebookLogin,
}) => {
    return (
        <>
            {/* OR Divider */}
            <div className={styles.orDivider}>
                <span className={styles.orText}>Hoặc</span>
            </div>

            {/* External Auth Buttons Container */}
            <div className={styles.externalAuthContainer}>
                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={onGoogleLogin}
                    className={`${styles.authButton} ${styles.googleButton}`}
                >
                    <img src={google_logo} alt="Google" className={styles.buttonIcon} />
                    <span className={styles.buttonText}>Đăng nhập với Google</span>
                </button>

                {/* Facebook Login Button */}
                <button
                    type="button"
                    onClick={onFacebookLogin}
                    className={`${styles.authButton} ${styles.facebookButton}`}
                >
                    <img src={facebook_logo} alt="Facebook" className={styles.buttonIcon} />
                    <span className={styles.buttonText}>Đăng nhập với Facebook</span>
                </button>
            </div>
            {(externalAuthLoading.google || externalAuthLoading.facebook) && (
                <FullScreenSpinner isVisible={true} />
            )}
        </>
    );
};

export default ExternalAuthButtons;
