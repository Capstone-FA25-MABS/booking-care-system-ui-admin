import SettingsSidebar from '@/pages/settings/components/SettingsSidebar';

const ProfileSettings = () => {
    return (
        <div className="content" id="profilePage">
            {/* Page Header */}
            <div className="mb-3 border-bottom pb-3">
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="settings-wrapper d-flex">
                        {/* Settings Sidebar */}
                        <SettingsSidebar activeMenu="profile" />

                        {/* Main Content */}
                        <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                            <div className="card-header border-bottom px-0 mx-3">
                                <h5 className="fw-bold">Basic Information</h5>
                            </div>
                            <div className="card-body px-0 mx-3">
                                <form>
                                    {/* Profile Image Section */}
                                    <div className="row border-bottom mb-3">
                                        <div className="col-lg-12">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-2">
                                                    <label className="form-label mb-0">
                                                        Profile Image
                                                        <span className="text-danger ms-1">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-lg-10">
                                                    <div className="profile-container">
                                                        <img
                                                            src="/src/assets/img/users/user-01.jpg"
                                                            alt="Profile"
                                                        />
                                                        <div className="overlay-btn">
                                                            <a
                                                                href="#"
                                                                className="text-white"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    document
                                                                        .getElementById(
                                                                            'profileUpload'
                                                                        )
                                                                        ?.click();
                                                                }}
                                                            >
                                                                <i className="ti ti-photo fs-10"></i>
                                                            </a>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id="profileUpload"
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name Fields */}
                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        First Name
                                                        <span className="text-danger ms-1">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Last Name
                                                        <span className="text-danger ms-1">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Fields */}
                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Email
                                                        <span className="text-danger ms-1">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="email" className="form-control" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Phone Number
                                                        <span className="text-danger ms-1">*</span>
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="tel" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information Section */}
                                    <div className="row border-bottom mb-3">
                                        <div className="mb-3">
                                            <h5 className="fw-bold mb-0">Address Information</h5>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Address Line 1
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Address Line 2
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Country
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <select className="form-select">
                                                        <option>Select</option>
                                                        <option>USA</option>
                                                        <option>Canada</option>
                                                        <option>UK</option>
                                                        <option>Germany</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">State</label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <select className="form-select">
                                                        <option>Select</option>
                                                        <option>California</option>
                                                        <option>Ontario</option>
                                                        <option>England</option>
                                                        <option>Bavaria</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">City</label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <select className="form-select">
                                                        <option>Select</option>
                                                        <option>Los Angeles</option>
                                                        <option>Toronto</option>
                                                        <option>London</option>
                                                        <option>Munich</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="row align-items-center mb-3">
                                                <div className="col-lg-4">
                                                    <label className="form-label mb-0">
                                                        Pincode
                                                    </label>
                                                </div>
                                                <div className="col-lg-8">
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex align-items-center justify-content-end">
                                        <button type="button" className="btn btn-light me-3">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
