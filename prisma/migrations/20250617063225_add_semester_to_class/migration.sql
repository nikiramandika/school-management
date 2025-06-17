-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('GANJIL', 'GENAP');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "semester" "Semester" NOT NULL DEFAULT 'GANJIL';

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "semester" "Semester" NOT NULL DEFAULT 'GANJIL';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "semester" "Semester" NOT NULL DEFAULT 'GANJIL';

-- CreateTable
CREATE TABLE "SkillGrade" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "semester" "Semester" NOT NULL DEFAULT 'GANJIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillGrade_studentId_lessonId_semester_key" ON "SkillGrade"("studentId", "lessonId", "semester");

-- AddForeignKey
ALTER TABLE "SkillGrade" ADD CONSTRAINT "SkillGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGrade" ADD CONSTRAINT "SkillGrade_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
