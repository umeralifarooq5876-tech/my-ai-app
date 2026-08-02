import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  const PORT = 3000;

  // Enable CORS for mobile Capacitor APK and web client calls
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize Gemini AI safely on server-side
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAiKey: !!process.env.GEMINI_API_KEY });
  });

  // 1. AI Study Schedule & Timetable Generator
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const {
        studentName,
        gradeLevel,
        board,
        examDate,
        targetGoal,
        dailyHours,
        preferredTime,
        subjects,
        weakTopics,
        learningStyle,
        chapterSyllabus,
        personalBioNotes,
      } = req.body;

      const ai = getAI();
      const prompt = `You are an elite, internet-connected academic planner and board exam preparation strategist for High School, FBISE, and Punjab Board students.
You have real-time access to current educational board guidelines, model paper structures, SLO (Student Learning Outcome) rubrics, and weightage standards.

STUDENT PROFILE & ACADEMIC SPECS:
- Student Name: ${studentName || "Scholar"}
- Grade Level / Class: ${gradeLevel || "10th Grade / Matric Part 2"}
- Educational Board: ${board || "Punjab Board (BISE) / Federal Board (FBISE)"}
- Target Board Exam Date: ${examDate || "April 2027"}
- Target Grade / Percentage Goal: ${targetGoal || "95%+ / Top Position"}
- Daily Available Study Hours: ${dailyHours || 4} hours/day
- Preferred Time Shifts: ${preferredTime || "Evening/Night Shifts"}
- Enrolled Subjects: ${JSON.stringify(subjects || [])}
- Chapter Syllabus Status: "${chapterSyllabus || "Core matric chapters"}"
- Priority Weak Topics & Areas: "${weakTopics || "Core concepts, Math derivations, Physics numericals, Organic Chemistry"}"
- Personal Bio & Learning Preferences: "${personalBioNotes || "Aspiration for top board position. Prefers step-by-step guidance."}"
- Weekly Plan Strategy / Special Notes: "${learningStyle || "Balanced Pomodoro focus blocks with active recall"}"

TASK:
Generate a 7-day (weekly) study plan and daily timetable schedule customized specifically for ${studentName || "the student"}'s specs and target goals.
Every 7 days (each week), the student generates a new plan to adapt to covered syllabus topics, past paper practice, and new goals.
Incorporate up-to-date board exam patterns, high-weightage topics, and active recall slots.

Return JSON strictly matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              overview: { type: Type.STRING },
              weeklyStrategy: { type: Type.STRING },
              dailyTargetHours: { type: Type.NUMBER },
              subjectBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    priority: { type: Type.STRING, description: "High, Medium, or Maintenance" },
                    allocatedWeeklyHours: { type: Type.NUMBER },
                    keyFocusTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    examTip: { type: Type.STRING },
                  },
                  required: ["subject", "priority", "allocatedWeeklyHours", "keyFocusTopics", "examTip"],
                },
              },
              scheduleSlots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: { type: Type.STRING, description: "e.g. 04:00 PM - 05:00 PM" },
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    activityType: { type: Type.STRING, description: "Concept Mastery, Numerical Practice, Revision, or Quiz" },
                    durationMinutes: { type: Type.NUMBER },
                    day: { type: Type.STRING, description: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday" },
                  },
                  required: ["timeSlot", "subject", "topic", "activityType", "durationMinutes"],
                },
              },
              examCountdownStrategy: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                    goal: { type: Type.STRING },
                  },
                  required: ["phase", "timeframe", "goal"],
                },
              },
            },
            required: [
              "planTitle",
              "overview",
              "weeklyStrategy",
              "dailyTargetHours",
              "subjectBreakdown",
              "scheduleSlots",
              "examCountdownStrategy",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      data.planCreatedDate = new Date().toISOString();
      data.currentCycleDay = 1;
      data.totalCycleDays = 7;

      res.json({ success: true, plan: data });
    } catch (err: any) {
      console.error("Error in /api/generate-plan:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate study plan" });
    }
  });

  // 2. AI Tutor & Homework Problem Solver
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const { subject, question, gradeLevel, studentProfile, attachment } = req.body;
      if (!question && !attachment) {
        return res.status(400).json({ success: false, error: "Question or attachment is required." });
      }

      const ai = getAI();
      const promptText = `You are APEX AI, an internet-connected, real-time grounded AI Master Tutor for High School, FBISE, and Punjab Board students.
