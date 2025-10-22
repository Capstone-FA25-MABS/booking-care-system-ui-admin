import React from 'react';

interface StatusTabButtonProps {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

export const StatusTabButton: React.FC<StatusTabButtonProps> = ({
    label,
    count,
    isActive,
    onClick,
}) => {
    const buttonClass = `btn ${isActive ? 'btn-primary' : 'btn-light'}`;
    const badgeClass = `badge ${isActive ? 'bg-white text-primary' : 'bg-secondary text-white'} ms-2`;

    return (
        <button type="button" className={buttonClass} onClick={onClick}>
            {label} <span className={badgeClass}>{count}</span>
        </button>
    );
};
