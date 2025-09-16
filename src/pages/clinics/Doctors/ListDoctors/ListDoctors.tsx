import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import styles from './ListDoctors.module.scss';
import Calendar from '@/components/Calendar';

// Import ảnh trực tiếp
import doctor01 from '@/assets/img/doctors/doctor-01.jpg';
import doctor02 from '@/assets/img/doctors/doctor-02.jpg';
import doctor03 from '@/assets/img/doctors/doctor-03.jpg';
import doctor04 from '@/assets/img/doctors/doctor-04.jpg';
import doctor05 from '@/assets/img/doctors/doctor-05.jpg';
import doctor06 from '@/assets/img/doctors/doctor-06.jpg';
import doctor07 from '@/assets/img/doctors/doctor-07.jpg';
import doctor08 from '@/assets/img/doctors/doctor-08.jpg';
import doctor09 from '@/assets/img/doctors/doctor-09.jpg';

interface Doctor {
    id: string;
    name: string;
    designation: string;
    department: string;
    phone: string;
    email: string;
    experience: string;
    status: 'Available' | 'Unavailable';
    avatar: string;
}

const doctors: Doctor[] = [
    {
        id: '1',
        name: 'Dr. Mick Thompson',
        designation: 'Cardiologist',
        department: 'Cardiology',
        phone: '+1 54554 54584',
        email: 'mick.thompson@example.com',
        experience: '10 năm',
        status: 'Available',
        avatar: doctor01,
    },
    {
        id: '2',
        name: 'Dr. Sarah Johnson',
        designation: 'Orthopedic Surgeon',
        department: 'Orthopedics',
        phone: '+1 43554 54584',
        email: 'sarah.johnson@example.com',
        experience: '8 năm',
        status: 'Available',
        avatar: doctor02,
    },
    {
        id: '3',
        name: 'Dr. Emily Carter',
        designation: 'Pediatrician',
        department: 'Pediatrics',
        phone: '+1 47554 54585',
        email: 'emily.carter@example.com',
        experience: '12 năm',
        status: 'Available',
        avatar: doctor03,
    },
    {
        id: '4',
        name: 'Dr. David Lee',
        designation: 'Gynecologist',
        department: 'Gynecology',
        phone: '+1 54114 54586',
        email: 'david.lee@example.com',
        experience: '9 năm',
        status: 'Available',
        avatar: doctor04,
    },
    {
        id: '5',
        name: 'Dr. Anna Kim',
        designation: 'Psychiatrist',
        department: 'Psychiatry',
        phone: '+1 51247 54587',
        email: 'anna.kim@example.com',
        experience: '7 năm',
        status: 'Available',
        avatar: doctor05,
    },
    {
        id: '6',
        name: 'Dr. John Smith',
        designation: 'Neurosurgeon',
        department: 'Neurology',
        phone: '+1 41452 54588',
        email: 'john.smith@example.com',
        experience: '15 năm',
        status: 'Unavailable',
        avatar: doctor06,
    },
    {
        id: '7',
        name: 'Dr. Lisa White',
        designation: 'Oncologist',
        department: 'Oncology',
        phone: '+1 51425 54589',
        email: 'lisa.white@example.com',
        experience: '11 năm',
        status: 'Available',
        avatar: doctor07,
    },
    {
        id: '8',
        name: 'Dr. Patricia Brown',
        designation: 'Pulmonologist',
        department: 'Pulmonology',
        phone: '+1 42565 54590',
        email: 'patricia.brown@example.com',
        experience: '6 năm',
        status: 'Available',
        avatar: doctor08,
    },
    {
        id: '9',
        name: 'Dr. Rachel Green',
        designation: 'Urologist',
        department: 'Urology',
        phone: '+1 45214 54591',
        email: 'rachel.green@example.com',
        experience: '13 năm',
        status: 'Available',
        avatar: doctor09,
    },
    {
        id: '10',
        name: 'Dr. Michael Smith',
        designation: 'Cardiologist',
        department: 'Cardiology',
        phone: '+1 41245 54592',
        email: 'michael.smith@example.com',
        experience: '10 năm',
        status: 'Available',
        avatar: doctor09,
    },
];

