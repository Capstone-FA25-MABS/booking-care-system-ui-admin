import React from 'react';
import './skeleton-animation.scss';

interface SkeletonCellProps {
    height: string;
    width: string;
}

/**
 * Skeleton cell component for table loading state
 * Displays animated placeholder for table cell content
 */
const SkeletonCell: React.FC<SkeletonCellProps> = ({ height, width }) => {
    const skeletonClass = 'bg-light rounded placeholder-glow';
    const skeletonStyle = {
        animation: 'pulse 1.5s ease-in-out infinite',
    };

    return (
        <td>
            <div className={skeletonClass} style={{ height, width, ...skeletonStyle }} />
        </td>
    );
};

export default SkeletonCell;
