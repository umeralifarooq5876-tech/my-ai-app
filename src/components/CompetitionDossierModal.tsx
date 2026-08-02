import React from "react";
import { X, Printer, Download, Sparkles, Award, CheckCircle2, ShieldCheck, FileText } from "lucide-react";

interface CompetitionDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeLevel: string;
  boardName: string;
}

export const CompetitionDossierModal: React.FC<CompetitionDossierModalProps> = ({
  isOpen,
  onClose,
  gradeLevel,
  boardName,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header Bar */}
        <div className="bg-indigo-50/80 dark:bg-slate-900 border-b border-indigo-100 dark:border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              Competition Submission Dossier — AI App Development #6
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Printable Document */}
        <div className="p-6 lg:p-10 space-y-8 overflow-y-auto text-slate-800 dark:text-slate-200 print:bg-white print:text-slate-900 print:p-0">
          {/* Document Title Header */}
          <div className="border-b border-indigo-100 dark:border-white/10 print:border-slate-300 pb-6 space-y-2 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-violet-500/20 dark:text-violet-300 text-xs font-bold print:border print:border-violet-600 print:text-violet-900">
              OFFICIAL ENTRY DOCUMENTATION
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white print:text-slate-900">
              OBSIDIAN APEX
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 print:text-slate-600 max-w-xl mx-auto">
              AI-Powered Study Planner & Exam Preparation Ecosystem for Matric Students
            </p>
            <div className="flex justify-center gap-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 print:text-emerald-700 pt-2 font-bold">
              <span>Category: AI App Development #6</span> • <span>Target: {gradeLevel} ({boardName})</span>
            </div>
          </div>

          {/* Section 1: The Problem */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-slate-900 flex items-center gap-2 border-l-4 border-violet-500 pl-3">
              1. The Problem Statement
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 print:text-slate-700">
              Matric (9th & 10th Grade) board examination preparation presents intense psychological and organizational pressures for students. Students face bulky STEM syllabi across Physics, Chemistry, Mathematics, Biology, and Computer Science without structured time management. Most existing tools provide generic calendars without understanding high-yield board exam topics, numerical derivations, or individual weak topic diagnostics.
            </p>
          </div>

          {/* Section 2: AI Tools & Architecture */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-slate-900 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              2. AI Tools & Technologies Used
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-slate-950/80 print:bg-slate-100 border border-indigo-100 dark:border-white/10 print:border-slate-300 space-y-1">
                <span className="font-bold text-violet-700 dark:text-violet-400 print:text-violet-800 block">@google/genai Gemini 3.6 Flash</span>
                <p className="text-slate-600 dark:text-slate-300 print:text-slate-700">
                  Utilized server-side via Node/Express endpoints for natural language study plan generation, step-by-step math/science problem solving, and instant MCQ quiz synthesis with strict JSON schemas.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-slate-950/80 print:bg-slate-100 border border-indigo-100 dark:border-white/10 print:border-slate-300 space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 block">Web Audio API Focus Engine</span>
                <p className="text-slate-600 dark:text-slate-300 print:text-slate-700">
                  Custom real-time Web Audio sound synthesis generating 10Hz Alpha binaural beats, pink noise rain, and lofi chords to optimize student focus during Pomodoro study sprints.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Key Features & Functionality */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-slate-900 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              3. Key Features & Functionality
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/60 print:bg-slate-100 border border-indigo-100 dark:border-white/5 print:border-slate-300">
                <strong className="text-slate-900 dark:text-white print:text-slate-900 block">📅 AI Study Planner & Timetable</strong>
                Generates a customized daily time-slot schedule based on the student's available hours, exam date, and subject priorities.
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/60 print:bg-slate-100 border border-indigo-100 dark:border-white/5 print:border-slate-300">
                <strong className="text-slate-900 dark:text-white print:text-slate-900 block">🤖 24/7 AI Apex Tutor & Homework Solver</strong>
                Provides step-by-step problem derivations, key definitions, board scoring guidelines, and common pitfalls to avoid.
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/60 print:bg-slate-100 border border-indigo-100 dark:border-white/5 print:border-slate-300">
                <strong className="text-slate-900 dark:text-white print:text-slate-900 block">🎯 Board Exam MCQ Simulator & Flashcards</strong>
                Generates instant practice tests with detailed answer explanations and spaced repetition flashcards for high-yield memorization.
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/60 print:bg-slate-100 border border-indigo-100 dark:border-white/5 print:border-slate-300">
                <strong className="text-slate-900 dark:text-white print:text-slate-900 block">⏱️ Pomodoro Sprint Room & Binaural Audio</strong>
                Custom study sprint timer integrated with real-time sound synthesis (10Hz Alpha Binaural Beats, Rain, Lo-Fi Chords).
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/60 print:bg-slate-100 border border-indigo-100 dark:border-white/5 print:border-slate-300 md:col-span-2">
                <strong className="text-slate-900 dark:text-white print:text-slate-900 block">📊 Weak Area Diagnostic & Readiness Score</strong>
                Analyzes student confidence levels across topics to predict exam readiness (0-100%) and output a 7-day revision blueprint.
              </div>
            </div>
          </div>

          {/* Section 4: Alignment with Judging Criteria */}
          <div className="space-y-3 border-t border-indigo-100 dark:border-white/10 print:border-slate-300 pt-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Competition Judging Criteria Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/80 print:bg-slate-100 border border-indigo-100 dark:border-white/5">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 block">Problem Impact</span>
                Directly addresses matric exam anxiety and time management for high school students.
              </div>
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/80 print:bg-slate-100 border border-indigo-100 dark:border-white/5">
                <span className="font-bold text-violet-700 dark:text-violet-400 print:text-violet-800 block">AI Integration</span>
                Advanced server-side Gemini 3.6 Flash structured schema pipelines for schedules, quizzes, tutoring, and diagnostics.
              </div>
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-950/80 print:bg-slate-100 border border-indigo-100 dark:border-white/5">
                <span className="font-bold text-amber-700 dark:text-amber-400 print:text-amber-800 block">UI / UX Craft</span>
                Mobile-first responsive layout with Neo-Lavender aesthetic light mode and dark obsidian theme, glass cards, and high contrast typography.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
