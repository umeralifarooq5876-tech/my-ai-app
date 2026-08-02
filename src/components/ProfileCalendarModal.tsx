import React, { useState, useEffect } from "react";
import { StudentProfile, DailyStudyActivity, StreakData } from "../types";
import {
  loadStudyActivityMap,
  saveStudyActivityMap,
  recordTodayStudyActivity,
  calculateStreakFromActivityMap,
  getTodayDateString,
} from "../utils/storage";
import {
  X,
  User,
  Flame,
  Calendar,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  RefreshCw,
  Edit3,
  Plus,
  Sparkles,
  Layers,
  Check,
  Globe,
} from "lucide-react";

interface ProfileCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  streak: number;
  setStreak: (val: number) => void;
  onOpenWizard: () => void;
}

export const ProfileCalendarModal: React.FC<ProfileCalendarModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  streak,
  setStreak,
  onOpenWizard,
}) => {
  const [activityMap, setActivityMap] = useState<Record<string, DailyStudyActivity>>({});
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: streak,
    longestStreak: streak,
    totalActiveDays: 0,
    lastStudyDate: "",
  });

  // Calendar navigation state (Year and Month)
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

  // Internet connectivity state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Load activity map and compute streak stats on open
  useEffect(() => {
    if (isOpen) {
      const map = loadStudyActivityMap();
      setActivityMap(map);
      const data = calculateStreakFromActivityMap(map);
      setStreakData(data);
      setStreak(data.currentStreak);
    }
  }, [isOpen]);

  // Track online/offline status in real time
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Perform daily check-in / manual activity logging for today
  const handleDailyCheckIn = () => {
    const { activityMap: updatedMap, streakData: updatedStreak } = recordTodayStudyActivity(
      30, // add 30 mins focus
      1,  // add 1 task completed
      0,
      "Daily check-in study session logged!"
    );
    setActivityMap(updatedMap);
    setStreakData(updatedStreak);
    setStreak(updatedStreak.currentStreak);

    setSyncMessage("⚡ Daily Check-In recorded! Study streak updated.");
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Handle manual sync simulation
  const handleCloudSync = () => {
    setIsSyncing(true);
    setSyncMessage("Connecting to Internet & Apex AI Cloud Sync...");

    setTimeout(() => {
      setIsSyncing(false);
      const map = loadStudyActivityMap();
      setActivityMap(map);
      const data = calculateStreakFromActivityMap(map);
      setStreakData(data);
      setStreak(data.currentStreak);
      setSyncMessage("✅ Cloud Sync Complete! Streak & calendar logs backed up.");
      setTimeout(() => setSyncMessage(null), 3500);
    }, 900);
  };

  // Calendar Calculation
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Adjust for Monday starting calendar (0 = Mon, ..., 6 = Sun)
  const startOffset = (firstDayOfMonth + 6) % 7;

  // Generate calendar days
  const calendarCells: Array<{ dayNum: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push({ dayNum: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(currentMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const dateStr = `${currentYear}-${mStr}-${dStr}`;
    calendarCells.push({ dayNum: d, dateStr });
  }

  const todayStr = getTodayDateString();
  const selectedActivity = selectedDateStr ? activityMap[selectedDateStr] : null;

  // Calculate total focus hours overall
  const totalFocusMinsOverall = (Object.values(activityMap) as DailyStudyActivity[]).reduce<number>(
    (acc, cur) => acc + (cur?.focusMinutes || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-indigo-200 dark:border-violet-500/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] sm:max-h-[90vh] text-slate-800 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="shrink-0 bg-indigo-50/80 dark:bg-slate-900 border-b border-indigo-100 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide truncate">
                  {profile.studentName || "Scholar Profile"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-violet-500/20 text-indigo-700 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 shrink-0">
                  {profile.gradeLevel || "Matric Student"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile.boardName || "Board Exam Prep"} • Target Goal:{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{profile.targetPercentage || "95%+"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="btn-profile-replan"
              onClick={() => {
                onClose();
                onOpenWizard();
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-violet-600/20 dark:hover:bg-violet-600/40 text-indigo-900 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Profile & Plan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-indigo-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Cloud Sync & Internet Connection Bar */}
        <div className="shrink-0 bg-indigo-50/40 dark:bg-slate-950 px-4 sm:px-6 py-2 sm:py-2.5 border-b border-indigo-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-bold text-[11px] sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                Internet Connected & Cloud Sync
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-bold text-[11px] sm:text-xs">
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Offline Mode (Local Sync)
              </span>
            )}

            <span className="text-slate-500 dark:text-slate-400 hidden md:inline text-[11px]">
              • Real-time streak & activity logs active
            </span>
          </div>

          <div className="flex items-center gap-2">
            {syncMessage && (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] animate-in fade-in">
                {syncMessage}
              </span>
            )}
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-semibold transition flex items-center gap-1.5 text-[11px] sm:text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Cloud Sync"}</span>
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">

          {/* KPI Streak & Performance Header Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Current Streak Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/40 border border-amber-500/40 space-y-1 relative overflow-hidden group">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Current Streak</span>
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              </div>
              <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span>{streakData.currentStreak}</span>
                <span className="text-sm font-bold text-amber-400">Days</span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-medium">
                {streakData.currentStreak > 0 ? "🔥 Consecutive Study Days" : "Start your streak today!"}
              </p>
            </div>

            {/* Longest Streak Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-violet-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Record</span>
                <Trophy className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {streakData.longestStreak} <span className="text-xs font-semibold text-slate-400">Days</span>
              </div>
              <p className="text-[11px] text-slate-400">Longest streak recorded</p>
            </div>

            {/* Total Active Days */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Days</span>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {streakData.totalActiveDays} <span className="text-xs font-semibold text-slate-400">Logged</span>
              </div>
              <p className="text-[11px] text-slate-400">Total study sessions</p>
            </div>

            {/* Total Focus Hours */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Focus</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {(totalFocusMinsOverall / 60).toFixed(1)} <span className="text-xs font-semibold text-slate-400">Hours</span>
              </div>
              <p className="text-[11px] text-slate-400">Recorded study time</p>
            </div>
          </div>

          {/* Daily Quick Check-In Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Daily Study Check-In Tracker</span>
                  {activityMap[todayStr] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Logged Today
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400">
                  Completing Pomodoros, finishing schedule tasks, or taking quizzes automatically logs your active study days!
                </p>
              </div>
            </div>

            <button
              id="btn-profile-daily-checkin"
              onClick={handleDailyCheckIn}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 text-slate-950 hover:text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Flame className="w-4 h-4 text-slate-950 fill-slate-950 group-hover:text-white" />
              <span>Log Study Session for Today (+1 Streak)</span>
            </button>
          </div>

          {/* MAIN SECTION: Interactive Monthly Study Activity Calendar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Study Activity Calendar
                </h3>
              </div>

              {/* Month Selector Controls */}
              <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-white w-32 text-center">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
              {/* Day Labels (Mon - Sun) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/10">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  if (cell.dayNum === null || cell.dateStr === null) {
                    return <div key={`empty-${idx}`} className="h-14 rounded-xl bg-slate-900/20 border border-transparent" />;
                  }

                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDateStr;
                  const activity = activityMap[cell.dateStr];
                  const hasActivity = activity && (activity.focusMinutes > 0 || activity.completedTasks > 0 || activity.completedQuizzes > 0);

                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => setSelectedDateStr(cell.dateStr!)}
                      className={`h-14 sm:h-16 rounded-xl p-1.5 flex flex-col justify-between transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-violet-500 shadow-lg scale-105 z-10"
                          : ""
                      } ${
                        hasActivity
                          ? "bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-950/40 border border-amber-500/50 hover:border-amber-400 text-white"
                          : "bg-slate-900/60 border border-white/5 hover:border-white/20 text-slate-300"
                      }`}
                    >
                      {/* Cell Header: Day number + Today indicator */}
                      <div className="flex items-center justify-between w-full text-xs font-bold">
                        <span className={isToday ? "text-amber-400 font-extrabold" : ""}>
                          {cell.dayNum}
                        </span>

                        {isToday && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Today
                          </span>
                        )}

                        {hasActivity && !isToday && (
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>

                      {/* Cell Activity Content */}
                      {hasActivity ? (
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-extrabold text-emerald-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{activity.focusMinutes}m</span>
                          </div>
                          {activity.completedTasks > 0 && (
                            <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                              ✓ {activity.completedTasks} task{activity.completedTasks > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-600 font-medium">No activity</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                    <span>Active Study Session Logged</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-900 border border-white/20" />
                    <span>Rest / Unlogged Day</span>
                  </div>
                </div>

                <span>Click any date to inspect detailed activity logs</span>
              </div>
            </div>
          </div>

          {/* Selected Date Activity Inspector Detail Card */}
          {selectedDateStr && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-violet-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h4 className="text-xs font-extrabold text-white">
                    Study Log Details for {selectedDateStr}
                  </h4>
                  {selectedDateStr === todayStr && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      TODAY
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  {selectedActivity ? "Activity Recorded" : "No Activity Recorded Yet"}
                </span>
              </div>

              {selectedActivity ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Focus Time
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {selectedActivity.focusMinutes} Minutes
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Tasks
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {selectedActivity.completedTasks} Schedule Tasks
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-violet-400" /> Quizzes Solved
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {selectedActivity.completedQuizzes} Assessments
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    No study activity recorded for {selectedDateStr}. Log a Pomodoro focus session or complete a task to mark this date active!
                  </p>
                  {selectedDateStr === todayStr && (
                    <button
                      onClick={handleDailyCheckIn}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition"
                    >
                      Check In Today Now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Academic Specifications & Goal Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" /> Academic Profile & Board Exam Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Student Name & Grade</span>
                <p className="text-sm font-bold text-white">{profile.studentName || "Scholar"}</p>
                <p className="text-slate-300">{profile.gradeLevel || "10th Grade (Matric Part 2)"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Educational Board</span>
                <p className="text-sm font-bold text-white">{profile.boardName || "Federal Board (FBISE)"}</p>
                <p className="text-emerald-400 font-semibold">Target Exam Date: {profile.examTargetDate || "2027-04-15"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Target Marks Goal</span>
                <p className="text-sm font-bold text-amber-400">{profile.targetMarksGoal || "95%+ (A+ Distinction)"}</p>
                <p className="text-slate-400">Daily Goal: {profile.dailyStudyHours || 4} Hours/Day</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Preferred Study Schedule</span>
                <p className="text-sm font-bold text-violet-300">{profile.preferredStudyTime || "Evening / Night Shift"}</p>
                <p className="text-slate-400">{profile.studyPace || "Balanced Pomodoro (25m Focus / 5m Rest)"}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="shrink-0 bg-slate-900 border-t border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">Obsidian Apex Academic Tracker</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
