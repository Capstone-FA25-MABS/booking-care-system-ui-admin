import React from 'react';
import SkeletonCell from './SkeletonCell';

interface SkeletonTableRowProps {
    /**
     * Whether to show phone column
     * @default false
     */
    showPhoneColumn?: boolean;
}

/**
 * Skeleton row component for account management table loading state
 * Displays animated placeholders for table row content
 */
const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ showPhoneColumn = false }) => {
    const skeletonStyle = {
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    return (
        <tr>
            {/* Column 1: Name with Avatar */}
            <td>
                <div className="d-flex align-items-center">
                    <div
                        className="avatar me-2 bg-light rounded-circle placeholder-glow"
                        style={{ width: '40px', height: '40px', ...skeletonStyle }}
                    />
                    <div className="flex-grow-1">
                        <div
                            className="bg-light rounded placeholder-glow mb-2"
                            style={{ height: '14px', width: '120px', ...skeletonStyle }}
                        />
                    </div>
                </div>
            </td>
            {/* Column 2: Email */}
            <SkeletonCell height="14px" width="180px" />
            {/* Column 3: Phone (optional) */}
            {showPhoneColumn && <SkeletonCell height="14px" width="100px" />}
            {/* Column 4: Address */}
            <SkeletonCell height="14px" width="150px" />
            {/* Column 5: Status Badge */}
            <SkeletonCell height="24px" width="50px" />
            {/* Column 6: Lock/Unlock Toggle */}
            <SkeletonCell height="24px" width="50px" />
            {/* Column 7: Actions Dropdown */}
            <SkeletonCell height="24px" width="80px" />
        </tr>
    );
};

export default SkeletonTableRow;
