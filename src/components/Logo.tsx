import React from 'react';
import { Terminal, Cpu } from 'lucide-react';

export function Logo({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center bg-black overflow-hidden rounded-inherit ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-black to-cyan-500/20" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(rgba(59,130,246,0.35) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <Cpu className="text-blue-400 w-[56%] h-[56%]" strokeWidth={1.75} />
        <Terminal
          className="absolute text-cyan-300/80 w-[28%] h-[28%] right-[14%] bottom-[14%]"
          strokeWidth={2}
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
    </div>
  );
}
