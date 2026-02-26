import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, fullWidth = false, ...props }) => {

    const baseStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--primary)',
            color: 'white',
        },
        secondary: {
            backgroundColor: 'var(--surface-color)',
            color: 'var(--text-dark)',
            border: '1px solid var(--border-color)',
        },
        danger: {
            backgroundColor: '#ef4444',
            color: 'white',
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ ...baseStyle, ...variants[variant] }}
            onMouseOver={(e) => {
                if (!disabled) {
                    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                }
            }}
            onMouseOut={(e) => {
                if (!disabled) {
                    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary)';
                    if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--surface-color)';
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
