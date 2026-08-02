export type GradeLevel = "9th Grade (Matric Part 1)" | "10th Grade (Matric Part 2)" | "Pre-1st Year / FSC" | "General High School";

export type BoardType = "Punjab Board (BISE)" | "Federal Board (FBISE)" | "Sindh / KPK / Cambridge" | "General High School";

export interface SubjectTopic {
  id: string;
  name: string;
  completed: boolean;
  confidence: "weak" | "moderate" | "mastered";
  importance: "low" | "medium" | "high";
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color class or hex
  iconName: string;
  totalChapters: number;
  completedChapters: number;
  topics: SubjectTopic[];
}

export interface ScheduleSlot {
  id: string;
  timeSlot: string;
  subject: string;
  topic: string;
  activityType: "Concept Mastery" | "Numerical Practice" | "Revision" | "Quiz Practice" | "Past Paper Practice";
  durationMinutes: number;
  completed: boolean;
  day: string; // "Monday", "Tuesday", etc. or "Daily"
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  weeklyStrategy: string;
  dailyTargetHours: number;
  subjectBreakdown: {
    subject: string;
    priority: string;
    allocatedWeeklyHours: number;
    keyFocusTopics: string[];
    examTip: string;
  }[];
  scheduleSlots: {
    timeSlot: string;
    subject: string;
    topic: string;
    activityType: string;
    durationMinutes: number;
  }[];
  examCountdownStrategy: {
    phase: string;
    timeframe: string;
    goal: string;
  }[];
}

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  category: string;
  userRating?: "easy" | "medium" | "hard";
}

export type AssessmentFormat = "mcqs" | "flashcards" | "short_questions" | "detailed_questions" | "full_paper";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examTip: string;
}

export interface Quiz {
  quizTitle: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
}

export interface ShortQuestion {
  id: string;
  questionText: string;
  marks: number;
  modelAnswer: string;
  keyPoints: string[];
  boardExamTip?: string;
}

export interface DetailedQuestion {
  id: string;
  questionText: string;
  marks: number;
  subParts?: { partLabel: string; text: string; marks: number }[];
  stepByStepSolution: { stepNumber: number; title: string; explanation: string }[];
  markingScheme: string;
  boardExamTip?: string;
}

export interface FullExamPaper {
  paperTitle: string;
  subject: string;
  topic: string;
  boardName: string;
  gradeLevel: string;
  totalMarks: number;
  timeAllowedMinutes: number;
  instructions: string[];
  sectionA_MCQs: QuizQuestion[];
  sectionB_ShortQuestions: ShortQuestion[];
  sectionC_DetailedQuestions: DetailedQuestion[];
}

export interface GeneralAssessment {
  id: string;
  title: string;
  subject: string;
  topic: string;
  format: AssessmentFormat;
  createdAt: string;
  totalMarks?: number;
  questionsMCQ?: QuizQuestion[];
  flashcards?: Flashcard[];
  shortQuestions?: ShortQuestion[];
  detailedQuestions?: DetailedQuestion[];
  fullExamPaper?: FullExamPaper;
}

export interface TutorResponse {
  directAnswer: string;
  keyConcepts: string[];
  stepByStepSolution: {
    stepNumber: number;
    title: string;
    explanation: string;
  }[];
  importantFormulasOrDefinitions: string[];
  boardExamTips: string;
  commonPitfallsToAvoid: string[];
  practiceCheckQuestion: string;
}

export interface TutorChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  subject?: string;
  userText?: string;
  tutorOutput?: TutorResponse;
  attachment?: {
    name: string;
    type: "image" | "file";
    dataUrl?: string;
  };
}

export interface DiagnosticReport {
  readinessScore: number;
  gradePrediction: string;
  overallStatus: string;
  criticalWeakAreas: {
    subject: string;
    topic: string;
    riskLevel: string;
    recommendedAction: string;
  }[];
  actionPlan7Days: {
    dayNumber: number;
    task: string;
    targetHours: number;
  }[];
  motivationalDirective: string;
}

export interface FocusSessionLog {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  subject: string;
  notes?: string;
}

export interface StudentProfile {
  studentName: string;
  gradeLevel: string;
  boardName: string;
  examTargetDate: string;
  targetMarksGoal: string;
  targetPercentage?: string;
  dailyStudyHours: number;
  preferredStudyTime: string;
  timeSlots?: string[];
  studyPace: string;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  selectedSubjects?: string[];
  chapterSyllabus?: string;
  personalBioNotes?: string;
  hasCompletedWizard: boolean;
}

export interface DailyStudyActivity {
  date: string; // "YYYY-MM-DD"
  focusMinutes: number;
  completedTasks: number;
  completedQuizzes: number;
  notes?: string;
  loggedAt?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastStudyDate: string;
}

export type ActiveTab = "dashboard" | "schedule" | "focus" | "tutor" | "quiz" | "diagnostics" | "specs" | "dossier";
