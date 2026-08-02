import React, { useState } from "react";
import { Subject, ScheduleSlot, StudyPlan, StudentProfile } from "../types";
import {
  Sparkles,
  X,
  BookOpen,
  Clock,
  Zap,
  Calendar,
  CheckCircle2,
  Bot,
  RefreshCw,
  Layers,
  FileText,
  MessageSquare,
  Rocket,
  Check,
  Brain,
  Sliders,
  Flame,
} from "lucide-react";

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: (slots: ScheduleSlot[]) => void;
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan) => void;
  profile: StudentProfile;
}

const WEEKLY_GOAL_STYLES = [
  { id: "balanced", label: "Balanced Revision & Mastery", desc: "Equal weight to theory, numericals, and revision" },
  { id: "cram", label: "Intensive Board Exam Sprint", desc: "High-density coverage of priority high-weightage chapters" },
  { id: "weakness", label: "Weak Topic Repair & Drill", desc: "Focuses 60%+ time on difficult topics & numericals" },
  { id: "pastpapers", label: "Past Papers & Model Questions", desc: "Solve board exam questions with timed testing" },
];

const TIME_SLOT_OPTIONS = [
  "Early Morning (6 AM - 9 AM)",
  "Morning Shift (9 AM - 12 PM)",
  "Afternoon Shift (1 PM - 4 PM)",
  "Evening Shift (5 PM - 8 PM)",
  "Late Night Shift (9 PM - 1 AM)",
  "Flexible Split Shifts",
];

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  activePlan,
  setActivePlan,
  profile,
}) => {
  if (!isOpen) return null;

  // Form State
  const [weeklyGoalStyle, setWeeklyGoalStyle] = useState("Balanced Revision & Mastery");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    subjects.length > 0 ? subjects.map((s) => s.name) : ["Mathematics", "Physics", "Chemistry", "English"]
  );
  const [chapterTopicDetails, setChapterTopicDetails] = useState("");
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 4);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(
    profile.timeSlots && profile.timeSlots.length > 0
      ? profile.timeSlots
      : ["Evening Shift (5 PM - 8 PM)", "Late Night Shift (9 PM - 1 AM)"]
  );
  const [extraInstructions, setExtraInstructions] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleSubject = (subName: string) => {
    if (selectedSubjects.includes(subName)) {
      if (selectedSubjects.length === 1) return;
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subName));
    } else {
      setSelectedSubjects([...selectedSubjects, subName]);
    }
  };

  const toggleTimeSlot = (slot: string) => {
    if (selectedTimeSlots.includes(slot)) {
      if (selectedTimeSlots.length === 1) return;
      setSelectedTimeSlots(selectedTimeSlots.filter((s) => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleGenerateWeeklyPlan = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setGenerationPhase("Connecting to Gemini AI Academic Planner Engine...");

    try {
      setTimeout(() => setGenerationPhase("Analyzing student profile specs & topic weightages..."), 1000);
      setTimeout(() => setGenerationPhase("Structuring daily study blocks & active recall sessions..."), 2200);

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: profile.studentName || "Scholar",
          gradeLevel: profile.gradeLevel || "10th Grade (Matric)",
          board: profile.boardName || "Punjab Board / FBISE",
          examDate: profile.examTargetDate || "2027-04-15",
          targetGoal: profile.targetPercentage || "95%+",
          dailyHours,
          preferredTime: selectedTimeSlots.join(", "),
          subjects: selectedSubjects,
          weakTopics: chapterTopicDetails,
          learningStyle: `${weeklyGoalStyle}. Additional Instructions: ${extraInstructions}`,
          chapterSyllabus: profile.chapterSyllabus || chapterTopicDetails,
          personalBioNotes: profile.personalBioNotes || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);

        if (data.plan.scheduleSlots && data.plan.scheduleSlots.length > 0) {
          const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const newSlots: ScheduleSlot[] = data.plan.scheduleSlots.map((slot: any, idx: number) => ({
            id: `ai-plan-slot-${Date.now()}-${idx}`,
            timeSlot: slot.timeSlot,
            subject: slot.subject,
            topic: slot.topic,
            activityType: slot.activityType || "Concept Mastery",
            durationMinutes: slot.durationMinutes || 60,
            completed: false,
            day: slot.day || daysList[idx % daysList.length],
          }));
          setSchedule(newSlots);
        }

        setIsGenerating(false);
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to generate AI plan. Please try again.");
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error connecting to AI Planner.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-indigo-50/80 dark:bg-slate-900 border-b border-indigo-100 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <span>AI Weekly Planner & Schedule Creator</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-500/30">
                  Powered by Gemini
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for {profile.studentName || "Scholar"} • {profile.gradeLevel || "Matric"} • {profile.boardName || "FBISE/Punjab Board"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. How do you want your plan for the week? */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-violet-400" /> 1. Weekly Plan Strategy & Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WEEKLY_GOAL_STYLES.map((style) => {
                const isSelected = weeklyGoalStyle === style.label;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setWeeklyGoalStyle(style.label)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? "bg-indigo-100 dark:bg-violet-600/20 border-indigo-300 dark:border-violet-500 text-indigo-950 dark:text-white ring-1 ring-indigo-300 dark:ring-violet-500/50"
                        : "bg-indigo-50/50 dark:bg-slate-950 border-indigo-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{style.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-violet-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{style.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Which subjects to include? */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 2. Select Enrolled Subjects for This Week
              </label>
              <button
                type="button"
                onClick={() => setSelectedSubjects(subjects.map((s) => s.name))}
                className="text-[11px] text-indigo-600 dark:text-violet-400 hover:underline font-bold"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.name);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.name)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition ${
                      isSelected
                        ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-950 dark:text-white"
                        : "bg-indigo-50/50 dark:bg-slate-950 border-indigo-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="truncate">{sub.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Chapters & Topics in detail */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> 3. Chapters & Specific Topics to Cover
            </label>
            <textarea
              rows={2}
              value={chapterTopicDetails}
              onChange={(e) => setChapterTopicDetails(e.target.value)}
              placeholder="e.g. Maths: Ch 1 Quadratic Equations & Ch 2 Matrices; Physics: Kinematics numericals..."
              className="w-full bg-indigo-50/50 dark:bg-slate-950 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-xl p-3 text-xs outline-none focus:border-violet-500 resize-none transition"
            />
          </div>

          {/* 4. Time allocation per subject / Daily Study Hours & Time slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Daily Available Hours
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-extrabold">{dailyHours} Hours/Day</span>
              </label>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                className="w-full accent-violet-600 dark:accent-violet-500 bg-indigo-100 dark:bg-slate-950 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>2 hrs</span>
                <span>4 hrs (Std)</span>
                <span>8+ hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Preferred Day Time Shifts
              </label>
              <div className="grid grid-cols-1 gap-1 max-h-28 overflow-y-auto pr-1">
                {TIME_SLOT_OPTIONS.map((slot) => {
                  const isSelected = selectedTimeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`p-1.5 px-2.5 rounded-lg border text-left text-[11px] font-bold transition flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-100 dark:bg-violet-600/20 border-indigo-300 dark:border-violet-500 text-indigo-950 dark:text-white"
                          : "bg-indigo-50/50 dark:bg-slate-950 border-indigo-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate">{slot}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Any extra custom information for the AI */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-rose-600 dark:text-rose-400" /> 5. Any Other Info / Special Events for AI Planner
            </label>
            <input
              type="text"
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="e.g. Maths test on Thursday morning, leave Friday evening free for sports..."
              className="w-full bg-indigo-50/50 dark:bg-slate-950 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Generation phase feedback */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-violet-600/10 border border-violet-500/30 text-center space-y-2 animate-pulse">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-violet-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-indigo-700 dark:text-violet-300">{generationPhase}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-100 dark:border-white/10">
            <button
              disabled={isGenerating}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              disabled={isGenerating}
              onClick={handleGenerateWeeklyPlan}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-violet-900/20 dark:shadow-violet-900/50 transition active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 text-amber-300" />
              )}
              <span>Generate AI Weekly Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
