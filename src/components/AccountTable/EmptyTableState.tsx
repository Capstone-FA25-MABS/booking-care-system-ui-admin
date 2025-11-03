import React from 'react';

interface EmptyTableStateProps {
    /**
     * Number of columns to span
     */
    colSpan: number;
    /**
     * Custom message to display
     * @default "Không có dữ liệu"
     */
    message?: string;
}

/**
 * Empty state component for tables
 * Displays a centered message when no data is available
 */
const EmptyTableState: React.FC<EmptyTableStateProps> = ({
    colSpan,
    message = 'Không có dữ liệu',
}) => {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-5">
                <div className="text-muted">
                    <i className="ti ti-database-off fs-48 mb-2 d-block" />
                    <p className="mb-0">{message}</p>
                </div>
            </td>
        </tr>
    );
};

export default EmptyTableState;
