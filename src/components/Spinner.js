import React from 'react';

/** Inline spinner for button loading states */
export default function Spinner({ size = 18, className = '' }) {
  return (
    <span
      className={`spinner-icon ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
