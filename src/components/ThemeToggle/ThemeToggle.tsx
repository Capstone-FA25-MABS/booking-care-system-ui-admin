import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { toggleTheme, isDark } = useTheme();

    return (
        <button
            className={`btn btn-icon ${className}`}
            onClick={toggleTheme}
            title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            type="button"
        >
            <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} fs-16`}></i>
            {showLabel && <span className="ms-2">{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>}
        </button>
    );
};

export default ThemeToggle;
