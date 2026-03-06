import { Student, UserRole, KPI, Fee, ReportCard, InstallmentPlan, CurriculumTree, GradeLevelNode, SubjectNode, AcademicWeek, CurriculumSystem, GradebookConfig, ClassSection, AttendanceSession, Teacher, Admin } from '../types';

// --- Generators ---
const generateFees = (type: 'Standard' | 'Scholarship' | 'Late'): Fee[] => {
  const baseFees: Fee[] = [
    { id: 'f1', title: 'Technology Resource Fee', amount: 850, dueDate: '2023-09-01', status: 'Paid' },
    { id: 'f2', title: 'Uniform & Kits', amount: 1200, dueDate: '2023-09-05', status: 'Paid' },
  ];

  if (type === 'Late') {
    return [...baseFees, { id: 'f_late', title: 'Late Registration Penalty', amount: 500, dueDate: '2023-10-01', status: 'Overdue' }];
  }
  if (type === 'Scholarship') {
    return [{ id: 'f1', title: 'Technology Resource Fee', amount: 850, dueDate: '2023-09-01', status: 'Paid' }];
  }
  return [...baseFees, { id: 'f3', title: 'Spring Field Trip', amount: 300, dueDate: '2024-03-15', status: 'Pending' }];
};

const generateInstallmentPlans = (type: 'Standard' | 'Late'): InstallmentPlan[] => {
  const annualTotal = 24000;
  
  return [{
    id: 'plan_tuition_23_24',
    title: 'Annual Tuition 2023/2024',
    totalAmount: annualTotal,
    installments: [
      { id: 'ins1', dueDate: '2023-09-01', amount: 8000, status: type === 'Late' ? 'Overdue' : 'Paid' },
      { id: 'ins2', dueDate: '2024-01-01', amount: 8000, status: 'Pending' },
      { id: 'ins3', dueDate: '2024-04-01', amount: 8000, status: 'Pending' }
    ]
  }];
};

const generateReportCards = (studentName: string, avg: number): ReportCard[] => {
  const reports: ReportCard[] = [
    {
      id: 'rc_t1',
      title: 'Term 1 Progress Report',
      academicYear: '2023-2024',
      issueDate: '2023-12-15',
      gradeAverage: `${avg}%`,
      type: 'Report Card'
    }
  ];

  if (avg >= 90) {
    reports.push({
      id: 'cert_honors',
      title: 'Principal\'s List Award',
      academicYear: '2023-2024',
      issueDate: '2024-01-10',
      gradeAverage: 'High Distinction',
      type: 'Certificate'
    });
  }
  return reports;
};

