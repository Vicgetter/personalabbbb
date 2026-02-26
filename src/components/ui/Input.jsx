import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                {...props}
            />
        </div>
    );
};

export default Input;
