import { Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan, DiagnosticReport, StudentProfile, TutorChatMessage, GeneralAssessment, DailyStudyActivity, StreakData } from "../types";
import { DEFAULT_SUBJECTS, DEFAULT_SCHEDULE_SLOTS, DEFAULT_FLASHCARDS } from "../data/defaultData";

const KEYS = {
  SUBJECTS: "obsidian_apex_subjects_v1",
  SCHEDULE: "obsidian_apex_schedule_v2",
  FLASHCARDS: "obsidian_apex_flashcards_v2",
  FOCUS_LOGS: "obsidian_apex_focus_logs_v1",
  STUDY_PLAN: "obsidian_apex_study_plan_v2",
  DIAGNOSTIC: "obsidian_apex_diagnostic_v1",
  EXAM_DATE: "obsidian_apex_exam_date_v1",
  GRADE_LEVEL: "obsidian_apex_grade_level_v1",
  BOARD_NAME: "obsidian_apex_board_name_v1",
  STREAK: "obsidian_apex_streak_v1",
  STUDENT_PROFILE: "obsidian_apex_student_profile_v1",
  TUTOR_CHAT: "obsidian_apex_tutor_chat_v1",
  QUIZ_VAULT: "obsidian_apex_quiz_vault_v1",
  STUDY_ACTIVITY: "obsidian_apex_study_activity_v1",
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  studentName: "Scholar",
  gradeLevel: "10th Grade (Matric Part 2)",
  boardName: "Federal Board (FBISE)",
  examTargetDate: "2027-04-15",
  targetMarksGoal: "95%+ (A+ Distinction)",
  targetPercentage: "95%+",
  dailyStudyHours: 4,
  preferredStudyTime: "Evening / Night (7 PM - 12 AM)",
  timeSlots: ["Evening (5 PM - 8 PM)", "Late Night (9 PM - 12 AM)"],
  studyPace: "Balanced Pomodoro (25m Focus / 5m Rest)",
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  selectedSubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Urdu"],
  chapterSyllabus: "",
  personalBioNotes: "",
  hasCompletedWizard: false,
};

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(KEYS.STUDENT_PROFILE);
    if (raw) return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STUDENT_PROFILE;
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
  } catch {}
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch {}
}

