import { Subject, ScheduleSlot, Flashcard, Quiz } from "../types";

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    code: "MATH-10",
    color: "from-blue-600 to-cyan-500",
    iconName: "Calculator",
    totalChapters: 13,
    completedChapters: 6,
    topics: [
      { id: "m1", name: "Quadratic Equations & Formulas", completed: true, confidence: "mastered", importance: "high" },
      { id: "m2", name: "Variations & Ratio", completed: true, confidence: "mastered", importance: "high" },
      { id: "m3", name: "Partial Fractions", completed: true, confidence: "moderate", importance: "medium" },
      { id: "m4", name: "Sets & Functions", completed: false, confidence: "weak", importance: "high" },
      { id: "m5", name: "Basic Statistics & Standard Deviation", completed: false, confidence: "weak", importance: "medium" },
      { id: "m6", name: "Trigonometry & Heights/Distances", completed: false, confidence: "weak", importance: "high" },
      { id: "m7", name: "Circle Theorems & Tangents", completed: false, confidence: "weak", importance: "high" },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    code: "PHY-10",
    color: "from-purple-600 to-indigo-500",
    iconName: "Zap",
    totalChapters: 9,
    completedChapters: 4,
    topics: [
      { id: "p1", name: "Simple Harmonic Motion & Waves", completed: true, confidence: "mastered", importance: "high" },
      { id: "p2", name: "Sound Waves & Intensity Levels", completed: true, confidence: "moderate", importance: "medium" },
      { id: "p3", name: "Geometrical Optics & Lenses", completed: false, confidence: "weak", importance: "high" },
      { id: "p4", name: "Electrostatics & Coulomb's Law", completed: false, confidence: "weak", importance: "high" },
      { id: "p5", name: "Current Electricity & Ohm's Law", completed: true, confidence: "mastered", importance: "high" },
      { id: "p6", name: "Electromagnetism & Transformer", completed: false, confidence: "weak", importance: "high" },
      { id: "p7", name: "Basic Electronics & Logic Gates", completed: false, confidence: "moderate", importance: "medium" },
      { id: "p8", name: "Atomic & Nuclear Physics", completed: false, confidence: "weak", importance: "medium" },
    ],
  },
  {
    id: "chem",
    name: "Chemistry",
    code: "CHEM-10",
    color: "from-emerald-600 to-teal-500",
    iconName: "FlaskConical",
    totalChapters: 8,
    completedChapters: 4,
    topics: [
      { id: "c1", name: "Chemical Equilibrium & Kc", completed: true, confidence: "mastered", importance: "high" },
      { id: "c2", name: "Acids, Bases & pH Scale", completed: true, confidence: "mastered", importance: "high" },
      { id: "c3", name: "Organic Chemistry & Hydrocarbons", completed: false, confidence: "weak", importance: "high" },
      { id: "c4", name: "Biochemistry & Carbohydrates", completed: true, confidence: "moderate", importance: "medium" },
      { id: "c5", name: "Environmental Chemistry I (Atmosphere)", completed: false, confidence: "moderate", importance: "medium" },
      { id: "c6", name: "Environmental Chemistry II (Water)", completed: false, confidence: "weak", importance: "medium" },
      { id: "c7", name: "Chemical Industries & Metallurgy", completed: false, confidence: "weak", importance: "high" },
    ],
  },
  {
    id: "bio",
    name: "Biology",
    code: "BIO-10",
    color: "from-rose-600 to-pink-500",
    iconName: "Dna",
    totalChapters: 9,
    completedChapters: 5,
    topics: [
      { id: "b1", name: "Gaseous Exchange & Respiratory System", completed: true, confidence: "mastered", importance: "high" },
      { id: "b2", name: "Homeostasis & Kidney Structure", completed: true, confidence: "mastered", importance: "high" },
      { id: "b3", name: "Coordination & Nervous System", completed: true, confidence: "moderate", importance: "high" },
      { id: "b4", name: "Support & Movement (Skeletal System)", completed: false, confidence: "weak", importance: "medium" },
      { id: "b5", name: "Reproduction & Genetics", completed: false, confidence: "weak", importance: "high" },
      { id: "b6", name: "Man and His Environment", completed: true, confidence: "mastered", importance: "medium" },
      { id: "b7", name: "Biotechnology & Genetic Engineering", completed: false, confidence: "moderate", importance: "high" },
    ],
  },
  {
    id: "cs",
    name: "Computer Science",
    code: "CS-10",
    color: "from-amber-600 to-orange-500",
    iconName: "Code",
    totalChapters: 7,
    completedChapters: 5,
    topics: [
      { id: "cs1", name: "Problem Solving & Flowcharts", completed: true, confidence: "mastered", importance: "high" },
      { id: "cs2", name: "C Language Basics & Variables", completed: true, confidence: "mastered", importance: "high" },
      { id: "cs3", name: "Input/Output Functions in C", completed: true, confidence: "mastered", importance: "medium" },
      { id: "cs4", name: "Conditional Logic (if-else, switch)", completed: true, confidence: "moderate", importance: "high" },
      { id: "cs5", name: "Loop Control Structures (for, while)", completed: false, confidence: "weak", importance: "high" },
      { id: "cs6", name: "Arrays & Logic Functions", completed: false, confidence: "weak", importance: "high" },
    ],
  },
  {
    id: "eng",
    name: "English Compulsory",
    code: "ENG-10",
    color: "from-sky-600 to-cyan-500",
    iconName: "BookOpen",
    totalChapters: 13,
    completedChapters: 8,
    topics: [
      { id: "e1", name: "Hazrat Muhammad (PBUH) - An Embodiment of Justice", completed: true, confidence: "mastered", importance: "high" },
      { id: "e2", name: "Chinese New Year", completed: true, confidence: "mastered", importance: "medium" },
      { id: "e3", name: "Try Again (Poem Comprehension)", completed: true, confidence: "mastered", importance: "high" },
      { id: "e4", name: "Grammar: Direct/Indirect Speech & Active/Passive", completed: false, confidence: "weak", importance: "high" },
      { id: "e5", name: "Essay Writing: High-Scoring Techniques", completed: false, confidence: "moderate", importance: "high" },
    ],
  },
];

export const DEFAULT_SCHEDULE_SLOTS: ScheduleSlot[] = [];

export const DEFAULT_FLASHCARDS: Flashcard[] = [];

export const DEFAULT_QUIZ: Quiz | null = null;

