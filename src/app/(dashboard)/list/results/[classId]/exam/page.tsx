import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClassHeader from "../../class-header";
import StudentTable from "../../student-table";
import Tabs from "../tabs";

interface ExamPageProps {
  params: {
    classId: string;
  };
}

const ExamPage = async ({ params }: ExamPageProps) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    notFound();
  }

  // Fetch class details
  const selectedClass = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      lessons: {
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
              surname: true
            }
          }
        }
      }
    }
  });

  if (!selectedClass) {
    notFound();
  }

  // Check if user has access to this class
  if (role !== "admin" && !selectedClass.lessons.some(lesson => lesson.teacher.id === currentUserId)) {
    notFound();
  }

  // Fetch students and exams for this class
  const [students, exams, existingGrades] = await prisma.$transaction([
    prisma.student.findMany({
      where: { classId },
      select: { 
        id: true, 
        name: true, 
        surname: true,
        class: {
          select: {
            id: true,
            name: true
          }
        }
      },
    }),
    prisma.exam.findMany({
      where: { lesson: { classId } },
      select: { 
        id: true, 
        title: true,
        startTime: true,
        endTime: true,
        lesson: {
          select: {
            class: { select: { id: true, name: true } },
            teacher: { select: { id: true, name: true, surname: true } },
          }
        }
      },
    }),
    prisma.result.findMany({
      where: {
        exam: {
          lesson: { classId }
        }
      },
      select: {
        id: true,
        score: true,
        examId: true,
        studentId: true
      }
    })
  ]);

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      <ClassHeader 
        className={selectedClass.name}
        teacherName={selectedClass.lessons[0]?.teacher.name}
        teacherSurname={selectedClass.lessons[0]?.teacher.surname}
      />
      
      <Tabs classId={params.classId} className="mb-6" />

      <StudentTable 
        students={students.map(student => ({
          id: student.id.toString(),
          name: student.name,
          surname: student.surname,
          className: student.class.name
        }))}
        exams={exams.map(exam => ({
          id: exam.id.toString(),
          title: exam.title,
          className: exam.lesson.class.name,
          teacherId: exam.lesson.teacher.id,
          date: exam.startTime.toISOString()
        }))}
        assignments={[]}
        role={role}
        currentUserId={currentUserId || undefined}
        existingGrades={existingGrades.map(grade => ({
          id: grade.id.toString(),
          score: grade.score,
          assessmentId: grade.examId?.toString() || '',
          studentId: grade.studentId
        }))}
      />
    </div>
  );
};

export default ExamPage; 