export function loadSchedule(): ScheduleSlot[] {
  try {
    const raw = localStorage.getItem(KEYS.SCHEDULE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SCHEDULE_SLOTS;
}

export function saveSchedule(schedule: ScheduleSlot[]): void {
  try {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch {}
}

export function loadFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(KEYS.FLASHCARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FLASHCARDS;
}

export function saveFlashcards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
  } catch {}
}

export function loadFocusLogs(): FocusSessionLog[] {
  try {
    const raw = localStorage.getItem(KEYS.FOCUS_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveFocusLogs(logs: FocusSessionLog[]): void {
  try {
    localStorage.setItem(KEYS.FOCUS_LOGS, JSON.stringify(logs));
  } catch {}
}

export function loadActiveStudyPlan(): StudyPlan | null {
  try {
    const raw = localStorage.getItem(KEYS.STUDY_PLAN);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveActiveStudyPlan(plan: StudyPlan): void {
  try {
    localStorage.setItem(KEYS.STUDY_PLAN, JSON.stringify(plan));
  } catch {}
}

export function loadDiagnosticReport(): DiagnosticReport | null {
  try {
    const raw = localStorage.getItem(KEYS.DIAGNOSTIC);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveDiagnosticReport(report: DiagnosticReport): void {
  try {
    localStorage.setItem(KEYS.DIAGNOSTIC, JSON.stringify(report));
  } catch {}
}

export function getExamTargetDate(): string {
  try {
    return localStorage.getItem(KEYS.EXAM_DATE) || "2027-04-15";
  } catch {
    return "2027-04-15";
  }
}

export function setExamTargetDate(dateStr: string): void {
  try {
    localStorage.setItem(KEYS.EXAM_DATE, dateStr);
  } catch {}
}

export function getGradeLevel(): string {
  try {
    return localStorage.getItem(KEYS.GRADE_LEVEL) || "10th Grade (Matric Part 2)";
  } catch {
    return "10th Grade (Matric Part 2)";
  }
}

export function setGradeLevel(grade: string): void {
  try {
    localStorage.setItem(KEYS.GRADE_LEVEL, grade);
  } catch {}
}

export function getBoardName(): string {
  try {
    return localStorage.getItem(KEYS.BOARD_NAME) || "Punjab Board (BISE)";
  } catch {
    return "Punjab Board (BISE)";
  }
}

export function setBoardName(board: string): void {
  try {
    localStorage.setItem(KEYS.BOARD_NAME, board);
  } catch {}
}

export function getTodayDateString(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultStudyActivity(): Record<string, DailyStudyActivity> {
  const activityMap: Record<string, DailyStudyActivity> = {};
  // Create realistic activity sequence for last 5 consecutive days up to today
  for (let i = 4; i >= 0; i--) {
    const dateStr = getTodayDateString(-i);
    activityMap[dateStr] = {
      date: dateStr,
      focusMinutes: i === 0 ? 45 : 60 + ((4 - i) * 15),
      completedTasks: 2 + ((4 - i) % 3),
      completedQuizzes: i % 2 === 0 ? 1 : 0,
      notes: i === 0 ? "Daily goal session completed today!" : `Recorded study activity for ${dateStr}`,
      loggedAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  }
  return activityMap;
}

export function loadStudyActivityMap(): Record<string, DailyStudyActivity> {
  try {
    const raw = localStorage.getItem(KEYS.STUDY_ACTIVITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch {}
  const defaults = getDefaultStudyActivity();
  saveStudyActivityMap(defaults);
  return defaults;
}

export function saveStudyActivityMap(map: Record<string, DailyStudyActivity>): void {
  try {
    localStorage.setItem(KEYS.STUDY_ACTIVITY, JSON.stringify(map));
  } catch {}
}

export function calculateStreakFromActivityMap(map: Record<string, DailyStudyActivity>): StreakData {
  const dates = Object.keys(map).sort();
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, lastStudyDate: "" };
  }

  const todayStr = getTodayDateString();
  const yesterdayStr = getTodayDateString(-1);

  // Active dates with recorded focus/tasks/quizzes or manual log
  const activeDateSet = new Set(
    dates.filter((d) => {
      const act = map[d];
      return act && (act.focusMinutes > 0 || act.completedTasks > 0 || act.completedQuizzes > 0 || act.loggedAt);
    })
  );

  const sortedActiveDates = Array.from(activeDateSet).sort();
  const totalActiveDays = sortedActiveDates.length;

  if (totalActiveDays === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, lastStudyDate: "" };
  }

  let currentStreak = 0;
  const isTodayActive = activeDateSet.has(todayStr);
  const isYesterdayActive = activeDateSet.has(yesterdayStr);

  if (!isTodayActive && !isYesterdayActive) {
    currentStreak = 0;
  } else {
    // Count consecutive days backward
    let cursor = isTodayActive ? new Date() : new Date(Date.now() - 86400000);
    while (true) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;

      if (activeDateSet.has(formatted)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all logged dates
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTimestamp: number | null = null;

  for (const dateStr of sortedActiveDates) {
    const parts = dateStr.split("-").map(Number);
    const time = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

    if (prevTimestamp === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((time - prevTimestamp) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTimestamp = time;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays,
    lastStudyDate: sortedActiveDates[sortedActiveDates.length - 1] || "",
  };
}

export function recordTodayStudyActivity(
  addFocusMinutes: number = 0,
  addCompletedTasks: number = 0,
  addCompletedQuizzes: number = 0,
  note?: string
): { activityMap: Record<string, DailyStudyActivity>; streakData: StreakData } {
  const map = loadStudyActivityMap();
  const todayStr = getTodayDateString();

  const existing = map[todayStr] || {
    date: todayStr,
    focusMinutes: 0,
    completedTasks: 0,
    completedQuizzes: 0,
    notes: "Active study session logged",
    loggedAt: new Date().toISOString(),
  };

  existing.focusMinutes += addFocusMinutes;
  existing.completedTasks += addCompletedTasks;
  existing.completedQuizzes += addCompletedQuizzes;
  if (note) existing.notes = note;
  existing.loggedAt = new Date().toISOString();

  map[todayStr] = existing;
  saveStudyActivityMap(map);

  const streakData = calculateStreakFromActivityMap(map);
  setStreakCount(streakData.currentStreak);

  return { activityMap: map, streakData };
}

export function getStreakCount(): number {
  try {
    const map = loadStudyActivityMap();
    const info = calculateStreakFromActivityMap(map);
    return info.currentStreak;
  } catch {
    return 5;
  }
}

export function setStreakCount(count: number): void {
  try {
    localStorage.setItem(KEYS.STREAK, count.toString());
  } catch {}
}

export function loadTutorHistory(): TutorChatMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.TUTOR_CHAT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveTutorHistory(chat: TutorChatMessage[]): void {
  try {
    localStorage.setItem(KEYS.TUTOR_CHAT, JSON.stringify(chat));
  } catch {}
}

export function loadQuizVault(): GeneralAssessment[] {
  try {
    const raw = localStorage.getItem(KEYS.QUIZ_VAULT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveQuizVault(vault: GeneralAssessment[]): void {
  try {
    localStorage.setItem(KEYS.QUIZ_VAULT, JSON.stringify(vault));
  } catch {}
}

export function resetAllAppData(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {}
}
