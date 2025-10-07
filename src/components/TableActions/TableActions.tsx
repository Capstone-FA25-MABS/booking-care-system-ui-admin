import React from 'react';
import { Link } from 'react-router-dom';

export interface TableActionsProps {
    id: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView?: (id: string) => void;
    editLink?: string;
    viewLink?: string;
    showEdit?: boolean;
    showDelete?: boolean;
    showView?: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({
    id,
    onEdit,
    onDelete,
    onView,
    editLink,
    viewLink,
    showEdit = true,
    showDelete = true,
    showView = false,
}) => {
    return (
        <div className="d-flex gap-2">
            {showView && (
                <>
                    {viewLink ? (
                        <Link
                            to={viewLink}
                            className="btn btn-sm btn-outline-primary"
                            title="Xem chi tiết"
                        >
                            <i className="ti ti-eye"></i>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => onView?.(id)}
                            title="Xem chi tiết"
                        >
                            <i className="ti ti-eye"></i>
                        </button>
                    )}
                </>
            )}

            {showEdit && (
                <>
                    {editLink ? (
                        <Link
                            to={editLink}
                            className="btn btn-sm btn-outline-warning"
                            title="Chỉnh sửa"
                        >
                            <i className="ti ti-edit"></i>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => onEdit(id)}
                            title="Chỉnh sửa"
                        >
                            <i className="ti ti-edit"></i>
                        </button>
                    )}
                </>
            )}

            {showDelete && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(id)}
                    title="Xóa"
                >
                    <i className="ti ti-trash"></i>
                </button>
            )}
        </div>
    );
};

export default TableActions;
