import React from 'react';
import Button from '@/components/Button';
import ModalDelete from '@/components/ModalDelete';
import ModalFilter from '@/components/ModalFilter';
import SortDropdown from '@/components/SortDropdown';
import ExportDropdown from '@/components/ExportDropdown';
import Pagination from '@/components/Pagination';

export interface ListPageProps {
    title: string;
    addButtonText: string;
    onAddClick: () => void;
    onFilterClick: () => void;
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onExportClick: (format: string) => void;
    onSearchChange: (searchTerm: string) => void;
    searchValue: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    showDeleteModal: boolean;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    deleteItemName: string;
    showFilterModal: boolean;
    onCloseFilter: () => void;
    onApplyFilter: () => void;
    children: React.ReactNode;
    paginationProps: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        totalItems: number;
        itemsPerPage: number;
    };
}

const ListPage: React.FC<ListPageProps> = ({
    title,
    addButtonText,
    onAddClick,
    onFilterClick,
    onSortChange,
    onExportClick,
    onSearchChange,
    searchValue,
    sortBy,
    sortOrder,
    showDeleteModal,
    onConfirmDelete,
    onCancelDelete,
    deleteItemName,
    showFilterModal,
    onCloseFilter,
    onApplyFilter,
    children,
    paginationProps,
}) => {
    return (
        <div className="main-wrapper">
            <div className="settings-wrapper">
                <div className="content">
                    {/* Header */}
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                        <div className="flex-grow-1">
                            <h4 className="fw-bold mb-0">{title}</h4>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={onFilterClick}
                                className="d-flex align-items-center gap-2"
                            >
                                <i className="ti ti-filter"></i>
                                Filter
                            </Button>
                            <SortDropdown
                                options={[
                                    { value: 'name', label: 'Tên', direction: 'asc' },
                                    { value: 'date', label: 'Ngày tạo', direction: 'desc' },
                                    { value: 'status', label: 'Trạng thái', direction: 'asc' },
                                ]}
                                selectedValue={sortBy}
                                onSelect={(value) => onSortChange(value, sortOrder)}
                            />
                            <ExportDropdown
                                options={[
                                    { value: 'csv', label: 'CSV', format: 'csv' },
                                    { value: 'excel', label: 'Excel', format: 'excel' },
                                    { value: 'pdf', label: 'PDF', format: 'pdf' },
                                ]}
                                onExport={onExportClick}
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onAddClick}
                                className="d-flex align-items-center gap-2"
                            >
                                <i className="ti ti-plus"></i>
                                {addButtonText}
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="ti ti-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm..."
                                        value={searchValue}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {children}

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                            Hiển thị{' '}
                            {(paginationProps.currentPage - 1) * paginationProps.itemsPerPage + 1} -{' '}
                            {Math.min(
                                paginationProps.currentPage * paginationProps.itemsPerPage,
                                paginationProps.totalItems
                            )}{' '}
                            trong tổng số {paginationProps.totalItems} mục
                        </div>
                        <Pagination
                            currentPage={paginationProps.currentPage}
                            totalPages={paginationProps.totalPages}
                            onPageChange={paginationProps.onPageChange}
                        />
                    </div>

                    {/* Modals */}
                    <ModalDelete
                        show={showDeleteModal}
                        onHide={onCancelDelete}
                        onConfirm={onConfirmDelete}
                        title="Xác nhận xóa"
                        message={`Bạn có chắc chắn muốn xóa ${deleteItemName}?`}
                    />

                    <ModalFilter
                        show={showFilterModal}
                        onHide={onCloseFilter}
                        onApply={onApplyFilter}
                        onReset={() => {}}
                        fields={[]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListPage;