You have live access to current board syllabi, model papers, SLO (Student Learning Outcome) mark distribution schemes, and past paper scoring rubrics.

STUDENT PROFILE & ACADEMIC SPECS:
- Student Name: ${studentProfile?.studentName || "Scholar"}
- Grade Level / Class: ${gradeLevel || studentProfile?.gradeLevel || "10th Grade / Matric"}
- Board: ${studentProfile?.boardName || "FBISE / Punjab Board"}
- Target Score Goal: ${studentProfile?.targetPercentage || "95%+"}
- Target Exam Date: ${studentProfile?.examTargetDate || "April 2027"}
- Current Subject: ${subject || "General STEM"}
- Syllabus Focus / Notes: "${studentProfile?.chapterSyllabus || "Core board curriculum"}"
- Known Weak Topics: "${studentProfile?.weakTopics || "Numerical practice & derivations"}"
${attachment ? `- Attached File / Photo: "${attachment.name}" (${attachment.type})` : ""}

STUDENT QUESTION / PROBLEM:
"${question || "Please analyze the attached image/file and solve the problem step-by-step."}"

TASK:
Provide a comprehensive, high-clarity, step-by-step academic solution tailored specifically for board exam preparation. If an image or diagram is attached, carefully analyze all visible math, physics, chemistry, or text details in the image.
Incorporate exact formulas, definitions, key concepts, board exam scoring tips (how to structure answers for max marks), common pitfalls to avoid, and a quick self-check question.
Return strict JSON adhering to the schema.`;

      let contents: any = promptText;

      if (attachment && attachment.dataUrl && attachment.dataUrl.startsWith("data:image/")) {
        const matches = attachment.dataUrl.match(/^data:(.+?);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const data = matches[2];
          contents = [
            { inlineData: { mimeType, data } },
            promptText
          ];
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              directAnswer: { type: Type.STRING, description: "Clear short core answer summary" },
              keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              stepByStepSolution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["stepNumber", "title", "explanation"],
                },
              },
              importantFormulasOrDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } },
              boardExamTips: { type: Type.STRING, description: "How to write this answer to get maximum marks in board exams" },
              commonPitfallsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              practiceCheckQuestion: { type: Type.STRING, description: "A quick test question to verify understanding" },
            },
            required: [
              "directAnswer",
              "keyConcepts",
              "stepByStepSolution",
              "importantFormulasOrDefinitions",
              "boardExamTips",
              "commonPitfallsToAvoid",
              "practiceCheckQuestion",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, answer: data });
    } catch (err: any) {
      console.error("Error in /api/ai-tutor:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process tutor question" });
    }
  });

  // 3. AI General Assessment & Practice Generator
  app.post("/api/generate-assessment", async (req, res) => {
    try {
      const {
        format = "mcqs",
        subject = "Physics",
        topic = "General Syllabus",
        difficulty = "Medium (SLO Standard)",
        numItems = 5,
        additionalInfo = "",
        studentProfile,
      } = req.body;

      const ai = getAI();
      const boardName = studentProfile?.boardName || "FBISE / Punjab Board";
      const gradeLevel = studentProfile?.gradeLevel || "10th Grade / Matric";

      const prompt = `You are a Master Board Exam Test Setter for High School and Matric (${gradeLevel}, ${boardName}).
Generate an authentic, high-yield practice assessment for the following request:

Subject: ${subject}
Topic/Chapter: ${topic}
Format / Assessment Type: ${format}
Difficulty Standard: ${difficulty}
Target Item Count / Scale: ${numItems}
Additional User Notes/Focus: "${additionalInfo}"

