import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, ShieldAlert, Activity, Server, Lock, Fingerprint, Database, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SecurityView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [secure, setSecure] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    
    const messages = [
      "Initializing Deep Header Inspection...",
      "Analyzing TLS/SSL Certificates...",
      "Scanning application bundle for known signatures...",
      "Executing dynamic sandbox heuristics...",
      "Verifying secure API endpoints & configurations...",
      "Checking memory bounds and stack integrity...",
      "Validating CSRF tokens and XSS protection...",
      "No anomalies detected. Finalizing security report..."
    ];

    const messageInterval = setInterval(() => {
      if (messages.length > 0) {
        setLogs(prev => [...prev, messages.shift() as string]);
      }
    }, 800);

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        setProgress(100);
        setScanning(false);
        setSecure(true);
        clearInterval(progressInterval);
        clearInterval(messageInterval);
      } else {
        setProgress(currentProgress);
      }
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
          {scanning ? (
            <Activity className="w-12 h-12 text-blue-400 animate-pulse" />
          ) : (
            <ShieldCheck className="w-12 h-12 text-emerald-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {scanning ? "Advanced Malware & Security Scan" : "System Secure"}
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          {scanning 
            ? "Performing a high-security heuristic scan of all modules, memory states, and network boundaries."
            : "No threats or malware detected. The application is running in a highly secure environment."}
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-slate-800 p-4 bg-slate-900/50 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <Fingerprint className="text-slate-500" />
               <div className="flex-1">
                 <div className="h-2 w-full md:w-64 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
               </div>
               <span className="text-slate-400 text-sm font-mono">{Math.round(progress)}%</span>
            </div>
            {secure && (
              <span className="text-emerald-400 flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                <CheckCircle2 size={16} /> Certified Clean
              </span>
            )}
        </div>
        
        <div className="p-6 bg-slate-950 font-mono text-sm h-[300px] overflow-y-auto space-y-3">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex items-start gap-4"
              >
                <span className="text-slate-600 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,-1)}]</span>
                <span className="text-emerald-500/80">&gt;</span>
                <span className="text-slate-300">{log}</span>
              </motion.div>
            ))}
            {!scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-4 mt-4 border-t border-slate-800">
                <span className="text-emerald-400 font-bold block">SCAN COMPLETED. ZERO THREATS DETECTED.</span>
                <span className="text-slate-500 block mt-1">Environment lock status: ENABLED. Data encryption: AES-256-GCM.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center gap-3">
            <Server className="text-indigo-400" size={32} />
            <h3 className="font-bold text-slate-200">Infrastructure</h3>
            <p className="text-sm text-slate-400">Cloud servers hardened and securely proxying API connections.</p>
         </div>
         <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center gap-3">
            <Lock className="text-purple-400" size={32} />
            <h3 className="font-bold text-slate-200">Data Persistence</h3>
            <p className="text-sm text-slate-400">All local schemas heavily sanitized to prevent injection attacks.</p>
         </div>
         <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center gap-3">
            <Database className="text-blue-400" size={32} />
            <h3 className="font-bold text-slate-200">API Gateway</h3>
            <p className="text-sm text-slate-400">Rate limits strictly enforced to deflect DDOS operations.</p>
         </div>
      </div>
    </div>
  );
}
