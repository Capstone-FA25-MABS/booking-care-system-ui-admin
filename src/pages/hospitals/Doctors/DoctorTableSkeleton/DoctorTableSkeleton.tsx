import React from 'react';
import { Skeleton, Stack } from '@mui/material';

interface DoctorTableSkeletonProps {
    rows?: number;
}

const DoctorTableSkeleton: React.FC<DoctorTableSkeletonProps> = ({ rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }, (_, index) => (
                <tr key={`skeleton-row-${index}`}>
                    {/* Name & Position Column */}
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

                    {/* Specialty Column */}
                    <td>
                        <Skeleton
                            variant="rectangular"
                            width={100}
                            height={24}
                            sx={{ borderRadius: '12px' }}
                        />
                    </td>

                    {/* Experience Column */}
                    <td>
                        <Skeleton
                            variant="rectangular"
                            width={80}
                            height={24}
                            sx={{ borderRadius: '12px' }}
                        />
                    </td>

                    {/* Services & Prices Column */}
                    <td>
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
                    </td>

                    {/* Languages Column */}
                    <td>
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
                    <td>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Skeleton variant="circular" width={24} height={24} />
                            <Skeleton variant="circular" width={24} height={24} />
                        </Stack>
                    </td>
                </tr>
            ))}
        </>
    );
};

export default DoctorTableSkeleton;
