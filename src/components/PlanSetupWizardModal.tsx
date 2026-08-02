import React, { useState, useEffect } from "react";
import { getApiUrl } from "../utils/api";
import { Subject, ScheduleSlot, StudyPlan, StudentProfile } from "../types";
import {
  Sparkles,
  X,
  User,
  GraduationCap,
  Calendar,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
  Award,
  Layers,
  FileText,
  BrainCircuit,
  Bot,
  Percent,
  MessageSquare,
  Check,
  Flame,
  Rocket,
  HeartHandshake,
  Quote,
  CheckCircle,
} from "lucide-react";

interface PlanSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setSchedule: (schedule: ScheduleSlot[]) => void;
  setActivePlan: (plan: StudyPlan) => void;
  setExamDate: (date: string) => void;
  setGradeLevel: (val: string) => void;
  setBoardName: (val: string) => void;
}

const ALL_MATRIC_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiat",
  "Pakistan Studies",
];

const AVAILABLE_TIME_SLOTS = [
  "Early Morning (6 AM - 9 AM)",
  "Morning Shift (9 AM - 12 PM)",
  "Afternoon Shift (1 PM - 4 PM)",
  "Evening Shift (5 PM - 8 PM)",
  "Late Night Shift (9 PM - 1 AM)",
  "Flexible / Split Shifts",
];

const MOTIVATIONAL_QUOTES = [
  "\"The secret of getting ahead is getting started. Consistency turns small daily actions into top board positions!\"",
  "\"Success isn't about perfection; it's about progress. Every hour you study today is an investment in your future!\"",
  "\"Your target is set and your roadmap is clear. Believe in your preparation and let's make your dream percentage a reality!\"",
];

