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
    subjects?: { id: number; name: string }[];
    classes?: { id: number; name: string }[];
    teachers?: { id: string; name: string; surname: string }[];
    lessons?: { id: number; name: string; subject: { id: number; name: string }; class: { id: number; name: string }; teacher: { id: string; name: string; surname: string } }[];
    student?: { id: string; name: string; surname: string };
    assessment?: { id: number; title: string };
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
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;
      case "result":
        // If relatedData is provided from parent component, use it
        if (initialRelatedData) {
          relatedData = initialRelatedData;
        } else {
          // Otherwise fetch all data
          const [students, exams, assignments, classes] = await prisma.$transaction([
            prisma.student.findMany({
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
              select: { 
                id: true, 
                title: true,
                lesson: {
                  select: {
                    class: { select: { id: true, name: true } },
                    teacher: { select: { id: true, name: true, surname: true } },
                  }
                }
              },
            }),
            prisma.assignment.findMany({
              select: { 
                id: true, 
                title: true,
                lesson: {
                  select: {
                    class: { select: { id: true, name: true } },
                    teacher: { select: { id: true, name: true, surname: true } },
                  }
                }
              },
            }),
            prisma.class.findMany({
              select: {
                id: true,
                name: true
              }
            })
          ]);

          // Filter based on role
          if (role === "teacher") {
            // Get all classes that the teacher teaches
            const teacherClasses = classes.filter(cls => 
              exams.some(exam => exam.lesson.class.id === cls.id && exam.lesson.teacher.id === currentUserId) ||
              assignments.some(assignment => assignment.lesson.class.id === cls.id && assignment.lesson.teacher.id === currentUserId)
            );

            // For edit case, ensure the current result's class is included
            let filteredClasses = teacherClasses;
            if (type === "update" && data) {
              const currentResult = await prisma.result.findUnique({
                where: { id: data.id },
                include: {
                  exam: {
                    include: {
                      lesson: {
                        select: {
                          class: true
                        }
                      }
                    }
                  },
                  assignment: {
                    include: {
                      lesson: {
                        select: {
                          class: true
                        }
                      }
                    }
                  }
                }
              });

              if (currentResult) {
                const currentClass = currentResult.exam?.lesson.class || currentResult.assignment?.lesson.class;
                if (currentClass && !filteredClasses.some(cls => cls.id === currentClass.id)) {
                  filteredClasses = [...filteredClasses, currentClass];
                }
              }
            }

            const filteredStudents = students.filter(student => 
              filteredClasses.some(cls => cls.id === student.class.id)
            );

            const filteredExams = exams.filter(exam => 
              exam.lesson.teacher.id === currentUserId && 
              filteredClasses.some(cls => cls.id === exam.lesson.class.id)
            );

            const filteredAssignments = assignments.filter(assignment => 
              assignment.lesson.teacher.id === currentUserId && 
              filteredClasses.some(cls => cls.id === assignment.lesson.class.id)
            );

            relatedData = {
              classes: filteredClasses,
              students: filteredStudents.map(student => ({
                ...student,
                id: student.id.toString(),
                className: student.class.name
              })),
              exams: filteredExams.map(exam => ({
                ...exam,
                id: exam.id.toString(),
                className: exam.lesson.class.name
              })),
              assignments: filteredAssignments.map(assignment => ({
                ...assignment,
                id: assignment.id.toString(),
                className: assignment.lesson.class.name
              }))
            };
          } else {
            relatedData = {
              classes,
              students: students.map(student => ({
                ...student,
                id: student.id.toString(),
                className: student.class.name
              })),
              exams: exams.map(exam => ({
                ...exam,
                id: exam.id.toString(),
                className: exam.lesson.class.name
              })),
              assignments: assignments.map(assignment => ({
                ...assignment,
                id: assignment.id.toString(),
                className: assignment.lesson.class.name
              }))
            };
          }
        }
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

