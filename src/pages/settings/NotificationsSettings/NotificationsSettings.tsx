import SettingsSidebar from '../components/SettingsSidebar';

const NotificationsSettings = () => {
    return (
        <div className="content">
            {/* Page Header */}
            <div className="mb-3 border-bottom pb-3">
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="settings-wrapper d-flex">
                        {/* Settings Sidebar */}
                        <SettingsSidebar activeMenu="notifications" />

                        {/* Main Content */}
                        <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                            <div className="card-header border-bottom px-0 mx-3">
                                <h5 className="fw-bold">Notifications Settings</h5>
                            </div>
                            <div className="card-body px-0 mx-3">
                                <p className="text-muted">
                                    Notifications settings content will be implemented here.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsSettings;
