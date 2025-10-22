import { Link } from 'react-router-dom';

const AppFooter = () => {
    return (
        <div className="footer text-center bg-white p-2 border-top">
            <p className="text-dark mb-0">
                2025 &copy;{' '}
                <Link to="/" className="link-primary">
                    Preclinic
                </Link>
                , Tất Cả Quyền Được Bảo Lưu
            </p>
        </div>
    );
};

export default AppFooter;
