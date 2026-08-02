import React, { useState, useEffect, useRef } from "react";
import { Subject, FocusSessionLog } from "../types";
import { playAmbientSound, stopAmbientSound, playTimerCompletionChime, SoundMode } from "../utils/audioSynth";
import { recordTodayStudyActivity } from "../utils/storage";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Radio,
  CloudRain,
  Music,
  Headphones,
} from "lucide-react";

interface FocusRoomViewProps {
  subjects: Subject[];
  focusLogs: FocusSessionLog[];
  setFocusLogs: React.Dispatch<React.SetStateAction<FocusSessionLog[]>>;
  streak: number;
  setStreak: (val: number) => void;
}

export const FocusRoomView: React.FC<FocusRoomViewProps> = ({
  subjects,
  focusLogs,
  setFocusLogs,
  streak,
  setStreak,
}) => {
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [soundMode, setSoundMode] = useState<SoundMode>("off");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || "Mathematics");

  // Sprint task list
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: "t1", text: "Read Chapter Summary & High-Yield Notes", done: false },
    { id: "t2", text: "Solve 5 Board Exam Numerical Problems", done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");

  const intervalRef = useRef<any>(null);

  // Switch timer presets
  const handleModeChange = (mode: "focus" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setTimerMode(mode);
    let secs = 25 * 60;
    if (mode === "shortBreak") secs = 5 * 60;
    if (mode === "longBreak") secs = 15 * 60;
    setTargetSeconds(secs);
    setSecondsRemaining(secs);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            playTimerCompletionChime();

            // Log session if focus mode completed
            if (timerMode === "focus") {
              const mins = Math.round(targetSeconds / 60);
              const newLog: FocusSessionLog = {
                id: `log-${Date.now()}`,
                date: new Date().toISOString(),
                durationMinutes: mins,
                subject: selectedSubject,
                notes: `Completed ${mins}m Focus Sprint`,
              };
              setFocusLogs((logs) => [newLog, ...logs]);

              // Automatically record daily activity & recalculate real streak
              const { streakData } = recordTodayStudyActivity(mins, 1, 0, `Completed ${mins}m Focus Sprint on ${selectedSubject}`);
              setStreak(streakData.currentStreak);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, targetSeconds, timerMode, selectedSubject]);

  // Handle ambient audio
  const handleSoundChange = (mode: SoundMode) => {
    setSoundMode(mode);
    playAmbientSound(mode);
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = targetSeconds > 0 ? ((targetSeconds - secondsRemaining) / targetSeconds) * 100 : 0;

  const todayLogs = focusLogs.filter(
    (l) => new Date(l.date).toDateString() === new Date().toDateString()
  );
  const totalTodayMinutes = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: `t-${Date.now()}`, text: newTaskInput.trim(), done: false }]);
    setNewTaskInput("");
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-indigo-100 dark:border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Timer className="w-6 h-6 text-indigo-600 dark:text-violet-400" /> Obsidian Focus Sprint Room
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs">
          Deep work Pomodoro sprint engine paired with ambient Web Audio concentration frequencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Pomodoro Countdown */}
        <div className="lg:col-span-2 bg-gradient-to-b from-violet-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 space-y-8 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-indigo-200 dark:border-white/10 z-10 shadow-sm">
            <button
              onClick={() => handleModeChange("focus")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timerMode === "focus"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              25m Focus Sprint
            </button>
            <button
              onClick={() => handleModeChange("shortBreak")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timerMode === "shortBreak"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              5m Short Break
            </button>
            <button
              onClick={() => handleModeChange("longBreak")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timerMode === "longBreak"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              15m Rest Break
            </button>
          </div>

          {/* Subject Dropdown Picker */}
          <div className="z-10 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <span>Sprint Target Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-violet-500 shadow-sm"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Large Countdown Digital Display */}
          <div className="relative z-10 my-4">
            <div className="w-64 h-64 lg:w-72 lg:h-72 rounded-full border-4 border-indigo-100 dark:border-slate-800 flex flex-col items-center justify-center relative bg-white dark:bg-slate-950/90 shadow-2xl">
              {/* Progress SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  className="stroke-indigo-100 dark:stroke-slate-800 fill-none stroke-[8px]"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  className="stroke-violet-600 dark:stroke-violet-500 fill-none stroke-[8px] transition-all duration-1000"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * progressPct) / 100}
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative z-10">
                <span className="font-mono text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-widest drop-shadow-sm">
                  {formatTime(secondsRemaining)}
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">
                  {isRunning ? "Focus Session Active" : "Paused"}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-4 z-10">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-xl transition-all ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 dark:shadow-amber-900/40"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 dark:shadow-emerald-900/40"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Pause Sprint</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Sprint</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsRemaining(targetSeconds);
              }}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-indigo-200 dark:border-white/10 transition shadow-sm"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Ambient Audio Synth & Tasks Checklist */}
        <div className="space-y-6">
          {/* Ambient Web Audio Generator */}
          <div className="bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-indigo-100 dark:border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-600 dark:text-violet-400" /> Web Audio Synth Ambience
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-mono font-bold">
                Real-Time
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "off", label: "Silent (Off)", icon: VolumeX, desc: "No audio" },
                { id: "binaural", label: "10Hz Alpha Waves", icon: Radio, desc: "Binaural focus beat" },
                { id: "lofi", label: "Lo-Fi Warm Chords", icon: Music, desc: "Relaxing study chords" },
                { id: "rain", label: "Natural Rain Noise", icon: CloudRain, desc: "Calming pink noise" },
                { id: "hum", label: "Deep Focus Drone", icon: Volume2, desc: "Low A1 frequency hum" },
              ].map((item) => {
                const Icon = item.icon;
                const active = soundMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSoundChange(item.id as SoundMode)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                      active
                        ? "bg-indigo-100 dark:bg-violet-600/20 border-indigo-300 dark:border-violet-500 text-indigo-900 dark:text-white shadow-sm"
                        : "bg-indigo-50/50 dark:bg-slate-950/80 border-indigo-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-indigo-100/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-indigo-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    {active && <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sprint Goals Checklist */}
          <div className="bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-[0_8px_30px_rgb(99,102,241,0.06)] dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-indigo-100 dark:border-white/10 pb-3">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Sprint Goals Checklist
            </h3>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add focus task..."
                className="flex-1 bg-indigo-50/50 dark:bg-slate-950 text-slate-900 dark:text-white border border-indigo-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/40 dark:bg-slate-950/60 border border-indigo-100 dark:border-white/5 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() =>
                        setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className={task.done ? "line-through text-slate-400" : ""}>{task.text}</span>
                  </label>
                  <button
                    onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Today's Focus Stats */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-slate-950/90 border border-indigo-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Focus Today</span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{totalTodayMinutes} Minutes</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Sessions Logged</span>
                <p className="text-sm font-bold text-indigo-700 dark:text-violet-400">{todayLogs.length} Sprints</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
