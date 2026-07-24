export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  thumbnail: string | null;
  modules: Module[];
  isPublished: boolean;
  position: number;
  _count: { enrollments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
  videoUrl: string | null;
  content: string | null;
  duration: number | null;
  position: number;
  quiz: { id: string; passingScore: number; maxAttempts: number } | null;
  assignment: { id: string; submissionType: string; dueDays: number | null } | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  enrolledAt: string;
  completedAt: string | null;
  course?: Course;
  progress?: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  maxPercentage: number;
  status: "IN_PROGRESS" | "COMPLETED";
  timeSpent: number;
  completedAt: string | null;
  lesson?: Lesson;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  answers: GradedAnswer[];
  passed: boolean;
  attemptedAt: string;
}

export interface GradedAnswer {
  questionIndex: number;
  selectedAnswer: number;
  correctAnswer: number;
  correct: boolean;
}

export interface Assignment {
  id: string;
  lessonId: string;
  instructions: string | null;
  submissionType: string;
  dueDays: number | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string;
  submittedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  verificationCode: string;
  issuedAt: string;
  status?: string;
  revokedAt?: string | null;
  course?: { title: string; slug: string };
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  criteria: string | null;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface SchoolStats {
  enrollments: number;
  completedLessons: number;
  certificates: number;
  badges: number;
  streak: number;
}
