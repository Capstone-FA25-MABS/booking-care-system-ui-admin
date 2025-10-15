import React from 'react';
import { Skeleton, Stack } from '@mui/material';

export interface SkeletonColumn {
    type: 'avatar' | 'text' | 'badge' | 'actions' | 'date' | 'services' | 'languages';
    width?: number | string;
    height?: number;
    lines?: number;
    items?: number; // for actions column
}

export interface TableSkeletonProps {
    rows?: number;
    columns: SkeletonColumn[];
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns }) => {
    const renderSkeletonColumn = (column: SkeletonColumn) => {
        const { type, width, height, lines = 1, items = 1 } = column;

        // Helper function to get numeric width
        const getNumericWidth = (w: number | string | undefined, defaultWidth: number): number => {
            if (typeof w === 'number') return w;
            if (typeof w === 'string') return parseInt(w) || defaultWidth;
            return defaultWidth;
        };

        switch (type) {
            case 'avatar': {
                const avatarWidth = getNumericWidth(width, 120);
                return (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Skeleton
                            variant="circular"
                            width={40}
                            height={40}
                            sx={{ borderRadius: '50%' }}
                        />
                        <Stack spacing={0.5}>
                            <Skeleton variant="text" width={avatarWidth} height={16} />
                            <Skeleton variant="text" width={avatarWidth * 0.8} height={14} />
                        </Stack>
                    </Stack>
                );
            }

            case 'text': {
                const textWidth = getNumericWidth(width, 100);
                return (
                    <Stack spacing={0.5}>
                        {Array.from({ length: lines }, (_, lineIndex) => (
                            <Skeleton
                                key={lineIndex}
                                variant="text"
                                width={textWidth}
                                height={height || 16}
                            />
                        ))}
                    </Stack>
                );
            }

            case 'badge': {
                const badgeWidth = getNumericWidth(width, 90);
                return (
                    <Skeleton
                        variant="rectangular"
                        width={badgeWidth}
                        height={height || 24}
                        sx={{ borderRadius: '12px' }}
                    />
                );
            }

            case 'date':
                return (
                    <Stack spacing={0.5}>
                        <Skeleton variant="text" width={100} height={16} />
                        <Skeleton variant="text" width={80} height={14} />
                    </Stack>
                );

            case 'services':
                return (
                    <Stack spacing={0.5}>
                        <Skeleton
                            variant="rectangular"
                            width={150}
                            height={20}
                            sx={{ borderRadius: '10px' }}
                        />
                        <Skeleton
                            variant="rectangular"
                            width={120}
                            height={20}
                            sx={{ borderRadius: '10px' }}
                        />
                    </Stack>
                );

            case 'languages':
                return (
                    <Stack spacing={0.5}>
                        <Skeleton
                            variant="rectangular"
                            width={60}
                            height={20}
                            sx={{ borderRadius: '10px' }}
                        />
                        <Skeleton
                            variant="rectangular"
                            width={80}
                            height={20}
                            sx={{ borderRadius: '10px' }}
                        />
                    </Stack>
                );

            case 'actions':
                return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {Array.from({ length: items }, (_, itemIndex) => (
                            <Skeleton key={itemIndex} variant="circular" width={24} height={24} />
                        ))}
                    </Stack>
                );

            default: {
                const defaultWidth = getNumericWidth(width, 100);
                return <Skeleton variant="text" width={defaultWidth} height={height || 16} />;
            }
        }
    };

    return (
        <>
            {Array.from({ length: rows }, (_, rowIndex) => (
                <tr key={`skeleton-row-${rowIndex}`}>
                    {columns.map((column, columnIndex) => (
                        <td
                            key={`skeleton-col-${rowIndex}-${columnIndex}`}
                            className={column.type === 'actions' ? 'action-item' : ''}
                        >
                            {renderSkeletonColumn(column)}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
