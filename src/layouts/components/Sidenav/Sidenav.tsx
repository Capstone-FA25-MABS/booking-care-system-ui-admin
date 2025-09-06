import SimpleBar from 'simplebar-react';
import GroupMenuItem from './components/GroupMenuItem';
import { listGroupMenuItem } from './sidenav.data';

interface SidenavProps {
    handleClickCloseSidebar: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ handleClickCloseSidebar }) => {
    return (
        <div className="sidebar" id="sidebar">
            {/* Start Logo */}
            <div className="sidebar-logo">
                <div>
                    {/* Logo Normal */}
                    <a href="index.html" className="logo logo-normal">
                        <img src="/src/assets/img/logo.svg" alt="Logo" />
                    </a>

                    {/* Logo Small */}
                    <a href="index.html" className="logo-small">
                        <img src="/src/assets/img/logo-small.svg" alt="Logo" />
                    </a>

                    {/* Logo Dark */}
                    <a href="index.html" className="dark-logo">
                        <img src="/src/assets/img/logo-white.svg" alt="Logo" />
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
                            href="javascript:void(0);"
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
                                        <img src="/src/assets/img/icons/trustcare.svg" alt="img" />
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
                                            <img src="/src/assets/img/icons/clinic-01.svg" alt="" />
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
                                            <img src="/src/assets/img/icons/clinic-02.svg" alt="" />
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
                                            <img src="/src/assets/img/icons/clinic-03.svg" alt="" />
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
                                            <img src="/src/assets/img/icons/clinic-04.svg" alt="" />
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
                            <img src="/src/assets/img/icons/sidebar-icon.svg" alt="img" />
                        </div>
                        <div>
                            <h6 className="fs-14 fw-semibold mb-1">Upgrade To Pro</h6>
                            <p className="fs-13 mb-0">
                                Check 1 min video and begin use Preclinic like a pro
                            </p>
                        </div>
                        <a href="javascript:void(0);" className="close-icon shadow-sm">
                            <i className="ti ti-x"></i>
                        </a>
                    </div>
                </div>
            </SimpleBar>
        </div>
        // <div className="sidebar" id="sidebar">

        //     {/* Start Logo */}
        //     <div className="sidebar-logo">
        //         <div>
        //             {/* Logo Normal */}
        //             <a href="index.html" className="logo logo-normal">
        //                 <img src="assets/img/logo.svg" alt="Logo" />
        //             </a>

        //             {/* Logo Small */}
        //             <a href="index.html" className="logo-small">
        //                 <img src="assets/img/logo-small.svg" alt="Logo" />
        //             </a>

        //             {/* Logo Dark */}
        //             <a href="index.html" className="dark-logo">
        //                 <img src="assets/img/logo-white.svg" alt="Logo" />
        //             </a>
        //         </div>
        //         <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn">
        //             <i className="ti ti-arrow-left text-body"></i>
        //         </button>

        //         {/* Sidebar Menu Close */}
        //         <button className="sidebar-close">
        //             <i className="ti ti-x align-middle"></i>
        //         </button>
        //     </div>
        //     {/* End Logo */}

        //     {/* Sidenav Menu */}
        //     <div className="sidebar-inner" data-simplebar>
        //         <div id="sidebar-menu" className="sidebar-menu">
        //             <div className="sidebar-top shadow-sm p-2 rounded-1 mb-3 dropend">
        //                 <a href="javascript:void(0);" className="drop-arrow-none" data-bs-toggle="dropdown" data-bs-auto-close="outside" data-bs-offset="0,22" aria-haspopup="false" aria-expanded="false">
        //                     <div className="d-flex justify-content-between align-items-center">
        //                         <div className="d-flex align-items-center">
        //                             <span className="avatar rounded-circle flex-shrink-0 p-2"><img src="assets/img/icons/trustcare.svg" alt="img" /></span>
        //                             <div className="ms-2">
        //                                 <h6 className="fs-14 fw-semibold mb-0">Trustcare Clinic</h6>
        //                                 <p className="fs-13 mb-0">Lasvegas</p>
        //                             </div>
        //                         </div>
        //                         <i className="ti ti-arrows-transfer-up"></i>
        //                     </div>
        //                 </a>
        //                 <div className="dropdown-menu dropdown-menu-lg">
        //                     <div className="p-2">
        //                         <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
        //                             <span className="d-flex align-items-center">
        //                                 <span className="me-2"><img src="assets/img/icons/clinic-01.svg" alt="" /></span>
        //                                 <span className="fw-semibold text-dark">CureWell Medical Hub<small className="d-block text-muted fw-normal fs-13">Ohio</small></span>
        //                             </span>
        //                             <input className="form-check-input m-0 me-2" type="checkbox" />
        //                         </label>
        //                         <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
        //                             <span className="d-flex align-items-center">
        //                                 <span className="me-2"><img src="assets/img/icons/clinic-02.svg" alt="" /></span>
        //                                 <span className="fw-semibold text-dark">Trustcare Clinic<small className="d-block text-muted fw-normal fs-13">Lasvegas</small></span>
        //                             </span>
        //                             <input className="form-check-input m-0 me-2" type="checkbox" />
        //                         </label>
        //                         <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
        //                             <span className="d-flex align-items-center">
        //                                 <span className="me-2"><img src="assets/img/icons/clinic-03.svg" alt="" /></span>
        //                                 <span className="fw-semibold text-dark">NovaCare Medical<small className="d-block text-muted fw-normal fs-13">Washington</small></span>
        //                             </span>
        //                             <input className="form-check-input m-0 me-2" type="checkbox" />
        //                         </label>
        //                         <label className="dropdown-item d-flex align-items-center justify-content-between p-1">
        //                             <span className="d-flex align-items-center">
        //                                 <span className="me-2"><img src="assets/img/icons/clinic-04.svg" alt="" /></span>
        //                                 <span className="fw-semibold text-dark">Greeny Medical Clinic<small className="d-block text-muted fw-normal fs-13">Illinios</small></span>
        //                             </span>
        //                             <input className="form-check-input m-0 me-2" type="checkbox" />
        //                         </label>
        //                     </div>
        //                 </div>
        //             </div>
        //             <ul>
        //                 <li className="menu-title"><span>Main Menu</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-layout-dashboard"></i><span>Dashboard</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="index.html">Admin Dashboard</a></li>
        //                                 <li><a href="doctor-dashboard.html">Doctor Dashboard</a></li>
        //                                 <li><a href="patient-dashboard.html">Patient Dashboard</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-apps"></i><span>Applications</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="chat.html">Chat</a></li>
        //                                 <li className="submenu submenu-two">
        //                                     <a href="#">Calls<span className="menu-arrow inside-submenu"></span></a>
        //                                     <ul>
        //                                         <li><a href="voice-call.html">Voice Call</a></li>
        //                                         <li><a href="video-call.html">Video Call</a></li>
        //                                         <li><a href="outgoing-call.html">Outgoing Call</a></li>
        //                                         <li><a href="incoming-call.html">Incoming Call</a></li>
        //                                         <li><a href="call-history.html">Call History</a></li>
        //                                     </ul>
        //                                 </li>
        //                                 <li><a href="calendar.html">Calendar</a></li>
        //                                 <li><a href="contacts.html">Contacts</a></li>
        //                                 <li><a href="email.html">Email</a></li>
        //                                 <li className="submenu submenu-two">
        //                                     <a href="#">Invoices<span className="menu-arrow inside-submenu"></span></a>
        //                                     <ul>
        //                                         <li><a href="invoice.html">Invoices</a></li>
        //                                         <li><a href="invoice-details.html">Invoice Details</a></li>
        //                                     </ul>
        //                                 </li>
        //                                 <li><a href="todo.html">To Do</a></li>
        //                                 <li><a href="notes.html">Notes</a></li>
        //                                 <li><a href="kanban-view.html">Kanban Board</a></li>
        //                                 <li><a href="file-manager.html">File Manager</a></li>
        //                                 <li><a href="social-feed.html">Social Feed</a></li>
        //                                 <li><a href="search-list.html">Search Result</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);" className="active subdrop">
        //                                 <i className="ti ti-layout-sidebar"></i><span>Layouts</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="index.html">Default</a></li>
        //                                 <li><a href="layout-mini.html" className="active">Mini</a></li>
        //                                 <li><a href="layout-hover-view.html">Hover View</a></li>
        //                                 <li><a href="layout-hidden.html">Hidden</a></li>
        //                                 <li><a href="layout-full-width.html">Full Width</a></li>
        //                                 <li><a href="layout-rtl.html">RTL</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Clinic</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-user-plus"></i><span>Doctors</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="doctors.html">Doctors</a></li>
        //                                 <li><a href="doctor-details.html">Doctor Details</a></li>
        //                                 <li><a href="add-doctor.html">Add Doctor</a></li>
        //                                 <li><a href="doctor-schedule.html">Doctor Schedule</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-user-heart"></i><span>Patients</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="patients.html">Patients</a></li>
        //                                 <li><a href="patient-details.html">Patient Details</a></li>
        //                                 <li><a href="create-patient.html">Create Patient</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-calendar-check"></i><span>Appointments</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="appointments.html">Appointments</a></li>
        //                                 <li><a href="new-appointment.html">New Appointment</a></li>
        //                                 <li><a href="appointment-calendar.html">Calendar</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="locations.html">
        //                                 <i className="ti ti-map-pin"></i><span>Locations</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="services.html">
        //                                 <i className="ti ti-user-cog"></i><span>Services</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="specializations.html">
        //                                 <i className="ti ti-user-shield"></i><span>Specializations</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="assets.html">
        //                                 <i className="ti ti-asset"></i><span>Assets</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="activities.html">
        //                                 <i className="ti ti-activity"></i><span>Activities</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="messages.html">
        //                                 <i className="ti ti-messages"></i><span>Messages</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>HRM</span></li>
        //                 <li>
        //                     <ul>
        //                         <li>
        //                             <a href="staffs.html">
        //                                 <i className="ti ti-users-group"></i><span>Staffs</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="hrm-departments.html">
        //                                 <i className="ti ti-building-bank"></i><span>Departments</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="designation.html">
        //                                 <i className="ti ti-user-cog"></i><span>Designation</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="attendance.html">
        //                                 <i className="ti ti-user-check"></i><span>Attendance</span>
        //                             </a>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-users-minus"></i><span>Leaves</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="leaves.html">Leaves</a></li>
        //                                 <li><a href="leave-type.html">Leave Type</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="holidays.html">
        //                                 <i className="ti ti-home-exclamation"></i><span>Holidays</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="payroll.html">
        //                                 <i className="ti ti-coin"></i><span>Payroll</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Finance & Accounts</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-credit-card"></i><span>Expenses</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="expenses.html">Expenses</a></li>
        //                                 <li><a href="expense-category.html">Expense Category</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="income.html">
        //                                 <i className="ti ti-coins"></i><span>Income</span>
        //                             </a>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-file-invoice"></i><span>Invoices</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="invoices.html">Invoices</a></li>
        //                                 <li><a href="invoices-details.html">Invoice Details</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="payments.html">
        //                                 <i className="ti ti-cards"></i><span>Payments</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="transactions.html">
        //                                 <i className="ti ti-transition-right"></i><span>Transactions</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Administration</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-user"></i><span>Users</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="roles-and-permissions.html">Roles & Permissions</a></li>
        //                                 <li><a href="delete-account-request.html">Delete Account Request</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-report"></i><span>Reports</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="income-report.html">Income Report</a></li>
        //                                 <li><a href="expense-report.html">Expense Report</a></li>
        //                                 <li><a href="profit-and-loss.html">Profit & Loss</a></li>
        //                                 <li><a href="appointment-report.html">Appointment Report</a></li>
        //                                 <li><a href="patient-report.html">Patient Report</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Content</span></li>
        //                 <li>
        //                     <ul>
        //                         <li>
        //                             <a href="pages.html">
        //                                 <i className="ti ti-brand-pagekit"></i><span>Pages</span>
        //                             </a>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-brand-blogger"></i><span>Blogs</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="add-blog.html">Add Blog</a></li>
        //                                 <li><a href="blogs.html">Blogs</a></li>
        //                                 <li><a href="blog-categories.html">Blog Categories</a></li>
        //                                 <li><a href="blog-comments.html">Blog Comments</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-map-pins"></i><span>Location</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="countries.html">Countries</a></li>
        //                                 <li><a href="states.html">States</a></li>
        //                                 <li><a href="cities.html">Cities</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="testimonials.html">
        //                                 <i className="ti ti-brand-wechat"></i><span>Testimonials</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="faq.html">
        //                                 <i className="ti ti-question-mark"></i><span>FAQ</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Support</span></li>
        //                 <li>
        //                     <ul>
        //                         <li>
        //                             <a href="contact-messages.html">
        //                                 <i className="ti ti-message-dots"></i><span>Contact Messages</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="tickets.html">
        //                                 <i className="ti ti-ticket"></i><span>Tickets</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="announcements.html">
        //                                 <i className="ti ti-speakerphone"></i><span>Announcements</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="newsletters.html">
        //                                 <i className="ti ti-mail-bolt"></i><span>Newsletters</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Pages</span></li>
        //                 <li>
        //                     <ul>
        //                         <li>
        //                             <a href="starter.html">
        //                                 <i className="ti ti-player-play"></i><span>Starter</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="profile.html">
        //                                 <i className="ti ti-user-circle"></i><span>Profile</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="gallery.html">
        //                                 <i className="ti ti-photo"></i><span>Gallery</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="timeline.html">
        //                                 <i className="ti ti-timeline-event-text"></i><span>Timeline</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="pricing.html">
        //                                 <i className="ti ti-tag"></i><span>Pricing</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="coming-soon.html">
        //                                 <i className="ti ti-sparkles"></i><span>Coming Soon</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="under-maintenance.html">
        //                                 <i className="ti ti-settings-down"></i><span>Under Maintenance</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="privacy-policy.html">
        //                                 <i className="ti ti-shield-check"></i><span>Privacy Policy</span>
        //                             </a>
        //                         </li>
        //                         <li>
        //                             <a href="terms-and-conditions.html">
        //                                 <i className="ti ti-file-time"></i><span>Terms & Conditions</span>
        //                             </a>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Authentication</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-login"></i><span>Login</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="login-cover.html">Cover</a></li>
        //                                 <li><a href="login-illustration.html">Illustration</a></li>
        //                                 <li><a href="login-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-file-pencil"></i><span>Register</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="register-cover.html">Cover</a></li>
        //                                 <li><a href="register-illustration.html">Illustration</a></li>
        //                                 <li><a href="register-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-lock-exclamation"></i><span>Forgot Password</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="forgot-password-cover.html">Cover</a></li>
        //                                 <li><a href="forgot-password-illustration.html">Illustration</a></li>
        //                                 <li><a href="forgot-password-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-restore"></i><span>Reset Password</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="reset-password-cover.html">Cover</a></li>
        //                                 <li><a href="reset-password-illustration.html">Illustration</a></li>
        //                                 <li><a href="reset-password-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-mail-check"></i><span>Email Verification</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="email-verification-cover.html">Cover</a></li>
        //                                 <li><a href="email-verification-illustration.html">Illustration</a></li>
        //                                 <li><a href="email-verification-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-discount-check"></i><span>2 Step Verification</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="two-step-verification-cover.html">Cover</a></li>
        //                                 <li><a href="two-step-verification-illustration.html">Illustration</a></li>
        //                                 <li><a href="two-step-verification-basic.html">Basic</a></li>
        //                             </ul>
        //                         </li>
        //                         <li>
        //                             <a href="lock-screen.html">
        //                                 <i className="ti ti-lock"></i><span>Lock Screen</span>
        //                             </a>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-exclamation-mark-off"></i><span>Error Pages</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="error-404.html">404 Error</a></li>
        //                                 <li><a href="error-500.html">500 Error</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Settings</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-user-cog"></i><span>Account Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="profile-settings.html">Profile</a></li>
        //                                 <li><a href="security-settings.html">Security</a></li>
        //                                 <li><a href="notifications-settings.html">Notifications</a></li>
        //                                 <li><a href="integrations-settings.html">Integrations</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-world-cog"></i><span>Website Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="organization-settings.html">Organization</a></li>
        //                                 <li><a href="localization-settings.html">Localization</a></li>
        //                                 <li><a href="prefixes-settings.html">Prefixes</a></li>
        //                                 <li><a href="seo-setup-settings.html">SEO Setup</a></li>
        //                                 <li><a href="language-settings.html">Language</a></li>
        //                                 <li><a href="maintenance-mode-settings.html">Maintenance Mode</a></li>
        //                                 <li><a href="login-and-register-settings.html">Login & Register</a></li>
        //                                 <li><a href="preferences-settings.html">Preferences</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-building-hospital"></i><span>Clinic Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="appointment-settings.html">Appointment</a></li>
        //                                 <li><a href="working-hours-settings.html">Working Hours</a></li>
        //                                 <li><a href="cancellation-reason-settings.html">Cancellation Reason</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-device-mobile-cog"></i><span>App Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="invoice-settings.html">Invoice Settings</a></li>
        //                                 <li><a href="invoice-templates-settings.html">Invoice Templates</a></li>
        //                                 <li><a href="signatures-settings.html">Signatures</a></li>
        //                                 <li><a href="custom-fields-settings.html">Custom Fields</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-device-desktop-cog"></i><span>System Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="email-settings.html">Email Settings</a></li>
        //                                 <li><a href="email-templates-settings.html">Email Templates</a></li>
        //                                 <li><a href="sms-gateways-settings.html">SMS Gateways</a></li>
        //                                 <li><a href="sms-templates-settings.html">SMS Templates</a></li>
        //                                 <li><a href="gdpr-cookies-settings.html">GDPR Cookies</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-settings-dollar"></i><span>Finance & Accounts</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="payment-methods-settings.html">Payment Methods</a></li>
        //                                 <li><a href="bank-accounts-settings.html">Bank Accounts</a></li>
        //                                 <li><a href="tax-rates-settings.html">Tax Rates</a></li>
        //                                 <li><a href="currencies-settings.html">Currencies</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-settings-2"></i><span>Other Settings</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="sitemap-settings.html">Sitemap</a></li>
        //                                 <li><a href="clear-cache-settings.html">Clear Cache</a></li>
        //                                 <li><a href="storage-settings.html">Storage</a></li>
        //                                 <li><a href="cronjob-settings.html">Cronjob</a></li>
        //                                 <li><a href="ban-ip-address-settings.html">Ban IP Address</a></li>
        //                                 <li><a href="system-backup-settings.html">System Backup</a></li>
        //                                 <li><a href="database-backup-settings.html">Database Backup</a></li>
        //                                 <li><a href="system-update.html">System Update</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>UI Interface</span></li>
        //                 <li>
        //                     <ul>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-chart-pie"></i><span>Base UI</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="ui-accordion.html">Accordion</a></li>
        //                                 <li><a href="ui-alerts.html">Alerts</a></li>
        //                                 <li><a href="ui-avatar.html">Avatar</a></li>
        //                                 <li><a href="ui-badges.html">Badges</a></li>
        //                                 <li><a href="ui-breadcrumb.html">Breadcrumb</a></li>
        //                                 <li><a href="ui-buttons.html">Buttons</a></li>
        //                                 <li><a href="ui-buttons-group.html">Button Group</a></li>
        //                                 <li><a href="ui-cards.html">Card</a></li>
        //                                 <li><a href="ui-carousel.html">Carousel</a></li>
        //                                 <li><a href="ui-collapse.html">Collapse</a></li>
        //                                 <li><a href="ui-dropdowns.html">Dropdowns</a></li>
        //                                 <li><a href="ui-ratio.html">Ratio</a></li>
        //                                 <li><a href="ui-grid.html">Grid</a></li>
        //                                 <li><a href="ui-images.html">Images</a></li>
        //                                 <li><a href="ui-links.html">Links</a></li>
        //                                 <li><a href="ui-list-group.html">List Group</a></li>
        //                                 <li><a href="ui-modals.html">Modals</a></li>
        //                                 <li><a href="ui-offcanvas.html">Offcanvas</a></li>
        //                                 <li><a href="ui-pagination.html">Pagination</a></li>
        //                                 <li><a href="ui-placeholders.html">Placeholders</a></li>
        //                                 <li><a href="ui-popovers.html">Popovers</a></li>
        //                                 <li><a href="ui-progress.html">Progress</a></li>
        //                                 <li><a href="ui-scrollspy.html">Scrollspy</a></li>
        //                                 <li><a href="ui-spinner.html">Spinner</a></li>
        //                                 <li><a href="ui-nav-tabs.html">Tabs</a></li>
        //                                 <li><a href="ui-toasts.html">Toasts</a></li>
        //                                 <li><a href="ui-tooltips.html">Tooltips</a></li>
        //                                 <li><a href="ui-typography.html">Typography</a></li>
        //                                 <li><a href="ui-utilities.html">Utilities</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-radar"></i><span>Advanced UI</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="extended-dragula.html">Dragula</a></li>
        //                                 <li><a href="ui-clipboard.html">Clipboard</a></li>
        //                                 <li><a href="ui-rangeslider.html">Range Slider</a></li>
        //                                 <li><a href="ui-sweetalerts.html">Sweet Alerts</a></li>
        // 								<li><a href="ui-lightbox.html">Lightbox</a></li>
        // 								<li><a href="ui-rating.html">Rating</a></li>
        // 								<li><a href="ui-scrollbar.html">Scrollbar</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-forms"></i><span>Forms</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li className="submenu submenu-two">
        //                                     <a href="javascript:void(0);">Form Elements<span className="menu-arrow inside-submenu"></span></a>
        //                                     <ul>
        //                                         <li><a href="form-basic-inputs.html">Basic Inputs</a></li>
        //                                         <li><a href="form-checkbox-radios.html">Checkbox & Radios</a></li>
        //                                         <li><a href="form-input-groups.html">Input Groups</a></li>
        //                                         <li><a href="form-grid-gutters.html">Grid & Gutters</a></li>
        //                                         <li><a href="form-mask.html">Input Masks</a></li>
        //                                         <li><a href="form-fileupload.html">File Uploads</a></li>
        //                                     </ul>
        //                                 </li>
        //                                 <li className="submenu submenu-two">
        //                                     <a href="javascript:void(0);">Layouts<span className="menu-arrow inside-submenu"></span></a>
        //                                     <ul>
        //                                         <li><a href="form-horizontal.html">Horizontal Form</a></li>
        //                                         <li><a href="form-vertical.html">Vertical Form</a></li>
        //                                         <li><a href="form-floating-labels.html">Floating Labels</a></li>
        //                                     </ul>
        //                                 </li>
        //                                 <li><a href="form-validation.html">Form Validation</a></li>
        //                                 <li><a href="form-select2.html">Select2</a></li>
        //                                 <li><a href="form-wizard.html">Form Wizard</a></li>
        //                                 <li><a href="form-pickers.html">Form Picker</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-table-row"></i><span>Tables</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="tables-basic.html">Basic Tables </a></li>
        //                                 <li><a href="data-tables.html">Data Table </a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-chart-donut"></i>
        //                                 <span>Charts</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="chart-apex.html">Apex Charts</a></li>
        //                                 <li><a href="chart-c3.html">Chart C3</a></li>
        //                                 <li><a href="chart-js.html">Chart Js</a></li>
        //                                 <li><a href="chart-morris.html">Morris Charts</a></li>
        //                                 <li><a href="chart-flot.html">Flot Charts</a></li>
        //                                 <li><a href="chart-peity.html">Peity Charts</a></li>
        //                             </ul>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-icons"></i>
        //                                 <span>Icons</span><span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="icon-fontawesome.html">Fontawesome Icons</a></li>
        //                                 <li><a href="icon-tabler.html">Tabler Icons</a></li>
        //                                 <li><a href="icon-bootstrap.html">Bootstrap Icons</a></li>
        //                                 <li><a href="icon-remix.html">Remix Icons</a></li>
        //                                 <li><a href="icon-feather.html">Feather Icons</a></li>
        //                                 <li><a href="icon-ionic.html">Ionic Icons</a></li>
        //                                 <li><a href="icon-material.html">Material Icons</a></li>
        //                                 <li><a href="icon-pe7.html">Pe7 Icons</a></li>
        //                                 <li><a href="icon-simpleline.html">Simpleline Icons</a></li>
        //                                 <li><a href="icon-themify.html">Themify Icons</a></li>
        //                                 <li><a href="icon-weather.html">Weather Icons</a></li>
        //                                 <li><a href="icon-typicons.html">Typicons Icons</a></li>
        //                                 <li><a href="icon-flag.html">Flag Icons</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //                 <li className="menu-title"><span>Help</span></li>
        //                 <li>
        //                     <ul>
        //                         <li>
        //                             <a href="javascript:void(0);"><i className="ti ti-file-dots"></i><span>Documentation</span></a>
        //                         </li>
        //                         <li>
        //                             <a href="javascript:void(0);"><i className="ti ti-status-change"></i><span>Changelog</span><span className="badge bg-danger ms-2 badge-md rounded-2 fs-12 fw-medium">v1.6.8</span></a>
        //                         </li>
        //                         <li className="submenu">
        //                             <a href="javascript:void(0);">
        //                                 <i className="ti ti-versions"></i><span>Multi Level</span>
        //                                 <span className="menu-arrow"></span>
        //                             </a>
        //                             <ul>
        //                                 <li><a href="javascript:void(0);">Multilevel 1</a></li>
        //                                 <li className="submenu submenu-two">
        //                                     <a href="javascript:void(0);">Multilevel 2<span
        //                                             className="menu-arrow inside-submenu"></span></a>
        //                                     <ul>
        //                                         <li><a href="javascript:void(0);">Multilevel 2.1</a></li>
        //                                         <li className="submenu submenu-two submenu-three">
        //                                             <a href="javascript:void(0);">Multilevel 2.2<span
        //                                                     className="menu-arrow inside-submenu inside-submenu-two"></span></a>
        //                                             <ul>
        //                                                 <li><a href="javascript:void(0);">Multilevel 2.2.1</a></li>
        //                                                 <li><a href="javascript:void(0);">Multilevel 2.2.2</a></li>
        //                                             </ul>
        //                                         </li>
        //                                     </ul>
        //                                 </li>
        //                                 <li><a href="javascript:void(0);">Multilevel 3</a></li>
        //                             </ul>
        //                         </li>
        //                     </ul>
        //                 </li>
        //             </ul>
        //         </div>
        //         <div className="sidebar-footer border-top mt-3">
        //             <div className="trial-item mt-0 p-3 text-center">
        //                 <div className="trial-item-icon rounded-4 mb-3 p-2 text-center shadow-sm d-inline-flex">
        //                     <img src="assets/img/icons/sidebar-icon.svg" alt="img" />
        //                 </div>
        //                 <div>
        //                     <h6 className="fs-14 fw-semibold mb-1">Upgrade To Pro</h6>
        //                     <p className="fs-13 mb-0">Check 1 min video and begin use Preclinic like a pro</p>
        //                 </div>
        //                 <a href="javascript:void(0);" className="close-icon shadow-sm"><i className="ti ti-x"></i></a>
        //             </div>
        //         </div>
        //     </div>

        // </div>
    );
};

export default Sidenav;
