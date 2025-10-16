import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TableActions.module.scss';

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
        <div className={styles.tableActions}>
            <button
                type="button"
                className={styles.moreButton}
                data-bs-toggle="dropdown"
                title="Thao tác"
            >
                <i className="ti ti-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu p-2">
                {showView && (
                    <li>
                        {viewLink ? (
                            <Link
                                to={viewLink}
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                            >
                                <i className="ti ti-eye me-2"></i> Xem
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                onClick={() => onView?.(id)}
                            >
                                <i className="ti ti-eye me-2"></i> Xem
                            </button>
                        )}
                    </li>
                )}

                {showView && (showEdit || showDelete) && (
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                )}

                {showEdit && (
                    <li>
                        {editLink ? (
                            <Link
                                to={editLink}
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                            >
                                <i className="ti ti-edit me-2"></i> Sửa
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent"
                                onClick={() => onEdit(id)}
                            >
                                <i className="ti ti-edit me-2"></i> Sửa
                            </button>
                        )}
                    </li>
                )}

                {showEdit && showDelete && (
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                )}

                {showDelete && (
                    <li>
                        <button
                            type="button"
                            className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                            onClick={() => onDelete(id)}
                        >
                            <i className="ti ti-trash me-2"></i> Xóa
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default TableActions;
