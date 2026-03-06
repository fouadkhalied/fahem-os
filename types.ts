import React from 'react';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum Language {
  AR = 'ar',
  EN = 'en'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
}

export interface Teacher extends User {
  specialization: string;
  hiringDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  phone: string;
  assignedClasses: string[]; // Class IDs
  academicLoad: number; // Hours per week
}

export interface Admin extends User {
  title: string;
  permissions: string[];
  department: string;
  lastActive: string;
}

export interface Fee {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface InstallmentPlan {
  id: string;
  title: string;
  totalAmount: number;
  installments: Installment[];
}

export interface ReportCard {
  id: string;
  title: string; // e.g., "Term 1 Report", "Certificate of Excellence"
  academicYear: string;
  issueDate: string;
  gradeAverage: string | number;
  type: 'Report Card' | 'Certificate' | 'Transcript';
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  attendance: number;
  performance: number;
  status: 'Active' | 'At Risk' | 'Inactive';
  fees: Fee[];
  installmentPlans: InstallmentPlan[];
  reportCards: ReportCard[];
}

export interface LessonPlan {
  id?: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  objectives: string[];
  materials: string[];
  outline: {
    duration: string;
    activity: string;
    description: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'up' | 'down';
}

export interface NavItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  view: string;
}

// --- Curriculum & Content Types ---

export type CurriculumSystem = 'National' | 'IG' | 'IB' | 'American';

export interface ContentResource {
  id: string;
  title: string;
  type: 'Document' | 'Video' | 'Presentation' | 'Link' | 'SCORM';
  url: string;
  source: 'Local' | 'Google Drive' | 'OneDrive';
  size?: string;
  uploadedAt?: string;
}

export interface LibraryFolder {
  id: string;
  name: string;
  resources: ContentResource[];
  subFolders: LibraryFolder[];
}

export interface AcademicWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  topics: string[];
}

export interface SubjectNode {
  id: string;
  name: string;
  weeks: AcademicWeek[];
  resources: ContentResource[];
  folders: LibraryFolder[];
  lessonPlans: LessonPlan[];
  assignedTeacherId?: string;
}

export interface GradeLevelNode {
  id: string;
  name: string;
  subjects: SubjectNode[];
}

export interface CurriculumTree {
  id: string;
  system: CurriculumSystem;
  academicYear: string;
  grades: GradeLevelNode[];
}

// --- Gradebook Types ---

export type AssessmentCategory = 'Homework' | 'Quiz' | 'Project' | 'Exam' | 'Participation' | string;

export interface GradingTerm {
  id: string;
  name: string; // Term 1, Semester 1
  startDate: string;
  endDate: string;
  status: 'Active' | 'Locked' | 'Archived';
}

export interface Assessment {
  id: string;
  title: string;
  category: AssessmentCategory;
  maxScore: number;
  date: string;
  termId: string;
}

export interface GradeEntry {
  studentId: string;
  assessmentId: string;
  score: number | null; // null represents not graded yet
  status: 'Submitted' | 'Graded' | 'Missing' | 'Late' | 'Excused';
  feedback?: string;
}

export interface GradingScaleRule {
  grade: string;
  min: number;
  max: number;
  color: string;
}

export interface GradebookConfig {
  id: string;
  classId: string;
  subjectName: string;
  categoryWeights: Record<string, number>; // e.g. { Exam: 40, Quiz: 20 }
  passingScore: number;
  gradingScale: GradingScaleRule[];
  terms: GradingTerm[];
  assessments: Assessment[];
  entries: GradeEntry[];
}

// --- Class Management & Attendance Types ---

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused' | 'Left Early';

export interface ClassSection {
  id: string;
  name: string; // e.g. "10-A"
  gradeLevel: string;
  curriculumSystem: CurriculumSystem;
  academicYear: string;
  room: string;
  teacherId: string; // Homeroom teacher
  students: string[]; // List of Student IDs
  schedule: {
    day: string;
    periods: { subject: string; time: string }[];
  }[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  timestamp: string; // ISO time of scan
  method: 'QR' | 'Manual' | 'Geo';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Active' | 'Closed';
  subject: string;
  records: AttendanceRecord[];
}