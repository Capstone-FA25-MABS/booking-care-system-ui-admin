import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    variant?:
        | 'primary'
        | 'secondary'
        | 'outline-primary'
        | 'outline-secondary'
        | 'danger'
        | 'outline-danger'
        | 'light'
        | 'white';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
}) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        'outline-primary': 'btn-outline-primary',
        'outline-secondary': 'btn-outline-secondary',
        danger: 'btn-danger',
        'outline-danger': 'btn-outline-danger',
        light: 'btn-light',
        white: 'btn-white bg-white',
    };
    const sizeClasses = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    };

    const classes =
        `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    const renderIcon = () => {
        if (loading) {
            return (
                <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                ></span>
            );
        }
        if (icon) {
            return <i className={`${icon} ${iconPosition === 'left' ? 'me-1' : 'ms-1'}`}></i>;
        }
        return null;
    };

    return (
        <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
            {iconPosition === 'left' && renderIcon()}
            {children}
            {iconPosition === 'right' && renderIcon()}
        </button>
    );
};

export default Button;
