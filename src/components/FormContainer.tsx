import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: {
    teachers?: { id: string; name: string; surname: string; }[];
    grades?: { id: number; level: number; }[];
    [key: string]: any;
  };
};

const FormContainer = async ({ table, type, data, id, relatedData: initialRelatedData }: FormContainerProps) => {
  let relatedData = initialRelatedData || {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete" && !initialRelatedData) {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const allClasses = await prisma.class.findMany({
          include: { supervisor: true },
        });
        const existingSupervisors = new Set(
          allClasses
            .map(item => item.supervisor?.id)
            .filter((id): id is string => id !== undefined)
        );
        const teachersWithStatus = classTeachers.map(teacher => ({
          ...teacher,
          isSupervisor: existingSupervisors.has(teacher.id)
        }));
        relatedData = { teachers: teachersWithStatus, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam":
        // Always fetch lessons for the dropdown
        const examLessons = await prisma.lesson.findMany({
          include: {
            subject: {
              select: {
                id: true,
                name: true
              }
            },
            class: {
              select: {
                id: true,
                name: true
              }
            },
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true
              }
            }
          },
        });
        
        // If it's an update form, ensure the current lesson is included
        if (type === "update" && data?.lessonId) {
          const currentLesson = examLessons.find(lesson => lesson.id === data.lessonId);
          if (!currentLesson) {
            const lesson = await prisma.lesson.findUnique({
              where: { id: data.lessonId },
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                class: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    surname: true
                  }
                }
              }
            });
            if (lesson) {
              examLessons.push(lesson);
            }
          }
        }

        relatedData = { lessons: examLessons };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      default:
        break;
    }
  }
  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;

