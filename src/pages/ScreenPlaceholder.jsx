import React from 'react';

const ScreenPlaceholder = ({ title }) => {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>{title}</h1>
            <p>This screen is currently under development or pending migration.</p>
        </div>
    );
};

export default ScreenPlaceholder;