REQUIREMENTS BY FORMAT:
- If format is "mcqs": Generate ${numItems} multiple choice questions with exactly 4 options each, 0-indexed correct answer, detailed solution explanation, and high-scoring board tip.
- If format is "flashcards": Generate ${numItems} revision flashcards (front concept prompt, back clear concise answer/formula, category).
- If format is "short_questions": Generate ${numItems} SLO-aligned short conceptual questions (3-4 marks each), concise model answers, 3-4 bullet key scoring points, and board tips.
- If format is "detailed_questions": Generate ${Math.min(numItems, 3)} detailed long questions / numerical derivations / multi-part board problems (8-10 marks each), sub-parts if applicable, step-by-step solutions, marking scheme breakdown, and exam tips.
- If format is "full_paper": Generate a complete Model Exam Paper with Section A (3 MCQs), Section B (3 Short Questions), Section C (2 Long Questions), instructions, total marks (e.g. 50-75 marks), and 60-90 min time limit.

Return strict JSON conforming to the schema.`;

      // Define Schema per format or unified optional fields
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              format: { type: Type.STRING },
              totalMarks: { type: Type.NUMBER },
              questionsMCQ: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                  },
                  required: ["id", "questionText", "options", "correctIndex", "explanation", "examTip"],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ["id", "front", "back", "category"],
                },
              },
              shortQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                    modelAnswer: { type: Type.STRING },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    boardExamTip: { type: Type.STRING },
                  },
                  required: ["id", "questionText", "marks", "modelAnswer", "keyPoints", "boardExamTip"],
                },
              },
              detailedQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                    subParts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          partLabel: { type: Type.STRING },
                          text: { type: Type.STRING },
                          marks: { type: Type.NUMBER },
                        },
                        required: ["partLabel", "text", "marks"],
                      },
                    },
                    stepByStepSolution: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          stepNumber: { type: Type.NUMBER },
                          title: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                        },
                        required: ["stepNumber", "title", "explanation"],
                      },
                    },
                    markingScheme: { type: Type.STRING },
                    boardExamTip: { type: Type.STRING },
                  },
                  required: ["id", "questionText", "marks", "stepByStepSolution", "markingScheme", "boardExamTip"],
                },
              },
              fullExamPaper: {
                type: Type.OBJECT,
                properties: {
                  paperTitle: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  boardName: { type: Type.STRING },
                  gradeLevel: { type: Type.STRING },
                  totalMarks: { type: Type.NUMBER },
                  timeAllowedMinutes: { type: Type.NUMBER },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sectionA_MCQs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        questionText: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                        examTip: { type: Type.STRING },
                      },
                      required: ["id", "questionText", "options", "correctIndex", "explanation", "examTip"],
                    },
                  },
                  sectionB_ShortQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        questionText: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                        modelAnswer: { type: Type.STRING },
                        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        boardExamTip: { type: Type.STRING },
                      },
                      required: ["id", "questionText", "marks", "modelAnswer", "keyPoints", "boardExamTip"],
                    },
                  },
                  sectionC_DetailedQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        questionText: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                        stepByStepSolution: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              stepNumber: { type: Type.NUMBER },
                              title: { type: Type.STRING },
                              explanation: { type: Type.STRING },
                            },
                            required: ["stepNumber", "title", "explanation"],
                          },
                        },
                        markingScheme: { type: Type.STRING },
                        boardExamTip: { type: Type.STRING },
                      },
                      required: ["id", "questionText", "marks", "stepByStepSolution", "markingScheme", "boardExamTip"],
                    },
                  },
                },
                required: ["paperTitle", "subject", "totalMarks", "timeAllowedMinutes", "instructions", "sectionA_MCQs", "sectionB_ShortQuestions", "sectionC_DetailedQuestions"],
              },
            },
            required: ["title", "subject", "topic", "format"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      data.id = `asmt-${Date.now()}`;
      data.createdAt = new Date().toISOString();
      res.json({ success: true, assessment: data });
    } catch (err: any) {
      console.error("Error in /api/generate-assessment:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate assessment" });
    }
  });

  // 3b. AI Quiz & Practice Generator (Legacy Alias)
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { subject, topic, questionCount, difficulty } = req.body;

      const ai = getAI();
      const prompt = `Generate a high-yield exam practice quiz for Matric / High School level.
