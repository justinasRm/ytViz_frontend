// Switch.tsx
import React from 'react';
import '../css/Switch.css';

interface SwitchProps {
    isOn: boolean;
    handleToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isOn, handleToggle }) => {
    return (
        <div className="switch-container">
            <strong>2D</strong>
            <div className="switch">
                <input
                    checked={isOn}
                    onChange={handleToggle}
                    className="switch-checkbox"
                    id={`switch-new`}
                    type="checkbox"
                />
                <label
                    className="switch-label"
                    htmlFor={`switch-new`}
                >
                    <span className={`switch-button`} />
                </label>
            </div>
            <strong>3D</strong>
        </div>
    );
};

export default Switch;