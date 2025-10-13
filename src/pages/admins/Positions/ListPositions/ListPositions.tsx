import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import GenericModal from '@/components/GenericModal';
import { Position, PositionFormData } from '@/types/position.types';
import { mockPositions } from '@/data/doctor.mockData';
import Select from 'react-select';
import { selectCustomStyles } from '@/constants/select.styles';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';

const ListPositions: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>(mockPositions);
    const [originalPositions, setOriginalPositions] = useState<Position[]>(mockPositions);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('Mới Thêm Gần Đây');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
    const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);

    // Position Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<PositionFormData>({
        name: '',
        status: 'ACTIVE',
        description: '',
    });

    // Status options for react-select
    const statusOptions = [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
    ];

    // Custom React Select Component
    const ReactSelectComponent = ({
        value,
        onChange,
    }: {
        value: any;
        onChange: (value: any) => void;
    }) => (
        <Select
            options={statusOptions}
            value={statusOptions.find((option) => option.value === value)}
            onChange={(selectedOption) => onChange(selectedOption?.value)}
            placeholder="Chọn trạng thái"
            isSearchable={false}
            styles={selectCustomStyles}
        />
    );

    // Custom Input Component
    const CustomInputComponent = ({
        value,
        onChange,
        placeholder,
        required,
    }: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        required?: boolean;
    }) => (
        <Input
            name="name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
        />
    );

    // Custom Textarea Component
    const CustomTextareaComponent = ({
        value,
        onChange,
        placeholder,
        rows,
    }: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        rows?: number;
    }) => (
        <Textarea
            name="description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
        />
    );

    const fields = [
        {
            type: 'custom' as const,
            name: 'name',
            label: 'Tên Chức Vụ',
            placeholder: 'Nhập tên chức vụ',
            required: true,
            value: formData.name,
            onChange: (value: string) => setFormData((prev) => ({ ...prev, name: value })),
            component: CustomInputComponent,
            componentProps: {
                placeholder: 'Nhập tên chức vụ',
                required: true,
            },
        },
        {
            type: 'custom' as const,
            name: 'status',
            label: 'Trạng Thái',
            required: true,
            value: formData.status,
            onChange: (value: 'ACTIVE' | 'INACTIVE') =>
                setFormData((prev) => ({ ...prev, status: value })),
            component: ReactSelectComponent,
        },
        {
            type: 'custom' as const,
            name: 'description',
            label: 'Mô Tả',
            placeholder: 'Nhập mô tả cho chức vụ...',
            value: formData.description,
            onChange: (value: string) => setFormData((prev) => ({ ...prev, description: value })),
            component: CustomTextareaComponent,
            componentProps: {
                placeholder: 'Nhập mô tả cho chức vụ...',
                rows: 4,
            },
        },
    ];

    const handleAddClick = () => {
        setModalMode('add');
        setFormData({
            name: '',
            status: 'ACTIVE',
            description: '',
        });
        setShowModal(true);
    };

    const handleEditClick = (position: {
        name: string;
        status: 'ACTIVE' | 'INACTIVE';
        description: string;
    }) => {
        setModalMode('edit');
        setFormData({
            name: position.name,
            status: position.status,
            description: position.description || '',
        });
        setShowModal(true);
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    const title = modalMode === 'add' ? 'Thêm Chức Vụ Mới' : 'Sửa Chức Vụ';

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination logic
    const paginatedPositions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return positions.slice(startIndex, endIndex);
    }, [positions, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(positions.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterSubmit = () => {
        let filteredPositions = [...originalPositions];

        // Lọc theo chức vụ
        if (selectedPositions.length > 0) {
            filteredPositions = filteredPositions.filter((position) =>
                selectedPositions.includes(position.id)
            );
        }

        // Lọc theo trạng thái
        if (selectedStatuses.length > 0) {
            filteredPositions = filteredPositions.filter((position) =>
                selectedStatuses.includes(position.status)
            );
        }

        setPositions(filteredPositions);
        setCurrentPage(1); // Reset về trang 1 khi filter
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedPositions([]);
        setSelectedStatuses([]);
        setPositions(originalPositions);
        setCurrentPage(1); // Reset về trang 1 khi clear filter
    };

    const handleResetFilter = (type: string) => {
        switch (type) {
            case 'positions':
                setSelectedPositions([]);
                break;
            case 'statuses':
                setSelectedStatuses([]);
                break;
            default:
                break;
        }
    };

    // Delete functions
    const handleDeleteClick = (position: Position) => {
        setPositionToDelete(position);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (positionToDelete) {
            // Remove position from list
            setPositions((prev) => prev.filter((position) => position.id !== positionToDelete.id));
            setOriginalPositions((prev: Position[]) =>
                prev.filter((position: Position) => position.id !== positionToDelete.id)
            );

            // Close modal
            setShowDeleteModal(false);
            setPositionToDelete(null);

            // Show success message
            alert(`Đã xóa chức vụ ${positionToDelete.name} thành công!`);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setPositionToDelete(null);
    };

    // Position modal functions
    const handlePositionSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (modalMode === 'add') {
                // Create new position
                const newPositionData: Position = {
                    id: `pos-${Date.now()}`,
                    name: formData.name,
                    status: formData.status,
                    description: formData.description,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // Add to positions list
                setPositions((prev) => [newPositionData, ...prev]);
                setOriginalPositions((prev) => [newPositionData, ...prev]);

                // Show success message
                alert('Tạo chức vụ thành công!');
            } else {
                // Update position
                if (!positionToEdit) return;

                const updatedPosition: Position = {
                    ...positionToEdit,
                    name: formData.name,
                    status: formData.status,
                    description: formData.description,
                    updatedAt: new Date().toISOString(),
                };

                // Update in positions list
                setPositions((prev) =>
                    prev.map((p) => (p.id === positionToEdit.id ? updatedPosition : p))
                );
                setOriginalPositions((prev) =>
                    prev.map((p) => (p.id === positionToEdit.id ? updatedPosition : p))
                );

                // Show success message
                alert('Cập nhật chức vụ thành công!');
            }

            // Close modal
            handleCancel();
        } catch (error) {
            console.error('Error saving position:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClickWithPosition = (position: Position) => {
        setPositionToEdit(position);
        handleEditClick({
            name: position.name,
            status: position.status,
            description: position.description || '',
        });
    };

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            Danh Sách Chức Vụ{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Chức Vụ: {positions.length}
                            </span>
                        </h4>
                    </div>
                    <div className="text-end d-flex">
                        <ActionDropdown
                            type="export"
                            options={[
                                { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                {
                                    value: 'excel',
                                    label: 'Tải xuống dạng Excel',
                                    format: 'excel',
                                },
                            ]}
                            onExport={(format: string) => {
                                console.log('Exporting:', format);
                                // Handle export logic here
                            }}
                        />
                        <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                            <Link
                                to="/admins/positions"
                                className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-list fs-14 text-body"></i>
                            </Link>
                            <Link
                                to="/admins/positions"
                                className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                            >
                                <i className="ti ti-layout-grid fs-14 text-body"></i>
                            </Link>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            className="ms-2 fs-13"
                            icon="ti ti-plus"
                            onClick={handleAddClick}
                        >
                            Thêm Chức Vụ
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="positionSearch" aria-label="Search positions">
                                        <input
                                            id="positionSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Search"
                                            aria-controls="DataTables_Table_0"
                                        ></input>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex table-dropdown mb-3 pb-1 align-items-center flex-wrap row-gap-3 ms-auto">
                        <Button
                            variant="white"
                            size="md"
                            className="me-2 fs-14 py-1 border d-inline-flex text-dark align-items-center"
                            icon="ti ti-filter text-gray-5"
                            onClick={() => setShowFilterModal(true)}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={[
                                { value: 'recent', label: 'Mới Thêm Gần Đây' },
                                { value: 'asc', label: 'Tăng Dần' },
                                { value: 'desc', label: 'Giảm Dần' },
                                { value: 'last-month', label: 'Tháng Trước' },
                                { value: 'last-7-days', label: '7 Ngày Qua' },
                            ]}
                            selectedValue={sortBy}
                            onSelect={setSortBy}
                            placeholder="Sắp xếp theo:"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Tên Chức Vụ</th>
                                <th>Ngày Tạo</th>
                                <th>Ngày Cập Nhật</th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPositions.map((position) => (
                                <tr key={position.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar me-2">
                                                <div className="avatar-title bg-primary-subtle text-primary rounded">
                                                    <i className="ti ti-briefcase"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="mb-1 fs-14 fw-semibold">
                                                    {position.name}
                                                </h6>
                                                <span className="text-muted fs-13">
                                                    ID: {position.id}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-muted fs-14">
                                            {position.createdAt
                                                ? new Date(position.createdAt).toLocaleDateString(
                                                      'vi-VN'
                                                  )
                                                : 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-muted fs-14">
                                            {position.updatedAt
                                                ? new Date(position.updatedAt).toLocaleDateString(
                                                      'vi-VN'
                                                  )
                                                : 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge status={position.status} />
                                    </td>
                                    <td className="action-item">
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            data-bs-toggle="dropdown"
                                        >
                                            <i className="ti ti-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu p-2">
                                            <li>
                                                <button
                                                    type="button"
                                                    className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                                    onClick={() =>
                                                        handleEditClickWithPosition(position)
                                                    }
                                                >
                                                    <i className="ti ti-edit me-2"></i>
                                                    Sửa
                                                </button>
                                            </li>
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                                                    onClick={() => handleDeleteClick(position)}
                                                >
                                                    <i className="ti ti-trash me-2"></i>
                                                    Xóa
                                                </button>
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Position Modal */}
            <GenericModal
                show={showModal}
                mode={modalMode}
                title={title}
                fields={fields}
                onSubmit={handlePositionSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                submitButtonText={modalMode === 'add' ? 'Tạo Chức Vụ' : 'Cập Nhật Chức Vụ'}
            />

            {/* Delete Confirmation Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xóa chức vụ"
                message={`Bạn có chắc chắn muốn xóa chức vụ "${positionToDelete?.name}"? Hành động này không thể hoàn tác.`}
            />

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterSubmit}
                onReset={handleClearFilters}
                title="Bộ lọc chức vụ"
                fields={[
                    {
                        name: 'positions',
                        label: 'Chức Vụ',
                        type: 'multiselect',
                        options: originalPositions.map((position) => ({
                            value: position.id,
                            label: position.name,
                        })),
                        value: selectedPositions,
                        onChange: setSelectedPositions,
                        resetValue: () => handleResetFilter('positions'),
                    },
                    {
                        name: 'statuses',
                        label: 'Trạng Thái',
                        type: 'multiselect',
                        options: [
                            { value: 'ACTIVE', label: 'Hoạt động' },
                            { value: 'INACTIVE', label: 'Không hoạt động' },
                        ],
                        value: selectedStatuses,
                        onChange: setSelectedStatuses,
                        resetValue: () => handleResetFilter('statuses'),
                    },
                ]}
            />
        </>
    );
};

export default ListPositions;