Subject: ${subject || "Physics"}
Topic: ${topic || "Work, Energy & Power"}
Difficulty: ${difficulty || "Medium"}
Count: ${questionCount || 5} questions.

Strictly format the JSON to match the schema. Each question must have exactly 4 options, a correct option index (0-3), detailed solution, and relevant board exam tip.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                  },
                  required: ["id", "questionText", "options", "correctIndex", "explanation", "examTip"],
                },
              },
            },
            required: ["quizTitle", "subject", "topic", "questions"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, quiz: data });
    } catch (err: any) {
      console.error("Error in /api/generate-quiz:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate quiz" });
    }
  });

  // 4. AI Flashcards & Chapter Summarizer
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { subject, chapterTitle, notesText } = req.body;

      const ai = getAI();
      const prompt = `Summarize and create high-retention flashcards for Matric/High School exam review.
Subject: ${subject || "Chemistry"}
Chapter/Topic: ${chapterTitle || "Chemical Bonding"}
Notes/Text Content: "${notesText || "Types of chemical bonds: Ionic, Covalent, Coordinate Covalent, Metallic. Electrostatic forces, sharing of valence electrons, Lewis structures, polar vs non-polar molecules."}"

Generate key chapter takeaways, 5 critical definitions, and 6 flashcards (Front prompt, Back answer). Return strict JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chapterTitle: { type: Type.STRING },
              subject: { type: Type.STRING },
              summaryPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                  required: ["term", "definition"],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ["id", "front", "back", "category"],
                },
              },
            },
            required: ["chapterTitle", "subject", "summaryPoints", "keyTerms", "flashcards"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, summary: data });
    } catch (err: any) {
      console.error("Error in /api/generate-summary:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate summary" });
    }
  });

  // 5. AI Weak Topic Diagnostic & Exam Readiness
  app.post("/api/diagnostic-report", async (req, res) => {
    try {
      const {
        subjectPerformances,
        examDaysLeft,
        studentProfile,
        totalFocusMinutes,
        scheduleStats,
        quizStats,
      } = req.body;

      const ai = getAI();
      const prompt = `You are the lead academic analyst for Obsidian Apex.
Analyze the following comprehensive student progress data:
- Student Name: ${studentProfile?.studentName || "Scholar"}
- Grade Level / Class: ${studentProfile?.gradeLevel || "10th Grade / Matric"}
- Educational Board: ${studentProfile?.boardName || "FBISE / Punjab Board"}
- Target Score Goal: ${studentProfile?.targetPercentage || "95%+"}
- Days Remaining Until Board Exam: ${examDaysLeft || 60} days
- Total Focus Study Time Logged: ${totalFocusMinutes || 0} minutes (${Math.round((totalFocusMinutes || 0) / 60)} hours)
- Schedule Task Execution: ${scheduleStats?.completedCount || 0} completed out of ${scheduleStats?.totalCount || 0} scheduled tasks (${scheduleStats?.completionRate || 0}% rate)
- Study Vault Activity: ${quizStats?.totalItems || 0} active flashcards and assessment items created
- Detailed Subject Mastery Metrics: ${JSON.stringify(subjectPerformances || [], null, 2)}

TASK:
Perform a deep AI diagnostic analysis. 
1. Calculate a realistic board exam readiness score (0-100%) and predicted grade tier based on syllabus completion, confidence distribution, and study discipline.
2. Provide a clear overall status overview highlighting key strengths and immediate improvement priorities.
3. Identify top high-risk weak topics along with specific, actionable intervention advice.
4. Construct a 7-day high-yield revision blueprint tailored to weak topics and remaining exam days.
5. Provide an inspiring, high-impact Apex Mentor motto.

