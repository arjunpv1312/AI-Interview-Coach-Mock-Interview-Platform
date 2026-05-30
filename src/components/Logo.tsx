import React from 'react';
import { Brain, Sparkles, CircuitBoard } from 'lucide-react';
import { motion } from 'motion/react';

export function Logo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-slate-900 overflow-hidden rounded-inherit ${className}`}>
      {/* Professional subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-800/80" />
      
      {/* Structural geometric grid subtle overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {/* Main analytical icon */}
        <Brain className="text-blue-400 w-[55%] h-[55%] drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all" strokeWidth={1.5} />
        
        {/* Circuit accent overlapping */}
        <CircuitBoard className="absolute text-purple-400/80 w-[40%] h-[40%] right-[10%] bottom-[10%] drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]" strokeWidth={1} />
        
        {/* Sparkle subtle ping */}
        <motion.div 
            className="absolute top-[15%] right-[25%]"
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
            <Sparkles className="text-blue-300 w-[20%] h-[20%]" strokeWidth={2} />
        </motion.div>
      </div>

      {/* Subtle light glints on edges */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </div>
  );
}
