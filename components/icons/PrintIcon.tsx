
import React from 'react';

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h-1.061A48.343 48.343 0 0112 15.492c-2.67 0-5.197.44-7.424 1.257m14.848 0H18.82a48.344 48.344 0 00-7.424-1.257c-2.67 0-5.197.44-7.424 1.257m14.848 0L20.25 15.75A.75.75 0 0021 15V5.25a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v9.75c0 .414.336.75.75.75h1.5" />
  </svg>
);

export default PrintIcon;
