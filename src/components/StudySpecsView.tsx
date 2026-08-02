import React, { useState, useEffect, useRef } from "react";
import { StudentProfile } from "../types";
import { loadStudentProfile } from "../utils/storage";
import {
  BookOpen,
  FileText,
  UploadCloud,
  FolderPlus,
  Search,
  Download,
  Eye,
  Filter,
  Trash2,
  Star,
  Sparkles,
  CheckCircle2,
  Layers,
  FileCode,
  Tag,
  X,
  FileCheck,
  Zap,
  GraduationCap,
  Plus,
  Check,
  SlidersHorizontal,
} from "lucide-react";

export interface SpecDocument {
  id: string;
  title: string;
  category: "SSC-I" | "SSC-II" | "General";
  boardName?: string;
  gradeLevel?: string;
  subject: string;
  type: "SLO Specifications" | "Model Paper" | "Curriculum Syllabus" | "Marking Scheme" | "Notes & Guides" | "Past Specs";
  fileType: "pdf" | "doc" | "docx" | "txt" | "image" | "link";
  fileUrl?: string; // Data URL or Blob or Link
  size?: string;
  uploadDate: string;
  description: string;
  isFavorite?: boolean;
  isPreloaded?: boolean;
  sloTopics?: string[];
}

const PRELOADED_SPECS: SpecDocument[] = [];

const SUBJECT_LIST = [
  "All Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiat",
  "Pakistan Studies"
];

const TYPE_LIST = [
  "All Types",
  "SLO Specifications",
  "Model Paper",
  "Curriculum Syllabus",
  "Marking Scheme",
  "Notes & Guides"
];

interface StudySpecsViewProps {
  profile?: StudentProfile;
}

