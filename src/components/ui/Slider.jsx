import React from 'react';

const Slider = ({ label, min, max, value, onChange }) => {
    return (
        <div className="mb-4">
            {label && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 500 }}>
                    <label>{label}</label>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{value}</span>
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                }}
            />
        </div>
    );
};

export default Slider;
