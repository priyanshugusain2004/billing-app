
import React from 'react';

const CarrotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.3,3.3l-2.8,2.8C15.8,5.4,14.9,5,14,5c-1.7,0-3,1.3-3,3c0,0.5,0.1,0.9,0.3,1.3L4.1,16.5c-0.4,0.4-0.4,1,0,1.4 l1.4,1.4c0.4,0.4,1,0.4,1.4,0l7.2-7.2c0.4,0.2,0.8,0.3,1.3,0.3c1.7,0,3-1.3,3-3c0-0.9-0.4-1.8-1.1-2.4l2.8-2.8 c0.4-0.4,0.4-1,0-1.4l-1.4-1.4C20.3,2.9,19.7,2.9,19.3,3.3z"/>
  </svg>
);

export default CarrotIcon;
