import React, { useEffect, useState, useRef } from 'react';
import { InterviewSession, QuestionReview, SkillScores } from '../types';
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
    const animation = animate(count, score, { duration: 1.4, ease: 'easeOut' });
    return animation.stop;
  }, [score, count]);

  const colorClass =
    score >= 80
      ? 'text-emerald-400'
      : score >= 60
        ? 'text-blue-400'
        : 'text-rose-400';

  return (
    <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
      <motion.span className={`text-5xl font-extrabold ${colorClass}`}>
        {rounded}
      </motion.span>
      <span className="text-lg font-semibold text-slate-500">/ 100</span>
    </div>
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
  const [activeTab, setActiveTab] = useState<SummaryTab>('scorecard');
  const [expandedReviewIdx, setExpandedReviewIdx] = useState<number | null>(0);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const savedScoreRef = useRef(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#000000',
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

  useEffect(() => {
    let isMounted = true;
    const fallbackEval = {
      crackProbability: 'Needs Work',
      overallScore: 0,
      overallSummary:
        'Evaluation could not reach the AI engine due to a temporary network error. Your transcript was preserved.',
      speakingSkills: 'Transcript captured safely.',
      technicalSkills: 'Please retry evaluation or retake a round.',
      deepDive: 'Temporary network interruption during scoring.',
      skillScores: {
        technicalDepth: 0,
        resumeAlignment: 0,
        systemArchitecture: 0,
        communication: 0,
        problemSolving: 0,
      },
      questionReviews: [],
      improvements: ['Check connection and run another round when ready.'],
      studyTopics: ['System Design Fundamentals'],
    };

    const fetchEvaluation = async () => {
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
        }

        if (isMounted) {
          setEvaluation(data);
          if (onSaveScore && !savedScoreRef.current) {
            savedScoreRef.current = true;
            onSaveScore(data);
          }
        }
      } catch (e: any) {
        console.warn('Evaluation fetch failed:', e?.message || e);
        if (isMounted) {
          setEvaluation(fallbackEval);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvaluation();
    return () => {
      isMounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-lg font-semibold text-white">
          Generating Executive Interview Scorecard...
        </div>
        <p className="text-slate-400 text-sm">
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

  // Fallback Q&A pairs from transcript if model omitted any
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
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : evaluation.crackProbability === 'Possible'
        ? 'text-blue-400 border-blue-500/40 bg-blue-500/10'
        : 'text-rose-400 border-rose-500/40 bg-rose-500/10';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14" ref={reportRef}>
      {/* Executive Summary Banner */}
      <div className="amoled-surface rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{session.company}</span>
              <span aria-hidden="true">·</span>
              <span>{session.role}</span>
              <span aria-hidden="true">·</span>
              <span>{session.type}</span>
              <span aria-hidden="true">·</span>
              <span>{session.difficulty}</span>
              {session.resumeProfile && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400">
                    Resume: {session.resumeProfile.fileName}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Post-Interview Executive Summary
            </h1>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${verdictColor}`}
            >
              <Award size={14} />
              <span>Hire Readiness: {evaluation.crackProbability}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-black border border-[#16223b] rounded-2xl px-6 py-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">
                Overall Score
              </div>
              <AnimatedScoreNumber score={overallScore} />
            </div>
          </div>
        </div>

        {/* Action Strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-[#16223b]"
          data-html2canvas-ignore="true"
        >
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-black border border-[#16223b] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('scorecard')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'amoled-btn-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              <span>Executive Scorecard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'qa'
                  ? 'amoled-btn-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle size={14} />
              <span>Q&amp;A Breakdown ({questionReviews.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'amoled-btn-primary text-white'
                  : 'text-slate-400 hover:text-white'
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
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-[#0a1120] border border-[#16223b] text-xs font-semibold text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>{downloading ? 'Exporting...' : 'Export PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-[#0a1120] border border-[#16223b] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCcw size={14} />
              <span>New Session</span>
            </button>
            <button
              type="button"
              onClick={onDashboard}
              className="px-3.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-xs font-semibold text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Executive Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Bars */}
          <div className="lg:col-span-6 amoled-surface rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                Competency Breakdown
              </h2>
              <span className="text-xs text-slate-400 font-mono">0–100 Scale</span>
            </div>

            <div className="space-y-4">
              {skillRows.map((skill) => {
                const clamped = Math.max(0, Math.min(100, Math.round(skill.value)));
                const barColor =
                  clamped >= 80
                    ? 'from-emerald-500 to-cyan-400'
                    : clamped >= 60
                      ? 'from-blue-600 to-cyan-400'
                      : 'from-rose-500 to-amber-500';
                return (
                  <div key={skill.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">
                        {skill.label}
                      </span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {clamped}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-black border border-[#16223b] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clamped}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary & Core Skills */}
          <div className="lg:col-span-6 space-y-6">
            <div className="amoled-surface rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Target size={18} />
                <h2 className="text-base font-bold text-white">
                  Executive Takeaway
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evaluation.overallSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="amoled-surface rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                  <MessageCircle size={16} />
                  <span>Communication</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {evaluation.speakingSkills}
                </p>
              </div>
              <div className="amoled-surface rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                  <Code2 size={16} />
                  <span>Technical Accuracy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
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
            <div className="amoled-surface rounded-2xl p-10 text-center text-sm text-slate-400">
              Complete at least one Q&amp;A turn during the interview to inspect
              question-by-question feedback.
            </div>
          ) : (
            questionReviews.map((item, idx) => {
              const isOpen = expandedReviewIdx === idx;
              const verdictStyle =
                item.verdict === 'Strong'
                  ? 'text-emerald-400'
                  : item.verdict === 'Partial'
                    ? 'text-blue-400'
                    : 'text-rose-400';

              return (
                <div
                  key={idx}
                  className="amoled-surface rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedReviewIdx(isOpen ? null : idx)
                    }
                    className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-[#0a1120]/60 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-blue-400">
                          Q{idx + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${verdictStyle}`}>
                          {item.verdict}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-white">
                          {item.rating ?? 0}/100
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                        {item.question}
                      </h3>
                    </div>
                    <div className="text-slate-400 shrink-0 pt-1">
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-[#16223b] space-y-4 text-sm">
                      <div className="bg-black border border-[#16223b] rounded-xl p-4 space-y-1">
                        <div className="text-xs font-semibold text-slate-400">
                          Your Response
                        </div>
                        <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                          {item.candidateAnswer}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black border border-[#16223b] rounded-xl p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                            <AlertTriangle size={14} />
                            <span>Interviewer Critique</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {item.feedback}
                          </p>
                        </div>

                        <div className="bg-[#050d1c] border border-blue-500/30 rounded-xl p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                            <CheckCircle2 size={14} />
                            <span>Ideal Benchmark Answer</span>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
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
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-400" />
                <span>Priority Improvements</span>
              </h2>
              <ul className="space-y-3">
                {(evaluation.improvements || []).map((imp: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-slate-300 bg-black border border-[#16223b] rounded-xl p-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-blue-400 pt-0.5 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="amoled-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={17} className="text-blue-400" />
                <span>Targeted Study Topics</span>
              </h2>
              <ul className="space-y-3">
                {(evaluation.studyTopics || []).map((topic: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-slate-300 bg-black border border-[#16223b] rounded-xl p-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-cyan-400 pt-0.5 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="amoled-surface rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#16223b]">
              <Target className="text-blue-400" size={20} />
              <h2 className="text-lg font-bold text-white">
                Comprehensive Deep-Dive Analysis
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              {evaluation.deepDive ? (
                evaluation.deepDive
                  .split('\n')
                  .map((paragraph: string, idx: number) =>
                    paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                  )
              ) : (
                <p className="text-slate-500">
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
