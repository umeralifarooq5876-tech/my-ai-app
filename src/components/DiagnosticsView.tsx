import React, { useState } from "react";
import { getApiUrl } from "../utils/api";
import {
  Subject,
  DiagnosticReport,
  ScheduleSlot,
  FocusSessionLog,
  GeneralAssessment,
  Flashcard,
  StudentProfile,
} from "../types";
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Layers,
  Clock,
  Flame,
  BookOpen,
  Zap,
  HelpCircle,
  BrainCircuit,
  Target,
  FileCheck,
} from "lucide-react";

interface DiagnosticsViewProps {
  subjects: Subject[];
  examDate: string;
  activeReport: DiagnosticReport | null;
  setActiveReport: (report: DiagnosticReport) => void;
  schedule?: ScheduleSlot[];
  focusLogs?: FocusSessionLog[];
  streak?: number;
  assessmentVault?: GeneralAssessment[];
  flashcards?: Flashcard[];
  profile?: StudentProfile;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  subjects,
  examDate,
  activeReport,
  setActiveReport,
  schedule = [],
  focusLogs = [],
  streak = 1,
  assessmentVault = [],
  flashcards = [],
  profile,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const daysLeft = Math.max(
    0,
    Math.floor((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  // Live KPI Calculations
  const totalChapters = subjects.reduce((sum, s) => sum + (s.totalChapters || 0), 0);
  const completedChapters = subjects.reduce((sum, s) => sum + (s.completedChapters || 0), 0);
  const overallSyllabusProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const totalScheduleSlots = schedule.length;
  const completedScheduleSlots = schedule.filter((s) => s.completed).length;
  const scheduleCompletionRate = totalScheduleSlots > 0 ? Math.round((completedScheduleSlots / totalScheduleSlots) * 100) : 0;

  const totalFocusMinutes = focusLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  const totalVaultItems = assessmentVault.length + flashcards.length;

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const masteredTopics = subjects.reduce((acc, s) => acc + s.topics.filter((t) => t.confidence === "mastered").length, 0);
  const moderateTopics = subjects.reduce((acc, s) => acc + s.topics.filter((t) => t.confidence === "moderate").length, 0);
  const weakTopics = subjects.reduce((acc, s) => acc + s.topics.filter((t) => t.confidence === "weak").length, 0);

  const handleRunAIDiagnostic = async () => {
    setIsAnalyzing(true);
    setErrorMsg("");

    try {
      const subjectPerformances = subjects.map((s) => ({
        subject: s.name,
        completedChapters: s.completedChapters,
        totalChapters: s.totalChapters,
        weakTopicCount: s.topics.filter((t) => t.confidence === "weak").length,
        moderateTopicCount: s.topics.filter((t) => t.confidence === "moderate").length,
        masteredTopicCount: s.topics.filter((t) => t.confidence === "mastered").length,
        weakTopicNames: s.topics.filter((t) => t.confidence === "weak").map((t) => t.name),
      }));

      const res = await fetch(getApiUrl("/api/diagnostic-report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectPerformances,
          examDaysLeft: daysLeft,
          studentProfile: profile,
          totalFocusMinutes,
          scheduleStats: {
            completedCount: completedScheduleSlots,
            totalCount: totalScheduleSlots,
            completionRate: scheduleCompletionRate,
          },
          quizStats: {
            totalItems: totalVaultItems,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setActiveReport(data.report);
      } else {
        setErrorMsg(data.error || "Failed to generate diagnostic report.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error communicating with AI Diagnostic service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" /> Stats & AI Diagnostic Intelligence
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Real-time mastery tracking, study performance metrics, and Gemini-powered exam readiness diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="px-3.5 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition border border-indigo-200 dark:border-white/10"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
            <span>How AI Diagnostic Works</span>
          </button>

          <button
            onClick={handleRunAIDiagnostic}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-900/20 dark:shadow-amber-900/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Run AI Diagnostic Report</span>
          </button>
        </div>
      </div>

      {/* How Diagnostic AI Works Modal / Explanatory Card */}
      {showHowItWorks && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-violet-500/30 space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.06)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-violet-400" /> How the AI Diagnostic Engine Evaluates Your Progress
            </h3>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-indigo-100 dark:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-100 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Multi-Vector Metric Aggregation</h4>
              <p className="text-slate-600 dark:text-slate-400">
                The engine continuously monitors your live syllabus completion, schedule task completion rates, focus session hours, and quiz results across all subjects.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-100 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">SLO & Exam Schema Grounding</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Gemini 3.6 Flash evaluates your data against official Board Exam (FBISE & BISE) mark distribution schemes, identifying high-yield concepts versus critical weak points.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-100 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Predictive Blueprint & Interventions</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Calculates your predicted board percentage, pinpoints high-risk weak areas with actionable fix steps, and builds an emergency 7-day revision blueprint.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Live App Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 space-y-1 shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Syllabus Covered</span>
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{overallSyllabusProgress}%</div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {completedChapters} of {totalChapters} chapters done
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 space-y-1 shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Schedule Execution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{scheduleCompletionRate}%</div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {completedScheduleSlots}/{totalScheduleSlots} tasks completed
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 space-y-1 shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Focus Time Logged</span>
            <Clock className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{focusHours} hrs</div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{totalFocusMinutes} total study mins</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 space-y-1 shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Vault Practice Items</span>
            <FileCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalVaultItems}</div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Quizzes & flashcards saved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 space-y-1 shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{streak} Days</div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{daysLeft} days to Board Exam</p>
        </div>
      </div>

      {/* Subject Mastery Visual Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-violet-400" /> Subject Completion & Topic Confidence Matrix
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Breakdown of mastered vs moderate vs weak topics across enrolled board subjects.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Mastered ({masteredTopics})
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate ({moderateTopics})
            </span>
            <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Weak ({weakTopics})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const total = sub.topics.length || 1;
            const subWeakCount = sub.topics.filter((t) => t.confidence === "weak").length;
            const subModCount = sub.topics.filter((t) => t.confidence === "moderate").length;
            const subMasterCount = sub.topics.filter((t) => t.confidence === "mastered").length;
            const subProgress = Math.round((sub.completedChapters / (sub.totalChapters || 1)) * 100);

            return (
              <div key={sub.id} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">{sub.name}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {sub.completedChapters}/{sub.totalChapters} Chapters ({subProgress}%)
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-900 dark:text-slate-300 font-mono font-bold">
                    {sub.topics.length} Topics
                  </span>
                </div>

                {/* Multi-segment confidence bar */}
                <div className="w-full bg-indigo-100 dark:bg-slate-800 rounded-full h-3 flex overflow-hidden border border-indigo-200 dark:border-white/5">
                  <div
                    style={{ width: `${(subMasterCount / total) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Mastered: ${subMasterCount}`}
                  />
                  <div
                    style={{ width: `${(subModCount / total) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Moderate: ${subModCount}`}
                  />
                  <div
                    style={{ width: `${(subWeakCount / total) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Weak: ${subWeakCount}`}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-700 dark:text-emerald-400">Mastered: {subMasterCount}</span>
                  <span className="text-amber-700 dark:text-amber-400">Moderate: {subModCount}</span>
                  <span className="text-rose-700 dark:text-rose-400">Weak: {subWeakCount}</span>
                </div>

                {/* Topics Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sub.topics.map((t) => (
                    <span
                      key={t.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        t.confidence === "mastered"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                          : t.confidence === "moderate"
                          ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                          : "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                      }`}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Diagnostic Report */}
      {activeReport ? (
        <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 rounded-2xl p-6 lg:p-8 space-y-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-white/10 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Diagnostic Evaluation
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">Board Exam Readiness Assessment</h2>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50/80 dark:bg-slate-950 p-3.5 rounded-xl border border-indigo-100 dark:border-white/10">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Predicted Grade</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{activeReport.gradePrediction}</span>
              </div>
              <div className="w-px h-8 bg-indigo-200 dark:bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block font-sans">Readiness Score</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{activeReport.readinessScore}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-slate-950 border border-indigo-100 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-amber-700 dark:text-amber-400 block mb-1">Status Summary & Diagnosis: </strong>
            {activeReport.overallStatus}
          </div>

          {/* Critical Weak Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> High Risk Weak Topics & Interventions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeReport.criticalWeakAreas.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950 border border-rose-200 dark:border-rose-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-bold uppercase">
                      {item.riskLevel} Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300">{item.topic}</h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-normal">{item.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Emergency Action Blueprint */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 7-Day High-Yield Revision Blueprint
            </h3>

            <div className="space-y-2">
              {activeReport.actionPlan7Days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-bold flex items-center justify-center shrink-0">
                      D{day.dayNumber}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{day.task}</span>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold shrink-0">
                    {day.targetHours} Hours
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Directive */}
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-slate-950 border border-indigo-200 dark:border-violet-500/30 text-xs text-indigo-900 dark:text-violet-300 flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-600 dark:text-violet-400 shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-white block">Apex Mentor Directive:</strong>
              {activeReport.motivationalDirective}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-indigo-200 dark:border-white/20 text-center space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.04)]">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Your AI Weak Area Diagnostic</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Click "Run AI Diagnostic Report" to let Gemini 3.6 Flash analyze your topic confidence, focus time, and exam countdown to build a custom revision strategy.
            </p>
          </div>
          <button
            onClick={handleRunAIDiagnostic}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-900/10 dark:shadow-amber-900/30 inline-flex items-center gap-2 transition disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Run Diagnostic Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
