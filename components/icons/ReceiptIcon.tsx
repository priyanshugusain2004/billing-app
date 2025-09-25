
import React from 'react';

const ReceiptIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m2.25-9h.01M7.5 12h3m-3 0h-1.5m2.25-3h5.25m-5.25 0h3m-3 0h-1.5m3 9h-3.375c-.621 0-1.125-.504-1.125-1.125V4.125C3 3.504 3.504 3 4.125 3h11.25c.621 0 1.125.504 1.125 1.125v13.75c0 .621-.504 1.125-1.125 1.125h-3.375" />
  </svg>
);

export default ReceiptIcon;