Return strict JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readinessScore: { type: Type.NUMBER },
              gradePrediction: { type: Type.STRING, description: "e.g. A+ Grade (85-95% expected)" },
              overallStatus: { type: Type.STRING },
              criticalWeakAreas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                  },
                  required: ["subject", "topic", "riskLevel", "recommendedAction"],
                },
              },
              actionPlan7Days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    task: { type: Type.STRING },
                    targetHours: { type: Type.NUMBER },
                  },
                  required: ["dayNumber", "task", "targetHours"],
                },
              },
              motivationalDirective: { type: Type.STRING },
            },
            required: [
              "readinessScore",
              "gradePrediction",
              "overallStatus",
              "criticalWeakAreas",
              "actionPlan7Days",
              "motivationalDirective",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, report: data });
    } catch (err: any) {
      console.error("Error in /api/diagnostic-report:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to run diagnostic" });
    }
  });

  // 5. AI Emergency Leave & Schedule Re-Planner
  app.post("/api/replan-schedule", async (req, res) => {
    try {
      const { changeInstruction, currentSchedule, studentProfile } = req.body;
      const ai = getAI();

      const prompt = `You are the Internet-Connected Apex AI Schedule Assistant.
You are fully connected to the student's academic specs, curriculum requirements, and exam goals.

STUDENT ACADEMIC PROFILE & SPECS:
- Name: ${studentProfile?.studentName || "Scholar"}
- Grade / Class: ${studentProfile?.gradeLevel || "10th Grade / Matric"}
- Board: ${studentProfile?.boardName || "FBISE / Punjab Board"}
- Target Exam Date: ${studentProfile?.examTargetDate || "April 2027"}
- Target Goal: ${studentProfile?.targetPercentage || "95%+"}
- Daily Study Hours: ${studentProfile?.dailyStudyHours || 4} hours/day
- Preferred Time Shifts: ${studentProfile?.preferredStudyTime || "Evening Shifts"}
- Syllabus Notes: "${studentProfile?.chapterSyllabus || "Core syllabus topics"}"

CURRENT SCHEDULE SLOTS:
${JSON.stringify(currentSchedule || [], null, 2)}

STUDENT CHANGE INSTRUCTION:
"${changeInstruction || "I need an emergency day off today, please re-adjust my schedule."}"

RULES FOR RE-PLANNING:
1. EMERGENCY WORK / LEAVE: If the user indicates emergency work, sick leave, or unexpected event for a specific day or time (e.g., "emergency today", "leave on Friday"), ONLY clear or remove study slots for that specific emergency time window/day. Do NOT alter completed tasks. Move uncompleted topics into remaining open days or upcoming slots.
2. SPECIFIC DAY RE-PLAN: If the user requests to change a specific day (e.g., "change Tuesday's schedule" or "add Chemistry on Thursday"), ONLY modify slots for that target day while keeping other days unchanged.
3. WHOLE WEEK RE-PLAN: If the user explicitly asks to replan or rebalance the entire week, reorganize all uncompleted topics across the 7 days logically based on board subject priorities.
4. COMPLETED TASKS PRESERVATION: Never unmark or clear tasks that the student has already completed.
5. Provide a warm, supportive, and clear AI explanation message describing exactly what changes were made.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiExplanation: { type: Type.STRING, description: "Friendly AI response explaining how the schedule was re-adjusted" },
              updatedSlots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    activityType: { type: Type.STRING },
                    durationMinutes: { type: Type.NUMBER },
                    day: { type: Type.STRING, description: "Day label e.g. Today, Tomorrow, Monday, Tuesday, etc." },
                    completed: { type: Type.BOOLEAN },
                  },
                  required: ["timeSlot", "subject", "topic", "activityType", "durationMinutes"],
                },
              },
            },
            required: ["aiExplanation", "updatedSlots"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, aiExplanation: data.aiExplanation, updatedSlots: data.updatedSlots });
    } catch (err: any) {
      console.error("Error in /api/replan-schedule:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to replan schedule" });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Obsidian Apex server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
