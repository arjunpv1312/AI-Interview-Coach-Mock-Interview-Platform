import React, { useRef, useState, useEffect } from 'react';
import { Award, Download, DownloadCloud } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Logo } from './Logo';

export function PublicCertificateView() {
  const [certData, setCertData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const dataStr = params.get('cert');
      if (dataStr) {
        setCertData(JSON.parse(atob(dataStr)));
      } else {
        // Redirect to login if no cert found
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
      window.location.href = '/';
    }
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current || !certData) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0f172a'
      });
      const link = document.createElement('a');
      link.download = `Certificate_${certData.title.replace(/\s+/g, '_')}_${certData.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!certData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="z-10 w-full max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex justify-center w-16 h-16 rounded-xl bg-slate-900 shadow-xl shadow-blue-500/20 border border-slate-800 text-white p-3 mb-2">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verified Achievement</h1>
          <p className="text-slate-400">This certificate was earned through rigorous practice on Interview Copilot.</p>
        </div>

        <div className="bg-[#0f172a] p-2 md:p-4 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-indigo-900/50 mx-auto" ref={certificateRef}>
          {/* Inner Border */}
          <div className="border border-indigo-500/30 rounded-2xl p-8 md:p-16 relative overflow-hidden bg-gradient-to-b from-[#1e293b]/50 to-[#0f172a]">
            
            {/* Background Details */}
            <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
              <Award size={400} className="text-indigo-400 transform -rotate-12 translate-x-24" />
            </div>

            <div className="text-center relative z-10 space-y-8">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/20">
                  <Award size={48} className="text-indigo-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-indigo-300 uppercase font-serif">
                  Certificate of Achievement
                </h1>
                <p className="text-indigo-400/80 tracking-widest uppercase text-sm md:text-base font-semibold">
                  For Outstanding Performance & Dedication
                </p>
              </div>

              <div className="py-6 space-y-4">
                <p className="text-slate-400 text-lg">This certificate proudly recognizes that</p>
                <div className="border-b border-indigo-500/30 pb-2 mb-2 inline-block px-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white capitalize font-serif tracking-wide">{certData.name}</h2>
                </div>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-slate-300 text-md md:text-lg leading-relaxed">
                  Has successfully earned the title of <strong className="text-white">{certData.title}</strong> in rigorous simulated technical interviews, demonstrating exceptional logical reasoning, communication skills, and robust technical proficiency.
                </p>
              </div>

              <div className="flex justify-between items-end pt-16 px-4 md:px-12 border-t border-indigo-500/20 mt-12 mb-8">
                <div className="text-left space-y-1">
                  <p className="text-slate-500 text-xs tracking-wider uppercase font-medium">Issue Date</p>
                  <p className="text-slate-200 font-bold">{certData.date}</p>
                </div>
                {/* Signature/Seal area */}
                <div className="text-right space-y-1">
                  <p className="text-slate-500 text-xs tracking-wider uppercase font-medium mx-auto text-center">Authorized By</p>
                  <div className="font-serif text-2xl text-slate-300 italic px-4 border-b border-slate-700 pb-1 font-semibold">
                    Interview Copilot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
           <button onClick={() => window.location.href = '/'} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700">
              Create Your Own
           </button>
           <button onClick={handleDownload} disabled={downloading} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex gap-2 items-center">
              {downloading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <DownloadCloud size={20} />}
              {downloading ? 'Downloading...' : 'Download Full Res Version'}
           </button>
        </div>
      </div>
    </div>
  );
}