export const PlanSetupWizardModal: React.FC<PlanSetupWizardModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  subjects,
  setSubjects,
  setSchedule,
  setActivePlan,
  setExamDate,
  setGradeLevel,
  setBoardName,
}) => {
  const [step, setStep] = useState(1);

  // Form State initialized from current profile
  const [studentName, setStudentName] = useState(profile.studentName || "Scholar");
  const [gradeLevel, setGradeState] = useState(profile.gradeLevel || "10th Grade (Matric Part 2)");
  const [boardName, setBoardState] = useState(profile.boardName || "Federal Board (FBISE)");
  const [examDate, setExamDateState] = useState(profile.examTargetDate || "2027-04-15");
  const [targetGoal, setTargetGoal] = useState(profile.targetMarksGoal || "95%+ (A+ Distinction)");
  const [targetPercentage, setTargetPercentage] = useState(profile.targetPercentage || "95%+");
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 4);
  const [preferredTime, setPreferredTime] = useState(profile.preferredStudyTime || "Evening / Night (7 PM - 12 AM)");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(
    profile.timeSlots && profile.timeSlots.length > 0
      ? profile.timeSlots
      : ["Evening Shift (5 PM - 8 PM)", "Late Night Shift (9 PM - 1 AM)"]
  );
  const [studyPace, setStudyPace] = useState(profile.studyPace || "Balanced Pomodoro (25m Focus / 5m Rest)");
  
  const [selectedSubjectNames, setSelectedSubjectNames] = useState<string[]>(
    profile.selectedSubjects && profile.selectedSubjects.length > 0
      ? profile.selectedSubjects
      : subjects.map((s) => s.name)
  );

  const [chapterSyllabus, setChapterSyllabus] = useState(
    profile.chapterSyllabus || "Maths: Ch 1-5 covered, Physics: Ch 1-4 covered, Chemistry: Ch 1-3 covered."
  );

  const [weakTopicsInput, setWeakTopicsInput] = useState(
    "Mathematics Quadratic equations & derivations, Physics numericals in Kinematics, Organic Chemistry reactions"
  );

  const [personalBioNotes, setPersonalBioNotes] = useState(
    profile.personalBioNotes || "Aiming for top board position in FBISE. I learn best with step-by-step numerical examples."
  );

  const [quoteIndex, setQuoteIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Update local state when profile changes
  useEffect(() => {
    if (isOpen) {
      setStudentName(profile.studentName || "Scholar");
      setGradeState(profile.gradeLevel || "10th Grade (Matric Part 2)");
      setBoardState(profile.boardName || "Federal Board (FBISE)");
      setExamDateState(profile.examTargetDate || "2027-04-15");
      setTargetGoal(profile.targetMarksGoal || "95%+ (A+ Distinction)");
      setTargetPercentage(profile.targetPercentage || "95%+");
      setDailyHours(profile.dailyStudyHours || 4);
      setPreferredTime(profile.preferredStudyTime || "Evening / Night (7 PM - 12 AM)");
      if (profile.timeSlots) setSelectedTimeSlots(profile.timeSlots);
      if (profile.selectedSubjects) setSelectedSubjectNames(profile.selectedSubjects);
      if (profile.chapterSyllabus) setChapterSyllabus(profile.chapterSyllabus);
      if (profile.personalBioNotes) setPersonalBioNotes(profile.personalBioNotes);
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const toggleSubject = (name: string) => {
    if (selectedSubjectNames.includes(name)) {
      if (selectedSubjectNames.length === 1) return; // Keep at least one
      setSelectedSubjectNames(selectedSubjectNames.filter((s) => s !== name));
    } else {
      setSelectedSubjectNames([...selectedSubjectNames, name]);
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

  const handleSaveAndGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMsg("");

    setGenerationPhase("Saving student profile & analyzing syllabus weights...");

    try {
      setTimeout(() => setGenerationPhase("Allocating daily time-slots around your preferred shifts..."), 1000);
      setTimeout(() => setGenerationPhase("Synthesizing step-by-step topic targets with Gemini AI..."), 2000);

      // Save profile state immediately
      const updatedProfile: StudentProfile = {
        studentName: studentName.trim() || "Scholar",
        gradeLevel,
        boardName,
        examTargetDate: examDate,
        targetMarksGoal: targetGoal,
        targetPercentage,
        dailyStudyHours: dailyHours,
        preferredStudyTime: preferredTime,
        timeSlots: selectedTimeSlots,
        studyPace,
        pomodoroMinutes: studyPace.includes("50m") ? 50 : 25,
        shortBreakMinutes: studyPace.includes("50m") ? 10 : 5,
        selectedSubjects: selectedSubjectNames,
        chapterSyllabus,
        personalBioNotes,
        hasCompletedWizard: true,
      };

      setProfile(updatedProfile);
      setGradeLevel(gradeLevel);
      setBoardName(boardName);
      setExamDate(examDate);

      // Attempt AI backend plan synthesis
      const res = await fetch(getApiUrl("/api/generate-plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          gradeLevel,
          board: boardName,
          examDate,
          targetGoal,
          targetPercentage,
          dailyHours,
          preferredTime,
          timeSlots: selectedTimeSlots,
          subjects: selectedSubjectNames,
          chapterSyllabus,
          weakTopics: weakTopicsInput,
          personalBioNotes,
          learningStyle: studyPace,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);

        if (data.plan.scheduleSlots && data.plan.scheduleSlots.length > 0) {
          const newSlots: ScheduleSlot[] = data.plan.scheduleSlots.map(
            (slot: any, idx: number) => ({
              id: `wiz-slot-${Date.now()}-${idx}`,
              timeSlot: slot.timeSlot,
              subject: slot.subject,
              topic: slot.topic,
              activityType: slot.activityType || "Concept Mastery",
              durationMinutes: slot.durationMinutes || 45,
              completed: false,
              day: "Daily",
            })
          );
          setSchedule(newSlots);
        }
      }

      // Filter subjects state
      setSubjects((prev) => prev.filter((s) => selectedSubjectNames.includes(s.name)));

      setIsGenerating(false);
      onClose();
    } catch (err: any) {
      console.warn("Generating plan offline fallback", err);
      // Fallback: profile saved, complete wizard
      setProfile({
        studentName: studentName.trim() || "Scholar",
        gradeLevel,
        boardName,
        examTargetDate: examDate,
        targetMarksGoal: targetGoal,
        targetPercentage,
        dailyStudyHours: dailyHours,
        preferredStudyTime: preferredTime,
        timeSlots: selectedTimeSlots,
        studyPace,
        pomodoroMinutes: studyPace.includes("50m") ? 50 : 25,
        shortBreakMinutes: studyPace.includes("50m") ? 10 : 5,
        selectedSubjects: selectedSubjectNames,
        chapterSyllabus,
        personalBioNotes,
        hasCompletedWizard: true,
      });

      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-indigo-50/80 dark:bg-slate-900 border-b border-indigo-100 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase flex items-center gap-2">
                <span>Student Profile & Onboarding</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-violet-500/20 text-indigo-700 dark:text-violet-300 font-extrabold border border-indigo-200 dark:border-violet-500/30">
                  Step {step} of 6
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 1 && "Welcome to Obsidian Apex Exam Companion"}
                {step === 2 && "Student Identity, Class & Educational Board"}
                {step === 3 && "Enrolled Subjects & Chapter Syllabus Notes"}
                {step === 4 && "Daily Study Hours & Preferred Time Slots"}
                {step === 5 && "Target Board Exam Dates & Desired Percentage"}
                {step === 6 && "Your Student Profile is Ready!"}
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

        {/* Step Progress Indicators */}
        <div className="bg-indigo-50/40 dark:bg-slate-950 px-4 py-2.5 border-b border-indigo-100 dark:border-white/5 flex items-center justify-between text-[11px] overflow-x-auto">
          {[
            { num: 1, label: "Welcome" },
            { num: 2, label: "Identity" },
            { num: 3, label: "Subjects & Syllabus" },
            { num: 4, label: "Schedule" },
            { num: 5, label: "Exam Dates" },
            { num: 6, label: "Complete!" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg transition ${
                step === s.num
                  ? "text-indigo-950 dark:text-violet-300 font-extrabold bg-indigo-100 dark:bg-violet-600/20 border border-indigo-300 dark:border-violet-500/30"
                  : step > s.num
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                  step === s.num
                    ? "bg-violet-600 text-white"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-slate-800 dark:text-slate-200 min-h-[390px] flex flex-col justify-between">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* SCREEN 1: Welcome & Short Intro */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-indigo-950/80 border border-violet-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Welcome to Obsidian Apex!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                  Your AI-powered study companion designed specifically for <strong className="text-violet-300">FBISE, Punjab Board, and High School Matric students</strong> to master exams with confidence.
                </p>
              </div>

              {/* Core Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <div className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-400" /> Customized AI Schedule
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Builds your daily study timetable based on your available study hours and preferred shift times.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" /> FBISE Study Specs & SLOs
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Direct access to official SSC-I & SSC-II Student Learning Outcomes (SLOs), model papers, and rubrics.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-amber-400" /> AI Board Exam Tutor
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Instant step-by-step solutions for Math derivations, Physics numericals, and Chemistry equations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" /> Practice Vault & Diagnostics
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Interactive board exam quizzes, flashcard memory revision, and readiness diagnostic reports.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-center text-xs text-violet-300 font-medium">
                👉 Let's take a few moments to fill your academic profile so your study schedule and AI tutor are tailored specifically for you!
              </div>
            </div>
          )}

          {/* SCREEN 2: Student Identity (Name, Grade, Board) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  Tell us about yourself so we can personalize your AI study reports and tutor responses.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Student Name / Preferred Handle *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aisha / Umer Farooq"
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-violet-400" /> Class / Academic Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500 transition"
                >
                  <option value="9th Grade (Matric Part 1)">9th Grade — Matric Part 1 (SSC-I)</option>
                  <option value="10th Grade (Matric Part 2)">10th Grade — Matric Part 2 (SSC-II)</option>
                  <option value="Pre-1st Year / FSC">Pre-1st Year / FSC Part 1 (11th Grade)</option>
                  <option value="General High School">General High School STEM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Educational Board
                </label>
                <select
                  value={boardName}
                  onChange={(e) => setBoardState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500 transition"
                >
                  <option value="Federal Board (FBISE)">Federal Board Islamabad (FBISE)</option>
                  <option value="Punjab Board (BISE)">Punjab Board (BISE Lahore / Rawalpindi / Multan / Gujranwala)</option>
                  <option value="Sindh / KPK / Cambridge">Sindh Board / KPK BISE / Cambridge O-Levels</option>
                  <option value="General High School">General High School Board</option>
                </select>
              </div>
            </div>
          )}

          {/* SCREEN 3: Subjects, Syllabus & Personal Bio Notes */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Select Enrolled Subjects
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedSubjectNames(ALL_MATRIC_SUBJECTS)}
                  className="text-[11px] text-violet-400 hover:underline font-bold"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_MATRIC_SUBJECTS.map((subName) => {
                  const isSelected = selectedSubjectNames.includes(subName);
                  return (
                    <button
                      key={subName}
                      type="button"
                      onClick={() => toggleSubject(subName)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition ${
                        isSelected
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{subName}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Chapter Syllabus Status
                </label>
                <input
                  type="text"
                  value={chapterSyllabus}
                  onChange={(e) => setChapterSyllabus(e.target.value)}
                  placeholder="e.g. Maths: Ch 1-5 completed, Physics: Ch 1-4 completed..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-violet-400" /> Anything else about yourself? (Personal Bio / Preferences)
                </label>
                <textarea
                  rows={2}
                  value={personalBioNotes}
                  onChange={(e) => setPersonalBioNotes(e.target.value)}
                  placeholder="e.g. Aiming for FBISE board position. Prefer step-by-step numerical examples..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 resize-none transition"
                />
              </div>
            </div>
          )}

          {/* SCREEN 4: Daily Study Hours & Time Slots */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-400" /> Daily Available Study Hours
                  </span>
                  <span className="text-violet-400 font-extrabold">{dailyHours} Hours / Day</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>2 Hours</span>
                  <span>4 Hours (Standard)</span>
                  <span>6 Hours</span>
                  <span>10 Hours (Sprint)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Preferred Study Time Slots
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleTimeSlot(slot)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                          isSelected
                            ? "bg-violet-600/20 border-violet-500 text-white"
                            : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="line-clamp-1">{slot}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Focus Technique
                </label>
                <select
                  value={studyPace}
                  onChange={(e) => setStudyPace(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-violet-500 transition"
                >
                  <option value="Balanced Pomodoro (25m Focus / 5m Rest)">Balanced Pomodoro (25m Focus / 5m Rest)</option>
                  <option value="Deep Focus Sprints (50m Focus / 10m Rest)">Deep Focus Sprints (50m Focus / 10m Rest)</option>
                  <option value="High-Yield Board Exam Cram Mode">High-Yield Revision Sprint Mode</option>
                </select>
              </div>
            </div>
          )}

          {/* SCREEN 5: Target Exam Dates & Desired Percentage */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  Gathering your target exam date and percentage goal allows our AI to schedule your countdown phases.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-violet-400" /> Target Board Exam Date *
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDateState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-400" /> Desired Percentage Goal *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { perc: "95%+", label: "95%+ Top Distinction", desc: "Board Position & Medals" },
                    { perc: "90%+", label: "90%+ High A+ Grade", desc: "Top FSC College Admissions" },
                    { perc: "85%+", label: "85%+ Solid A Grade", desc: "High Competitive Score" },
                    { perc: "75%+", label: "75%+ Confident Pass", desc: "Solid Core Preparation" },
                  ].map((p) => (
                    <button
                      key={p.perc}
                      type="button"
                      onClick={() => {
                        setTargetPercentage(p.perc);
                        setTargetGoal(`${p.perc} (${p.label})`);
                      }}
                      className={`p-3 rounded-xl border text-left transition ${
                        targetPercentage === p.perc
                          ? "bg-amber-500/20 border-amber-500 text-white font-bold ring-1 ring-amber-500/50"
                          : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center justify-between">
                        <span>{p.label}</span>
                        {targetPercentage === p.perc && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" /> Priority Weak Topics to Revise Before Exam
                </label>
                <input
                  type="text"
                  value={weakTopicsInput}
                  onChange={(e) => setWeakTopicsInput(e.target.value)}
                  placeholder="e.g. Physics Kinematics numericals, Math quadratic equations..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>
          )}

          {/* SCREEN 6: Your Profile is Complete! */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mx-auto shadow-inner">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Your Student Profile is Complete! 🎉
                </h3>
                <p className="text-xs text-slate-300">
                  All your academic specs, exam dates, and daily preferences have been configured.
                </p>
              </div>

              {/* Summary Specs Cards */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Name</span>
                    <span className="font-extrabold text-white text-sm">{studentName || "Scholar"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Class & Board</span>
                    <span className="font-extrabold text-violet-300">{gradeLevel} ({boardName.split(" ")[0]})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Exam Date</span>
                    <span className="font-extrabold text-amber-300">{examDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Desired Goal</span>
                    <span className="font-extrabold text-emerald-400">{targetPercentage} Percentage</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-bold">
                    📚 {selectedSubjectNames.length} Enrolled Subjects
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-bold">
                    ⏱️ {dailyHours} Hours / Day
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-bold">
                    🎯 {selectedTimeSlots.length} Study Shifts
                  </span>
                </div>
              </div>

              {/* Motivational Quote / Line to start app */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/60 to-indigo-950/60 border border-violet-500/30 flex items-start gap-3">
                <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                    Daily Motivational Spark
                  </span>
                  <p className="text-xs italic text-slate-200 font-medium leading-relaxed">
                    {MOTIVATIONAL_QUOTES[quoteIndex]}
                  </p>
                </div>
              </div>

              {/* Generating status */}
              {isGenerating && (
                <div className="p-3.5 rounded-xl bg-violet-600/10 border border-violet-500/30 text-center space-y-2 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-violet-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-violet-300">{generationPhase}</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            {step > 1 ? (
              <button
                disabled={isGenerating}
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isGenerating}
                onClick={handleSaveAndGeneratePlan}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/50 transition active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4 text-amber-300" />}
                <span>Save Profile & Launch App</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
