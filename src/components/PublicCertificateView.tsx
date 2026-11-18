import React, { useRef, useState, useEffect } from 'react';
import { Award, DownloadCloud } from 'lucide-react';
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
        window.location.href = '/';
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current || !certData) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: '#000000',
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

  if (!certData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-blue-500/30 rounded-full border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center w-14 h-14 rounded-2xl bg-[#050912] border border-blue-500/30 overflow-hidden mb-1">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Verified Achievement
          </h1>
          <p className="text-sm text-slate-400">
            Earned through structured technical mock practice on Interview
            Copilot Pro.
          </p>
        </div>

        <div
          className="bg-black p-3 md:p-5 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-blue-500/40 mx-auto"
          ref={certificateRef}
        >
          <div className="border border-blue-500/25 rounded-2xl p-8 md:p-14 relative overflow-hidden bg-gradient-to-b from-[#060c18] to-black">
            <div className="text-center relative z-10 space-y-7">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-blue-600/15 rounded-2xl flex items-center justify-center border border-blue-500/40 text-blue-400">
                  <Award size={40} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400">
                  Certificate of Achievement
                </h2>
                <p className="text-cyan-400/80 text-xs md:text-sm font-semibold">
                  Technical Interview Readiness & Engineering Excellence
                </p>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-slate-400 text-sm">
                  This credential recognizes that
                </p>
                <div className="border-b border-blue-500/30 pb-2 inline-block px-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white capitalize">
                    {certData.name}
                  </h3>
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Has successfully earned the{' '}
                  <strong className="text-white">{certData.title}</strong>{' '}
                  distinction through structured mock interviews, demonstrating
                  clear technical communication and problem-solving rigor.
                </p>
              </div>

              <div className="flex justify-between items-end pt-10 px-4 md:px-10 border-t border-[#16223b] mt-8">
                <div className="text-left space-y-1">
                  <p className="text-slate-500 text-xs font-medium">
                    Issue Date
                  </p>
                  <p className="text-slate-200 text-sm font-bold font-mono tabular-nums">
                    {certData.date}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-slate-500 text-xs font-medium">
                    Issued By
                  </p>
                  <div className="text-lg text-blue-300 font-bold border-b border-[#16223b] pb-1">
                    Interview Copilot Pro
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="px-5 py-3 rounded-xl bg-[#050912] hover:bg-[#0a1120] text-slate-200 text-xs font-semibold transition-colors border border-[#16223b] cursor-pointer"
          >
            Open Interview Copilot
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-3 rounded-xl amoled-btn-primary text-white text-xs font-bold transition-all flex gap-2 items-center cursor-pointer"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <DownloadCloud size={16} />
            )}
            <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
