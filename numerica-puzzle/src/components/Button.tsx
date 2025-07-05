import React from 'react';
import './Button.css';

export type ButtonState = 'pressable' | 'was-pressed' | 'disabled' | 'error';

interface ButtonProps {
  state: ButtonState;
  onClick: () => void;
  label: string;
  disabled?: boolean; // Add disabled prop
}

const Button: React.FC<ButtonProps> = ({ state, onClick, label, disabled }) => {
  return (
    <button className={`button button--${state}`} onClick={onClick} disabled={disabled || state === 'disabled' || state === 'was-pressed'}>
      {label}
    </button>
  );
};

export default Button;
