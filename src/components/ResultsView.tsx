import React, { useEffect, useState, useRef, useCallback } from 'react';
import { InterviewSession, QuestionReview, SkillScores } from '../types';
import { DifficultyOrchestrator } from '../lib/DifficultyOrchestrator';
import {
  RefreshCcw,
  Target,
  MessageCircle,
  Code2,
  Award,
  BookOpen,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ListChecks,
  ArrowLeft,
} from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

function AnimatedScoreNumber({ score }: { score: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, score, { duration: 1.2, ease: 'easeOut' });
    return animation.stop;
  }, [score, count]);

  const colorClass =
    score >= 80
      ? 'text-emerald-700 dark:text-emerald-400'
      : score >= 60
        ? 'text-violet-700 dark:text-violet-400'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
      <motion.span className={`text-5xl font-extrabold ${colorClass}`}>
        {rounded}
      </motion.span>
      <span className="text-lg font-semibold text-[#5a5170] dark:text-[#a69cbe]">
        / 100
      </span>
    </div>
  );
}

const CircularCompetencyRing: React.FC<{
  label: string;
  value: number;
  index: number;
}> = ({ label, value, index }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (clamped / 100) * circumference;
  const staggerDelay = index * 0.09;

  const strokeClass =
    clamped >= 80
      ? 'stroke-emerald-700 dark:stroke-emerald-400'
      : clamped >= 60
        ? 'stroke-violet-700 dark:stroke-violet-400'
        : 'stroke-rose-700 dark:stroke-rose-400';

  const statusLabel =
    clamped >= 80 ? 'Strong' : clamped >= 60 ? 'Proficient' : 'Needs Focus';

  const badgeTextColor =
    clamped >= 80
      ? 'text-emerald-700 dark:text-emerald-400'
      : clamped >= 60
        ? 'text-violet-700 dark:text-violet-300'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: staggerDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      role="progressbar"
      aria-label={`${label}: ${clamped} percent`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="flex flex-col items-center justify-between p-4 rounded-xl bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] text-center gap-2.5"
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            strokeWidth="7"
            className="stroke-[#ede9fe] dark:stroke-[#1d1330]"
          />
          <motion.circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            strokeWidth="7"
            className={strokeClass}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{
              duration: 0.85,
              delay: staggerDelay + 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold font-mono tabular-nums text-[#140f1f] dark:text-white">
            {clamped}%
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="text-xs font-bold text-[#140f1f] dark:text-white leading-snug">
          {label}
        </div>
        <div className={`text-[11px] font-semibold ${badgeTextColor}`}>
          {statusLabel}
        </div>
      </div>
    </motion.div>
  );
}

interface ResultsViewProps {
  session: InterviewSession;
  onRetake: () => void;
  onDashboard: () => void;
  onSaveScore?: (score: any) => void;
}

type SummaryTab = 'scorecard' | 'qa' | 'roadmap';

export function ResultsView({
  session,
  onRetake,
  onDashboard,
  onSaveScore,
}: ResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isFallbackEval, setIsFallbackEval] = useState(false);
  const [activeTab, setActiveTab] = useState<SummaryTab>('scorecard');
  const [expandedReviewIdx, setExpandedReviewIdx] = useState<number | null>(0);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const savedScoreRef = useRef(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const isDark = document.documentElement.classList.contains('dark');
      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: isDark ? '#000000' : '#ffffff',
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const aspectInfo = reportRef.current.getBoundingClientRect();
      const pdfHeight = (aspectInfo.height * pdfWidth) / aspectInfo.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`interview-report-${session.company.toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Failed to download PDF', error);
    } finally {
      setDownloading(false);
    }
  };

  const fetchEvaluation = useCallback(async () => {
    setLoading(true);
    setIsFallbackEval(false);

    const fallbackEval = {
      crackProbability: 'Needs Work',
      overallScore: 0,
      overallSummary:
        'Evaluation could not reach the AI engine due to a temporary network error. Your transcript was preserved.',
      speakingSkills: 'Transcript captured safely.',
      technicalSkills: 'Click Retry Evaluation above or run another round.',
      deepDive: 'Temporary network interruption during scoring.',
      skillScores: {
        technicalDepth: 0,
        resumeAlignment: 0,
        systemArchitecture: 0,
        communication: 0,
        problemSolving: 0,
      },
      questionReviews: [],
      improvements: ['Retry evaluation or verify network connection.'],
      studyTopics: ['System Design Fundamentals'],
    };

    try {
      let res: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25000);
        try {
          res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: session.company,
              role: session.role,
              type: session.type,
              difficulty: session.difficulty,
              experience: session.experience ?? 3,
              finalTier: session.finalTier,
              peakTier: session.peakTier,
              resumeProfile: session.resumeProfile || null,
              history: session.history,
            }),
            signal: controller.signal,
          });
          clearTimeout(timer);
          break;
        } catch (err) {
          clearTimeout(timer);
          if (attempt === 1) throw err;
          await new Promise((r) => setTimeout(r, 700));
        }
      }

      const textResponse = res ? await res.text() : '';
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        data = fallbackEval;
        setIsFallbackEval(true);
      }

      setEvaluation(data);
      if (onSaveScore && !savedScoreRef.current && !data?.error) {
        savedScoreRef.current = true;
        onSaveScore(data);
      }
    } catch (e: any) {
      console.warn('Evaluation fetch failed:', e?.message || e);
      setIsFallbackEval(true);
      setEvaluation(fallbackEval);
    } finally {
      setLoading(false);
    }
  }, [session, onSaveScore]);

  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-11 h-11 border-2 border-violet-500/20 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />
        <div className="text-lg font-semibold text-[#140f1f] dark:text-white">
          Generating Executive Interview Scorecard...
        </div>
        <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm">
          Scoring technical depth, resume alignment, and per-question answers.
        </p>
      </div>
    );
  }

  if (!evaluation) return null;

  const overallScore = evaluation.overallScore ?? 0;
  const skillScores: SkillScores = evaluation.skillScores || {
    technicalDepth: overallScore,
    resumeAlignment: session.resumeProfile ? overallScore : 70,
    systemArchitecture: Math.max(0, overallScore - 4),
    communication: Math.min(100, overallScore + 5),
    problemSolving: overallScore,
  };

  const skillRows = [
    { label: 'Technical Depth', value: skillScores.technicalDepth ?? 0 },
    { label: 'Resume Alignment', value: skillScores.resumeAlignment ?? 0 },
    { label: 'System Architecture', value: skillScores.systemArchitecture ?? 0 },
    { label: 'Communication Clarity', value: skillScores.communication ?? 0 },
    { label: 'Problem Solving', value: skillScores.problemSolving ?? 0 },
  ];

  const questionReviews: QuestionReview[] =
    Array.isArray(evaluation.questionReviews) &&
    evaluation.questionReviews.length > 0
      ? evaluation.questionReviews
      : (() => {
          const pairs: QuestionReview[] = [];
          for (let i = 0; i < session.history.length; i++) {
            if (session.history[i].role === 'interviewer') {
              const nextMsg = session.history[i + 1];
              if (nextMsg && nextMsg.role === 'candidate') {
                pairs.push({
                  question: session.history[i].text,
                  candidateAnswer: nextMsg.text,
                  rating: overallScore,
                  verdict:
                    overallScore >= 80
                      ? 'Strong'
                      : overallScore >= 60
                        ? 'Partial'
                        : 'Needs Depth',
                  feedback:
                    'Review how clearly you explained concrete metrics and trade-offs.',
                  idealAnswer:
                    'Anchor your response with system constraints, trade-offs made, and measurable outcomes.',
                });
              }
            }
          }
          return pairs;
        })();

  const verdictColor =
    evaluation.crackProbability === 'Highly Likely'
      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : evaluation.crackProbability === 'Possible'
        ? 'text-violet-700 dark:text-violet-300 border-violet-500/40 bg-violet-500/10'
        : 'text-rose-700 dark:text-rose-400 border-rose-500/40 bg-rose-500/10';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14" ref={reportRef}>
      {isFallbackEval && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200"
          data-html2canvas-ignore="true"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              AI scoring timed out temporarily. Your interview transcript is
              intact.
            </span>
          </div>
          <button
            type="button"
            onClick={fetchEvaluation}
            className="px-3.5 py-1.5 rounded-lg amoled-btn-primary text-white font-semibold cursor-pointer"
          >
            Retry Evaluation
          </button>
        </div>
      )}

      {/* Executive Summary Banner */}
      <div className="amoled-surface rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5a5170] dark:text-[#a69cbe]">
              <span>{session.company}</span>
              <span aria-hidden="true">·</span>
              <span>{session.role}</span>
              <span aria-hidden="true">·</span>
              <span>{session.type}</span>
              {session.experience !== undefined && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {session.experience >= 25
                      ? '25+ yrs'
                      : `${session.experience} yrs`}
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-violet-700 dark:text-violet-300 font-medium">
                {(() => {
                  const base =
                    session.baseTier ??
                    DifficultyOrchestrator.orchestrate({
                      company: session.company,
                      role: session.role,
                      experienceYears: session.experience ?? 3,
                      roundType: session.type,
                      userDifficulty: session.difficulty,
                    }).baseTier;
                  const peak = session.peakTier ?? session.finalTier ?? base;
                  return peak !== base
                    ? `Tier ${base}→${peak}/10`
                    : `Tier ${peak}/10`;
                })()}
              </span>
              <span aria-hidden="true">·</span>
              <span>{session.difficulty}</span>
              {session.resumeProfile && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-violet-700 dark:text-violet-300 font-medium">
                    Resume: {session.resumeProfile.fileName}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#140f1f] dark:text-white tracking-tight [text-wrap:balance]">
              Post-Interview Executive Summary
            </h1>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${verdictColor}`}
            >
              <Award size={14} />
              <span>Hire Readiness: {evaluation.crackProbability}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-2xl px-6 py-4">
            <div>
              <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-medium mb-1">
                Overall Score
              </div>
              <AnimatedScoreNumber score={overallScore} />
            </div>
          </div>
        </div>

        {/* Action Strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-[#e4ddf5] dark:border-[#26193f]"
          data-html2canvas-ignore="true"
        >
          {/* Tab Switcher */}
          <div
            role="tablist"
            aria-label="Interview summary views"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'scorecard'}
              onClick={() => setActiveTab('scorecard')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'amoled-btn-primary text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              <span>Executive Scorecard</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'qa'}
              onClick={() => setActiveTab('qa')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'qa'
                  ? 'amoled-btn-primary text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              <MessageCircle size={14} />
              <span>Q&amp;A Breakdown ({questionReviews.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'roadmap'}
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'amoled-btn-primary text-white'
                  : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
              }`}
            >
              <ListChecks size={14} />
              <span>Action Plan &amp; Deep Dive</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>{downloading ? 'Exporting...' : 'Export PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-black hover:bg-[#f3effb] dark:hover:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] text-xs font-semibold text-[#140f1f] dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCcw size={14} />
              <span>New Session</span>
            </button>
            <button
              type="button"
              onClick={onDashboard}
              className="px-3.5 py-2 rounded-xl bg-violet-600/12 hover:bg-violet-600/20 border border-violet-500/40 text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Executive Scorecard with Staggered Circular Rings */}
      {activeTab === 'scorecard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 amoled-surface rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
                Competency Breakdown
              </h2>
              <span className="text-xs text-[#5a5170] dark:text-[#a69cbe] font-mono tabular-nums">
                0–100 Scale
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {skillRows.map((skill, idx) => (
                <CircularCompetencyRing
                  key={skill.label}
                  label={skill.label}
                  value={skill.value}
                  index={idx}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="amoled-surface rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                <Target size={18} />
                <h2 className="text-base font-bold text-[#140f1f] dark:text-white">
                  Executive Takeaway
                </h2>
              </div>
              <p className="text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                {evaluation.overallSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="amoled-surface rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-sm font-semibold">
                  <MessageCircle size={16} />
                  <span>Communication</span>
                </div>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed">
                  {evaluation.speakingSkills}
                </p>
              </div>
              <div className="amoled-surface rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 text-sm font-semibold">
                  <Code2 size={16} />
                  <span>Technical Accuracy</span>
                </div>
                <p className="text-xs text-[#5a5170] dark:text-[#a69cbe] leading-relaxed">
                  {evaluation.technicalSkills}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Question-by-Question Review */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          {questionReviews.length === 0 ? (
            <div className="amoled-surface rounded-2xl p-10 text-center space-y-4">
              <p className="text-sm text-[#5a5170] dark:text-[#a69cbe]">
                Complete at least one Q&amp;A turn during the interview to inspect
                question-by-question feedback.
              </p>
              <button
                type="button"
                onClick={onRetake}
                className="px-4 py-2 rounded-xl amoled-btn-primary text-white text-xs font-semibold cursor-pointer"
              >
                Start New Session
              </button>
            </div>
          ) : (
            questionReviews.map((item, idx) => {
              const isOpen = expandedReviewIdx === idx;
              const verdictStyle =
                item.verdict === 'Strong'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : item.verdict === 'Partial'
                    ? 'text-violet-700 dark:text-violet-400'
                    : 'text-rose-700 dark:text-rose-400';

              return (
                <div
                  key={idx}
                  className="amoled-surface rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpandedReviewIdx(isOpen ? null : idx)
                    }
                    className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-[#f3effb]/60 dark:hover:bg-[#120b1f]/70 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#5a5170] dark:text-[#a69cbe]">
                        <span className="font-mono text-violet-700 dark:text-violet-400 font-semibold">
                          Q{idx + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${verdictStyle}`}>
                          {item.verdict}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-[#140f1f] dark:text-white font-semibold">
                          {item.rating ?? 0}/100
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#140f1f] dark:text-white leading-snug">
                        {item.question}
                      </h3>
                    </div>
                    <div className="text-[#5a5170] dark:text-[#a69cbe] shrink-0 pt-1">
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-3 border-t border-[#e4ddf5] dark:border-[#26193f] space-y-4 text-sm">
                      <div className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-4 space-y-1">
                        <div className="text-xs font-semibold text-[#5a5170] dark:text-[#a69cbe]">
                          Your Response
                        </div>
                        <p className="text-[#140f1f] dark:text-[#e9e4f5] leading-relaxed text-xs sm:text-sm">
                          {item.candidateAnswer}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle size={14} />
                            <span>Interviewer Critique</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                            {item.feedback}
                          </p>
                        </div>

                        <div className="bg-[#f3effb] dark:bg-[#120b1f] border border-violet-300 dark:border-violet-500/35 rounded-xl p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                            <CheckCircle2 size={14} />
                            <span>Ideal Benchmark Answer</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#24173d] dark:text-violet-100 leading-relaxed">
                            {item.idealAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Action Plan & Deep Dive */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="amoled-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-[#140f1f] dark:text-white flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-700 dark:text-amber-400" />
                <span>Priority Improvements</span>
              </h2>
              <ul className="space-y-3">
                {(evaluation.improvements || []).map((imp: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-[#362f47] dark:text-[#d8d0ea] bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400 pt-0.5 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="amoled-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-[#140f1f] dark:text-white flex items-center gap-2">
                <BookOpen size={17} className="text-violet-700 dark:text-violet-400" />
                <span>Targeted Study Topics</span>
              </h2>
              <ul className="space-y-3">
                {(evaluation.studyTopics || []).map((topic: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-[#362f47] dark:text-[#d8d0ea] bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 pt-0.5 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="amoled-surface rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e4ddf5] dark:border-[#26193f]">
              <Target className="text-violet-700 dark:text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-[#140f1f] dark:text-white">
                Comprehensive Deep-Dive Analysis
              </h2>
            </div>
            <div className="space-y-3 text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
              {evaluation.deepDive ? (
                evaluation.deepDive
                  .split('\n')
                  .map((paragraph: string, idx: number) =>
                    paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                  )
              ) : (
                <p className="text-[#5a5170] dark:text-[#a69cbe]">
                  No detailed deep-dive narrative available for this session.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