const selectCustomStyles = {
    control: (provided: any) => ({
        ...provided,
        minHeight: '40px',
        borderRadius: '8px',
        borderColor: '#E5E7EB',
        boxShadow: 'none',
        fontSize: '14px',
        padding: '1px 0',
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '1px 8px',
    }),
    multiValue: (provided: any) => ({
        ...provided,
        background: '#F3F4F6',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#111827',
        margin: '2px 4px',
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: '#111827',
        fontWeight: 400,
        padding: '2px 6px',
        fontSize: '13px',
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        color: '#6B7280',
        ':hover': { backgroundColor: '#E5E7EB', color: '#EF4444' },
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#EEF2FF' : state.isFocused ? '#F3F4F6' : '#fff',
        color: '#111827',
        fontSize: '14px',
        padding: '8px 14px',
        cursor: 'pointer',
        fontWeight: 400,
    }),
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        zIndex: 9999,
    }),
};

const ListDoctors: React.FC = () => {
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>(['m-1']);
    const [selectedDesignations, setSelectedDesignations] = useState<string[]>(['m-1']);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['m-1']);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedAmounts, setSelectedAmounts] = useState<string[]>(['m-1']);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['m-1']);
    const [sortBy, setSortBy] = useState<string>('Recent');
    const [showFilterModal, setShowFilterModal] = useState(false);
    // State cho popup calendar
    const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);

    const handleFilterSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Implement filter logic here
    };

    const handleClearFilters = () => {
        setSelectedDoctors(['m-1']);
        setSelectedDesignations(['m-1']);
        setSelectedDepartments(['m-1']);
        setSelectedDate(null);
        setSelectedAmounts(['m-1']);
        setSelectedStatuses(['m-1']);
    };

    const handleResetFilter = (type: string) => {
        switch (type) {
            case 'doctors':
                setSelectedDoctors(['m-1']);
                break;
            case 'designations':
                setSelectedDesignations(['m-1']);
                break;
            case 'departments':
                setSelectedDepartments(['m-1']);
                break;
            case 'date':
                setSelectedDate(null);
                break;
            case 'amounts':
                setSelectedAmounts(['m-1']);
                break;
            case 'statuses':
                setSelectedStatuses(['m-1']);
                break;
            default:
                break;
        }
    };

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Bác Sĩ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Bác Sĩ: 565
                            </span>
                        </h4>
                    </div>
                    <div className="text-end d-flex">
                        <div className="dropdown me-1">
                            <a
                                className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
                                data-bs-toggle="dropdown"
                            >
                                Xuất Dữ Liệu
                                <i className="ti ti-chevron-down ms-2"></i>
                            </a>
                            <ul className="dropdown-menu p-2">
                                <li>
                                    <a className="dropdown-item" href="#">
                                        Tải xuống dạng PDF
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#">
                                        Tải xuống dạng Excel
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                            <Link
                                to="/clinic/doctors"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/clinic/doctors"
                                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-layout-grid fs-14 text-body"></i>
                            </Link>
                        </div>
                        <Link
                            to="/clinic/doctors/add"
                            className="btn btn-primary ms-2 fs-13 btn-md"
                        >
                            <i className="ti ti-plus me-1"></i>Thêm Bác Sĩ
                        </Link>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <div className="input-icon-start position-relative">
                                        <span className="input-icon-addon">
                                            <i className="ti ti-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control shadow-sm"
                                            placeholder="Tìm kiếm"
                                        />
                                        <span className="input-icon-addon text-dark shadow fs-18 d-inline-flex p-0 header-search-icon">
                                            <i className="ti ti-command"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                        <div className="dropdown me-2">
                            <button
                                className="btn btn-white bg-white fs-14 py-1 border d-inline-flex text-dark align-items-center"
                                onClick={() => setShowFilterModal(true)}
                            >
                                <i className="ti ti-filter text-gray-5 me-1"></i>Lọc
                            </button>
                        </div>
                        <div className="dropdown">
                            <a
                                className="dropdown-toggle btn bg-white btn-md d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14"
                                data-bs-toggle="dropdown"
                            >
                                <span className="me-1">Sắp xếp theo:</span> {sortBy}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end p-2">
                                {[
                                    'Mới Thêm Gần Đây',
                                    'Tăng Dần',
                                    'Giảm Dần',
                                    'Tháng Trước',
                                    '7 Ngày Qua',
                                ].map((option) => (
                                    <li key={option}>
                                        <a
                                            className="dropdown-item rounded-1"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSortBy(option);
                                            }}
                                        >
                                            {option}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên & Chức vụ</th>
                                <th>Chuyên khoa</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Kinh nghiệm</th>
                                <th>Trạng thái</th>
                                <th>Quản lý</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <Link
                                                to="/clinic/doctor-details"
                                                className="avatar me-2"
                                            >
                                                <img
                                                    src={doctor.avatar}
                                                    alt="Doctor"
                                                    className="rounded-circle"
                                                />
                                            </Link>
                                            <div>
                                                <h6 className="mb-1 fs-14 fw-semibold">
                                                    <Link to="/clinic/doctor-details">
                                                        {doctor.name}
                                                    </Link>
                                                </h6>
                                                <span className="fs-13 d-block">
                                                    {doctor.designation}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{doctor.department}</td>
                                    <td>{doctor.phone}</td>
                                    <td>
                                        <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 fw-semibold mb-0">
                                            {doctor.experience}
                                        </h6>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-soft-${
                                                doctor.status === 'Available' ? 'success' : 'danger'
                                            } border border-${doctor.status === 'Available' ? 'success' : 'danger'}`}
                                        >
                                            {doctor.status === 'Available'
                                                ? 'Có mặt'
                                                : 'Không có mặt'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="action-item me-2">
                                                <Link to="/clinic/appointment-calendar">
                                                    <i className="ti ti-calendar-cog"></i>
                                                </Link>
                                            </div>
                                            <div className="action-item">
                                                <a data-bs-toggle="dropdown">
                                                    <i className="ti ti-dots-vertical"></i>
                                                </a>
                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link
                                                            to="/clinic/doctors/edit/1"
                                                            className="dropdown-item d-flex align-items-center"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="dropdown-item d-flex align-items-center"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#delete_modal"
                                                        >
                                                            Xóa
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="footer text-center bg-white p-2 border-top">
                <p className="text-dark mb-0">
                    2025 &copy; <a className="link-primary">Preclinic</a>, Tất Cả Quyền Được Bảo Lưu
                </p>
            </div>

            {/* Modal Bootstrap cho filter */}
            {showFilterModal && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', background: 'rgba(0,0,0,0.15)' }}
                    tabIndex={-1}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content ${styles.modalContent}`}>
                            <div className={`modal-header ${styles.modalHeader}`}>
                                <h4 className={styles.modalTitle}>Filter</h4>
                                <a
                                    className={styles.clearAll}
                                    onClick={() => {
                                        handleClearFilters();
                                    }}
                                >
                                    Clear All
                                </a>
                            </div>
                            <div className={styles.modalBody}>
                                {/* Doctor */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>Doctor</label>
                                        <a
                                            className={styles.resetLink}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResetFilter('doctors');
                                            }}
                                        >
                                            Reset
                                        </a>
                                    </div>
                                    <Select
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: 'Dr. Mick Thompson' },
                                            { value: 'm-2', label: 'Dr. Sarah Johnson' },
                                            { value: 'm-3', label: 'Dr. Emily Carter' },
                                            { value: 'm-4', label: 'Dr. David Lee' },
                                            { value: 'm-5', label: 'Dr. Anna Kim' },
                                        ].filter((option) =>
                                            selectedDoctors.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedDoctors(
                                                options.map((option) => option.value)
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: 'Dr. Mick Thompson' },
                                            { value: 'm-2', label: 'Dr. Sarah Johnson' },
                                            { value: 'm-3', label: 'Dr. Emily Carter' },
                                            { value: 'm-4', label: 'Dr. David Lee' },
                                            { value: 'm-5', label: 'Dr. Anna Kim' },
                                        ]}
                                        placeholder="Select doctor..."
                                    />
                                </div>
                                {/* Designation */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>Designation</label>
                                        <a
                                            className={styles.resetLink}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResetFilter('designations');
                                            }}
                                        >
                                            Reset
                                        </a>
                                    </div>
                                    <Select
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: 'Cardiologist' },
                                            { value: 'm-2', label: 'Orthopedic Surgeon' },
                                            { value: 'm-3', label: 'Pediatrician' },
                                            { value: 'm-4', label: 'Gynecologist' },
                                        ].filter((option) =>
                                            selectedDesignations.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedDesignations(
                                                options.map((option) => option.value)
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: 'Cardiologist' },
                                            { value: 'm-2', label: 'Orthopedic Surgeon' },
                                            { value: 'm-3', label: 'Pediatrician' },
                                            { value: 'm-4', label: 'Gynecologist' },
                                        ]}
                                        placeholder="Select designation..."
                                    />
                                </div>
                                {/* Department */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>Department</label>
                                        <a
                                            className={styles.resetLink}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResetFilter('departments');
                                            }}
                                        >
                                            Reset
                                        </a>
                                    </div>
                                    <Select
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: 'Cardiology' },
                                            { value: 'm-2', label: 'Orthopedics' },
                                            { value: 'm-3', label: 'Pediatrics' },
                                        ].filter((option) =>
                                            selectedDepartments.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedDepartments(
                                                options.map((option) => option.value)
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: 'Cardiology' },
                                            { value: 'm-2', label: 'Orthopedics' },
                                            { value: 'm-3', label: 'Pediatrics' },
                                        ]}
                                        placeholder="Select department..."
                                    />
                                </div>
                                {/* Date */}
                                <div className="mb-3">
                                    <label className={`${styles.label} mb-1`}>
                                        Date<span className="text-danger ms-1">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div className="input-icon-end position-relative">
                                            <input
                                                type="text"
                                                className={`form-control shadow-none ${styles.inputDate}`}
                                                placeholder="dd-mm-yyyy"
                                                value={
                                                    selectedDate
                                                        ? `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`
                                                        : ''
                                                }
                                                readOnly
                                                onClick={(e) => setCalendarAnchor(e.currentTarget)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span
                                                className="input-icon-addon"
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                <i className="ti ti-calendar"></i>
                                            </span>
                                        </div>
                                        <Calendar
                                            value={selectedDate}
                                            onChange={(date) => {
                                                setSelectedDate(date);
                                                setCalendarAnchor(null);
                                            }}
                                            anchorEl={calendarAnchor}
                                            open={Boolean(calendarAnchor)}
                                            onClose={() => setCalendarAnchor(null)}
                                            usePopper={true}
                                            styles={{ width: 320 }}
                                        />
                                    </div>
                                </div>
                                {/* Amount */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>Amount</label>
                                        <a
                                            className={styles.resetLink}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResetFilter('amounts');
                                            }}
                                        >
                                            Reset
                                        </a>
                                    </div>
                                    <Select
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: '$501 - $1000' },
                                            { value: 'm-2', label: '$1001 - $2000' },
                                            { value: 'm-3', label: '$2001 - $3000' },
                                        ].filter((option) =>
                                            selectedAmounts.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedAmounts(
                                                options.map((option) => option.value)
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: '$501 - $1000' },
                                            { value: 'm-2', label: '$1001 - $2000' },
                                            { value: 'm-3', label: '$2001 - $3000' },
                                        ]}
                                        placeholder="Select amount..."
                                    />
                                </div>
                                {/* Status */}
                                <div className="mb-2">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className={styles.label}>Status</label>
                                        <a
                                            className={styles.resetLink}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleResetFilter('statuses');
                                            }}
                                        >
                                            Reset
                                        </a>
                                    </div>
                                    <Select
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: 'Available' },
                                            { value: 'm-2', label: 'Unavailable' },
                                        ].filter((option) =>
                                            selectedStatuses.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedStatuses(
                                                options.map((option) => option.value)
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: 'Available' },
                                            { value: 'm-2', label: 'Unavailable' },
                                        ]}
                                        placeholder="Select status..."
                                    />
                                </div>
                            </div>
                            <div className={`modal-footer ${styles.modalFooter}`}>
                                <button
                                    type="button"
                                    className={`btn btn-light btn-md me-2 ${styles.btn}`}
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-primary btn-md ${styles.btn}`}
                                    onClick={handleFilterSubmit}
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListDoctors;
