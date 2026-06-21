import React, { useRef, useState } from 'react';
import { User } from '../types';
import { ArrowLeft, Download, Award, Linkedin, Lock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { toPng } from 'html-to-image';

interface CertificateViewProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function CertificateView({ user, onNavigate }: CertificateViewProps) {
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const highestScore = user.scoreHistory && user.scoreHistory.length > 0 ? Math.max(...user.scoreHistory) : 0;
  const streak = user.loginStreak || 1;

  const certificates = [
    {
      id: 'dedicated-13',
      title: 'Dedicated Candidate',
      subtitle: 'Completed 13 Interviews',
      description: 'Awarded for exceptional dedication to mastering the technical interview process through consistent practice.',
      isUnlocked: user.totalInterviews >= 13,
      progress: `${user.totalInterviews}/13`,
      progressPercent: Math.min(100, (user.totalInterviews / 13) * 100),
      color: 'indigo'
    },
    {
      id: 'master-20',
      title: 'Master Interviewee',
      subtitle: 'Completed 20 Interviews',
      description: 'An elite achievement demonstrating profound commitment and rigorous preparation for technical excellence.',
      isUnlocked: user.totalInterviews >= 20,
      progress: `${user.totalInterviews}/20`,
      progressPercent: Math.min(100, (user.totalInterviews / 20) * 100),
      color: 'amber'
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
      subtitle: 'Achieved a Score of 90+',
      description: 'Awarded for demonstrating outstanding technical proficiency and communication skills in a simulated interview.',
      isUnlocked: highestScore >= 90,
      progress: `High Score: ${highestScore}`,
      progressPercent: Math.min(100, (highestScore / 90) * 100),
      color: 'purple'
    },
    {
      id: 'streak-7',
      title: 'Consistency Champion',
      subtitle: '7-Day Login Streak',
      description: 'Awarded for showing remarkable discipline by practicing consistently over 7 consecutive days.',
      isUnlocked: streak >= 7,
      progress: `${streak}/7 Days`,
      progressPercent: Math.min(100, (streak / 7) * 100),
      color: 'emerald'
    }
  ];

  const handleDownload = async () => {
    if (!certificateRef.current || !selectedCert) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0f172a'
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

  const handleShareLinkedIn = () => {
    if(!selectedCert) return;
    
    // Generate cert payload for public viewing
    const certPayload = btoa(JSON.stringify({
        name: user.fullName,
        title: selectedCert.title,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }));
    
    const certUrl = `${window.location.origin}/?cert=${certPayload}`;
    const text = encodeURIComponent(`I just unlocked the "${selectedCert.title}" certificate on Interview Copilot! Check it out here: ${certUrl}`);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => selectedCert ? setSelectedCert(null) : onNavigate('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium p-2 mb-2 -ml-2 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
            Back to {selectedCert ? 'Certificates' : 'Dashboard'}
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Award className="text-indigo-400" />
            {selectedCert ? 'Certificate Preview' : 'Achievement Certificates'}
          </h1>
        </div>
        
        {selectedCert && (
          <div className="flex gap-3">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Download size={20} />
              )} 
              {downloading ? 'Generating...' : 'Download PNG'}
            </button>
            <button 
              onClick={handleShareLinkedIn}
              className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              <Linkedin size={20} />
              Share on LinkedIn
            </button>
          </div>
        )}
      </div>

      {!selectedCert ? (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
            <div className="mt-1">
              <Info className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">How it works</h3>
              <p className="text-slate-300 leading-relaxed">
                Complete mock interviews, achieve high scores, and maintain your login streaks to unlock verified milestones. Note that these certificates are generated for your personal progress tracking and motivation within the platform, and do not represent accreditation from a verified academic institution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <div 
                key={cert.id} 
                className={`flex flex-col bg-slate-900/60 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  cert.isUnlocked ? `border-indigo-500/50 hover:border-indigo-500 shadow-lg shadow-indigo-500/10` : 'border-slate-800 opacity-80'
                }`}
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cert.isUnlocked ? `bg-indigo-500/20 text-indigo-400` : 'bg-slate-800 text-slate-500'}`}>
                      {cert.isUnlocked ? <CheckCircle2 size={32} /> : <Lock size={32} />}
                    </div>
                    {cert.isUnlocked && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300`}>
                        Unlocked
                      </span>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${cert.isUnlocked ? 'text-white' : 'text-slate-300'}`}>{cert.title}</h3>
                  <p className={`font-medium mb-3 ${cert.isUnlocked ? `text-indigo-400` : 'text-slate-500'}`}>{cert.subtitle}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{cert.description}</p>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Progress</span>
                      <span>{cert.progress}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${cert.isUnlocked ? `bg-indigo-500` : 'bg-slate-600'}`} 
                        style={{ width: `${cert.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {cert.isUnlocked ? (
                  <button 
                    onClick={() => setSelectedCert(cert)}
                    className={`w-full py-4 px-6 flex items-center justify-between font-bold transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300`}
                  >
                    View Certificate
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <div className="w-full py-4 px-6 flex items-center justify-center font-semibold text-slate-500 bg-slate-800/30">
                    <Lock size={16} className="mr-2" /> Keep practicing to unlock
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Output Certificate */}
          <div className="max-w-4xl mx-auto">
            <div ref={certificateRef} className="bg-[#0f172a] p-2 md:p-4 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-indigo-900/50">
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
                      <h2 className="text-3xl md:text-4xl font-bold text-white capitalize font-serif tracking-wide">{user.fullName}</h2>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-6">
                    <p className="text-slate-300 text-md md:text-lg leading-relaxed">
                      Has successfully earned the title of <strong className="text-white">{selectedCert.title}</strong> in rigorous simulated technical interviews, demonstrating exceptional logical reasoning, communication skills, and robust technical proficiency.
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-16 px-4 md:px-12 border-t border-indigo-500/20 mt-12 mb-8">
                    <div className="text-left space-y-1">
                      <p className="text-slate-500 text-xs tracking-wider uppercase font-medium">Issue Date</p>
                      <p className="text-slate-200 font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
          </div>
        </div>
      )}
    </div>
  );
}
