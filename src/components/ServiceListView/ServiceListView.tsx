import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import EditServiceModal from '@/components/EditServiceModal';
import CreateServiceModal from '@/components/CreateServiceModal';
import ActionDropdown from '@/components/ActionDropdown';
import StatusBadge from '@/components/StatusBadge';
import TableActions from '@/components/TableActions';
import TableSkeleton from '@/components/TableSkeleton';
import { Service } from '@/types/service.types';
import { useServiceList } from '@/hooks/useServiceList';

interface ServiceListViewProps {
    hospitalId?: string;
    showHospitalColumn?: boolean;
    showHospitalFilter?: boolean;
    editServicePathTemplate?: string;
    pageTitle?: string;
    useEditModal?: boolean; // Use modal instead of navigation for editing
    useCreateModal?: boolean; // Use modal instead of navigation for creating
}

const ServiceListView: React.FC<ServiceListViewProps> = ({
    hospitalId,
    showHospitalColumn = true,
    showHospitalFilter = true,
    editServicePathTemplate = '/admin/services/edit/:id',
    pageTitle = 'Danh sách dịch vụ',
    useEditModal = false,
    useCreateModal = false,
}) => {
    const {
        services,
        isLoading,
        error,
        pagination,
        serviceCategories,
        hospitals,
        tempSelectedServiceTypes,
        setTempSelectedServiceTypes,
        tempSelectedHospitals,
        setTempSelectedHospitals,
        tempSelectedStatuses,
        setTempSelectedStatuses,
        tempSelectedPrices,
        setTempSelectedPrices,
        appliedSelectedServiceTypes,
        appliedSelectedHospitals,
        appliedSelectedStatuses,
        appliedSelectedPrices,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        currentPage,
        shouldHidePagination,
        handlePageChange,
        handleDeleteService,
        handleFilterSubmit,
        handleClearFilters,
        setError,
        refetchServices,
    } = useServiceList({
        hospitalId,
        showHospitalColumn,
        showHospitalFilter,
    });

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [serviceToEdit, setServiceToEdit] = useState<string | null>(null);

    const itemsPerPage = 10;

    // Build table columns dynamically
    const serviceTableColumns = [
        { label: 'Tên', hasAvatar: false, type: 'text' as const },
        { label: 'Mô tả', hasAvatar: false, type: 'text' as const },
        { label: 'Giá', hasAvatar: false, type: 'text' as const },
        { label: 'Thời gian', hasAvatar: false, type: 'text' as const },
        ...(showHospitalColumn
            ? [{ label: 'Bệnh viện', hasAvatar: false, type: 'text' as const }]
            : []),
        { label: 'Loại dịch vụ', hasAvatar: false, type: 'text' as const },
        { label: 'Trạng thái', hasAvatar: false, type: 'text' as const },
        { label: 'Hành động', hasAvatar: false, type: 'text' as const },
    ];

    const handleEditClick = (service: Service) => {
        if (useEditModal) {
            setServiceToEdit(service.id);
            setShowEditModal(true);
        }
        // If not using modal, TableActions will handle navigation via editLink
    };

    const handleEditSuccess = () => {
        // Refresh the service list after successful edit
        refetchServices();
    };

    const handleCreateClick = () => {
        if (useCreateModal) {
            setShowCreateModal(true);
        }
    };

    const handleCreateSuccess = () => {
        // Refresh the service list after successful create
        refetchServices();
    };

    const handleDeleteClick = (service: Service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (serviceToDelete) {
            const success = await handleDeleteService(serviceToDelete.id);
            if (success) {
                setShowDeleteModal(false);
                setServiceToDelete(null);
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    const handleFilterClick = () => {
        setTempSelectedServiceTypes(appliedSelectedServiceTypes);
        setTempSelectedHospitals(appliedSelectedHospitals);
        setTempSelectedStatuses(appliedSelectedStatuses);
        setTempSelectedPrices(appliedSelectedPrices);
        setShowFilterModal(true);
    };

    const handleFilterModalSubmit = async () => {
        await handleFilterSubmit();
        setShowFilterModal(false);
    };

    // Render table body
    const renderTableBody = () => {
        if (isLoading) {
            return <TableSkeleton rows={itemsPerPage} columns={serviceTableColumns} />;
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={serviceTableColumns.length} className="text-center py-4">
                        <div className="alert alert-danger" role="alert">
                            <strong>Lỗi:</strong> {error}
                            <button
                                type="button"
                                className="btn-close ms-2"
                                onClick={() => setError(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    </td>
                </tr>
            );
        }

        if (services.length === 0) {
            return (
                <tr>
                    <td colSpan={serviceTableColumns.length} className="text-center py-4">
                        <p className="text-muted">Không có dịch vụ nào được tìm thấy.</p>
                    </td>
                </tr>
            );
        }

        return services.map((service) => (
            <tr key={service.id}>
                <td>
                    <h6 className="mb-1 fs-14 fw-semibold">{service.name}</h6>
                </td>
                <td>
                    <span className="text-muted">
                        {(() => {
                            if (!service.description) return '-';
                            if (service.description.length > 50) {
                                return `${service.description.substring(0, 50)}...`;
                            }
                            return service.description;
                        })()}
                    </span>
                </td>
                <td>
                    <StatusBadge
                        status="ACTIVE"
                        variant="success"
                        customText={`${service.price.toLocaleString('vi-VN')} VNĐ`}
                    />
                </td>
                <td>
                    <StatusBadge
                        status="ACTIVE"
                        variant="info"
                        customText={`${service.duration || service.durationTime || 0} phút`}
                    />
                </td>
                {showHospitalColumn && <td>{service.hospitalName || '-'}</td>}
                <td>
                    <StatusBadge
                        status="ACTIVE"
                        variant="primary"
                        customText={service.serviceCategoryName || service.serviceTypeName || '-'}
                    />
                </td>
                <td>
                    <StatusBadge status={service.status || 'ACTIVE'} />
                </td>
                <td>
                    <TableActions
                        id={service.id}
                        onEdit={useEditModal ? () => handleEditClick(service) : () => {}}
                        onDelete={() => handleDeleteClick(service)}
                        editLink={
                            useEditModal
                                ? undefined
                                : editServicePathTemplate.replace(':id', service.id)
                        }
                        showEdit={true}
                        showDelete={true}
                        showView={false}
                    />
                </td>
            </tr>
        ));
    };

    // Build filter fields
    const filterFields = [
        {
            name: 'serviceTypes',
            label: 'Loại Dịch Vụ',
            type: 'multiselect' as const,
            options: serviceCategories.map((serviceCategory, index) => ({
                value: serviceCategory.id,
                label: serviceCategory.name,
                key: `service-category-${index}`,
            })),
            value: tempSelectedServiceTypes,
            onChange: setTempSelectedServiceTypes,
            resetValue: [],
        },
        ...(showHospitalFilter
            ? [
                  {
                      name: 'hospitals',
                      label: 'Bệnh Viện',
                      type: 'multiselect' as const,
                      options: hospitals.map((hospital, index) => ({
                          value: hospital.id,
                          label: hospital.name,
                          key: `hospital-${index}`,
                      })),
                      value: tempSelectedHospitals,
                      onChange: setTempSelectedHospitals,
                      resetValue: [],
                  },
              ]
            : []),
        {
            name: 'prices',
            label: 'Giá',
            type: 'multiselect' as const,
            options: [
                { value: 'p-1', label: 'Dưới 200,000 VNĐ', key: 'price-p-1' },
                { value: 'p-2', label: '200,000 - 400,000 VNĐ', key: 'price-p-2' },
                { value: 'p-3', label: '400,000 - 600,000 VNĐ', key: 'price-p-3' },
                { value: 'p-4', label: '600,000 - 800,000 VNĐ', key: 'price-p-4' },
                { value: 'p-5', label: '800,000 - 1,000,000 VNĐ', key: 'price-p-5' },
                { value: 'p-6', label: '1,000,000 - 1,500,000 VNĐ', key: 'price-p-6' },
                { value: 'p-7', label: 'Trên 1,500,000 VNĐ', key: 'price-p-7' },
            ],
            value: tempSelectedPrices,
            onChange: setTempSelectedPrices,
            resetValue: [],
        },
        {
            name: 'statuses',
            label: 'Trạng Thái',
            type: 'multiselect' as const,
            options: [
                { value: 'ACTIVE', label: 'Hoạt động', key: 'status-active' },
                { value: 'INACTIVE', label: 'Không hoạt động', key: 'status-inactive' },
            ],
            value: tempSelectedStatuses,
            onChange: setTempSelectedStatuses,
            resetValue: [],
        },
    ];

    return (
        <>
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">
                            {pageTitle}{' '}
                            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
                                Tổng Dịch Vụ: {pagination.totalCount}
                            </span>
                        </h4>
                    </div>
                    <div className="text-end d-flex">
                        <ActionDropdown
                            type="export"
                            options={[
                                { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                { value: 'excel', label: 'Tải xuống dạng Excel', format: 'excel' },
                            ]}
                            onExport={(format: string) => {
                                console.log('Exporting:', format);
                            }}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            className="ms-2 fs-13"
                            icon="ti ti-plus"
                            onClick={handleCreateClick}
                        >
                            Thêm dịch vụ
                        </Button>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <div className="search-set mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            <div className="table-search d-flex align-items-center mb-0">
                                <div className="search-input">
                                    <label htmlFor="serviceSearch" aria-label="Search services">
                                        <input
                                            id="serviceSearch"
                                            type="search"
                                            className="form-control form-control-sm"
                                            placeholder="Tìm kiếm dịch vụ..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
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
                            onClick={handleFilterClick}
                        >
                            Lọc
                        </Button>
                        <ActionDropdown
                            type="sort"
                            options={[
                                { value: 'Tên A-Z', label: 'Tên A-Z' },
                                { value: 'Tên Z-A', label: 'Tên Z-A' },
                                { value: 'Giá (Cao-Thấp)', label: 'Giá (Cao-Thấp)' },
                                { value: 'Giá (Thấp-Cao)', label: 'Giá (Thấp-Cao)' },
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
                                <th>Tên</th>
                                <th>Mô tả</th>
                                <th>Giá</th>
                                <th>Thời gian</th>
                                {showHospitalColumn && <th>Bệnh viện</th>}
                                <th>Loại dịch vụ</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>

                {!shouldHidePagination && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                <div className="footer text-center bg-white p-2 border-top">
                    <p className="text-dark mb-0">
                        2025 &copy;{' '}
                        <Link to="/" className="link-primary">
                            Preclinic
                        </Link>
                        , Tất cả quyền được bảo lưu
                    </p>
                </div>
            </div>

            {/* Filter Modal */}
            <ModalFilter
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                onApply={handleFilterModalSubmit}
                onReset={handleClearFilters}
                title="Lọc dịch vụ"
                fields={filterFields}
            />

            {/* Delete Modal */}
            <ModalDelete
                show={showDeleteModal}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa dịch vụ này không?"
                itemName={serviceToDelete ? serviceToDelete.name : ''}
            />

            {/* Edit Modal (only shown when useEditModal is true) */}
            {useEditModal && (
                <EditServiceModal
                    isOpen={showEditModal}
                    serviceId={serviceToEdit}
                    serviceCategories={serviceCategories}
                    onClose={() => {
                        setShowEditModal(false);
                        setServiceToEdit(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Create Modal (only shown when useCreateModal is true) */}
            {useCreateModal && hospitalId && (
                <CreateServiceModal
                    isOpen={showCreateModal}
                    hospitalId={hospitalId}
                    serviceCategories={serviceCategories}
                    onClose={() => {
                        setShowCreateModal(false);
                    }}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </>
    );
};

export default ServiceListView;
