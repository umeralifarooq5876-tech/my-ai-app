import React, { useState, useEffect } from "react";
import { ActiveTab, Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan, DiagnosticReport, StudentProfile, TutorChatMessage, GeneralAssessment } from "./types";
import {
  loadSubjects,
  saveSubjects,
  loadSchedule,
  saveSchedule,
  loadFlashcards,
  saveFlashcards,
  loadFocusLogs,
  saveFocusLogs,
  loadActiveStudyPlan,
  saveActiveStudyPlan,
  loadDiagnosticReport,
  saveDiagnosticReport,
  getExamTargetDate,
  setExamTargetDate,
  getGradeLevel,
  setGradeLevel,
  getBoardName,
  setBoardName,
  getStreakCount,
  setStreakCount,
  loadStudentProfile,
  saveStudentProfile,
  loadTutorHistory,
  saveTutorHistory,
  loadQuizVault,
  saveQuizVault,
} from "./utils/storage";

import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { ScheduleView } from "./components/ScheduleView";
import { FocusRoomView } from "./components/FocusRoomView";
import { TutorView } from "./components/TutorView";
import { QuizVaultView } from "./components/QuizVaultView";
import { DiagnosticsView } from "./components/DiagnosticsView";
import { StudySpecsView } from "./components/StudySpecsView";
import { CompetitionDossierModal } from "./components/CompetitionDossierModal";
import { PlanSetupWizardModal } from "./components/PlanSetupWizardModal";
import { SettingsModal } from "./components/SettingsModal";
import { ProfileCalendarModal } from "./components/ProfileCalendarModal";
import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  Bot,
  BrainCircuit,
  BarChart3,
  FileText,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Persistent App State
  const [profile, setProfileState] = useState<StudentProfile>(loadStudentProfile);
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(loadSchedule);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(loadFlashcards);
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(loadFocusLogs);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(loadActiveStudyPlan);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(loadDiagnosticReport);
  const [tutorHistory, setTutorHistory] = useState<TutorChatMessage[]>(loadTutorHistory);
  const [assessmentVault, setAssessmentVault] = useState<GeneralAssessment[]>(loadQuizVault);

  const [examDate, setExamDateState] = useState<string>(getExamTargetDate);
  const [gradeLevel, setGradeLevelState] = useState<string>(getGradeLevel);
  const [boardName, setBoardNameState] = useState<string>(getBoardName);
  const [streak, setStreakState] = useState<number>(getStreakCount);

  // Theme Mode State (dark | light)
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("obsidian_apex_theme_v1");
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return "dark";
  });

  useEffect(() => {
    try {
      localStorage.setItem("obsidian_apex_theme_v1", themeMode);
    } catch {}
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-open Onboarding Setup Wizard on first time visit
  useEffect(() => {
    if (!profile.hasCompletedWizard) {
      setIsWizardOpen(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveStudentProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveFlashcards(flashcards);
  }, [flashcards]);

  useEffect(() => {
    saveFocusLogs(focusLogs);
  }, [focusLogs]);

  useEffect(() => {
    if (activePlan) saveActiveStudyPlan(activePlan);
  }, [activePlan]);

  useEffect(() => {
    if (diagnosticReport) saveDiagnosticReport(diagnosticReport);
  }, [diagnosticReport]);

  useEffect(() => {
    saveTutorHistory(tutorHistory);
  }, [tutorHistory]);

  useEffect(() => {
    saveQuizVault(assessmentVault);
  }, [assessmentVault]);

  const setProfile = (newProf: StudentProfile) => {
    setProfileState(newProf);
    saveStudentProfile(newProf);
  };

  const setExamDate = (date: string) => {
    setExamDateState(date);
    setExamTargetDate(date);
    setProfileState((prev) => ({ ...prev, examTargetDate: date }));
  };

  const setGradeLevel = (val: string) => {
    setGradeLevelState(val);
    setGradeLevel(val);
    setProfileState((prev) => ({ ...prev, gradeLevel: val }));
  };

  const setBoardName = (val: string) => {
    setBoardNameState(val);
    setBoardName(val);
    setProfileState((prev) => ({ ...prev, boardName: val }));
  };

  const setStreak = (val: number) => {
    setStreakState(val);
    setStreakCount(val);
  };

  // Toggle schedule item completed
  const handleToggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 selection:bg-[#6C63FF] selection:text-white flex flex-col bg-[#f4f3ff] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 ${themeMode === 'dark' ? 'dark' : ''}`}>
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        examDate={examDate}
        streak={streak}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            subjects={subjects}
            setSubjects={setSubjects}
            schedule={schedule}
            setSchedule={setSchedule}
            onToggleScheduleItem={handleToggleScheduleItem}
            setActiveTab={setActiveTab}
            examDate={examDate}
            setExamDate={setExamDate}
            gradeLevel={gradeLevel}
            boardName={boardName}
            streak={streak}
            profile={profile}
            onOpenProfile={() => setIsWizardOpen(true)}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            subjects={subjects}
            setSubjects={setSubjects}
            schedule={schedule}
            setSchedule={setSchedule}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            boardName={boardName}
            setBoardName={setBoardName}
            examDate={examDate}
            profile={profile}
          />
        )}

        {activeTab === "specs" && <StudySpecsView profile={profile} />}

        {activeTab === "focus" && (
          <FocusRoomView
            subjects={subjects}
            focusLogs={focusLogs}
            setFocusLogs={setFocusLogs}
            streak={streak}
            setStreak={setStreak}
          />
        )}

        {activeTab === "tutor" && (
          <TutorView
            subjects={subjects}
            gradeLevel={gradeLevel}
            profile={profile}
            tutorHistory={tutorHistory}
            setTutorHistory={setTutorHistory}
          />
        )}

        {activeTab === "quiz" && (
          <QuizVaultView
            subjects={subjects}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            profile={profile}
            assessmentVault={assessmentVault}
            setAssessmentVault={setAssessmentVault}
          />
        )}

        {activeTab === "diagnostics" && (
          <DiagnosticsView
            subjects={subjects}
            examDate={examDate}
            activeReport={diagnosticReport}
            setActiveReport={setDiagnosticReport}
            schedule={schedule}
            focusLogs={focusLogs}
            streak={streak}
            assessmentVault={assessmentVault}
            flashcards={flashcards}
            profile={profile}
          />
        )}
      </main>

      {/* Competition Dossier PDF Modal */}
      <CompetitionDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        gradeLevel={gradeLevel}
        boardName={boardName}
      />

      {/* Plan Setup Wizard Modal */}
      <PlanSetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        profile={profile}
        setProfile={setProfile}
        subjects={subjects}
        setSubjects={setSubjects}
        setSchedule={setSchedule}
        setActivePlan={setActivePlan}
        setExamDate={setExamDate}
        setGradeLevel={setGradeLevel}
        setBoardName={setBoardName}
      />

      {/* Application & Profile Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        setProfile={setProfile}
        subjects={subjects}
        setSubjects={setSubjects}
        schedule={schedule}
        setSchedule={setSchedule}
        flashcards={flashcards}
        setFlashcards={setFlashcards}
        focusLogs={focusLogs}
        setFocusLogs={setFocusLogs}
        setExamDate={setExamDate}
        setGradeLevel={setGradeLevel}
        setBoardName={setBoardName}
        onOpenWizard={() => setIsWizardOpen(true)}
        tutorHistory={tutorHistory}
        setTutorHistory={setTutorHistory}
        assessmentVault={assessmentVault}
        setAssessmentVault={setAssessmentVault}
        activePlan={activePlan}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsSettingsOpen(false);
        }}
      />

      {/* Student Profile & Activity Calendar Modal */}
      <ProfileCalendarModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        setProfile={setProfile}
        streak={streak}
        setStreak={setStreakState}
        onOpenWizard={() => {
          setIsProfileOpen(false);
          setIsWizardOpen(true);
        }}
      />

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-[#f4f3ff]/95 dark:bg-[#0B0F17]/95 border-t border-indigo-100 dark:border-white/10 px-1 py-2 grid grid-cols-7 gap-0.5 backdrop-blur-md">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "schedule", label: "Schedule", icon: CalendarDays },
          { id: "specs", label: "Specs", icon: FileText },
          { id: "focus", label: "Focus", icon: Timer },
          { id: "tutor", label: "Tutor", icon: Bot },
          { id: "quiz", label: "Practice", icon: BrainCircuit },
          { id: "diagnostics", label: "Stats", icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition ${
                isActive
                  ? "text-indigo-600 dark:text-violet-400 font-bold bg-indigo-100 dark:bg-violet-600/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="border-t border-indigo-100 dark:border-white/5 py-4 text-center text-xs text-slate-500 dark:text-slate-400 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8">
          <p>© 2026 Obsidian Apex — Built for High School & Matric Board Preparation.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono">Gemini 3.6 Flash Server Engine Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
