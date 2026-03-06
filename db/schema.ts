import { pgTable, text, timestamp, uuid, pgEnum, date, integer, numeric, unique, time, jsonb, boolean } from 'drizzle-orm/pg-core';

// 1. Enums
export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT']);
export const employmentTypeEnum = pgEnum('employment_type', ['Full-time', 'Part-time', 'Contract']);
export const curriculumSystemEnum = pgEnum('curriculum_system', ['National', 'IG', 'IB', 'American']);
export const studentStatusEnum = pgEnum('student_status', ['Active', 'At Risk', 'Inactive']);
export const academicYearStatusEnum = pgEnum('academic_year_status', ['Active', 'Archived', 'Draft']);
export const termDivisionEnum = pgEnum('term_division', ['Semesters', 'Trimesters', 'Quarters']);
export const academicTermStatusEnum = pgEnum('academic_term_status', ['Active', 'Locked', 'Archived', 'Draft']);
export const gradeEntryStatusEnum = pgEnum('grade_entry_status', ['Submitted', 'Graded', 'Missing', 'Late', 'Excused']);
export const attendanceSessionStatusEnum = pgEnum('attendance_session_status', ['Active', 'Closed']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['Present', 'Absent', 'Late', 'Excused', 'Left Early']);
export const attendanceMethodEnum = pgEnum('attendance_method', ['QR', 'Manual', 'Geo']);
export const feeStatusEnum = pgEnum('fee_status', ['Paid', 'Pending', 'Overdue']);
export const notificationCategoryEnum = pgEnum('notification_category', ['ACADEMIC', 'FINANCIAL', 'BEHAVIORAL', 'ADMINISTRATIVE']);

// 2. Users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique(),
    avatar: text('avatar'),
    role: roleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Teachers
export const teachers = pgTable('teachers', {
    id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    specialization: text('specialization'),
    hiringDate: date('hiring_date'),
    employmentType: employmentTypeEnum('employment_type'),
    phone: text('phone'),
    academicLoad: integer('academic_load').default(0),
});

// 4. Class Sections
export const classSections = pgTable('class_sections', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    gradeLevel: text('grade_level').notNull(),
    curriculumSystem: curriculumSystemEnum('curriculum_system'),
    academicYear: text('academic_year').notNull(),
    room: text('room'),
    homeroomTeacherId: uuid('homeroom_teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Students
export const students = pgTable('students', {
    id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    classId: uuid('class_id').references(() => classSections.id, { onDelete: 'set null' }),
    gradeLevel: text('grade_level').notNull(),
    status: studentStatusEnum('status').default('Active'),
    dob: date('dob'),
    nationalId: text('national_id').unique(),
    enrollmentDate: date('enrollment_date'),
    attendanceScore: numeric('attendance_score').default('100'),
    performanceScore: numeric('performance_score').default('0'),
});

// 6. Teacher Classes (junction)
export const teacherClasses = pgTable('teacher_classes', {
    id: uuid('id').defaultRandom().primaryKey(),
    teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'cascade' }).notNull(),
    classId: uuid('class_id').references(() => classSections.id, { onDelete: 'cascade' }).notNull(),
    subjectName: text('subject_name').notNull(),
}, (t) => ({
    unq: unique().on(t.teacherId, t.classId, t.subjectName),
}));

// 7. Academic Years
export const academicYears = pgTable('academic_years', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    status: academicYearStatusEnum('status').default('Draft'),
    termDivision: termDivisionEnum('term_division'),
});

// 8. Academic Terms
export const academicTerms = pgTable('academic_terms', {
    id: uuid('id').defaultRandom().primaryKey(),
    academicYearId: uuid('academic_year_id').references(() => academicYears.id, { onDelete: 'cascade' }),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    startDate: date('start_date'),
    endDate: date('end_date'),
    status: academicTermStatusEnum('status').default('Draft'),
});

// 9. Subjects
export const subjects = pgTable('subjects', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').unique(),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    gradeLevel: text('grade_level').notNull(),
    credits: numeric('credits'),
    department: text('department'),
});

// 10. Assessments
export const assessments = pgTable('assessments', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    maxScore: numeric('max_score').notNull(),
    assessmentDate: date('assessment_date'),
    termId: uuid('term_id').references(() => academicTerms.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
    classId: uuid('class_id').references(() => classSections.id, { onDelete: 'cascade' }),
});

// 11. Grade Entries
export const gradeEntries = pgTable('grade_entries', {
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
    assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
    score: numeric('score'),
    status: gradeEntryStatusEnum('status').default('Graded'),
    feedback: text('feedback'),
}, (t) => ({
    pk: unique().on(t.studentId, t.assessmentId),
}));

// 12. Lesson Plans
export const lessonPlans = pgTable('lesson_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    topic: text('topic').notNull(),
    gradeLevel: text('grade_level').notNull(),
    subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'cascade' }),
    objectives: jsonb('objectives'),
    materials: jsonb('materials'),
    outline: jsonb('outline'),
    quiz: jsonb('quiz'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. Attendance Sessions
export const attendanceSessions = pgTable('attendance_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id').references(() => classSections.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
    sessionDate: date('session_date').notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    status: attendanceSessionStatusEnum('status').default('Active'),
});

// 14. Attendance Records
export const attendanceRecords = pgTable('attendance_records', {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id').references(() => attendanceSessions.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
    status: attendanceStatusEnum('status').notNull(),
    scanTime: timestamp('scan_time', { withTimezone: true }).defaultNow(),
    method: attendanceMethodEnum('method').default('Manual'),
    notes: text('notes'),
}, (t) => ({
    unq: unique().on(t.sessionId, t.studentId),
}));

// 15. Fees
export const fees = pgTable('fees', {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    amount: numeric('amount').notNull(),
    dueDate: date('due_date').notNull(),
    status: feeStatusEnum('status').default('Pending'),
});

// 16. Notification Triggers
export const notificationTriggers = pgTable('notification_triggers', {
    id: uuid('id').defaultRandom().primaryKey(),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar').notNull(),
    category: notificationCategoryEnum('category').notNull(),
    enabled: boolean('enabled').default(true),
    channels: jsonb('channels'),
    recipients: jsonb('recipients'),
    aiPurposeEn: text('ai_purpose_en'),
    aiPurposeAr: text('ai_purpose_ar'),
});

// ─── Curriculum Builder ───────────────────────────────────────────────────────

// 17. Curriculum Systems
export const curriculumSystems = pgTable('curriculum_systems', {
    id: uuid('id').defaultRandom().primaryKey(),
    system: curriculumSystemEnum('system').notNull(),
    academicYear: text('academic_year').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 18. Grade Levels
export const gradeLevels = pgTable('grade_levels', {
    id: uuid('id').defaultRandom().primaryKey(),
    curriculumSystemId: uuid('curriculum_system_id')
        .references(() => curriculumSystems.id, { onDelete: 'cascade' })
        .notNull(),
    name: text('name').notNull(),
    orderIndex: integer('order_index'),
});

// 19. Subject Teachers — pure junction table, composite PK, NO surrogate id column
export const subjectTeachers = pgTable('subject_teachers', {
    subjectId: uuid('subject_id')
        .references(() => subjects.id, { onDelete: 'cascade' })
        .notNull(),
    teacherId: uuid('teacher_id')
        .references(() => teachers.id, { onDelete: 'cascade' })
        .notNull(),
    gradeLevelId: uuid('grade_level_id')
        .references(() => gradeLevels.id, { onDelete: 'cascade' })
        .notNull(),
}, (t) => ({
    pk: unique().on(t.subjectId, t.teacherId),
}));