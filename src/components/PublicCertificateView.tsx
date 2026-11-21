import React, { useRef, useState, useEffect } from 'react';
import { Award, DownloadCloud, Moon, Sun } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Logo } from './Logo';

export function PublicCertificateView() {
  const [certData, setCertData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ic_color_mode') !== 'light';
    } catch {
      return true;
    }
  });
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

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
        backgroundColor: isDark ? '#000000' : '#ffffff',
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-violet-500/25 rounded-full border-t-violet-600 dark:border-t-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden transition-colors">
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          aria-label={`Switch to ${isDark ? 'White' : 'Black'} Mode`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#faf8ff] dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] text-xs font-semibold text-[#140f1f] dark:text-[#f5f3ff] cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-violet-400" />
              <span>White Mode</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-violet-700" />
              <span>Black Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center w-14 h-14 rounded-2xl bg-[#faf8ff] dark:bg-[#08050f] border border-violet-500/35 overflow-hidden mb-1">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#140f1f] dark:text-white tracking-tight">
            Verified Achievement
          </h1>
          <p className="text-sm text-[#5a5170] dark:text-[#a69cbe]">
            Earned through structured technical mock practice on InterviewCoach.
          </p>
        </div>

        <div
          className="bg-white dark:bg-black p-3 md:p-5 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-violet-500/45 mx-auto"
          ref={certificateRef}
        >
          <div className="border border-violet-500/25 rounded-2xl p-8 md:p-14 relative overflow-hidden bg-gradient-to-b from-[#f8f5ff] to-white dark:from-[#0c0518] dark:to-black">
            <div className="text-center relative z-10 space-y-7">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-violet-600/15 rounded-2xl flex items-center justify-center border border-violet-500/40 text-violet-700 dark:text-violet-400">
                  <Award size={40} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-purple-600 to-violet-800 dark:from-violet-300 dark:via-purple-300 dark:to-violet-400">
                  Certificate of Achievement
                </h2>
                <p className="text-violet-700 dark:text-purple-400/90 text-xs md:text-sm font-semibold">
                  Technical Interview Readiness &amp; Engineering Excellence
                </p>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm">
                  This credential recognizes that
                </p>
                <div className="border-b border-violet-500/35 pb-2 inline-block px-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#140f1f] dark:text-white capitalize">
                    {certData.name}
                  </h3>
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <p className="text-[#362f47] dark:text-[#d8d0ea] text-sm md:text-base leading-relaxed">
                  Has successfully earned the{' '}
                  <strong className="text-[#140f1f] dark:text-white">
                    {certData.title}
                  </strong>{' '}
                  distinction through structured mock interviews, demonstrating
                  clear technical communication and problem-solving rigor.
                </p>
              </div>

              <div className="flex justify-between items-end pt-10 px-4 md:px-10 border-t border-[#e4ddf5] dark:border-[#26193f] mt-8">
                <div className="text-left space-y-1">
                  <p className="text-[#5a5170] dark:text-[#a69cbe] text-xs font-medium">
                    Issue Date
                  </p>
                  <p className="text-[#140f1f] dark:text-[#d8d0ea] text-sm font-bold font-mono tabular-nums">
                    {certData.date}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[#5a5170] dark:text-[#a69cbe] text-xs font-medium">
                    Issued By
                  </p>
                  <div className="text-lg text-violet-700 dark:text-violet-300 font-bold border-b border-[#e4ddf5] dark:border-[#26193f] pb-1">
                    InterviewCoach
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
            className="px-5 py-3 rounded-xl bg-[#faf8ff] dark:bg-[#08050f] hover:bg-[#f2ecfc] dark:hover:bg-[#120b24] text-[#140f1f] dark:text-[#d8d0ea] text-xs font-semibold transition-colors border border-[#e4ddf5] dark:border-[#26193f] cursor-pointer"
          >
            Open InterviewCoach
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
