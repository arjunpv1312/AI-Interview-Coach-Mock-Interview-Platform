import React from 'react';

export function Logo({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center bg-[#faf8ff] dark:bg-black overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[74%] h-[74%]"
      >
        <defs>
          <linearGradient id="icMonogramGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="8"
          stroke="url(#icMonogramGrad)"
          strokeWidth="2.2"
        />
        <path
          d="M13 13V27"
          stroke="currentColor"
          className="text-[#140f1f] dark:text-white"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M27 14.5C25.5 13 23.4 12.2 21.2 12.5C18.1 12.9 16 15.6 16 20C16 24.4 18.1 27.1 21.2 27.5C23.4 27.8 25.5 27 27 25.5"
          stroke="url(#icMonogramGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M21.5 18V22M24.5 16.5V23.5"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
