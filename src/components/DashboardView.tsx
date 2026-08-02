import React, { useState } from "react";
import { getApiUrl } from "../utils/api";
import { Subject, ScheduleSlot, ActiveTab, StudentProfile, StudyPlan } from "../types";
import {
  Clock,
  CheckCircle2,
  Play,
  Sparkles,
  Flame,
  Target,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
  Calendar,
  Layers,
  User,
  GraduationCap,
  Edit3,
  Bot,
  Rocket,
  Check,
  RefreshCw,
  Plus,
  BarChart3,
  ListTodo,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { AIPlannerModal } from "./AIPlannerModal";

interface DashboardViewProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: (slots: ScheduleSlot[]) => void;
  onToggleScheduleItem: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  examDate: string;
  setExamDate: (date: string) => void;
  gradeLevel: string;
  boardName: string;
  streak: number;
  profile: StudentProfile;
  onOpenProfile: () => void;
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  onToggleScheduleItem,
  setActiveTab,
  examDate,
  setExamDate,
  gradeLevel,
  boardName,
  streak,
  profile,
  onOpenProfile,
  activePlan,
  setActivePlan,
}) => {
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState("All");
  const [inlineAdjustInput, setInlineAdjustInput] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState("");

  // Calculate schedule metrics
  const totalSlots = schedule.length;
  const completedSlots = schedule.filter((s) => s.completed).length;
  const progressPercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  // Filter schedule slots by selected day
  const filteredSchedule = schedule.filter((slot) => {
    if (selectedDayFilter === "All") return true;
    if (selectedDayFilter === "Today") return slot.day === "Today" || slot.day === "Monday" || !slot.day;
    return slot.day === selectedDayFilter;
  });

  const handleQuickReplan = async (instructionText: string) => {
    if (!instructionText.trim()) return;
    setIsAdjusting(true);
    setAdjustSuccessMsg("");

    try {
      const res = await fetch(getApiUrl("/api/replan-schedule"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeInstruction: instructionText,
          currentSchedule: schedule,
          studentProfile: profile,
        }),
      });

      const data = await res.json();
      if (data.success && data.updatedSlots) {
        const updated: ScheduleSlot[] = data.updatedSlots.map((s: any, idx: number) => ({
          id: s.id || `replan-slot-${Date.now()}-${idx}`,
          timeSlot: s.timeSlot,
          subject: s.subject,
          topic: s.topic,
          activityType: s.activityType || "Concept Review",
          durationMinutes: s.durationMinutes || 60,
          completed: !!s.completed,
          day: s.day || "Today",
        }));
        setSchedule(updated);
        setAdjustSuccessMsg(data.aiExplanation || "Schedule successfully updated by AI Assistant!");
        setInlineAdjustInput("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdjusting(false);
    }
  };

  // 7-Day Weekly Plan Cycle calculation
  const planCreatedDate = activePlan?.planCreatedDate ? new Date(activePlan.planCreatedDate) : new Date();
  const daysPassed = Math.floor((new Date().getTime() - planCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDayNum = Math.min(7, Math.max(1, daysPassed + 1));
  const isSevenDayCycleComplete = daysPassed >= 7;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. TOP AI PLANNER BAR */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-100 via-indigo-50 to-purple-100 dark:from-violet-950 dark:via-slate-900 dark:to-indigo-950 border border-indigo-200 dark:border-violet-500/40 p-6 lg:p-7 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-2xl dark:shadow-violet-950/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-violet-500/20 border border-indigo-200 dark:border-violet-500/30 text-indigo-800 dark:text-violet-300 text-xs font-black tracking-wide uppercase">
                <Bot className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                <span>AI Weekly Plan & Schedule Engine</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-black">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Internet Connected & Live Grounded
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-[10px] font-black">
                Synced with {profile.studentName || "Profile"}
              </span>
            </div>
            
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ready to generate or adjust your weekly plan, {profile.studentName || "Scholar"}?
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Connected live to current {profile.boardName || "FBISE / Punjab Board"} syllabi, model papers, and SLO guidelines. Tailored for {profile.gradeLevel || "Matric"} with a required <strong>7-day (weekly) plan renewal cycle</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsPlannerModalOpen(true)}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-violet-900/20 dark:shadow-violet-900/40 flex items-center justify-center gap-2.5 transition active:scale-95 shrink-0"
          >
            <Rocket className="w-4 h-4 text-amber-300" />
            <span>Generate Weekly AI Plan</span>
          </button>
        </div>
      </div>

      {/* 2. 7-DAY WEEKLY CYCLE STATUS & RENEWAL CARD */}
      <div className="bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-gradient-to-br dark:from-amber-500/20 dark:to-violet-500/20 border border-indigo-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-300 font-black shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">7-Day Weekly Study Cycle</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30">
                Day {currentDayNum} of 7
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every 7 days (each week), generate a fresh plan & timetable to adapt to completed chapters and new study goals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isSevenDayCycleComplete ? (
            <button
              onClick={() => setIsPlannerModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-bounce"
            >
              <RefreshCw className="w-4 h-4" />
              <span>7 Days Complete - Renew Weekly Plan</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Cycle Progress</span>
              <span className="text-xs font-black text-indigo-600 dark:text-violet-300 font-mono">
                {7 - currentDayNum} Days Remaining in Weekly Cycle
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTIVE PLAN DISPLAY & DASHBOARD TIMETABLE */}
      {activePlan || schedule.length > 0 ? (
        <div className="space-y-6">
          {/* Plan Header Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 dark:border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {activePlan?.planTitle || `${profile.gradeLevel || "Matric"} Weekly Master Plan`}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                    Goal: {profile.targetPercentage || "95%+"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activePlan?.weeklyStrategy || "Custom high-yield study schedule optimized for FBISE & Punjab board."}
                </p>
              </div>

              {/* Progress Stat */}
              <div className="flex items-center gap-4 shrink-0 bg-indigo-50/80 dark:bg-slate-950 p-3 px-4 rounded-xl border border-indigo-100 dark:border-white/10">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Plan Progress</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {completedSlots} / {totalSlots} <span className="text-xs text-slate-500 dark:text-slate-400">Done</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xs">
                  {progressPercent}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Weekly Target Completion
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-indigo-50 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-indigo-100 dark:border-white/10">
                <div
                  className="bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick AI Re-Plan Input Bar on Dashboard */}
          <div className="bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-violet-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-lg">
            <div className="flex items-center gap-2 shrink-0">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-violet-400" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">Need a schedule adjustment?</span>
            </div>

            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                value={inlineAdjustInput}
                onChange={(e) => setInlineAdjustInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickReplan(inlineAdjustInput)}
                placeholder="e.g. 'Emergency leave today', 'I finished Math early, shift Physics to tonight'..."
                className="w-full bg-indigo-50/50 dark:bg-slate-950 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500 transition"
              />
              <button
                disabled={isAdjusting || !inlineAdjustInput.trim()}
                onClick={() => handleQuickReplan(inlineAdjustInput)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition"
              >
                {isAdjusting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Re-Plan</span>
              </button>
            </div>

            {adjustSuccessMsg && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold w-full text-center md:text-left">
                {adjustSuccessMsg}
              </div>
            )}
          </div>

          {/* Timetable Days Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {["All", "Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (dayName) => (
                <button
                  key={dayName}
                  onClick={() => setSelectedDayFilter(dayName)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold transition shrink-0 ${
                    selectedDayFilter === dayName
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-transparent shadow-md shadow-violet-900/20"
                      : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-indigo-100 dark:border-white/10"
                  }`}
                >
                  {dayName}
                </button>
              )
            )}
          </div>

          {/* Schedule Slots Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedule.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  slot.completed
                    ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 opacity-80"
                    : "bg-white dark:bg-slate-900/90 border-indigo-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-violet-500/50 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-lg"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30">
                      {slot.timeSlot}
                    </span>
                    {slot.day && (
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 font-mono">
                        {slot.day}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{slot.subject}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                      {slot.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {slot.activityType || "Concept Mastery"}
                    </span>
                    <span>• {slot.durationMinutes || 60} mins</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleScheduleItem(slot.id)}
                  className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
                    slot.completed
                      ? "bg-emerald-100 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40"
                      : "bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-700 dark:bg-violet-600/20 dark:hover:bg-violet-600/30 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30"
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${slot.completed ? "text-emerald-600 dark:text-emerald-400 fill-emerald-400/20" : "text-indigo-600 dark:text-violet-400"}`}
                  />
                  <span>{slot.completed ? "Completed!" : "Mark as Done"}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Subject Breakdown Cards from Active Plan */}
          {activePlan?.subjectBreakdown && activePlan.subjectBreakdown.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-indigo-100 dark:border-white/10">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-violet-400" /> Subject Focus & AI Exam Tips
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePlan.subjectBreakdown.map((sb, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-white/10 rounded-2xl p-4 space-y-2 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{sb.subject}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                        {sb.priority} Priority
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-indigo-700 dark:text-violet-300">
                        🎯 Key Focus: <span className="text-slate-600 dark:text-slate-300 font-normal">{sb.keyFocusTopics.join(", ")}</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 italic bg-indigo-50/60 dark:bg-slate-950 p-2 rounded-lg border border-indigo-100 dark:border-white/5 text-[10px]">
                        💡 Tip: {sb.examTip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Prompt to Launch Planner */
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-white/10 text-center space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/40 flex items-center justify-center text-indigo-600 dark:text-violet-300 mx-auto">
            <Bot className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No active weekly plan generated yet!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click the AI Weekly Planner button at the top to create your personalized timetable tailored specifically for your target percentage and subjects.
            </p>
          </div>
          <button
            onClick={() => setIsPlannerModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Your First AI Plan</span>
          </button>
        </div>
      )}

      {/* AI Planner Modal */}
      <AIPlannerModal
        isOpen={isPlannerModalOpen}
        onClose={() => setIsPlannerModalOpen(false)}
        subjects={subjects}
        setSubjects={setSubjects}
        schedule={schedule}
        setSchedule={setSchedule}
        activePlan={activePlan}
        setActivePlan={setActivePlan}
        profile={profile}
      />
    </div>
  );
};