// --- Mock Students ---
export const STUDENTS: Student[] = [
  { 
    id: 'ST-2023-001', name: 'Layla Al-Mansour', grade: 'Grade 10', attendance: 98, performance: 96, status: 'Active',
    fees: generateFees('Standard'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Layla Al-Mansour', 96)
  },
  { 
    id: 'ST-2023-042', name: 'Omar Farooq', grade: 'Grade 10', attendance: 82, performance: 74, status: 'At Risk',
    fees: generateFees('Late'), installmentPlans: generateInstallmentPlans('Late'), reportCards: generateReportCards('Omar Farooq', 74)
  },
  { 
    id: 'ST-2023-115', name: 'Sarah Johnson', grade: 'Grade 11', attendance: 95, performance: 92, status: 'Active',
    fees: generateFees('Standard'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Sarah Johnson', 92)
  },
  { 
    id: 'ST-2023-088', name: 'Yousef Al-Harbi', grade: 'Grade 9', attendance: 65, performance: 58, status: 'Inactive',
    fees: generateFees('Late'), installmentPlans: generateInstallmentPlans('Late'), reportCards: generateReportCards('Yousef Al-Harbi', 58)
  },
  { 
    id: 'ST-2023-202', name: 'Noura Ebrahim', grade: 'Grade 12', attendance: 99, performance: 98, status: 'Active',
    fees: generateFees('Scholarship'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Noura Ebrahim', 98)
  },
  { 
    id: 'ST-2023-305', name: 'Karim Mostafa', grade: 'Grade 10', attendance: 91, performance: 85, status: 'Active',
    fees: generateFees('Standard'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Karim Mostafa', 85)
  },
  { 
    id: 'ST-2023-310', name: 'Dina Kamal', grade: 'Grade 11', attendance: 88, performance: 79, status: 'Active',
    fees: generateFees('Standard'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Dina Kamal', 79)
  },
  { 
    id: 'ST-2023-401', name: 'Fahad Al-Saud', grade: 'Grade 9', attendance: 94, performance: 88, status: 'Active',
    fees: generateFees('Standard'), installmentPlans: generateInstallmentPlans('Standard'), reportCards: generateReportCards('Fahad Al-Saud', 88)
  }
];

// --- Mock Teachers ---
export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'u1',
    name: 'Sarah Al-Majed',
    role: UserRole.TEACHER,
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    email: 'sarah.majed@faheem.edu',
    specialization: 'Mathematics',
    hiringDate: '2019-08-15',
    employmentType: 'Full-time',
    phone: '+966 50 123 4567',
    assignedClasses: ['c-10a', 'c-11b'],
    academicLoad: 18
  },
  {
    id: 't2',
    name: 'Ahmed Khalil',
    role: UserRole.TEACHER,
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    email: 'ahmed.khalil@faheem.edu',
    specialization: 'Physics',
    hiringDate: '2021-01-10',
    employmentType: 'Full-time',
    phone: '+966 55 987 6543',
    assignedClasses: ['c-10a'],
    academicLoad: 16
  },
  {
    id: 't3',
    name: 'Emily Davis',
    role: UserRole.TEACHER,
    avatar: 'https://i.pravatar.cc/150?u=emily',
    email: 'emily.davis@faheem.edu',
    specialization: 'English Literature',
    hiringDate: '2022-08-20',
    employmentType: 'Contract',
    phone: '+966 54 111 2233',
    assignedClasses: ['c-11b'],
    academicLoad: 12
  }
];

// --- Mock Admins ---
export const MOCK_ADMINS: Admin[] = [
  {
    id: 'adm1',
    name: 'Dr. Faisal Al-Saud',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=faisal',
    email: 'f.saud@faheem.edu',
    title: 'School Principal',
    department: 'Administration',
    permissions: ['ALL_ACCESS', 'SYSTEM_CONFIG', 'FINANCE_CONTROL'],
    lastActive: 'Active now'
  },
  {
    id: 'adm2',
    name: 'Mona Rashid',
    role: UserRole.ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=mona',
    email: 'm.rashid@faheem.edu',
    title: 'Academic Coordinator',
    department: 'Academics',
    permissions: ['CURRICULUM_EDIT', 'CLASS_ASSIGNMENT', 'TEACHER_EVALUATION'],
    lastActive: '2 hours ago'
  },
  {
    id: 'adm3',
    name: 'Yasser Ali',
    role: UserRole.ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=yasser',
    email: 'y.ali@faheem.edu',
    title: 'Registrar',
    department: 'Admissions',
    permissions: ['STUDENT_ENROLLMENT', 'RECORDS_ACCESS'],
    lastActive: '5 mins ago'
  }
];

// --- KPIs ---
export const ADMIN_KPIS: KPI[] = [
  { label: 'Total Enrollment', value: 1250, trend: 5.2, trendDirection: 'up' },
  { label: 'Avg Daily Attendance', value: '94.8%', trend: 0.4, trendDirection: 'up' },
  { label: 'Tuition Collection', value: '82%', trend: 2.1, trendDirection: 'down' },
  { label: 'Staff Satisfaction', value: '4.8/5', trend: 0, trendDirection: 'up' },
];

export const TEACHER_KPIS: KPI[] = [
  { label: 'Active Students', value: 142, trend: 2, trendDirection: 'up' },
  { label: 'Lesson Completion', value: '91%', trend: 15, trendDirection: 'up' },
  { label: 'Avg Assessment Score', value: '84%', trend: 3.5, trendDirection: 'up' },
  { label: 'Parent Engagement', value: 'High', trend: 0, trendDirection: 'up' },
];

export const PERFORMANCE_DATA = [
  { name: 'Week 1', math: 72, science: 74, arabic: 80 },
  { name: 'Week 2', math: 75, science: 76, arabic: 82 },
  { name: 'Week 3', math: 74, science: 79, arabic: 84 },
  { name: 'Week 4', math: 78, science: 82, arabic: 85 },
  { name: 'Week 5', math: 82, science: 85, arabic: 86 },
  { name: 'Week 6', math: 85, science: 84, arabic: 88 },
  { name: 'Week 7', math: 84, science: 88, arabic: 89 },
  { name: 'Week 8', math: 88, science: 90, arabic: 91 },
];

// --- Curriculum Generator Utilities ---

const generateWeeks = (): AcademicWeek[] => {
  const weeks: AcademicWeek[] = [];
  let currentDate = new Date('2023-09-03'); // First Sunday of Sept

  for (let i = 1; i <= 36; i++) {
    const end = new Date(currentDate);
    end.setDate(currentDate.getDate() + 4); // Thursday

    weeks.push({
      id: `w${i}`,
      weekNumber: i,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      topics: []
    });

    // Skip to next Sunday
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return weeks;
};

export const generateCurriculumTree = (system: CurriculumSystem): CurriculumTree => {
  let grades: string[] = [];
  let subjects: string[] = [];

  switch (system) {
    case 'National':
      grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
      subjects = ['Arabic Language', 'Islamic Studies', 'Mathematics', 'General Science', 'English Language', 'Social Studies', 'Digital Skills', 'Art Education'];
      break;
    case 'IG':
      grades = ['Year 7', 'Year 8', 'Year 9', 'Year 10 (IGCSE)', 'Year 11 (IGCSE)', 'Year 12 (AS)', 'Year 13 (A2)'];
      subjects = ['Mathematics', 'English Literature', 'Physics', 'Chemistry', 'Biology', 'Business Studies', 'Computer Science'];
      break;
    case 'IB':
      grades = ['PYP 1', 'PYP 2', 'MYP 1', 'MYP 2', 'MYP 3', 'DP 1', 'DP 2'];
      subjects = ['Theory of Knowledge', 'Language A', 'Language B', 'Individuals & Societies', 'Sciences', 'Mathematics', 'Arts'];
      break;
    case 'American':
      grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
      subjects = ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Electives', 'Physical Education'];
      break;
  }

  const gradeNodes: GradeLevelNode[] = grades.map((gradeName, idx) => ({
    id: `g-${idx}`,
    name: gradeName,
    subjects: subjects.map((subName, sIdx) => ({
      id: `s-${idx}-${sIdx}`,
      name: subName,
      weeks: generateWeeks(),
      resources: [
        { id: `res-${sIdx}-1`, title: 'Course Syllabus', type: 'Document', url: '#', source: 'Local', size: '2.4 MB', uploadedAt: '2023-09-01' },
        { id: `res-${sIdx}-2`, title: 'Textbook Chapter 1', type: 'Document', url: '#', source: 'Google Drive', size: '12 MB', uploadedAt: '2023-09-05' }
      ],
      folders: [
        {
          id: `f-${idx}-${sIdx}-1`,
          name: 'Assessments',
          resources: [],
          subFolders: []
        },
        {
          id: `f-${idx}-${sIdx}-2`,
          name: 'Presentations',
          resources: [],
          subFolders: []
        }
      ],
      lessonPlans: sIdx === 0 ? [{
        id: 'lp-1',
        topic: 'Introduction to the Subject',
        gradeLevel: gradeName,
        subject: subName,
        objectives: ['Understand key concepts', 'Identify course requirements'],
        materials: ['Textbook', 'Whiteboard'],
        outline: [{ duration: '10 min', activity: 'Ice Breaker', description: 'Class introduction' }],
        quiz: []
      }] : [],
      assignedTeacherId: undefined
    }))
  }));

  return {
    id: `curr-${Date.now()}`,
    system,
    academicYear: '2023-2024',
    grades: gradeNodes
  };
};

// --- Mock Gradebook Data ---
export const MOCK_GRADEBOOK: GradebookConfig = {
  id: 'gb-101',
  classId: 'c-10a',
  subjectName: 'Mathematics',
  categoryWeights: {
    'Homework': 10,
    'Quiz': 20,
    'Project': 30,
    'Exam': 40,
    'Participation': 0
  },
  passingScore: 50,
  gradingScale: [
    { grade: 'A', min: 90, max: 100, color: 'text-green-600' },
    { grade: 'B', min: 80, max: 89, color: 'text-blue-600' },
    { grade: 'C', min: 70, max: 79, color: 'text-yellow-600' },
    { grade: 'D', min: 60, max: 69, color: 'text-orange-600' },
    { grade: 'F', min: 0, max: 59, color: 'text-red-600' }
  ],
  terms: [
    { id: 't1', name: 'Term 1', startDate: '2023-09-01', endDate: '2023-12-20', status: 'Active' },
    { id: 't2', name: 'Term 2', startDate: '2024-01-05', endDate: '2024-03-30', status: 'Locked' },
    { id: 't3', name: 'Term 3', startDate: '2024-04-10', endDate: '2024-06-20', status: 'Active' }
  ],
  assessments: [
    { id: 'a1', title: 'Algebra Quiz', category: 'Quiz', maxScore: 20, date: '2023-09-15', termId: 't1' },
    { id: 'a2', title: 'Geometry Project', category: 'Project', maxScore: 100, date: '2023-10-10', termId: 't1' },
    { id: 'a3', title: 'Midterm Exam', category: 'Exam', maxScore: 100, date: '2023-11-05', termId: 't1' },
    { id: 'a4', title: 'Weekly HW 1', category: 'Homework', maxScore: 10, date: '2023-09-07', termId: 't1' }
  ],
  entries: [
    // Layla
    { studentId: 'ST-2023-001', assessmentId: 'a1', score: 19, status: 'Graded' },
    { studentId: 'ST-2023-001', assessmentId: 'a2', score: 98, status: 'Graded' },
    { studentId: 'ST-2023-001', assessmentId: 'a3', score: 95, status: 'Graded' },
    { studentId: 'ST-2023-001', assessmentId: 'a4', score: 10, status: 'Graded' },
    // Omar
    { studentId: 'ST-2023-042', assessmentId: 'a1', score: 12, status: 'Graded' },
    { studentId: 'ST-2023-042', assessmentId: 'a2', score: 0, status: 'Missing' },
    { studentId: 'ST-2023-042', assessmentId: 'a3', score: 65, status: 'Graded' },
    { studentId: 'ST-2023-042', assessmentId: 'a4', score: 7, status: 'Late' },
     // Karim
    { studentId: 'ST-2023-305', assessmentId: 'a1', score: 18, status: 'Graded' },
    { studentId: 'ST-2023-305', assessmentId: 'a2', score: 88, status: 'Graded' },
    { studentId: 'ST-2023-305', assessmentId: 'a3', score: 85, status: 'Graded' },
    { studentId: 'ST-2023-305', assessmentId: 'a4', score: null, status: 'Excused' },
    // Sarah
    { studentId: 'ST-2023-115', assessmentId: 'a1', score: null, status: 'Submitted' },
    { studentId: 'ST-2023-115', assessmentId: 'a2', score: 92, status: 'Graded' },
    { studentId: 'ST-2023-115', assessmentId: 'a3', score: null, status: 'Submitted' }
  ]
};

// --- Mock Classes & Attendance ---

export const CLASSES: ClassSection[] = [
  {
    id: 'c-10a',
    name: '10-A',
    gradeLevel: 'Grade 10',
    curriculumSystem: 'National',
    academicYear: '2023-2024',
    room: '102',
    teacherId: 'u1',
    students: STUDENTS.filter(s => s.grade === 'Grade 10').map(s => s.id),
    schedule: [
      { day: 'Sunday', periods: [{ subject: 'Mathematics', time: '08:00' }, { subject: 'Science', time: '09:00' }] },
      { day: 'Monday', periods: [{ subject: 'Mathematics', time: '10:00' }] }
    ]
  },
  {
    id: 'c-11b',
    name: '11-B',
    gradeLevel: 'Grade 11',
    curriculumSystem: 'American',
    academicYear: '2023-2024',
    room: '205',
    teacherId: 'u1',
    students: STUDENTS.filter(s => s.grade === 'Grade 11').map(s => s.id),
    schedule: [
      { day: 'Tuesday', periods: [{ subject: 'Physics', time: '08:00' }, { subject: 'Chemistry', time: '09:00' }] },
      { day: 'Wednesday', periods: [{ subject: 'Physics', time: '10:00' }] }
    ]
  },
  {
    id: 'c-12c',
    name: '12-C',
    gradeLevel: 'Grade 12',
    curriculumSystem: 'IB',
    academicYear: '2024-2025',
    room: '301',
    teacherId: 'u1',
    students: STUDENTS.filter(s => s.grade === 'Grade 12').map(s => s.id),
    schedule: [
      { day: 'Thursday', periods: [{ subject: 'Biology', time: '08:00' }, { subject: 'English', time: '09:00' }] },
      { day: 'Friday', periods: [{ subject: 'Biology', time: '10:00' }] }
    ]
  }
];

export const MOCK_ATTENDANCE_SESSION: AttendanceSession = {
  id: 'sess-001',
  classId: 'c-10a',
  date: new Date().toISOString().split('T')[0],
  startTime: '08:00',
  endTime: '09:00',
  status: 'Active',
  subject: 'Mathematics',
  records: [
    { id: 'rec-1', sessionId: 'sess-001', studentId: 'ST-2023-001', status: 'Present', timestamp: '08:02', method: 'QR' }
  ]
};