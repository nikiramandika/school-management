import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import StudentTable from "../../student-table";
import Tabs from "../tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "../components/download-button";
import DownloadAllResultsPDFButton from "../components/download-all-results-pdf";
import SemesterFilter from "../components/semester-filter";

// Type definitions for the download component
interface StudentForDownload {
  id: string;
  name: string;
  surname: string;
}

interface AssessmentForDownload {
  id: string;
  title: string;
  type: "Ujian" | "Tugas";
  semester?: string;
}

interface GradeForDownload {
  studentId: string;
  assessmentId: string;
  score: number;
  semester?: string;
}

interface AssignmentPageProps {
  params: {
    classId: string;
  };
  searchParams: {
    semester?: string;
  };
}

// Enhanced Header component with stats
const PageHeader = ({
  className,
  gradeLevel,
  semester,
  totalStudents,
  totalExams,
  totalAssignments,
  completedAssignments,
  role,
}: {
  className: string;
  gradeLevel: number;
  semester: string;
  totalStudents: number;
  totalExams: number;
  totalAssignments: number;
  completedAssignments: number;
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
        <div className="p-2 bg-cyan-500  rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hasil Tugas  {gradeLevel === 1 ? "X" : gradeLevel === 2 ? "XI" : "XII"} {className}
          </h1>
          <div className="mt-1">
            <Badge variant="outline" className={semester === "GANJIL" ? "border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300" : "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"}>
              Semester: {semester}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AssignmentPage = async ({ params, searchParams }: AssignmentPageProps) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  const selectedSemester = searchParams.semester;

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
      semester: true,
      supervisorId: true,
      grade: {
        select: {
          level: true,
        },
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
          subject: {
            select: {
              name: true,
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
    role !== "kepala_sekolah" &&
    !selectedClass.lessons.some(
      (lesson) => lesson.teacher.id === currentUserId
    ) &&
    selectedClass.supervisorId !== currentUserId
  ) {
    notFound();
  }

  // Determine target semester for viewing (prioritize class semester if no selection)
  const targetSemester = selectedSemester || selectedClass.semester;

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
            ...(role !== "admin" && role !== "kepala_sekolah"
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
          semester: true,
          lesson: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true, surname: true } },
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          lesson: {
            classId,
            ...(role !== "admin" && role !== "kepala_sekolah"
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
          semester: true,
          lesson: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true, surname: true } },
              subject: { select: { name: true } },
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
                  ...(role !== "admin" && role !== "kepala_sekolah"
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
                  ...(role !== "admin" && role !== "kepala_sekolah"
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
              semester: true,
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
              semester: true,
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
  const completedAssignments = assignments.filter((assignment) =>
    existingGrades.some((grade) => grade.assignmentId === assignment.id)
  ).length;

  // Filter for StudentTable (not for download)
  const filteredExams = exams.filter(e => !e.semester || e.semester === targetSemester);
  const filteredAssignments = assignments.filter(a => !a.semester || a.semester === targetSemester);

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          className={selectedClass.name}
          gradeLevel={selectedClass.grade?.level}
          semester={selectedClass.semester}
          totalStudents={totalStudents}
          totalExams={totalExams}
          totalAssignments={totalAssignments}
          completedAssignments={completedAssignments}
          role={role || ""}
        />

        {/* Semester Filter */}
        <SemesterFilter classSemester={selectedClass.semester} />

        <div className="flex justify-end mb-4">
          <DownloadAllResultsPDFButton
            students={students.map((student): StudentForDownload => ({
              id: student.id.toString(),
              name: student.name,
              surname: student.surname,
            }))}
            exams={exams.map((exam): AssessmentForDownload => ({
              id: exam.id.toString(),
              title: exam.title,
              type: "Ujian",
              semester: exam.semester,
            }))}
            assignments={assignments.map((assignment): AssessmentForDownload => ({
              id: assignment.id.toString(),
              title: assignment.title,
              type: "Tugas",
              semester: assignment.semester,
            }))}
            existingGrades={existingGrades.map((grade): GradeForDownload => ({
              studentId: grade.studentId,
              assessmentId: grade.examId != null
                ? `E-${grade.examId}`
                : grade.assignmentId != null
                ? `A-${grade.assignmentId}`
                : "",
              score: grade.score,
              semester: grade.exam?.semester || grade.assignment?.semester,
            }))}
            className={selectedClass.name}
            gradeLevel={selectedClass.grade?.level}
            classSemester={selectedClass.semester}
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs
          classId={params.classId}
          totalExams={filteredExams.length}
          totalAssignments={filteredAssignments.length}
          className="mb-6"
        />

        {/* Main Content Section */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-800 rounded-xl">
          <CardContent className="p-0 bg-gray-100 dark:bg-slate-700 rounded-xl">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
              <StudentTable
                students={students.map((student) => ({
                  id: student.id.toString(),
                  name: student.name,
                  surname: student.surname,
                  className: student.class.name,
                }))}
                exams={filteredExams.map((exam) => ({
                  id: exam.id.toString(),
                  title: exam.title,
                  className: exam.lesson.class.name,
                  teacherId: exam.lesson.teacher.id,
                  date: exam.startTime.toISOString(),
                  semester: exam.semester,
                  subject: exam.lesson.subject?.name,
                  class: {
                    name: exam.lesson.class.name,
                    grade: {
                      level: selectedClass.grade?.level || 1
                    }
                  }
                }))}
                assignments={filteredAssignments.map((assignment) => ({
                  id: assignment.id.toString(),
                  title: assignment.lesson?.subject?.name
                    ? `${assignment.title} (${assignment.lesson.subject.name})`
                    : assignment.title,
                  className: assignment.lesson.class.name,
                  teacherId: assignment.lesson.teacher.id,
                  date: assignment.startDate.toISOString(),
                  semester: assignment.semester,
                  subject: assignment.lesson.subject?.name,
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
                  assessmentId: grade.examId != null
                    ? `E-${grade.examId}`
                    : grade.assignmentId != null
                    ? `A-${grade.assignmentId}`
                    : "",
                  studentId: grade.studentId,
                }))}
                classSemester={selectedClass.semester}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentPage;
