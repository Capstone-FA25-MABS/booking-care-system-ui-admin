/**
 * Shared submit button component for profile settings
 * Extracted to reduce duplication between AdminProfileSettings and HospitalProfileSettings
 */

import React from 'react';
import Spinner from '@/components/Spinner';

export interface SubmitButtonProps {
    isSubmitting: boolean;
    submitText?: string;
    submittingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
    isSubmitting,
    submitText = 'Cập nhật thông tin',
    submittingText = 'Đang cập nhật...',
}) => {
    return (
        <>
            {isSubmitting ? (
                <>
                    <Spinner size="small" variant="primary" className="me-2" />
                    {submittingText}
                </>
            ) : (
                submitText
            )}
        </>
    );
};

export default SubmitButton;
