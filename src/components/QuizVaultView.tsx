import React, { useState } from "react";
import { getApiUrl } from "../utils/api";
import {
  Subject,
  Flashcard,
  StudentProfile,
  AssessmentFormat,
  GeneralAssessment,
  QuizQuestion,
  ShortQuestion,
  DetailedQuestion,
  FullExamPaper,
} from "../types";
import { DEFAULT_QUIZ } from "../data/defaultData";
import {
  BrainCircuit,
  Sparkles,
  Award,
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  BookOpen,
  FileText,
  HelpCircle as QuestionIcon,
  Check,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
  Sliders,
  Copy,
  Download,
  Eye,
  Trash2,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

interface QuizVaultViewProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  profile?: StudentProfile;
  assessmentVault?: GeneralAssessment[];
  setAssessmentVault?: React.Dispatch<React.SetStateAction<GeneralAssessment[]>>;
}

export const QuizVaultView: React.FC<QuizVaultViewProps> = ({
  subjects,
  flashcards,
  setFlashcards,
  profile,
  assessmentVault: propVault,
  setAssessmentVault: propSetVault,
}) => {
  // Config Form State
  const [subjectInput, setSubjectInput] = useState(subjects[0]?.name || "Physics");
  const [topicInput, setTopicInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<AssessmentFormat>("mcqs");
  const [difficulty, setDifficulty] = useState("Medium (SLO Standard)");
  const [numItems, setNumItems] = useState<number>(5);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // History & Active Assessment State
  const [localVault, setLocalVault] = useState<GeneralAssessment[]>(propVault || []);
  const assessmentVault = propVault || localVault;
  const setAssessmentVault = propSetVault || setLocalVault;

  const [activeAssessment, setActiveAssessment] = useState<GeneralAssessment | null>(null);

  // Practice Modes State
  // MCQ state
  const [userAnswersMCQ, setUserAnswersMCQ] = useState<Record<number, number>>({});
  const [isMcqSubmitted, setIsMcqSubmitted] = useState(false);

  // Flashcards state
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Collapsible solutions for Short/Long Qs
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Full paper state
  const [activePaperSection, setActivePaperSection] = useState<"all" | "secA" | "secB" | "secC">("all");

  // Format options definition
  const formatOptions: {
    id: AssessmentFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: "mcqs",
      label: "MCQs Quiz",
      description: "Interactive 4-option quiz with instant grading & board tips",
      icon: <HelpCircle className="w-5 h-5 text-emerald-400" />,
      badge: "Self-Testing",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "flashcards",
      label: "Flashcards Vault",
      description: "Flip cards for active recall, formulas & key definitions",
      icon: <Layers className="w-5 h-5 text-violet-400" />,
      badge: "Memory",
      badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    },
    {
      id: "short_questions",
      label: "Short Questions",
      description: "SLO-aligned short questions (3-4 marks) with model answers",
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      badge: "Conceptual",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "detailed_questions",
      label: "Long Questions",
      description: "Numerical derivations & detailed questions (8-10 marks) with marking steps",
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      badge: "Derivations",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "full_paper",
      label: "Full Board Paper",
      description: "Complete model paper with Section A, B & C, total marks & time limit",
      icon: <Award className="w-5 h-5 text-rose-400" />,
      badge: "Full Exam",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
  ];

  // Fast Presets
  const applyPreset = (
    sub: string,
    top: string,
    fmt: AssessmentFormat,
    diff: string,
    items: number
  ) => {
    setSubjectInput(sub);
    setTopicInput(top);
    setSelectedFormat(fmt);
    setDifficulty(diff);
    setNumItems(items);
  };

  // Generate Assessment handler
  const handleGenerateAssessment = async () => {
    if (!topicInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch(getApiUrl("/api/generate-assessment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: selectedFormat,
          subject: subjectInput,
          topic: topicInput,
          difficulty,
          numItems,
          additionalInfo: additionalNotes,
          studentProfile: profile,
        }),
      });

      const data = await res.json();
      if (data.success && data.assessment) {
        const newAsmt: GeneralAssessment = data.assessment;
        setActiveAssessment(newAsmt);
        setAssessmentVault((prev) => [newAsmt, ...prev]);

        // Reset sub-states
        setUserAnswersMCQ({});
        setIsMcqSubmitted(false);
        setFcIndex(0);
        setIsFlipped(false);
        setRevealedSolutions({});
      } else {
        setErrorMsg(data.error || "Failed to generate assessment.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error connecting to AI Assessment Engine.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // MCQ score calculation
  const calculateMcqScore = (questions: QuizQuestion[] = []) => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswersMCQ[idx] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & SYNC BAR */}
      <div className="border-b border-indigo-100 dark:border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Live Internet Grounded
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-violet-500/20 text-indigo-800 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 text-[10px] font-black">
              Synced with {profile?.studentName || "Scholar"} ({profile?.boardName || "FBISE/Punjab Board"})
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <BrainCircuit className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Universal AI Practice & Exam Generator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            Generate custom MCQs, Flashcards, Short Qs, Long Derivations, or Full Board Model Papers tailored to your syllabus.
          </p>
        </div>

        {assessmentVault.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Saved Assessments:</span>
            <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-violet-600/30 border border-indigo-200 dark:border-violet-500/40 text-indigo-900 dark:text-violet-200 text-xs font-black">
              {assessmentVault.length} in Vault
            </span>
          </div>
        )}
      </div>

      {/* 2. EFFICIENT ASSESSMENT GENERATION PANEL */}
      <div className="bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
              Configure Your Practice Assessment
            </h2>
          </div>
          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
            Step 1: Choose Details & Format
          </span>
        </div>

        {/* Quick Presets Row */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            ⚡ Quick 1-Click Presets:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPreset("Physics", "Current Electricity & Ohm's Law", "mcqs", "Medium (SLO Standard)", 5)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>5-Min Physics MCQ Sprint</span>
            </button>

            <button
              onClick={() => applyPreset("Chemistry", "Organic Functional Groups & Reaction Mechanisms", "flashcards", "Medium (SLO Standard)", 8)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-900 dark:text-violet-300 border border-indigo-300 dark:border-violet-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />
              <span>Chemistry Formula Flashcards</span>
            </button>

            <button
              onClick={() => applyPreset("Biology", "Cell Division, Mitosis & Meiosis", "short_questions", "Board Exam Hard", 5)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Biology Short Qs Pack</span>
            </button>

            <button
              onClick={() => applyPreset("Mathematics", "Quadratic Equations & Derivation Rules", "detailed_questions", "Board Exam Hard", 3)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Math Long Derivation Problems</span>
            </button>

            <button
              onClick={() => applyPreset(subjectInput, "Full Chapter Grand Review", "full_paper", "Board Exam Hard", 10)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Full Board Model Exam Paper</span>
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">Subject</label>
            <select
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:border-violet-500 outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="General Science">General Science</option>
              <option value="English Literature & Grammar">English</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          {/* Topic / Chapter Input */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">
              Chapter / Topic / Specific Concept
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Work & Energy, Organic Reactions, Trigonometric Identities..."
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* FORMAT SELECTION CARDS */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">
            Select Assessment Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {formatOptions.map((opt) => {
              const isSelected = selectedFormat === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedFormat(opt.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition flex flex-col justify-between space-y-2.5 relative ${
                    isSelected
                      ? "bg-indigo-50/90 dark:bg-slate-950 border-indigo-600 dark:border-violet-500 shadow-md dark:shadow-lg dark:shadow-violet-900/30 ring-1 ring-indigo-500 dark:ring-violet-500"
                      : "bg-white dark:bg-slate-950/60 border-indigo-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5">
                      {opt.icon}
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{opt.label}</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 dark:bg-violet-400 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty & Item Count Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">Difficulty Standard</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-indigo-500 dark:focus:border-violet-500"
            >
              <option value="Easy (Basic Recall)">Easy (Basic Recall)</option>
              <option value="Medium (SLO Standard)">Medium (SLO Standard)</option>
              <option value="Board Exam Hard (High-Yield SLO)">Board Exam Hard (High-Yield SLO)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">
              Quantity / Scale ({selectedFormat === "full_paper" ? "Full Exam Paper" : `${numItems} Items`})
            </label>
            <select
              value={numItems}
              onChange={(e) => setNumItems(Number(e.target.value))}
              disabled={selectedFormat === "full_paper"}
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-indigo-500 dark:focus:border-violet-500 disabled:opacity-50"
            >
              <option value={3}>3 Items (Quick Check)</option>
              <option value={5}>5 Items (Standard Quiz)</option>
              <option value={8}>8 Items (Deep Practice)</option>
              <option value={10}>10 Items (Comprehensive Set)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-300 block">Additional Notes / Focus (Optional)</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Focus on numerical calculations or diagram questions"
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 dark:focus:border-violet-500 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2">
          {errorMsg && <p className="text-xs text-rose-400 font-bold">{errorMsg}</p>}
          <div className="ml-auto">
            <button
              disabled={isGenerating || !topicInput.trim()}
              onClick={handleGenerateAssessment}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-900/40 flex items-center gap-2.5 transition active:scale-95 disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating AI Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. VAULT HISTORY SELECTOR (IF MULTIPLE ASSESSMENTS GENERATED) */}
      {assessmentVault.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            Switch Vault View:
          </span>
          {assessmentVault.map((asmt) => (
            <button
              key={asmt.id}
              onClick={() => {
                setActiveAssessment(asmt);
                setUserAnswersMCQ({});
                setIsMcqSubmitted(false);
                setFcIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeAssessment?.id === asmt.id
                  ? "bg-indigo-600 dark:bg-violet-600 text-white border border-indigo-400 dark:border-violet-400 shadow-md"
                  : "bg-indigo-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-indigo-200 dark:border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {asmt.subject} - {asmt.topic.substring(0, 20)} ({asmt.format.toUpperCase()})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 4. ACTIVE ASSESSMENT PRACTICE STUDIO */}
      {activeAssessment ? (
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-2xl space-y-6">
          {/* Assessment Header */}
          <div className="border-b border-indigo-100 dark:border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-violet-500/20 text-indigo-800 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 text-[10px] font-black uppercase tracking-wider">
                  {activeAssessment.format.replace("_", " ")} Mode
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-black">
                  {activeAssessment.subject}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeAssessment.title || `${activeAssessment.subject} Practice Assessment`}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Topic: {activeAssessment.topic}</p>
            </div>

            <button
              onClick={() => {
                setActiveAssessment(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold transition shrink-0"
            >
              + Create New Assessment
            </button>
          </div>

          {/* 4A. FORMAT: MCQS QUIZ */}
          {activeAssessment.format === "mcqs" && activeAssessment.questionsMCQ && (
            <div className="space-y-6">
              {/* Score Bar if submitted */}
              {isMcqSubmitted && (
                <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Quiz Score & Assessment</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        You scored {calculateMcqScore(activeAssessment.questionsMCQ)} out of{" "}
                        {activeAssessment.questionsMCQ.length} (
                        {Math.round(
                          (calculateMcqScore(activeAssessment.questionsMCQ) /
                            activeAssessment.questionsMCQ.length) *
                            100
                        )}
                        %)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserAnswersMCQ({});
                      setIsMcqSubmitted(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                </div>
              )}

              {/* MCQ List */}
              <div className="space-y-5">
                {activeAssessment.questionsMCQ.map((q, idx) => {
                  const selectedOpt = userAnswersMCQ[idx];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 md:p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-white/10 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono mr-2">Q{idx + 1}.</span>
                          {q.questionText}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let btnStyle =
                            "bg-white dark:bg-slate-900 border-indigo-200 dark:border-white/10 text-slate-800 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-violet-500/50";

                          if (isMcqSubmitted) {
                            if (oIdx === q.correctIndex) {
                              btnStyle = "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = "bg-rose-100 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-200";
                            }
                          } else if (isOptionSelected) {
                            btnStyle = "bg-indigo-600 dark:bg-violet-600 text-white border-indigo-500 dark:border-violet-400 font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isMcqSubmitted}
                              onClick={() => setUserAnswersMCQ({ ...userAnswersMCQ, [idx]: oIdx })}
                              className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>
                                <strong className="mr-2 uppercase font-mono">
                                  {String.fromCharCode(65 + oIdx)}.
                                </strong>
                                {opt}
                              </span>

                              {isMcqSubmitted && oIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                              )}
                              {isMcqSubmitted && isOptionSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isMcqSubmitted && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-violet-500/30 text-xs space-y-1 mt-2">
                          <span className="font-extrabold text-indigo-900 dark:text-violet-300 block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Explanation & Board Tip:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300">{q.explanation}</p>
                          {q.examTip && (
                            <p className="text-amber-800 dark:text-amber-300/90 font-semibold pt-1">💡 Tip: {q.examTip}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isMcqSubmitted && (
                <button
                  onClick={() => setIsMcqSubmitted(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Submit & Score Quiz</span>
                </button>
              )}
            </div>
          )}

          {/* 4B. FORMAT: FLASHCARDS VAULT */}
          {activeAssessment.format === "flashcards" && activeAssessment.flashcards && (
            <div className="space-y-6 max-w-xl mx-auto text-center">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>
                  Card {fcIndex + 1} of {activeAssessment.flashcards.length}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px]">
                  {activeAssessment.flashcards[fcIndex]?.category || "General Concept"}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[220px] p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-violet-500/40 shadow-2xl flex flex-col items-center justify-center space-y-4 hover:border-violet-400 transition"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {isFlipped ? "Back: Answer / Definition" : "Front: Prompt / Question (Click to Flip)"}
                </span>

                <p className="text-base font-extrabold text-white leading-relaxed max-w-md">
                  {isFlipped
                    ? activeAssessment.flashcards[fcIndex]?.back
                    : activeAssessment.flashcards[fcIndex]?.front}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  disabled={fcIndex === 0}
                  onClick={() => {
                    setFcIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-40"
                >
                  ← Previous Card
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-md"
                >
                  Flip Card 🔄
                </button>

                <button
                  disabled={fcIndex >= activeAssessment.flashcards.length - 1}
                  onClick={() => {
                    setFcIndex((prev) => Math.min(activeAssessment.flashcards!.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-40"
                >
                  Next Card →
                </button>
              </div>
            </div>
          )}

          {/* 4C. FORMAT: SHORT QUESTIONS */}
          {activeAssessment.format === "short_questions" && activeAssessment.shortQuestions && (
            <div className="space-y-4">
              {activeAssessment.shortQuestions.map((sq, idx) => {
                const isRevealed = revealedSolutions[sq.id || `sq-${idx}`];
                return (
                  <div
                    key={sq.id || idx}
                    className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Short Q{idx + 1} • [{sq.marks || 4} Marks]
                        </span>
                        <h3 className="text-sm font-extrabold text-white leading-snug">{sq.questionText}</h3>
                      </div>

                      <button
                        onClick={() => toggleSolution(sq.id || `sq-${idx}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
                      >
                        {isRevealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isRevealed ? "Hide Solution" : "View Model Solution"}</span>
                      </button>
                    </div>

                    {/* Solution Details */}
                    {isRevealed && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                        <div className="space-y-1">
                          <span className="font-extrabold text-emerald-400 block">
                            Model Board Answer:
                          </span>
                          <p className="text-slate-200 leading-relaxed">{sq.modelAnswer}</p>
                        </div>

                        {sq.keyPoints && sq.keyPoints.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-violet-300 block">
                              Key Scoring Points (Required for Full Marks):
                            </span>
                            <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                              {sq.keyPoints.map((kp, kIdx) => (
                                <li key={kIdx}>{kp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sq.boardExamTip && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium">
                            💡 Board Tip: {sq.boardExamTip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4D. FORMAT: DETAILED / LONG QUESTIONS */}
          {activeAssessment.format === "detailed_questions" && activeAssessment.detailedQuestions && (
            <div className="space-y-5">
              {activeAssessment.detailedQuestions.map((dq, idx) => {
                const isRevealed = revealedSolutions[dq.id || `dq-${idx}`];
                return (
                  <div
                    key={dq.id || idx}
                    className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Long Question {idx + 1} • [{dq.marks || 8} Marks]
                        </span>
                        <h3 className="text-base font-black text-white leading-snug">{dq.questionText}</h3>
                      </div>

                      <button
                        onClick={() => toggleSolution(dq.id || `dq-${idx}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
                      >
                        {isRevealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isRevealed ? "Hide Full Solution" : "View Step-by-Step Derivation & Solution"}</span>
                      </button>
                    </div>

                    {/* Sub Parts if available */}
                    {dq.subParts && dq.subParts.length > 0 && (
                      <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/40">
                        {dq.subParts.map((sp, sIdx) => (
                          <p key={sIdx} className="text-xs text-slate-300 font-semibold">
                            <span className="text-amber-400 font-bold">{sp.partLabel}.</span> {sp.text}{" "}
                            <span className="text-slate-500">[{sp.marks} Marks]</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Expanded Derivation / Solution */}
                    {isRevealed && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-4 text-xs animate-in fade-in duration-200">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Step-by-Step Board Derivation / Solution
                          </h4>
                          <div className="space-y-2">
                            {dq.stepByStepSolution.map((step) => (
                              <div key={step.stepNumber} className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                                <span className="font-bold text-violet-300 block">
                                  Step {step.stepNumber}: {step.title}
                                </span>
                                <p className="text-slate-300 leading-relaxed">{step.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {dq.markingScheme && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200">
                            <strong>📌 Marking Scheme Breakdown:</strong> {dq.markingScheme}
                          </div>
                        )}

                        {dq.boardExamTip && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                            <strong>💡 Exam Presentation Tip:</strong> {dq.boardExamTip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4E. FORMAT: FULL BOARD MODEL PAPER */}
          {activeAssessment.format === "full_paper" && activeAssessment.fullExamPaper && (
            <div className="space-y-6">
              {/* Paper Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase">
                      Official Style Board Model Paper
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      {activeAssessment.fullExamPaper.paperTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Time: {activeAssessment.fullExamPaper.timeAllowedMinutes} Mins
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-400">
                      <Award className="w-4 h-4" />
                      Total Marks: {activeAssessment.fullExamPaper.totalMarks}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 text-xs text-slate-300">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Instructions:</span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                    {activeAssessment.fullExamPaper.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setActivePaperSection("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activePaperSection === "all" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Sections
                </button>
                <button
                  onClick={() => setActivePaperSection("secA")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activePaperSection === "secA" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Section A (MCQs)
                </button>
                <button
                  onClick={() => setActivePaperSection("secB")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activePaperSection === "secB" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Section B (Short Qs)
                </button>
                <button
                  onClick={() => setActivePaperSection("secC")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activePaperSection === "secC" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Section C (Long Qs)
                </button>
              </div>

              {/* Render Paper Content */}
              <div className="space-y-6">
                {(activePaperSection === "all" || activePaperSection === "secA") && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-emerald-400 border-b border-emerald-500/30 pb-2">
                      SECTION A: Objective MCQs
                    </h4>
                    <div className="space-y-3">
                      {activeAssessment.fullExamPaper.sectionA_MCQs.map((q, idx) => (
                        <div key={q.id || idx} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                          <p className="text-xs font-bold text-white">
                            Q{idx + 1}. {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2 rounded bg-slate-900 border border-white/5">
                                <strong className="mr-1.5 font-mono">{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activePaperSection === "all" || activePaperSection === "secB") && (
                  <div className="space-y-3 pt-4">
                    <h4 className="text-sm font-black text-blue-400 border-b border-blue-500/30 pb-2">
                      SECTION B: Short Answer Conceptual Questions
                    </h4>
                    <div className="space-y-3">
                      {activeAssessment.fullExamPaper.sectionB_ShortQuestions.map((sq, idx) => (
                        <div key={sq.id || idx} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              Q{idx + 1}. {sq.questionText}
                            </span>
                            <span className="text-[10px] font-mono text-blue-300 font-bold">[{sq.marks} Marks]</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg">
                            <strong className="text-emerald-400">Model Answer:</strong> {sq.modelAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activePaperSection === "all" || activePaperSection === "secC") && (
                  <div className="space-y-3 pt-4">
                    <h4 className="text-sm font-black text-amber-400 border-b border-amber-500/30 pb-2">
                      SECTION C: Detailed / Long / Numerical Questions
                    </h4>
                    <div className="space-y-3">
                      {activeAssessment.fullExamPaper.sectionC_DetailedQuestions.map((dq, idx) => (
                        <div key={dq.id || idx} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-white">
                              Q{idx + 1}. {dq.questionText}
                            </span>
                            <span className="text-xs font-mono text-amber-300 font-bold">[{dq.marks} Marks]</span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-2 text-xs">
                            <span className="font-bold text-amber-300 block">Step-by-Step Derivation & Marking Scheme:</span>
                            {dq.stepByStepSolution.map((s) => (
                              <div key={s.stepNumber} className="text-slate-300">
                                <strong>Step {s.stepNumber} ({s.title}):</strong> {s.explanation}
                              </div>
                            ))}
                            <div className="text-emerald-300 pt-1">
                              <strong>Marking Breakdown:</strong> {dq.markingScheme}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-white/10 text-center space-y-3">
          <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-400">No Assessment Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Fill in the parameters above and click <strong>Generate AI Assessment</strong> to create MCQs, Flashcards, Short Qs, Long Derivations, or a Full Model Paper.
          </p>
        </div>
      )}
    </div>
  );
};
