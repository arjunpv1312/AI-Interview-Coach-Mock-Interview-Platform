import React, { useRef, useState } from 'react';
import { User } from '../types';
import {
  ArrowLeft,
  Download,
  Award,
  Linkedin,
  Lock,
  CheckCircle2,
  ChevronRight,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface CertificateViewProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function CertificateView({ user, onNavigate }: CertificateViewProps) {
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const highestScore =
    user.scoreHistory && user.scoreHistory.length > 0
      ? Math.max(...user.scoreHistory)
      : 0;
  const streak = user.loginStreak || 0;

  const certificates = [
    {
      id: 'dedicated-13',
      title: 'Dedicated Candidate',
      subtitle: 'Completed 13 Interviews',
      description:
        'Awarded for sustained commitment to mastering technical and architectural interviews through consistent mock practice.',
      isUnlocked: user.totalInterviews >= 13,
      progress: `${user.totalInterviews}/13`,
      progressPercent: Math.min(100, (user.totalInterviews / 13) * 100),
    },
    {
      id: 'master-20',
      title: 'Master Interviewee',
      subtitle: 'Completed 20 Interviews',
      description:
        'An executive milestone recognizing deep readiness across system design, coding depth, and structured communication.',
      isUnlocked: user.totalInterviews >= 20,
      progress: `${user.totalInterviews}/20`,
      progressPercent: Math.min(100, (user.totalInterviews / 20) * 100),
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
      subtitle: 'Achieved a Score of 90+',
      description:
        'Recognizes outstanding technical proficiency, resume storytelling clarity, and bar-raiser readiness in a scored round.',
      isUnlocked: highestScore >= 90,
      progress: `High Score: ${highestScore}`,
      progressPercent: Math.min(100, (highestScore / 90) * 100),
    },
    {
      id: 'streak-7',
      title: 'Consistency Champion',
      subtitle: '7-Session Practice Streak',
      description:
        'Awarded for disciplined daily execution across seven consecutive preparation sessions.',
      isUnlocked: streak >= 7,
      progress: `${streak}/7`,
      progressPercent: Math.min(100, (streak / 7) * 100),
    },
  ];

  const getPublicCertUrl = (cert: any) => {
    const certPayload = btoa(
      JSON.stringify({
        name: user.fullName,
        title: cert.title,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
    );
    return `${window.location.origin}/?cert=${certPayload}`;
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !selectedCert) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: '#000000',
      });
      const link = document.createElement('a');
      link.download = `Certificate_${selectedCert.title.replace(/\s+/g, '_')}_${user.fullName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!selectedCert) return;
    try {
      await navigator.clipboard.writeText(getPublicCertUrl(selectedCert));
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const linkedInHref = selectedCert
    ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
        `I just unlocked the "${selectedCert.title}" certificate on Interview Copilot! ${getPublicCertUrl(selectedCert)}`
      )}`
    : '#';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16223b] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              selectedCert ? setSelectedCert(null) : onNavigate('dashboard')
            }
            className="p-2.5 bg-black border border-[#16223b] hover:border-blue-500/40 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Award className="text-blue-400" size={24} />
              <span>
                {selectedCert
                  ? 'Certificate Preview'
                  : 'Achievement Certificates'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Download verified milestone credentials from your encrypted
              practice history.
            </p>
          </div>
        </div>

        {selectedCert && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="flex items-center gap-2 bg-black hover:bg-[#0a1120] border border-[#16223b] text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <Check size={15} className="text-emerald-400" />
              ) : (
                <Copy size={15} />
              )}
              <span>{copiedUrl ? 'Link Copied' : 'Copy Share Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 amoled-btn-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={15} />
              )}
              <span>{downloading ? 'Generating...' : 'Download PNG'}</span>
            </button>
            <a
              href={linkedInHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Linkedin size={15} />
              <span>Share on LinkedIn</span>
            </a>
          </div>
        )}
      </div>

      {!selectedCert ? (
        <div className="space-y-6">
          <div className="amoled-surface rounded-2xl p-5 flex items-start gap-4">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete mock interviews, score 90+, and sustain your practice
              streak to unlock exportable achievement certificates stored locally
              in your encrypted profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className={`amoled-surface rounded-2xl overflow-hidden flex flex-col justify-between transition-colors ${
                  cert.isUnlocked ? 'border-blue-500/40' : ''
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                        cert.isUnlocked
                          ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                          : 'bg-black border-[#16223b] text-slate-500'
                      }`}
                    >
                      {cert.isUnlocked ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Lock size={22} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        cert.isUnlocked ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {cert.isUnlocked ? 'Unlocked' : cert.progress}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">
                      {cert.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-3">
                      {cert.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-slate-400 font-mono tabular-nums">
                      <span>Progress</span>
                      <span>{cert.progress}</span>
                    </div>
                    <div className="h-2 w-full bg-black border border-[#16223b] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cert.isUnlocked
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-400'
                            : 'bg-blue-500/40'
                        }`}
                        style={{ width: `${cert.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {cert.isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-3.5 px-6 flex items-center justify-between text-xs font-bold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border-t border-[#16223b] transition-colors cursor-pointer"
                  >
                    <span>Preview & Export Certificate</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="w-full py-3.5 px-6 flex items-center justify-center text-xs font-medium text-slate-500 bg-black/60 border-t border-[#16223b]">
                    <Lock size={14} className="mr-2" />
                    <span>Complete target milestone to unlock</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div
            ref={certificateRef}
            className="bg-black p-3 md:p-5 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-blue-500/40"
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
                      {user.fullName}
                    </h3>
                  </div>
                </div>

                <div className="max-w-xl mx-auto">
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Has successfully earned the{' '}
                    <strong className="text-white">{selectedCert.title}</strong>{' '}
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
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
        </div>
      )}
    </div>
  );
}
