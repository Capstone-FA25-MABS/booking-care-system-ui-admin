import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import styles from './ListDoctors.module.scss';

// Import ảnh trực tiếp
import doctor01 from '@/assets/img/doctors/doctor-01.jpg';
import doctor02 from '@/assets/img/doctors/doctor-02.jpg';
import doctor03 from '@/assets/img/doctors/doctor-03.jpg';
import doctor04 from '@/assets/img/doctors/doctor-04.jpg';

interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: { name: string };
    specialtyId: string;
    yearsOfExperience: number;
    status: string;
    avatarUrl: string;
    prices: { serviceTypeName: string; amount: number }[];
    createdAt: string;
}

const mockDoctors: Doctor[] = [
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd6',
        firstName: 'Ngô',
        lastName: 'Văn I',
        email: 'dr.ngo.van.i@bookingcare.com',
        position: { name: 'Bác sĩ ngoại khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd1',
        yearsOfExperience: 7,
        status: 'ACTIVE',
        avatarUrl: doctor01,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 750000 },
            { serviceTypeName: 'TELEHEALTH', amount: 450000 },
        ],
        createdAt: '2025-09-14T09:30:59.67',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd7',
        firstName: 'Trần',
        lastName: 'Thị A',
        email: 'dr.tran.thi.a@bookingcare.com',
        position: { name: 'Bác sĩ nhi khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd2',
        yearsOfExperience: 10,
        status: 'INACTIVE',
        avatarUrl: doctor02,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 600000 },
            { serviceTypeName: 'TELEHEALTH', amount: 300000 },
        ],
        createdAt: '2025-09-15T10:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd8',
        firstName: 'Lê',
        lastName: 'Văn B',
        email: 'dr.le.van.b@bookingcare.com',
        position: { name: 'Bác sĩ nội khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd3',
        yearsOfExperience: 5,
        status: 'ACTIVE',
        avatarUrl: doctor03,
        prices: [
            { serviceTypeName: 'IN_PERSON', amount: 1200000 },
            { serviceTypeName: 'TELEHEALTH', amount: 800000 },
        ],
        createdAt: '2025-09-16T11:00:00.00',
    },
    {
        id: 'bd33ae9c-eed1-4b39-aa2f-015c96f77dd9',
        firstName: 'Phạm',
        lastName: 'Thị C',
        email: 'dr.pham.thi.c@bookingcare.com',
        position: { name: 'Bác sĩ ngoại khoa' },
        specialtyId: '25e24629-2bd5-4849-934c-63160ef1fcd1',
        yearsOfExperience: 8,
        status: 'ACTIVE',
        avatarUrl: doctor04,
        prices: [{ serviceTypeName: 'TELEHEALTH', amount: 400000 }],
        createdAt: '2025-09-17T12:00:00.00',
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
    option: (provided: any, state: any) => {
        let backgroundColor = '#fff';
        if (state.isSelected) {
            backgroundColor = '#EEF2FF';
        } else if (state.isFocused) {
            backgroundColor = '#F3F4F6';
        }

        return {
            ...provided,
            backgroundColor,
            color: '#111827',
            fontSize: '14px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 400,
        };
    },
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        zIndex: 9999,
    }),
};

const ListDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
    const [originalDoctors] = useState<Doctor[]>(mockDoctors);
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const handleFilterSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let filteredDoctors = [...originalDoctors];

        // Lọc theo bác sĩ
        if (selectedDoctors.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedDoctors.includes(doctor.id)
            );
        }

        // Lọc theo học hàm/học vị
        if (selectedPositions.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedPositions.includes(doctor.position.name)
            );
        }

        // Lọc theo chuyên khoa
        if (selectedSpecialties.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedSpecialties.includes(doctor.specialtyId)
            );
        }

        // Lọc theo loại dịch vụ
        if (selectedServiceTypes.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                doctor.prices.some((price) => selectedServiceTypes.includes(price.serviceTypeName))
            );
        }

        // Lọc theo giá
        if (selectedPrices.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                doctor.prices.some((price) => {
                    const amount = price.amount;
                    if (selectedPrices.includes('m-1') && amount < 500000) return true;
                    if (selectedPrices.includes('m-2') && amount >= 500000 && amount <= 1000000)
                        return true;
                    if (selectedPrices.includes('m-3') && amount > 1000000) return true;
                    return false;
                })
            );
        }

        // Lọc theo trạng thái
        if (selectedStatuses.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor) =>
                selectedStatuses.includes(doctor.status)
            );
        }

        setDoctors(filteredDoctors);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedDoctors([]);
        setSelectedPositions([]);
        setSelectedSpecialties([]);
        setSelectedServiceTypes([]);
        setSelectedPrices([]);
        setSelectedStatuses([]);
        setDoctors(originalDoctors);
    };

    const handleResetFilter = (type: string) => {
        switch (type) {
            case 'doctors':
                setSelectedDoctors([]);
                break;
            case 'positions':
                setSelectedPositions([]);
                break;
            case 'specialties':
                setSelectedSpecialties([]);
                break;
            case 'serviceTypes':
                setSelectedServiceTypes([]);
                break;
            case 'prices':
                setSelectedPrices([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
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
                                Tổng Bác Sĩ: {doctors.length}
                            </span>
                        </h4>
                    </div>
                    <div className="text-end d-flex">
                        <div className="dropdown me-1">
                            <button
                                className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
                                data-bs-toggle="dropdown"
                                type="button"
                            >
                                Xuất Dữ Liệu
                                <i className="ti ti-chevron-down ms-2"></i>
                            </button>
                            <ul className="dropdown-menu p-2">
                                <li>
                                    <button className="dropdown-item" type="button">
                                        Tải xuống dạng PDF
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" type="button">
                                        Tải xuống dạng Excel
                                    </button>
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
                                <label htmlFor="doctor-search" className="visually-hidden">
                                    Tìm kiếm bác sĩ
                                </label>
                                <div className="search-input">
                                    <div className="input-icon-start position-relative">
                                        <span className="input-icon-addon">
                                            <i className="ti ti-search"></i>
                                        </span>
                                        <input
                                            id="doctor-search"
                                            type="text"
                                            className="form-control shadow-sm"
                                            placeholder="Tìm kiếm bác sĩ..."
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
                            <button
                                className="dropdown-toggle btn bg-white btn-md d-inline-flex align-items-center fw-normal rounded border text-dark px-2 py-1 fs-14"
                                data-bs-toggle="dropdown"
                                type="button"
                            >
                                <span className="me-1">Sắp xếp theo:</span> {sortBy}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end p-2">
                                {[
                                    'Mới Thêm Gần Đây',
                                    'Tăng Dần',
                                    'Giảm Dần',
                                    'Tháng Trước',
                                    '7 Ngày Qua',
                                ].map((option) => (
                                    <li key={option}>
                                        <button
                                            className="dropdown-item rounded-1"
                                            onClick={() => setSortBy(option)}
                                            type="button"
                                        >
                                            {option}
                                        </button>
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
                                <th>Tên & Học hàm/Học vị</th>
                                <th>Chuyên khoa</th>
                                <th>Email</th>
                                <th>Kinh nghiệm</th>
                                <th>Loại dịch vụ</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <Link
                                                to={`/clinic/doctor-details/${doctor.id}`}
                                                className="avatar me-2"
                                            >
                                                <img
                                                    src={doctor.avatarUrl}
                                                    alt="Bác sĩ"
                                                    className="rounded-circle"
                                                />
                                            </Link>
                                            <div>
                                                <h6 className="mb-1 fs-14 fw-semibold">
                                                    <Link
                                                        to={`/clinic/doctor-details/${doctor.id}`}
                                                    >
                                                        {doctor.firstName} {doctor.lastName}
                                                    </Link>
                                                </h6>
                                                <span className="fs-13 d-block">
                                                    {doctor.position.name}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{doctor.specialtyId}</td>
                                    <td>
                                        <a href={`mailto:${doctor.email}`}>{doctor.email}</a>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 fw-semibold mb-0">
                                            {doctor.yearsOfExperience} năm
                                        </h6>
                                    </td>
                                    <td>
                                        {doctor.prices
                                            .map((price) =>
                                                price.serviceTypeName === 'IN_PERSON'
                                                    ? 'Trực tiếp'
                                                    : 'Từ xa'
                                            )
                                            .join(', ')}
                                    </td>
                                    <td>
                                        {doctor.prices
                                            .map(
                                                (price) =>
                                                    `${price.amount.toLocaleString('vi-VN')} VNĐ`
                                            )
                                            .join(', ')}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-soft-${
                                                doctor.status === 'ACTIVE' ? 'success' : 'danger'
                                            } border border-${doctor.status === 'ACTIVE' ? 'success' : 'danger'}`}
                                        >
                                            {doctor.status === 'ACTIVE' ? 'Có mặt' : 'Không có mặt'}
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
                                                <button
                                                    className={styles.dotsButton}
                                                    data-bs-toggle="dropdown"
                                                    type="button"
                                                >
                                                    <i className="ti ti-dots-vertical"></i>
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link
                                                            to={`/clinic/doctors/edit/${doctor.id}`}
                                                            className="dropdown-item d-flex align-items-center"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <button
                                                            className="dropdown-item d-flex align-items-center"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#delete_modal"
                                                            type="button"
                                                        >
                                                            Xóa
                                                        </button>
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

            {showFilterModal && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', background: 'rgba(0,0,0,0.15)' }}
                    tabIndex={-1}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className={`modal-content ${styles.modalContent}`}>
                            <div className={`modal-header ${styles.modalHeader}`}>
                                <h4 className={styles.modalTitle}>Lọc Bác Sĩ</h4>
                                <button
                                    className={styles.clearAll}
                                    onClick={() => {
                                        handleClearFilters();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleClearFilters();
                                        }
                                    }}
                                    type="button"
                                >
                                    Xóa Tất Cả
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {/* Bác sĩ */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="doctors-select" className={styles.label}>
                                            Bác Sĩ
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('doctors')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('doctors');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="doctors-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={originalDoctors
                                            .map((doctor) => ({
                                                value: doctor.id,
                                                label: `${doctor.firstName} ${doctor.lastName}`,
                                            }))
                                            .filter((option) =>
                                                selectedDoctors.includes(option.value)
                                            )}
                                        onChange={(options) =>
                                            setSelectedDoctors(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={originalDoctors.map((doctor) => ({
                                            value: doctor.id,
                                            label: `${doctor.firstName} ${doctor.lastName}`,
                                        }))}
                                        placeholder="Chọn bác sĩ..."
                                    />
                                </div>
                                {/* Học hàm/Học vị */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="positions-select" className={styles.label}>
                                            Học hàm/Học vị
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('positions')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('positions');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="positions-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            ...new Set(
                                                originalDoctors.map(
                                                    (doctor) => doctor.position.name
                                                )
                                            ),
                                        ]
                                            .map((position) => ({
                                                value: position,
                                                label: position,
                                            }))
                                            .filter((option) =>
                                                selectedPositions.includes(option.value)
                                            )}
                                        onChange={(options) =>
                                            setSelectedPositions(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={[
                                            ...new Set(
                                                originalDoctors.map(
                                                    (doctor) => doctor.position.name
                                                )
                                            ),
                                        ].map((position) => ({ value: position, label: position }))}
                                        placeholder="Chọn học hàm/học vị..."
                                    />
                                </div>
                                {/* Chuyên khoa */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label
                                            htmlFor="specialties-select"
                                            className={styles.label}
                                        >
                                            Chuyên Khoa
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('specialties')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('specialties');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="specialties-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            ...new Set(
                                                originalDoctors.map((doctor) => doctor.specialtyId)
                                            ),
                                        ]
                                            .map((specialty) => ({
                                                value: specialty,
                                                label: specialty,
                                            }))
                                            .filter((option) =>
                                                selectedSpecialties.includes(option.value)
                                            )}
                                        onChange={(options) =>
                                            setSelectedSpecialties(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={[
                                            ...new Set(
                                                originalDoctors.map((doctor) => doctor.specialtyId)
                                            ),
                                        ].map((specialty) => ({
                                            value: specialty,
                                            label: specialty,
                                        }))}
                                        placeholder="Chọn chuyên khoa..."
                                    />
                                </div>
                                {/* Loại dịch vụ */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label
                                            htmlFor="service-types-select"
                                            className={styles.label}
                                        >
                                            Loại Dịch Vụ
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('serviceTypes')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('serviceTypes');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="service-types-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            ...new Set(
                                                originalDoctors.flatMap((doctor) =>
                                                    doctor.prices.map((p) => p.serviceTypeName)
                                                )
                                            ),
                                        ]
                                            .map((type) => ({
                                                value: type,
                                                label: type === 'IN_PERSON' ? 'Trực tiếp' : 'Từ xa',
                                            }))
                                            .filter((option) =>
                                                selectedServiceTypes.includes(option.value)
                                            )}
                                        onChange={(options) =>
                                            setSelectedServiceTypes(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={[
                                            ...new Set(
                                                originalDoctors.flatMap((doctor) =>
                                                    doctor.prices.map((p) => p.serviceTypeName)
                                                )
                                            ),
                                        ].map((type) => ({
                                            value: type,
                                            label: type === 'IN_PERSON' ? 'Trực tiếp' : 'Từ xa',
                                        }))}
                                        placeholder="Chọn loại dịch vụ..."
                                    />
                                </div>
                                {/* Giá */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="prices-select" className={styles.label}>
                                            Giá
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('prices')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('prices');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="prices-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'm-1', label: 'Dưới 500,000 VNĐ' },
                                            { value: 'm-2', label: '500,000 - 1,000,000 VNĐ' },
                                            { value: 'm-3', label: 'Trên 1,000,000 VNĐ' },
                                        ].filter((option) => selectedPrices.includes(option.value))}
                                        onChange={(options) =>
                                            setSelectedPrices(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={[
                                            { value: 'm-1', label: 'Dưới 500,000 VNĐ' },
                                            { value: 'm-2', label: '500,000 - 1,000,000 VNĐ' },
                                            { value: 'm-3', label: 'Trên 1,000,000 VNĐ' },
                                        ]}
                                        placeholder="Chọn mức giá..."
                                    />
                                </div>
                                {/* Trạng thái */}
                                <div className="mb-2">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label htmlFor="statuses-select" className={styles.label}>
                                            Trạng Thái
                                        </label>
                                        <button
                                            className={styles.resetLink}
                                            onClick={() => handleResetFilter('statuses')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleResetFilter('statuses');
                                                }
                                            }}
                                            type="button"
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                    <Select
                                        id="statuses-select"
                                        isMulti
                                        classNamePrefix="select2"
                                        styles={selectCustomStyles}
                                        value={[
                                            { value: 'ACTIVE', label: 'Có mặt' },
                                            { value: 'INACTIVE', label: 'Không có mặt' },
                                        ].filter((option) =>
                                            selectedStatuses.includes(option.value)
                                        )}
                                        onChange={(options) =>
                                            setSelectedStatuses(
                                                options ? options.map((option) => option.value) : []
                                            )
                                        }
                                        options={[
                                            { value: 'ACTIVE', label: 'Có mặt' },
                                            { value: 'INACTIVE', label: 'Không có mặt' },
                                        ]}
                                        placeholder="Chọn trạng thái..."
                                    />
                                </div>
                            </div>
                            <div className={`modal-footer ${styles.modalFooter}`}>
                                <button
                                    type="button"
                                    className={`btn btn-light btn-md me-2 ${styles.btn}`}
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-primary btn-md ${styles.btn}`}
                                    onClick={handleFilterSubmit}
                                >
                                    Lọc
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
