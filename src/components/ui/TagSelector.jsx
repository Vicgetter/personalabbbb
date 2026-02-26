import React from 'react';

const TagSelector = ({ label, options, selected, onChange }) => {
    const toggleTag = (value) => {
        if (selected.includes(value)) {
            onChange(selected.filter(t => t !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="mb-4">
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {label} (Select multiple)
                </label>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {options.map((opt) => {
                    const isSelected = selected.includes(opt.value);
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleTag(opt.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-color)',
                                color: isSelected ? 'white' : 'var(--text-dark)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TagSelector;
