const DoctorDashboard = () => {
    return (
        <div className="content pb-0">
            <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-2 mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Doctor Dashboard</h4>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5>Welcome, Doctor!</h5>
                            <p>
                                This is your dashboard. You can manage your appointments, schedule,
                                and patients here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
