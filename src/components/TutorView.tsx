import React, { useState, useRef, useEffect } from "react";
import { Subject, TutorResponse, StudentProfile, TutorChatMessage } from "../types";
import { getApiUrl } from "../utils/api";
import {
  Bot,
  Send,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  FileText,
  RefreshCw,
  Trash2,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Camera,
  Paperclip,
  X,
  ShieldAlert,
  Check,
  Maximize2,
} from "lucide-react";

interface TutorViewProps {
  subjects: Subject[];
  gradeLevel: string;
  profile?: StudentProfile;
  tutorHistory?: TutorChatMessage[];
  setTutorHistory?: React.Dispatch<React.SetStateAction<TutorChatMessage[]>>;
}

export const TutorView: React.FC<TutorViewProps> = ({
  subjects,
  gradeLevel,
  profile,
  tutorHistory = [],
  setTutorHistory,
}) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [chatMessages, setChatMessages] = useState<TutorChatMessage[]>(tutorHistory);

  // Attachments State
  const [pendingAttachment, setPendingAttachment] = useState<{
    name: string;
    type: "image" | "file";
    dataUrl?: string;
  } | null>(null);

  // Permission Request Modal State
  const [permissionModal, setPermissionModal] = useState<{
    type: "photo" | "camera" | "file";
  } | null>(null);

  // Granted permissions memory
  const [grantedPermissions, setGrantedPermissions] = useState<{
    photo: boolean;
    camera: boolean;
    file: boolean;
  }>({
    photo: false,
    camera: false,
    file: false,
  });

  // Camera Live Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // File Input Refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tutorHistory) setChatMessages(tutorHistory);
  }, [tutorHistory]);

  const updateMessages = (newMsgs: TutorChatMessage[]) => {
    setChatMessages(newMsgs);
    if (setTutorHistory) setTutorHistory(newMsgs);
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  };

  // 1. Handle Option Selection from + Menu
  const handleOptionClick = (type: "photo" | "camera" | "file") => {
    setShowPlusMenu(false);
    setErrorMsg("");

    if (!grantedPermissions[type]) {
      // Show permission dialog first
      setPermissionModal({ type });
    } else {
      // Permission already granted, open feature
      executeFeature(type);
    }
  };

  const handleGrantPermission = () => {
    if (!permissionModal) return;
    const type = permissionModal.type;
    setGrantedPermissions((prev) => ({ ...prev, [type]: true }));
    setPermissionModal(null);
    executeFeature(type);
  };

  const handleDenyPermission = () => {
    if (!permissionModal) return;
    const type = permissionModal.type;
    setPermissionModal(null);
    setErrorMsg(
      `Permission denied for ${
        type === "camera" ? "Camera" : type === "photo" ? "Photo Access" : "Files & Storage"
      }. You can grant permission anytime by tapping the + icon again.`
    );
  };

  const executeFeature = (type: "photo" | "camera" | "file") => {
    if (type === "photo") {
      photoInputRef.current?.click();
    } else if (type === "file") {
      fileInputRef.current?.click();
    } else if (type === "camera") {
      openCameraModal();
    }
  };

  // Camera Live Modal Controls
  const openCameraModal = async () => {
    setCameraError("");
    setCameraModalOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError("Live camera stream is restricted in this browser frame.");
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setCameraError("Could not start live camera feed. You can use your device camera file picker below.");
    }
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setCameraModalOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPendingAttachment({
          name: `camera_capture_${Date.now().toString().slice(-4)}.jpg`,
          type: "image",
          dataUrl,
        });
        closeCameraModal();
        return;
      }
    }
    closeCameraModal();
  };

  // Handle Input File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingAttachment({
        name: file.name,
        type,
        dataUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Send Message with Question & Attachment
  const handleSendQuestion = async () => {
    if ((!questionInput.trim() && !pendingAttachment) || loading) return;

    const userText = questionInput.trim();
    const currentSubject = selectedSubject || "General";
    const attachmentToSend = pendingAttachment ? { ...pendingAttachment } : undefined;

    setQuestionInput("");
    setPendingAttachment(null);
    setErrorMsg("");

    const userMsgId = `user-${Date.now()}`;
    const newMessages: TutorChatMessage[] = [
      ...chatMessages,
      {
        id: userMsgId,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject: currentSubject,
        userText: userText || (attachmentToSend ? `Analyzed attached ${attachmentToSend.type}: ${attachmentToSend.name}` : ""),
        attachment: attachmentToSend,
      },
    ];

    updateMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/ai-tutor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject,
          question: userText,
          attachment: attachmentToSend,
          gradeLevel: gradeLevel || profile?.gradeLevel || "10th Grade (Matric)",
          studentProfile: profile,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        updateMessages([
          ...newMessages,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            subject: currentSubject,
            tutorOutput: data.answer,
          },
        ]);
      } else {
        setErrorMsg(data.error || "Could not generate solution. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error connecting to APEX AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    updateMessages([]);
    setErrorMsg("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-950 border border-indigo-100 dark:border-white/10 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "file")}
      />
      <input
        type="file"
        ref={cameraFileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e, "image");
          closeCameraModal();
        }}
      />

      {/* 1. TOP HEADER BAR */}
      <div className="bg-indigo-50/80 dark:bg-slate-900 border-b border-indigo-100 dark:border-white/10 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 dark:shadow-violet-600/30">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">APEX AI</h1>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Synced with {profile?.studentName || "Scholar"} • {profile?.gradeLevel || "Matric"} •{" "}
              {profile?.boardName || "FBISE/Punjab Board"} Specs
            </p>
          </div>
        </div>

        {chatMessages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* 2. CENTRAL MESSAGES AREA (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {chatMessages.length === 0 ? (
          /* Empty Chat Welcome State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-300 shadow-xl">
              <Bot className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                How can APEX AI assist your study today, {profile?.studentName || "Scholar"}?
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                I am APEX AI, your academic tutor for {profile?.boardName || "FBISE / Punjab Board"} syllabi, model
                paper marking schemes, and numerical step-by-step solutions. You can ask questions or attach photos of textbook problems.
              </p>
            </div>
          </div>
        ) : (
          /* Render Messages */
          chatMessages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === "user" ? (
                /* User Message Bubble */
                <div className="flex justify-end">
                  <div className="max-w-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-violet-200 font-bold border-b border-white/10 pb-1">
                      <span>{msg.subject || "General"}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Render User Attachment if present */}
                    {msg.attachment && (
                      <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10 space-y-1.5">
                        {msg.attachment.type === "image" && msg.attachment.dataUrl ? (
                          <div className="rounded-lg overflow-hidden border border-white/10 max-h-48 bg-slate-900">
                            <img
                              src={msg.attachment.dataUrl}
                              alt={msg.attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate">{msg.attachment.name}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-violet-200 block truncate">
                          Attached {msg.attachment.type}: {msg.attachment.name}
                        </span>
                      </div>
                    )}

                    {msg.userText && (
                      <p className="text-xs font-semibold leading-relaxed pt-0.5">{msg.userText}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* AI Tutor Message Card */
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-violet-600/30 border border-indigo-200 dark:border-violet-500/40 flex items-center justify-center text-indigo-700 dark:text-violet-300 shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                  </div>

                  <div className="flex-1 bg-indigo-50/50 dark:bg-slate-900/90 border border-indigo-200 dark:border-violet-500/30 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm dark:shadow-2xl text-slate-800 dark:text-slate-100">
                    {/* Header Summary */}
                    <div className="border-b border-indigo-100 dark:border-white/10 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-violet-500/20 text-indigo-800 dark:text-violet-300 text-[10px] font-black">
                          {msg.subject || "General"} • Board Solution
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {msg.tutorOutput?.directAnswer}
                      </h3>

                      {msg.tutorOutput?.keyConcepts && msg.tutorOutput.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.tutorOutput.keyConcepts.map((concept, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-slate-800 text-indigo-900 dark:text-slate-300 font-bold"
                            >
                              #{concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Breakdown */}
                    {msg.tutorOutput?.stepByStepSolution && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Step-by-Step Solution & Explanation
                        </h4>

                        <div className="space-y-2.5">
                          {msg.tutorOutput.stepByStepSolution.map((step) => (
                            <div
                              key={step.stepNumber}
                              className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                  {step.stepNumber}
                                </span>
                                <h5 className="text-xs font-bold text-white">{step.title}</h5>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed pl-7">{step.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulas / Definitions */}
                    {msg.tutorOutput?.importantFormulasOrDefinitions &&
                      msg.tutorOutput.importantFormulasOrDefinitions.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1.5">
                          <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> Formulas & Definitions to Remember
                          </h4>
                          <ul className="list-disc list-inside text-xs text-slate-200 space-y-1 pl-1">
                            {msg.tutorOutput.importantFormulasOrDefinitions.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Board Exam Tips */}
                    {msg.tutorOutput?.boardExamTips && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-400" /> Board Exam Scoring Guideline
                        </h4>
                        <p className="text-xs text-amber-200/90 leading-relaxed">{msg.tutorOutput.boardExamTips}</p>
                      </div>
                    )}

                    {/* Common Pitfalls */}
                    {msg.tutorOutput?.commonPitfallsToAvoid &&
                      msg.tutorOutput.commonPitfallsToAvoid.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                          <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400" /> Common Mistakes to Avoid in Exams
                          </h4>
                          <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-1 pl-1">
                            {msg.tutorOutput.commonPitfallsToAvoid.map((pitfall, idx) => (
                              <li key={idx}>{pitfall}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Practice Check Question */}
                    {msg.tutorOutput?.practiceCheckQuestion && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-emerald-400" /> Quick Self-Check Practice
                        </h4>
                        <p className="text-xs text-emerald-200/90">{msg.tutorOutput.practiceCheckQuestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>APEX AI is generating step-by-step solution...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 3. BOTTOM INPUT BAR */}
      <div className="bg-indigo-50/80 dark:bg-slate-900 border-t border-indigo-100 dark:border-white/10 p-3 md:p-4 shrink-0">
        <div className="relative bg-white dark:bg-slate-950 border border-indigo-200 dark:border-white/10 rounded-2xl p-3 focus-within:border-indigo-400 dark:focus-within:border-violet-500/80 transition shadow-sm dark:shadow-xl space-y-2.5">
          {/* Pending Attachment Chip Preview */}
          {pendingAttachment && (
            <div className="flex items-center gap-2.5 bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-violet-500/40 rounded-xl p-2 max-w-sm animate-in fade-in slide-in-from-bottom-2">
              {pendingAttachment.type === "image" && pendingAttachment.dataUrl ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-200 dark:border-white/10 shrink-0 bg-white dark:bg-slate-950">
                  <img
                    src={pendingAttachment.dataUrl}
                    alt={pendingAttachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/30 flex items-center justify-center text-indigo-700 dark:text-amber-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-xs">
                <p className="text-slate-900 dark:text-white font-extrabold truncate">{pendingAttachment.name}</p>
                <span className="text-[10px] text-indigo-600 dark:text-violet-300 uppercase tracking-wider font-bold">
                  {pendingAttachment.type} Attached
                </span>
              </div>
              <button
                onClick={() => setPendingAttachment(null)}
                className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Remove Attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Multi-line Text Area for wrapping & viewable text */}
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendQuestion();
              }
            }}
            rows={2}
            placeholder={
              selectedSubject
                ? `Ask a ${selectedSubject} question, derivation, or formula...`
                : "Ask APEX AI any question, derivation, or attach a photo..."
            }
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs px-1 py-1 outline-none resize-none min-h-[44px] max-h-36 overflow-y-auto leading-relaxed"
          />

          {/* Bottom Action Controls Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-white/5">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Plus (+) Options Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(!showPlusMenu);
                    setShowSubjectMenu(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    showPlusMenu
                      ? "bg-indigo-600 dark:bg-violet-600 text-white rotate-45 shadow-md shadow-indigo-900/30 dark:shadow-violet-900/50"
                      : "bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-indigo-300 dark:hover:border-violet-500/50"
                  }`}
                  title="Attach Photo, Camera or File"
                >
                  <Plus className="w-5 h-5 transition-transform duration-200" />
                </button>

                {/* Plus (+) Options Popup Menu */}
                {showPlusMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-52 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-white/15 rounded-2xl shadow-xl dark:shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-indigo-100 dark:border-white/5 mb-1">
                      Attach Content
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOptionClick("photo")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span>1. Upload photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOptionClick("camera")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span>2. Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOptionClick("file")}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <span>3. Upload file</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Short & Cool Subject Icon Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectMenu(!showSubjectMenu);
                    setShowPlusMenu(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative ${
                    selectedSubject
                      ? "bg-indigo-100 dark:bg-violet-600/30 border border-indigo-300 dark:border-violet-500/60 text-indigo-800 dark:text-violet-300 shadow-md shadow-indigo-900/10 dark:shadow-violet-900/30"
                      : "bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-indigo-300 dark:hover:border-violet-500/50"
                  }`}
                  title={selectedSubject ? `Subject: ${selectedSubject}` : "Select Subject (Optional)"}
                >
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                  {selectedSubject && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 dark:bg-amber-400 rounded-full border-2 border-white dark:border-slate-950" />
                  )}
                </button>

                {/* Subject Selection Popup Menu */}
                {showSubjectMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-white/15 rounded-xl shadow-xl dark:shadow-2xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-indigo-100 dark:border-white/5 mb-1">
                      Select Subject (Optional)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject("");
                        setShowSubjectMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        !selectedSubject
                          ? "bg-indigo-100 dark:bg-violet-600/30 text-indigo-900 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>General / Any</span>
                      {!selectedSubject && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400" />}
                    </button>
                    {subjects.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(s.name);
                          setShowSubjectMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          selectedSubject === s.name
                            ? "bg-indigo-100 dark:bg-violet-600/30 text-indigo-900 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30"
                            : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {selectedSubject === s.name && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-violet-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Subject Badge Tag */}
              {selectedSubject && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-violet-600/20 border border-indigo-200 dark:border-violet-500/40 text-indigo-900 dark:text-violet-300 text-[11px] font-extrabold animate-in fade-in zoom-in-95">
                  <span>{selectedSubject}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubject("")}
                    className="text-indigo-600 dark:text-violet-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    title="Clear Subject"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Ask APEX AI Send Button */}
            <button
              type="button"
              disabled={loading || (!questionInput.trim() && !pendingAttachment)}
              onClick={handleSendQuestion}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shrink-0 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-30 shadow-lg shadow-violet-600/20"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-amber-300" />
              )}
              <span className="hidden sm:inline">Ask APEX AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* PERMISSION REQUEST MODAL */}
      {permissionModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center shadow-2xl relative animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-gradient-to-br dark:from-violet-600/30 dark:to-indigo-600/30 border border-indigo-200 dark:border-violet-500/40 flex items-center justify-center text-amber-500 dark:text-amber-300 mx-auto shadow-inner">
              {permissionModal.type === "camera" && <Camera className="w-8 h-8" />}
              {permissionModal.type === "photo" && <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              {permissionModal.type === "file" && <Paperclip className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Allow APEX AI to access your{" "}
                {permissionModal.type === "camera"
                  ? "Camera"
                  : permissionModal.type === "photo"
                  ? "Photos & Media"
                  : "Storage & Files"}?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {permissionModal.type === "camera"
                  ? "APEX AI requires camera access to snap textbook numericals, diagrams, and exam papers directly."
                  : permissionModal.type === "photo"
                  ? "APEX AI requires access to your photo library to select study diagrams and homework images."
                  : "APEX AI requires access to your storage to upload model papers, PDF notes, and study files."}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={handleGrantPermission}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Allow Access</span>
              </button>

              <button
                onClick={handleDenyPermission}
                className="w-full py-2.5 rounded-2xl bg-indigo-100 dark:bg-slate-800 hover:bg-indigo-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition"
              >
                Don't Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CAMERA PREVIEW MODAL */}
      {cameraModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-white">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>APEX AI Camera Capture</span>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center space-y-3 text-slate-300">
                  <ShieldAlert className="w-8 h-8 text-amber-400" />
                  <p className="text-xs leading-relaxed">{cameraError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => cameraFileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Device Camera</span>
              </button>

              <button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
