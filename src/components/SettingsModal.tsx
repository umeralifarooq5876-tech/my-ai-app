import React, { useState } from "react";
import { StudentProfile, Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan, TutorChatMessage, GeneralAssessment, ActiveTab } from "../types";
import { resetAllAppData, saveStudentProfile, saveSubjects } from "../utils/storage";
import {
  X,
  Settings,
  User,
  BookOpen,
  Timer,
  Database,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Sparkles,
  Bot,
  CalendarDays,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lightbulb,
  Palette,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: (s: ScheduleSlot[]) => void;
  flashcards: Flashcard[];
  setFlashcards: (f: Flashcard[]) => void;
  focusLogs: FocusSessionLog[];
  setFocusLogs: (l: FocusSessionLog[]) => void;
  setExamDate: (date: string) => void;
  setGradeLevel: (val: string) => void;
  setBoardName: (val: string) => void;
  onOpenWizard: () => void;
  tutorHistory?: TutorChatMessage[];
  setTutorHistory?: React.Dispatch<React.SetStateAction<TutorChatMessage[]>>;
  assessmentVault?: GeneralAssessment[];
  setAssessmentVault?: React.Dispatch<React.SetStateAction<GeneralAssessment[]>>;
  activePlan?: StudyPlan | null;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  flashcards,
  setFlashcards,
  focusLogs,
  setFocusLogs,
  setExamDate,
  setGradeLevel,
  setBoardName,
  onOpenWizard,
  tutorHistory = [],
  setTutorHistory,
  assessmentVault = [],
  setAssessmentVault,
  activePlan,
  onNavigateTab,
  themeMode = "dark",
  setThemeMode,
}) => {
  const [activeTab, setActiveTab] = useState<"ai_data" | "pomodoro">("ai_data");
  const [historySubTab, setHistorySubTab] = useState<"overview" | "tutor_logs" | "quiz_logs" | "planner_logs">("overview");
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  const [tutorSubjectFilter, setTutorSubjectFilter] = useState<string>("All");

  // Local Profile Form State
  const [studentName, setStudentName] = useState(profile.studentName || "Scholar");
  const [gradeLevel, setGradeState] = useState(profile.gradeLevel || "10th Grade (Matric Part 2)");
  const [boardName, setBoardState] = useState(profile.boardName || "Punjab Board (BISE)");
  const [examDate, setExamDateState] = useState(profile.examTargetDate || "2027-04-15");
  const [targetGoal, setTargetGoal] = useState(profile.targetMarksGoal || "95%+ (A+ Distinction)");
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 4);
  const [preferredTime, setPreferredTime] = useState(profile.preferredStudyTime || "Evening / Night (7 PM - 12 AM)");

  // Local Pomodoro State
  const [pomodoroMins, setPomodoroMins] = useState(profile.pomodoroMinutes || 25);
  const [shortBreakMins, setShortBreakMins] = useState(profile.shortBreakMinutes || 5);

  // New Subject Form
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubChapters, setNewSubChapters] = useState(10);
  const [selectedSubForTopic, setSelectedSubForTopic] = useState(subjects[0]?.id || "");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicConfidence, setNewTopicConfidence] = useState<"weak" | "moderate" | "mastered">("weak");

  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updated: StudentProfile = {
      ...profile,
      studentName,
      gradeLevel,
      boardName,
      examTargetDate: examDate,
      targetMarksGoal: targetGoal,
      dailyStudyHours: dailyHours,
      preferredStudyTime: preferredTime,
      pomodoroMinutes: pomodoroMins,
      shortBreakMinutes: shortBreakMins,
    };
    setProfile(updated);
    saveStudentProfile(updated);
    setExamDate(examDate);
    setGradeLevel(gradeLevel);
    setBoardName(boardName);

    setSavedSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase(),
      color: "from-blue-600 to-indigo-600",
      iconName: "BookOpen",
      totalChapters: newSubChapters,
      completedChapters: 0,
      topics: [
        {
          id: `top-${Date.now()}-1`,
          name: "Chapter 1 Fundamental Concepts",
          completed: false,
          confidence: "moderate",
          importance: "high",
        },
      ],
    };

    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
    setNewSubName("");
    setNewSubCode("");
    setNewSubChapters(10);
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubForTopic) return;

    const updated = subjects.map((sub) => {
      if (sub.id === selectedSubForTopic) {
        return {
          ...sub,
          topics: [
            ...sub.topics,
            {
              id: `top-${Date.now()}`,
              name: newTopicName.trim(),
              completed: false,
              confidence: newTopicConfidence,
              importance: "medium" as const,
            },
          ],
        };
      }
      return sub;
    });

    setSubjects(updated);
    saveSubjects(updated);
    setNewTopicName("");
  };

  const handleDeleteSubject = (subId: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((s) => s.id !== subId);
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleExportData = () => {
    const backupObj = {
      profile,
      subjects,
      schedule,
      flashcards,
      focusLogs,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `obsidian_apex_profile_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.flashcards) setFlashcards(parsed.flashcards);
        if (parsed.focusLogs) setFocusLogs(parsed.focusLogs);
        alert("Study data imported successfully!");
      } catch (err) {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetApp = () => {
    if (confirm("Are you sure you want to reset all app data to fresh defaults?")) {
      resetAllAppData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F17] border border-violet-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Obsidian Apex Preferences & Settings
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-950 px-6 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: "ai_data", label: "AI Tools Data Access", icon: Sparkles },
            { id: "pomodoro", label: "Focus & Audio", icon: Timer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-200">
          {savedSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: AI Tools Data Access (Planner, Tutor, Quiz Generator) */}
          {activeTab === "ai_data" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-900/30 via-slate-900 to-emerald-900/30 border border-violet-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> AI Modules Data & History Access
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    View, search, and access your full history across AI Study Planner, AI Tutor, and Quiz Generator.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10 shrink-0 text-xs">
                  <button
                    onClick={() => setHistorySubTab("overview")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      historySubTab === "overview" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setHistorySubTab("tutor_logs")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      historySubTab === "tutor_logs" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" /> Tutor ({tutorHistory.length})
                  </button>
                  <button
                    onClick={() => setHistorySubTab("quiz_logs")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      historySubTab === "quiz_logs" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" /> Quiz Vault ({assessmentVault.length})
                  </button>
                  <button
                    onClick={() => setHistorySubTab("planner_logs")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      historySubTab === "planner_logs" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Planner ({schedule.length})
                  </button>
                </div>
              </div>

              {/* OVERVIEW SUB-TAB */}
              {historySubTab === "overview" && (
                <div className="space-y-6">
                  {/* 3 AI Data Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. AI Planner Data */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 text-blue-400" /> AI Planner
                          </span>
                          <span className="text-xs font-mono font-bold text-blue-400">{schedule.length} Slots</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Smart Timetable & Goals</h4>
                        <ul className="text-[11px] text-slate-300 space-y-1 font-medium">
                          <li>• Target Exam: <strong className="text-white">{profile.examTargetDate || "2027-04-15"}</strong></li>
                          <li>• Daily Target: <strong className="text-white">{profile.dailyStudyHours || 4} Hours/Day</strong></li>
                          <li>• Active Plan: <strong className="text-blue-300">{activePlan ? activePlan.planTitle : "Custom Timetable"}</strong></li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => setHistorySubTab("planner_logs")}
                          className="text-slate-400 hover:text-white font-semibold"
                        >
                          View {schedule.length} Slots →
                        </button>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab("schedule");
                            else onClose();
                          }}
                          className="text-blue-400 hover:underline font-bold flex items-center gap-1"
                        >
                          Open Planner <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 2. AI Tutor Context Data */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                            <Bot className="w-3 h-3 text-violet-400" /> AI Tutor
                          </span>
                          <span className="text-xs font-mono font-bold text-violet-400">{tutorHistory.length} Chat Logs</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Ask History & Context</h4>
                        <ul className="text-[11px] text-slate-300 space-y-1 font-medium">
                          <li>• Questions Logged: <strong className="text-white">{tutorHistory.filter(m => m.sender === "user").length} Asked</strong></li>
                          <li>• Education Board: <strong className="text-white">{profile.boardName}</strong></li>
                          <li>• Grade Level: <strong className="text-white">{profile.gradeLevel}</strong></li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => setHistorySubTab("tutor_logs")}
                          className="text-slate-400 hover:text-white font-semibold"
                        >
                          View Tutor History →
                        </button>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab("tutor");
                            else onClose();
                          }}
                          className="text-violet-400 hover:underline font-bold flex items-center gap-1"
                        >
                          Open AI Tutor <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 3. Practice Quiz Generator Data */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3 text-emerald-400" /> Quiz Vault
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{assessmentVault.length} Saved</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Assessments & Flashcards</h4>
                        <ul className="text-[11px] text-slate-300 space-y-1 font-medium">
                          <li>• Active Flashcards: <strong className="text-white">{flashcards.length} Cards</strong></li>
                          <li>• Saved Assessments: <strong className="text-emerald-300">{assessmentVault.length} Sets</strong></li>
                          <li>• Format: <strong className="text-white">MCQs, Short Qs, Model Papers</strong></li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => setHistorySubTab("quiz_logs")}
                          className="text-slate-400 hover:text-white font-semibold"
                        >
                          View Vault Items →
                        </button>
                        <button
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab("quiz");
                            else onClose();
                          }}
                          className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                        >
                          Launch Generator <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Access Actions Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3 text-xs">
                    <h4 className="font-extrabold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-violet-400" /> Instant Access & Management
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      Select a tab above or use the quick buttons below to jump directly into your AI study tools:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab("tutor");
                          else onClose();
                        }}
                        className="px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Bot className="w-3.5 h-3.5" /> Launch AI Tutor
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab("quiz");
                          else onClose();
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" /> Open Quiz Generator
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab("schedule");
                          else onClose();
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <CalendarDays className="w-3.5 h-3.5" /> Open AI Planner
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TUTOR LOGS SUB-TAB */}
              {historySubTab === "tutor_logs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-300">Filter Subject:</span>
                      <select
                        value={tutorSubjectFilter}
                        onChange={(e) => setTutorSubjectFilter(e.target.value)}
                        className="bg-slate-900 text-white border border-white/10 rounded-lg p-1.5 text-xs font-bold outline-none"
                      >
                        <option value="All">All Subjects</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {tutorHistory.length > 0 && setTutorHistory && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your AI Tutor conversation history?")) {
                            setTutorHistory([]);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear Tutor History
                      </button>
                    )}
                  </div>

                  {tutorHistory.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                      <Bot className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">No AI Tutor conversations logged yet.</p>
                      <p className="text-[11px] text-slate-400">Ask questions in the AI Tutor tab to build your live resolution history.</p>
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab("tutor");
                          else onClose();
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Go to AI Tutor
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {tutorHistory
                        .filter((msg) => tutorSubjectFilter === "All" || msg.subject === tutorSubjectFilter)
                        .map((msg) => {
                          const isAI = msg.sender === "ai";
                          const isExpanded = expandedTutorId === msg.id;

                          return (
                            <div
                              key={msg.id}
                              className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                                isAI
                                  ? "bg-violet-950/30 border-violet-500/30 text-slate-200"
                                  : "bg-slate-950 border-white/10 text-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      isAI
                                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    }`}
                                  >
                                    {isAI ? "AI Tutor Solution" : "Student Question"}
                                  </span>
                                  {msg.subject && (
                                    <span className="text-[11px] font-bold text-amber-300">[{msg.subject}]</span>
                                  )}
                                  <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                                </div>

                                {isAI && msg.tutorOutput && (
                                  <button
                                    onClick={() => setExpandedTutorId(isExpanded ? null : msg.id)}
                                    className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1"
                                  >
                                    <span>{isExpanded ? "Collapse Solution" : "Inspect Full Solution"}</span>
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>

                              {msg.userText && <p className="font-semibold text-white leading-relaxed">{msg.userText}</p>}

                              {isAI && msg.tutorOutput && (
                                <div className="space-y-2">
                                  <p className="font-bold text-amber-200">{msg.tutorOutput.directAnswer}</p>

                                  {isExpanded && (
                                    <div className="pt-2 border-t border-white/10 space-y-2.5 text-[11px]">
                                      <div>
                                        <h5 className="font-bold text-violet-300 flex items-center gap-1 mb-1">
                                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Key Concepts:
                                        </h5>
                                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                          {msg.tutorOutput.keyConcepts.map((kc, idx) => (
                                            <li key={idx}>{kc}</li>
                                          ))}
                                        </ul>
                                      </div>

                                      {msg.tutorOutput.stepByStepSolution.length > 0 && (
                                        <div>
                                          <h5 className="font-bold text-emerald-300 mb-1">Step-by-Step Solution:</h5>
                                          <div className="space-y-1 pl-2 border-l-2 border-emerald-500/40">
                                            {msg.tutorOutput.stepByStepSolution.map((s) => (
                                              <div key={s.stepNumber} className="space-y-0.5">
                                                <strong className="text-white">Step {s.stepNumber}: {s.title}</strong>
                                                <p className="text-slate-300">{s.explanation}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {msg.tutorOutput.boardExamTips && (
                                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                                          <strong>Board Exam Tip:</strong> {msg.tutorOutput.boardExamTips}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* QUIZ VAULT SUB-TAB */}
              {historySubTab === "quiz_logs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/10">
                    <span className="text-xs font-bold text-slate-300">
                      Total Generated Assessments: <strong className="text-emerald-400">{assessmentVault.length}</strong>
                    </span>

                    {assessmentVault.length > 0 && setAssessmentVault && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all generated quiz vault assessments?")) {
                            setAssessmentVault([]);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear Quiz Vault
                      </button>
                    )}
                  </div>

                  {assessmentVault.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                      <BrainCircuit className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">No Quiz Vault assessments generated yet.</p>
                      <p className="text-[11px] text-slate-400">Generate custom MCQs, Short Questions, or Model Papers in the Quiz tab.</p>
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab("quiz");
                          else onClose();
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Launch Quiz Generator
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {assessmentVault.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3 text-xs hover:border-emerald-500/40 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {item.format.toUpperCase().replace("_", " ")}
                              </span>
                              <span className="font-bold text-white text-xs">{item.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                              <span>Subject: <strong className="text-slate-200">{item.subject}</strong></span>
                              <span>Topic: <strong className="text-slate-200">{item.topic}</strong></span>
                              <span className="font-mono text-[10px] text-slate-500">{item.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                if (onNavigateTab) onNavigateTab("quiz");
                                else onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                            >
                              Practice Now →
                            </button>
                            {setAssessmentVault && (
                              <button
                                onClick={() => {
                                  setAssessmentVault((prev) => prev.filter((a) => a.id !== item.id));
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete assessment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PLANNER LOGS SUB-TAB */}
              {historySubTab === "planner_logs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/10 text-xs">
                    <div>
                      <h4 className="font-bold text-white">Active AI Generated Schedule ({schedule.length} Time Slots)</h4>
                      <p className="text-[11px] text-slate-400">Personalized study slots synchronized with your target board exam date.</p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenWizard();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Rerun AI Wizard
                    </button>
                  </div>

                  {activePlan && (
                    <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-xs">{activePlan.planTitle}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                          {activePlan.dailyTargetHours} Hours / Day
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{activePlan.overview}</p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {schedule.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-400 font-bold text-[11px]">{slot.timeSlot}</span>
                            <span className="font-bold text-white">{slot.subject}</span>
                            <span className="px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                              {slot.activityType}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{slot.topic}</p>
                        </div>

                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          slot.completed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                        }`}>
                          {slot.completed ? "Completed" : `${slot.durationMinutes}m Pending`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pomodoro & Audio */}
          {activeTab === "pomodoro" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white">Focus Room & Audio Defaults</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pomodoro Work Sprint (Minutes)</label>
                  <select
                    value={pomodoroMins}
                    onChange={(e) => setPomodoroMins(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value={15}>15 Minutes (Short)</option>
                    <option value={25}>25 Minutes (Standard Pomodoro)</option>
                    <option value={35}>35 Minutes (Extended)</option>
                    <option value={50}>50 Minutes (Deep Focus Sprint)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Short Rest Break (Minutes)</label>
                  <select
                    value={shortBreakMins}
                    onChange={(e) => setShortBreakMins(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value={5}>5 Minutes (Standard)</option>
                    <option value={10}>10 Minutes (Longer Rest)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Pomodoro Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
