import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import StudentTable from "../../student-table";
import Tabs from "../tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  Users,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "../components/download-button";
import DownloadAllResultsPDFButton from "../components/download-all-results-pdf";

interface ExamPageProps {
  params: {
    classId: string;
  };
}

// Enhanced Header component with stats
const PageHeader = ({
  className,
  gradeLevel,
  totalStudents,
  totalExams,
  totalAssignments,
  completedExams,
  role,
}: {
  className: string;
  gradeLevel: number;
  totalStudents: number;
  totalExams: number;
  totalAssignments: number;
  completedExams: number;
  role: string;
}) => (
  <div className="space-y-6">
    {/* Navigation Breadcrumb */}
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/list/results"
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Kelas
      </Link>
    </div>

    {/* Main Header */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500 rounded-lg">
          <BarChart2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hasil Ujian {gradeLevel === 1 ? "X" : gradeLevel === 2 ? "XI" : "XII"} {className}
          </h1>
        </div>
      </div>
    </div>
  </div>
);

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
      supervisorId: true,
      grade: {
        select: {
          level: true
        }
      },
      lessons: {
        select: {
          id: true,
          name: true,
          teacher: {
            select: {
              id: true,
              name: true,
              surname: true,
            },
          },
        },
      },
    },
  });

  if (!selectedClass) {
    notFound();
  }

  // Check if user has access to this class
  if (
    role !== "admin" &&
    !selectedClass.lessons.some(
      (lesson) => lesson.teacher.id === currentUserId
    ) &&
    selectedClass.supervisorId !== currentUserId
  ) {
    notFound();
  }

  // Fetch students, exams, assignments, and existing grades for this class
  const [students, exams, assignments, existingGrades] =
    await prisma.$transaction([
      prisma.student.findMany({
        where: { classId },
        select: {
          id: true,
          name: true,
          surname: true,
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.exam.findMany({
        where: {
          lesson: {
            classId,
            ...(role !== "admin"
              ? {
                  OR: [
                    { teacherId: currentUserId! },
                    { class: { supervisorId: currentUserId! } },
                  ],
                }
              : {}),
          },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          lesson: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true, surname: true } },
            },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          lesson: {
            classId,
            ...(role !== "admin"
              ? {
                  OR: [
                    { teacherId: currentUserId! },
                    { class: { supervisorId: currentUserId! } },
                  ],
                }
              : {}),
          },
        },
        select: {
          id: true,
          title: true,
          startDate: true,
          dueDate: true,
          lesson: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true, surname: true } },
            },
          },
        },
      }),
      prisma.result.findMany({
        where: {
          OR: [
            {
              exam: {
                lesson: {
                  classId,
                  ...(role !== "admin"
                    ? {
                        OR: [
                          { teacherId: currentUserId! },
                          { class: { supervisorId: currentUserId! } },
                        ],
                      }
                    : {}),
                },
              },
            },
            {
              assignment: {
                lesson: {
                  classId,
                  ...(role !== "admin"
                    ? {
                        OR: [
                          { teacherId: currentUserId! },
                          { class: { supervisorId: currentUserId! } },
                        ],
                      }
                    : {}),
                },
              },
            },
          ],
        },
        select: {
          id: true,
          score: true,
          examId: true,
          assignmentId: true,
          studentId: true,
          exam: {
            select: {
              title: true,
              lesson: {
                select: {
                  teacher: {
                    select: {
                      name: true,
                      surname: true,
                    },
                  },
                  class: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          assignment: {
            select: {
              title: true,
              lesson: {
                select: {
                  teacher: {
                    select: {
                      name: true,
                      surname: true,
                    },
                  },
                  class: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          student: {
            select: {
              name: true,
              surname: true,
            },
          },
        },
      }),
    ]);

  // Calculate stats
  const totalStudents = students.length;
  const totalExams = exams.length;
  const totalAssignments = assignments.length;
  const completedExams = exams.filter((exam) =>
    existingGrades.some((grade) => grade.examId === exam.id)
  ).length;

  // Gabungkan hasil ujian dan tugas
  const allResults = [
    ...existingGrades
      .filter((grade) => grade.examId !== null && grade.exam)
      .map((grade) => ({
        type: "Ujian",
        title: grade.exam?.title || "-",
        studentName: `${grade.student.name} ${grade.student.surname}`,
        score: grade.score,
        teacherName: grade.exam
          ? `${grade.exam.lesson.teacher.name} ${grade.exam.lesson.teacher.surname}`
          : "-",
        className: grade.exam?.lesson.class.name || "-",
        date: grade.exam?.lesson?.class?.name ? new Date().toLocaleDateString("id-ID") : "-",
      })),
    ...existingGrades
      .filter((grade) => grade.assignmentId !== null && grade.assignment)
      .map((grade) => ({
        type: "Tugas",
        title: grade.assignment?.title || "-",
        studentName: `${grade.student.name} ${grade.student.surname}`,
        score: grade.score,
        teacherName: grade.assignment
          ? `${grade.assignment.lesson.teacher.name} ${grade.assignment.lesson.teacher.surname}`
          : "-",
        className: grade.assignment?.lesson.class.name || "-",
        date: grade.assignment?.lesson?.class?.name ? new Date().toLocaleDateString("id-ID") : "-",
      })),
  ];

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          className={selectedClass.name}
          gradeLevel={selectedClass.grade?.level}
          totalStudents={totalStudents}
          totalExams={totalExams}
          totalAssignments={totalAssignments}
          completedExams={completedExams}
          role={role || ""}
        />

        <div className="flex justify-end mb-4">
          <DownloadAllResultsPDFButton
            students={students.map((student) => ({
              id: student.id.toString(),
              name: student.name,
              surname: student.surname,
            }))}
            exams={exams.map((exam) => ({
              id: exam.id.toString(),
              title: exam.title,
              type: "Ujian",
            }))}
            assignments={assignments.map((assignment) => ({
              id: assignment.id.toString(),
              title: assignment.title,
              type: "Tugas",
            }))}
            existingGrades={existingGrades.map((grade) => ({
              studentId: grade.studentId,
              assessmentId:
                grade.examId != null
                  ? `E-${grade.examId}`
                  : grade.assignmentId != null
                  ? `A-${grade.assignmentId}`
                  : "",
              score: grade.score,
            }))}
            className={selectedClass.name}
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs
          classId={params.classId}
          totalExams={totalExams}
          totalAssignments={totalAssignments}
          className="mb-6"
        />

        {/* Main Content Section */}

        <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
          <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
              <StudentTable
                students={students.map((student) => ({
                  id: student.id.toString(),
                  name: student.name,
                  surname: student.surname,
                  className: student.class.name,
                }))}
                exams={exams.map((exam) => ({
                  id: exam.id.toString(),
                  title: exam.title,
                  className: exam.lesson.class.name,
                  teacherId: exam.lesson.teacher.id,
                  date: exam.startTime.toISOString(),
                  class: {
                    name: exam.lesson.class.name,
                    grade: {
                      level: selectedClass.grade?.level || 1
                    }
                  }
                }))}
                assignments={assignments.map((assignment) => ({
                  id: assignment.id.toString(),
                  title: assignment.title,
                  className: assignment.lesson.class.name,
                  teacherId: assignment.lesson.teacher.id,
                  date: assignment.startDate.toISOString(),
                  class: {
                    name: assignment.lesson.class.name,
                    grade: {
                      level: selectedClass.grade?.level || 1
                    }
                  }
                }))}
                role={role}
                currentUserId={currentUserId || undefined}
                existingGrades={existingGrades.map((grade) => ({
                  id: grade.id.toString(),
                  score: grade.score,
                  assessmentId:
                    grade.examId != null
                      ? `E-${grade.examId}`
                      : grade.assignmentId != null
                      ? `A-${grade.assignmentId}`
                      : "",
                  studentId: grade.studentId,
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamPage;
