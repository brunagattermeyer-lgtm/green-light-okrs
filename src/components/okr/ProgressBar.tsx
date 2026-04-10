import React from 'react';

interface ProgressBarProps {
  percent: number;
  fillColor?: string;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent, fillColor = '#005216', height = 8 }) => (
  <div className="w-full rounded-full bg-okr-bl" style={{ height }}>
    <div
      className="rounded-full transition-all duration-500"
      style={{ width: `${Math.min(percent, 100)}%`, height, backgroundColor: fillColor }}
    />
  </div>
);

export default ProgressBar;
