import React from 'react';
import { Skeleton, Box, Stack } from '@mui/material';

const RefundTableSkeleton: React.FC = () => {
    return (
        <tr>
            {/* Mã Hoàn Tiền */}
            <td>
                <Skeleton variant="text" width={100} height={20} />
            </td>

            {/* Ngày Tạo */}
            <td>
                <Skeleton variant="text" width={120} height={20} />
            </td>

            {/* Số Tiền */}
            <td>
                <Skeleton variant="text" width={110} height={24} />
            </td>

            {/* Lý Do */}
            <td>
                <Box sx={{ maxWidth: '200px' }}>
                    <Skeleton variant="text" width="100%" height={20} />
                </Box>
            </td>

            {/* Thông Tin Ngân Hàng */}
            <td>
                <Stack spacing={0.5}>
                    <Skeleton variant="text" width={140} height={18} />
                    <Skeleton variant="text" width={160} height={16} />
                </Stack>
            </td>

            {/* Trạng Thái */}
            <td>
                <Skeleton
                    variant="rectangular"
                    width={90}
                    height={24}
                    sx={{ borderRadius: '12px' }}
                />
            </td>

            {/* Actions */}
            <td className="action-item">
                <Skeleton variant="circular" width={24} height={24} />
            </td>
        </tr>
    );
};

export default RefundTableSkeleton;
