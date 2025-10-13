import React from 'react';
import { Skeleton, Stack } from '@mui/material';

interface AppointmentTableSkeletonProps {
    rows?: number;
}

const AppointmentTableSkeleton: React.FC<AppointmentTableSkeletonProps> = ({ rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }, (_, index) => (
                <tr key={`skeleton-row-${index}`}>
                    {/* Date & Time Column */}
                    <td>
                        <Stack spacing={0.5}>
                            <Skeleton variant="text" width={100} height={16} />
                            <Skeleton variant="text" width={80} height={14} />
                        </Stack>
                    </td>

                    {/* Patient Column */}
                    <td>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Skeleton
                                variant="circular"
                                width={40}
                                height={40}
                                sx={{ borderRadius: '50%' }}
                            />
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={120} height={16} />
                                <Skeleton variant="text" width={100} height={14} />
                            </Stack>
                        </Stack>
                    </td>

                    {/* Doctor Column */}
                    <td>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Skeleton
                                variant="circular"
                                width={40}
                                height={40}
                                sx={{ borderRadius: '50%' }}
                            />
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width={130} height={16} />
                                <Skeleton variant="text" width={90} height={14} />
                            </Stack>
                        </Stack>
                    </td>

                    {/* Type Column */}
                    <td>
                        <Skeleton variant="text" width={80} height={16} />
                    </td>

                    {/* Status Column */}
                    <td>
                        <Skeleton
                            variant="rectangular"
                            width={90}
                            height={24}
                            sx={{ borderRadius: '12px' }}
                        />
                    </td>

                    {/* Actions Column */}
                    <td className="action-item">
                        <Skeleton variant="circular" width={24} height={24} />
                    </td>
                </tr>
            ))}
        </>
    );
};

export default AppointmentTableSkeleton;
