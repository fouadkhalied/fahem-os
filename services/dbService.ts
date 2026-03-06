import { db } from '../db';
import {
    users, students, teachers, subjects,
    curriculumSystems, gradeLevels, subjectTeachers,
    lessonPlans,
} from '../db/schema';
import { eq, and } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewStudentData {
    name: string;
    email?: string;
    gradeLevel: string;
    dob?: string;
    status?: 'Active' | 'At Risk' | 'Inactive';
}

export interface NewTeacherData {
    name: string;
    email: string;
    specialization: string;
    hiringDate: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract';
    phone?: string;
}

export interface NewSubjectData {
    code: string;
    nameEn: string;
    nameAr: string;
    department: string;
    gradeLevelId: string;
    gradeLevel: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const dbService = {

    // ── Students ───────────────────────────────────────────────────────────────

    async getStudents() {
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
                role: users.role,
                grade: students.gradeLevel,
                status: students.status,
                attendance: students.attendanceScore,
                performance: students.performanceScore,
            })
            .from(users)
            .innerJoin(students, eq(users.id, students.id));

        return results.map(r => ({
            ...r,
            attendance: Number(r.attendance || 0),
            performance: Number(r.performance || 0),
            status: r.status || 'Active',
            fees: [],
            installmentPlans: [],
            reportCards: [],
        }));
    },

    async addStudent(data: NewStudentData) {
        return await db.transaction(async (tx) => {
            const userId = crypto.randomUUID();
            await tx.insert(users).values({
                id: userId,
                name: data.name,
                email: data.email,
                role: 'STUDENT',
            });
            await tx.insert(students).values({
                id: userId,
                gradeLevel: data.gradeLevel,
                status: (data.status ?? 'Active') as any,
                dob: data.dob,
            });
            return { id: userId, ...data };
        });
    },

    // ── Teachers ───────────────────────────────────────────────────────────────

    async getTeachers() {
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
                role: users.role,
                specialization: teachers.specialization,
                hiringDate: teachers.hiringDate,
                employmentType: teachers.employmentType,
                phone: teachers.phone,
                academicLoad: teachers.academicLoad,
            })
            .from(users)
            .innerJoin(teachers, eq(users.id, teachers.id));

        return results.map(r => ({
            ...r,
            assignedClasses: [],
            academicLoad: Number(r.academicLoad || 0),
        }));
    },

    async addTeacher(data: NewTeacherData) {
        return await db.transaction(async (tx) => {
            const userId = crypto.randomUUID();
            await tx.insert(users).values({
                id: userId,
                name: data.name,
                email: data.email,
                role: 'TEACHER',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
            });
            await tx.insert(teachers).values({
                id: userId,
                specialization: data.specialization,
                hiringDate: data.hiringDate,
                employmentType: data.employmentType as any,
                phone: data.phone,
            });
            return { id: userId, ...data };
        });
    },

    // ── Curriculum System ──────────────────────────────────────────────────────

    /** Returns the first (and only) curriculum system row, or null. */
    async getCurriculumSystem() {
        const rows = await db.select().from(curriculumSystems).limit(1);
        return rows[0] ?? null;
    },

    /** Delete any existing system and insert a fresh one with auto-generated grades. */
    async createCurriculumSystem(system: 'National' | 'IG' | 'IB' | 'American', academicYear: string) {
        return await db.transaction(async (tx) => {
            // Remove old system (cascades to grade_levels → subject_teachers)
            await tx.delete(curriculumSystems);

            const [newSystem] = await tx
                .insert(curriculumSystems)
                .values({ system, academicYear })
                .returning();

            // Auto-generate grade level rows for the chosen system
            const gradeNames = getGradeNamesForSystem(system);
            if (gradeNames.length > 0) {
                await tx.insert(gradeLevels).values(
                    gradeNames.map((name, i) => ({
                        curriculumSystemId: newSystem.id,
                        name,
                        orderIndex: i,
                    }))
                );
            }

            return newSystem;
        });
    },

    // ── Grade Levels ───────────────────────────────────────────────────────────

    async getGradeLevels(curriculumSystemId: string) {
        return await db
            .select()
            .from(gradeLevels)
            .where(eq(gradeLevels.curriculumSystemId, curriculumSystemId))
            .orderBy(gradeLevels.orderIndex);
    },

    // ── Subjects ───────────────────────────────────────────────────────────────

    /**
     * Fetch all subjects for a grade level, with assigned teacher IDs joined in.
     */
    async getSubjectsByGradeLevel(gradeLevelId: string) {
        // Get subjects that belong to this grade level via grade_levels.name → subjects.grade_level
        // We store the grade name on the subject row for simplicity (matches existing schema).
        const gradeRow = await db
            .select()
            .from(gradeLevels)
            .where(eq(gradeLevels.id, gradeLevelId))
            .limit(1);

        if (!gradeRow[0]) return [];

        const subjectRows = await db
            .select()
            .from(subjects)
            .where(eq(subjects.gradeLevel, gradeRow[0].name));

        // For each subject, fetch assigned teacher IDs
        const enriched = await Promise.all(
            subjectRows.map(async (s) => {
                const teacherRows = await db
                    .select({ teacherId: subjectTeachers.teacherId })
                    .from(subjectTeachers)
                    .where(eq(subjectTeachers.subjectId, s.id));

                return {
                    ...s,
                    assignedTeacherIds: teacherRows.map(t => t.teacherId),
                };
            })
        );

        return enriched;
    },

    async addSubject(data: NewSubjectData) {
        const [inserted] = await db
            .insert(subjects)
            .values({
                code: data.code,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                gradeLevel: data.gradeLevel,
                department: data.department,
            })
            .returning();
        return inserted;
    },

    async deleteSubject(subjectId: string) {
        await db.delete(subjects).where(eq(subjects.id, subjectId));
    },

    // ── Subject–Teacher assignments ────────────────────────────────────────────

    async assignTeacherToSubject(subjectId: string, teacherId: string, gradeLevelId: string) {
        await db
            .insert(subjectTeachers)
            .values({ subjectId, teacherId, gradeLevelId })
            .onConflictDoNothing();
    },

    async removeTeacherFromSubject(subjectId: string, teacherId: string) {
        await db
            .delete(subjectTeachers)
            .where(
                and(
                    eq(subjectTeachers.subjectId, subjectId),
                    eq(subjectTeachers.teacherId, teacherId)
                )
            );
    },

    // ── Lesson Plans ───────────────────────────────────────────────────────────

    async saveLessonPlan(plan: any, subjectId: string, gradeLevel: string) {
        const [inserted] = await db
            .insert(lessonPlans)
            .values({
                topic: plan.topic,
                gradeLevel,
                subjectId,
                objectives: plan.objectives,
                materials: plan.materials,
                outline: plan.outline,
                quiz: plan.quiz,
            })
            .returning();
        return inserted;
    },

    async getLessonPlansBySubject(subjectId: string) {
        return await db
            .select()
            .from(lessonPlans)
            .where(eq(lessonPlans.subjectId, subjectId));
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGradeNamesForSystem(system: string): string[] {
    switch (system) {
        case 'National':
        case 'American':
            return Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
        case 'IG':
            return ['Year 7', 'Year 8', 'Year 9', 'Year 10 (IGCSE)', 'Year 11 (IGCSE)', 'Year 12 (AS)', 'Year 13 (A2)'];
        case 'IB':
            return ['PYP 1', 'PYP 2', 'MYP 1', 'MYP 2', 'MYP 3', 'DP 1', 'DP 2'];
        default:
            return [];
    }
}