export const StudySpecsView: React.FC<StudySpecsViewProps> = ({ profile: propProfile }) => {
  const activeProfile = propProfile || loadStudentProfile();
  const userBoardName = activeProfile.boardName || "Federal Board (FBISE)";
  const userGradeLevel = activeProfile.gradeLevel || "10th Grade (Matric Part 2)";

  const [documents, setDocuments] = useState<SpecDocument[]>(() => {
    try {
      const saved = localStorage.getItem("obsidian_study_specs_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Modal / Preview state
  const [previewDoc, setPreviewDoc] = useState<SpecDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"SSC-I" | "SSC-II">(
    userGradeLevel.includes("9th") || userGradeLevel.includes("SSC-I") ? "SSC-I" : "SSC-II"
  );
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newType, setNewType] = useState<SpecDocument["type"]>("SLO Specifications");
  const [newDescription, setNewDescription] = useState("");
  const [newTopics, setNewTopics] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; dataUrl: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Sync documents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("obsidian_study_specs_v3", JSON.stringify(documents));
    } catch (e) {
      console.warn("Storage limits reached for specs", e);
    }
  }, [documents]);

  // Keep newCategory in sync with user profile when upload modal opens
  useEffect(() => {
    if (userGradeLevel.includes("9th") || userGradeLevel.includes("SSC-I")) {
      setNewCategory("SSC-I");
    } else if (userGradeLevel.includes("10th") || userGradeLevel.includes("SSC-II")) {
      setNewCategory("SSC-II");
    }
  }, [userGradeLevel]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc))
    );
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this study specification document?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  // Process File Uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(Array.from(e.target.files));
    }
  };

  const processFileList = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedFiles((prev) => [...prev, { file, dataUrl }]);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const topicArray = newTopics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const firstFile = uploadedFiles[0];

    let ext: SpecDocument["fileType"] = "pdf";
    if (firstFile) {
      const nameLower = firstFile.file.name.toLowerCase();
      if (nameLower.endsWith(".doc")) ext = "doc";
      else if (nameLower.endsWith(".docx")) ext = "docx";
      else if (nameLower.endsWith(".txt")) ext = "txt";
      else if (nameLower.match(/\.(jpg|jpeg|png|webp)$/)) ext = "image";
    }

    const newDoc: SpecDocument = {
      id: `custom-spec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      category: newCategory,
      boardName: userBoardName,
      gradeLevel: userGradeLevel,
      subject: newSubject,
      type: newType,
      fileType: ext,
      fileUrl: firstFile?.dataUrl || undefined,
      size: firstFile ? `${(firstFile.file.size / (1024 * 1024)).toFixed(1)} MB` : "Custom Spec",
      uploadDate: new Date().toISOString().split("T")[0],
      description: newDescription.trim() || `Uploaded ${userBoardName} specification for ${newSubject} (${newCategory}).`,
      isPreloaded: false,
      isFavorite: false,
      sloTopics: topicArray.length > 0 ? topicArray : [`${newSubject} Core Objectives`, "SLO Unit Blueprint"]
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewTopics("");
    setUploadedFiles([]);
    setIsUploadModalOpen(false);
  };

  // Profile Board & Grade matching logic
  const isBoardMatching = (docBoard?: string): boolean => {
    if (!docBoard) return true; // custom uploaded documents without board tag match
    const d = docBoard.toLowerCase();
    const u = userBoardName.toLowerCase();
    if (d === u) return true;
    if (u.includes("punjab") && d.includes("punjab")) return true;
    if ((u.includes("federal") || u.includes("fbise")) && (d.includes("federal") || d.includes("fbise"))) return true;
    if (u.includes("sindh") && d.includes("sindh")) return true;
    if (u.includes("kpk") && d.includes("kpk")) return true;
    if (u.includes("cambridge") && d.includes("cambridge")) return true;
    return false;
  };

  const isGradeMatching = (docGrade?: string, docCategory?: string): boolean => {
    const u = userGradeLevel.toLowerCase();
    if (u.includes("9th") || u.includes("part 1") || u.includes("ssc-i")) {
      if (docCategory === "SSC-I") return true;
      if (docGrade && (docGrade.toLowerCase().includes("9th") || docGrade.toLowerCase().includes("ssc-i"))) return true;
      return false;
    }
    if (u.includes("10th") || u.includes("part 2") || u.includes("ssc-ii")) {
      if (docCategory === "SSC-II") return true;
      if (docGrade && (docGrade.toLowerCase().includes("10th") || docGrade.toLowerCase().includes("ssc-ii"))) return true;
      return false;
    }
    return true;
  };

  // Filter Logic - Strictly locked & tailored to active user profile
  const filteredDocs = documents.filter((doc) => {
    // 1. Strict profile board & grade match
    const bMatch = isBoardMatching(doc.boardName);
    const gMatch = isGradeMatching(doc.gradeLevel, doc.category);
    if (!bMatch || !gMatch) return false;

    // 2. Subject filter
    if (selectedSubject !== "All Subjects" && doc.subject !== selectedSubject) return false;
    // 3. Material Type filter
    if (selectedType !== "All Types" && doc.type !== selectedType) return false;
    // 4. Favorites filter
    if (onlyFavorites && !doc.isFavorite) return false;

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchSubject = doc.subject.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchBoard = doc.boardName?.toLowerCase().includes(q);
      const matchTopics = doc.sloTopics?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubject && !matchDesc && !matchBoard && !matchTopics) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:from-violet-950/80 dark:via-slate-900 dark:to-indigo-950/80 border border-indigo-200 dark:border-violet-500/30 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl dark:shadow-violet-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 text-indigo-600 dark:text-violet-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-violet-500/20 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Auto-Tailored to Student Profile
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> {userBoardName} • {userGradeLevel}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Study Specifications & Board Documents
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Official Student Learning Outcomes (SLO) blueprints, model papers, curriculum specifications, and study guides automatically tailored for <span className="text-indigo-600 dark:text-amber-300 font-bold">{userBoardName}</span> (<span className="text-emerald-600 dark:text-emerald-300 font-bold">{userGradeLevel}</span>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all ring-1 ring-white/20 active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>Upload PDF / DOC for {userBoardName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-white/10 space-y-3 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${userBoardName} (${userGradeLevel}) specs, SLOs...`}
              className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdowns & Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" /> Filter:
            </div>

            {/* Subject Dropdown */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {SUBJECT_LIST.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Material Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {TYPE_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Favorites Toggle Button */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition ${
                onlyFavorites
                  ? "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300"
                  : "bg-indigo-50/50 dark:bg-slate-950 border-indigo-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" : ""}`} />
              <span>Starred</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Specification Documents */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/80 border border-indigo-200 dark:border-violet-500/30 rounded-2xl space-y-4 max-w-2xl mx-auto my-6 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/30 text-indigo-700 dark:text-violet-300 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-amber-500 dark:text-amber-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              No Specifications Uploaded Yet for {userBoardName} ({userGradeLevel})
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              Your study space is strictly tailored to <span className="text-indigo-600 dark:text-amber-300 font-bold">{userBoardName}</span> • <span className="text-emerald-600 dark:text-emerald-300 font-bold">{userGradeLevel}</span>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload your official board syllabus, SLO pairing schemes, model papers, or study notes in PDF or DOC format below. If you want to view specifications for another board or class, update your settings in the Student Profile tab!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 text-white font-black text-xs shadow-lg shadow-amber-500/10 flex items-center gap-2 hover:opacity-95 transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>Upload PDF / DOC for {userBoardName}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
              className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-violet-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative shadow-[0_4px_20px_rgb(99,102,241,0.05)] dark:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-violet-950/30 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Header Badge & Action Icons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        doc.category === "SSC-I"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                      }`}
                    >
                      {doc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-indigo-100 dark:border-white/5 text-[10px] font-bold">
                      {doc.subject}
                    </span>
                    {doc.boardName && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 text-[9px] font-bold">
                        {doc.boardName.includes("Punjab") ? "Punjab BISE" : doc.boardName.includes("FBISE") || doc.boardName.includes("Federal") ? "FBISE" : doc.boardName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleFavorite(doc.id, e)}
                      title="Bookmark Spec"
                      className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-white/10 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          doc.isFavorite ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      title="Delete Spec"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-violet-300 transition line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {/* SLO Objective Topics Pill List */}
                {doc.sloTopics && doc.sloTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.sloTopics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-indigo-50/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-indigo-100 dark:border-white/5 text-[10px] font-medium"
                      >
                        • {topic}
                      </span>
                    ))}
                    {doc.sloTopics.length > 3 && (
                      <span className="text-[10px] text-indigo-600 dark:text-violet-400 font-semibold self-center">
                        +{doc.sloTopics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: File Format, Size & Action */}
              <div className="pt-3 border-t border-indigo-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-slate-800 text-indigo-900 dark:text-slate-300 text-[10px] font-bold uppercase">
                    {doc.fileType}
                  </span>
                  <span>{doc.size || "1.5 MB"}</span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 dark:text-violet-400 font-bold group-hover:translate-x-0.5 transition">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Spec</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specification Detailed Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <div className="bg-indigo-50/80 dark:bg-slate-900 px-6 py-4 border-b border-indigo-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-violet-600/20 text-indigo-700 dark:text-violet-300 flex items-center justify-center border border-indigo-200 dark:border-violet-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 dark:bg-violet-500/20 text-indigo-800 dark:text-violet-300">
                    {previewDoc.category} • {previewDoc.subject}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-md">
                    {previewDoc.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Info Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Material Type</span>
                  <p className="font-extrabold text-slate-900 dark:text-white truncate">{previewDoc.type}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Board & Grade</span>
                  <p className="font-extrabold text-amber-700 dark:text-amber-300 truncate">
                    {previewDoc.boardName || userBoardName}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">File Format</span>
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">{previewDoc.fileType}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">File Size</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{previewDoc.size || "2.1 MB"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Document Overview & SLO Scope
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {previewDoc.description}
                </p>
              </div>

              {/* Learning Outcomes & Topics List */}
              {previewDoc.sloTopics && previewDoc.sloTopics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Covered Student Learning Objectives (SLOs)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {previewDoc.sloTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 flex items-center gap-2 text-slate-800 dark:text-slate-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-violet-400" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-50/80 dark:bg-slate-900 px-6 py-4 border-t border-indigo-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Official Specification Repository</span>
              <div className="flex items-center gap-2">
                {previewDoc.fileUrl ? (
                  <a
                    href={previewDoc.fileUrl}
                    download={`${previewDoc.title}.${previewDoc.fileType}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </a>
                ) : (
                  <button
                    onClick={() =>
                      alert(`Downloading sample specification: ${previewDoc.title} (${previewDoc.fileType.toUpperCase()})`)
                    }
                    className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-violet-600 hover:bg-indigo-500 dark:hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download Spec PDF
                  </button>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Specification Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <div className="bg-indigo-50/80 dark:bg-slate-900 px-6 py-4 border-b border-indigo-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 text-white flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Upload Study Specs / Notes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Import official syllabus, SLO PDFs, model papers, or notes for <span className="text-indigo-600 dark:text-amber-300 font-bold">{userBoardName}</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 text-xs">
              {/* File Dropzone */}
              <div
                ref={dropzoneRef}
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl border-2 border-dashed border-indigo-300 dark:border-violet-500/40 hover:border-indigo-400 dark:hover:border-violet-400 bg-indigo-50/30 dark:bg-slate-900/50 hover:bg-indigo-50/60 dark:hover:bg-slate-900 transition text-center cursor-pointer space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-violet-400 mx-auto animate-bounce" />
                <p className="font-bold text-slate-900 dark:text-white">
                  Click or drag PDF, DOCX, or Image files here
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Supports .pdf, .docx, .doc, .txt & images up to 50MB
                </p>
                {uploadedFiles.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 justify-center">
                    {uploadedFiles.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 font-bold flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        {f.file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Specification Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Punjab Board 9th Grade Mathematics Official SLO Blueprint"
                  className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                />
              </div>

              {/* Category & Subject Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Class Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                  >
                    <option value="SSC-I">SSC-I (9th Grade)</option>
                    <option value="SSC-II">SSC-II (10th Grade)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                  >
                    {SUBJECT_LIST.filter((s) => s !== "All Subjects").map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Type */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Document Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                >
                  {TYPE_LIST.filter((t) => t !== "All Types").map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">Description & Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe key topics, weightage, or SLO instructions..."
                  className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                />
              </div>

              {/* Topics Input */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Key SLO Topics (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  placeholder="e.g. Kinematics, Newton's Laws, Work & Energy"
                  className="w-full bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-indigo-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Will save to {userBoardName} specification vault
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-indigo-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save Specification
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
