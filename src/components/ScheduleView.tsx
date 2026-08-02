import React, { useState } from "react";
import { getApiUrl } from "../utils/api";
import { Subject, ScheduleSlot, StudyPlan, StudentProfile } from "../types";
import { recordTodayStudyActivity } from "../utils/storage";
import { AIPlannerModal } from "./AIPlannerModal";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Bot,
  Sparkles,
  AlertCircle,
  Zap,
  Plus,
  Send,
  CalendarOff,
  Flame,
  ArrowRight,
  Sliders,
  Rocket,
} from "lucide-react";

interface ScheduleViewProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan) => void;
  gradeLevel: string;
  setGradeLevel: (val: string) => void;
  boardName: string;
  setBoardName: (val: string) => void;
  examDate: string;
  profile?: StudentProfile;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  activePlan,
  setActivePlan,
  gradeLevel,
  boardName,
  examDate,
  profile,
}) => {
  const [replanInstruction, setReplanInstruction] = useState("");
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanResponseMsg, setReplanResponseMsg] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState("All");
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);

  const totalSlots = schedule.length;
  const completedSlots = schedule.filter((s) => s.completed).length;

  const filteredSchedule = schedule.filter((slot) => {
    if (selectedDayFilter === "All") return true;
    if (selectedDayFilter === "Today") return slot.day === "Today" || slot.day === "Monday" || !slot.day;
    return slot.day === selectedDayFilter;
  });

  const handleToggleSlot = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          if (nextCompleted) {
            recordTodayStudyActivity(item.durationMinutes || 30, 1, 0, `Completed task: ${item.subject} - ${item.topic}`);
          }
          return { ...item, completed: nextCompleted };
        }
        return item;
      })
    );
  };

  const handleDeleteSlot = (id: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExecuteReplan = async (customText?: string) => {
    const textToSend = customText || replanInstruction;
    if (!textToSend.trim()) return;

    setIsReplanning(true);
    setReplanResponseMsg("");

    try {
      const res = await fetch(getApiUrl("/api/replan-schedule"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeInstruction: textToSend,
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
        setReplanResponseMsg(data.aiExplanation || "Schedule successfully re-adjusted!");
        setReplanInstruction("");
      } else {
        setReplanResponseMsg("Failed to adjust schedule. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setReplanResponseMsg("Error communicating with AI schedule assistant.");
    } finally {
      setIsReplanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-indigo-100 dark:border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Live Internet Grounded
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 text-[10px] font-black">
              Synced with {profile?.studentName || "Scholar"} ({profile?.boardName || "FBISE/Punjab Board"})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[10px] font-black">
              7-Day Weekly Cycle Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-violet-400" /> AI Schedule & Emergency Re-Planner
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            Request emergency day off, specific day tweaks, or full-week rebalancing. Connected to your curriculum specs & model papers.
          </p>
        </div>
      </div>

      {/* AI PLANNER & ASSISTANT CARD */}
      <div className="bg-gradient-to-r from-violet-100 via-indigo-50 to-purple-100 dark:from-violet-950/90 dark:via-slate-900 dark:to-indigo-950/90 border border-indigo-200 dark:border-violet-500/40 rounded-2xl p-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-violet-600/30 border border-indigo-200 dark:border-violet-500/40 flex items-center justify-center text-indigo-700 dark:text-violet-300 shadow-md shrink-0">
            <Bot className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Emergency Work & Schedule Re-Planner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold">
                Smart Presets Available
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Only affected emergency days are modified while keeping completed work intact! You can also request specific day or whole-week adjustments.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() =>
              handleExecuteReplan("I have emergency work / sick leave today! Clear today's study slots and shift uncompleted topics into upcoming open slots.")
            }
            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <CalendarOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>🚨 Emergency Work Today</span>
          </button>

          <button
            onClick={() =>
              handleExecuteReplan("Replan ONLY Tuesday's schedule: give me lighter Physics and add Mathematics revision.")
            }
            className="px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-violet-500/20 dark:hover:bg-violet-500/30 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
            <span>📅 Modify Specific Day Only</span>
          </button>

          <button
            onClick={() =>
              handleExecuteReplan("Rebalance my ENTIRE weekly schedule evenly across all 7 days for maximum retention.")
            }
            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>🔄 Rebalance Whole Week</span>
          </button>
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={replanInstruction}
            onChange={(e) => setReplanInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecuteReplan()}
            placeholder="e.g. 'I have a family event on Saturday, shift my Saturday Physics slots to Sunday morning'..."
            className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-xl p-3 text-xs outline-none focus:border-violet-500 transition"
          />

          <button
            disabled={isReplanning || !replanInstruction.trim()}
            onClick={() => handleExecuteReplan()}
            className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-lg shadow-violet-900/20 dark:shadow-violet-900/40 transition disabled:opacity-40"
          >
            {isReplanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-amber-300" />
            )}
            <span>Re-Plan</span>
          </button>
        </div>

        {replanResponseMsg && (
          <div className="p-3 rounded-xl bg-indigo-100/80 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/40 text-indigo-900 dark:text-violet-200 text-xs font-medium leading-relaxed">
            💬 <strong>AI Assistant:</strong> {replanResponseMsg}
          </div>
        )}
      </div>

      {/* SCHEDULE LIST SECTION */}
      <div className="bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Active Weekly Schedule</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({completedSlots} of {totalSlots} completed)
              </span>
            </h2>
          </div>

          {/* Day Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["All", "Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (dayName) => (
                <button
                  key={dayName}
                  onClick={() => setSelectedDayFilter(dayName)}
                  className={`px-3 py-1 rounded-lg font-extrabold transition shrink-0 ${
                    selectedDayFilter === dayName
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-transparent shadow-md"
                      : "bg-indigo-50/80 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-indigo-100 dark:border-white/5"
                  }`}
                >
                  {dayName}
                </button>
              )
            )}
          </div>
        </div>

        {/* Schedule Slots */}
        {filteredSchedule.length > 0 ? (
          <div className="space-y-3">
            {filteredSchedule.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  slot.completed
                    ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 opacity-75"
                    : "bg-indigo-50/30 dark:bg-slate-950 border-indigo-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-violet-500/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleSlot(slot.id)}
                    className="mt-0.5 shrink-0"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 transition ${
                        slot.completed
                          ? "text-emerald-600 dark:text-emerald-400 fill-emerald-400/20"
                          : "text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-violet-400"
                      }`}
                    />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30">
                        {slot.timeSlot}
                      </span>
                      {slot.day && (
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 font-mono">
                          {slot.day}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">• {slot.subject}</span>
                    </div>

                    <h3
                      className={`text-sm font-extrabold text-slate-900 dark:text-white ${
                        slot.completed ? "line-through text-slate-400 dark:text-slate-400" : ""
                      }`}
                    >
                      {slot.topic}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{slot.activityType || "Concept Review"}</span>
                      <span>• {slot.durationMinutes || 60} mins</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center space-y-4 rounded-xl bg-indigo-50/40 dark:bg-slate-950/60 border border-indigo-100 dark:border-white/5">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/30 flex items-center justify-center text-indigo-600 dark:text-violet-300 mx-auto">
              <Calendar className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">No schedule slots active</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven't generated a weekly schedule yet or no items match "{selectedDayFilter}". Create your customized timetable using the AI Weekly Planner.
              </p>
            </div>
            <button
              onClick={() => setIsPlannerModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg transition"
            >
              <Rocket className="w-4 h-4 text-amber-300" />
              <span>Generate AI Weekly Plan & Schedule</span>
            </button>
          </div>
        )}
      </div>

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
        profile={profile || {
          studentName: "Scholar",
          gradeLevel: gradeLevel,
          boardName: boardName,
          examTargetDate: examDate,
          targetMarksGoal: "95%+",
          targetPercentage: "95%+",
          dailyStudyHours: 4,
          preferredStudyTime: "Evening",
          timeSlots: ["Evening"],
          studyPace: "Balanced",
          pomodoroMinutes: 25,
          shortBreakMinutes: 5,
          selectedSubjects: subjects.map(s => s.name),
          chapterSyllabus: "",
          personalBioNotes: "",
          hasCompletedWizard: true
        }}
      />
    </div>
  );
};
