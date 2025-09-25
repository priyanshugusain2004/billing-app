
import React from 'react';

const AppleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.6,11.2C18.4,7.8,15.7,5,12.3,5C10.6,5,9.1,5.8,8,7C7.5,7.6,7,8.2,6.5,8.8c-1,1.1-2,2.5-2,4.2c0,2.9,2.2,5,5,5 c0.1,0,0.2,0,0.3,0c0.3,0,0.5-0.1,0.8-0.1c0.2,0,0.5,0,0.7,0c1.3,0,2.6-0.6,3.5-1.7C16.1,14.6,18.8,13.2,18.6,11.2z M12,3 c1,0,1.9,0.4,2.6,1.1c-0.5,0.8-0.9,1.7-1.1,2.7C13.1,6.3,12.6,6,12,6c-1.2,0-2.3,0.7-2.9,1.8C8.5,7,8,6.4,7.4,5.9 C8.8,4.1,10.4,3,12,3z"/>
  </svg>
);

export default AppleIcon;
