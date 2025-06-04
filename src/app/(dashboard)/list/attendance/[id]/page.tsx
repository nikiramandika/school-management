import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { AttendanceTable } from "../attendance-table";
import FormModal from "@/components/FormModal";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Clock,
  CheckCircle,
  School,
} from "lucide-react";
import Link from "next/link";

// Enhanced Header component with stats
const PageHeader = ({
  className,
  totalStudents,
  totalLessons,
  totalAttendances,
  role,
  gradeLevel,
}: {
  className: string;
  totalStudents: number;
  totalLessons: number;
  totalAttendances: number;
  role: string;
  gradeLevel: number;
}) => (
  <div className="space-y-6">
    {/* Navigation Breadcrumb */}
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/list/attendance"
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Kelas
      </Link>
    </div>

    {/* Main Header */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-500 rounded-lg">
          <UserCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Absensi {gradeLevel === 1 ? "X" : gradeLevel === 2 ? "XI" : "XII"} {className}
          </h1>
        </div>
      </div>
    </div>
  </div>
);

export default async function ClassAttendancePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Parse and validate class ID
  const classId = parseInt(id);
  if (isNaN(classId)) {
    return notFound();
  }

  // Get the class
  const classItem = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      grade: {
        select: {
          level: true,
        },
      },
      supervisorId: true,
      lessons: {
        select: {
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

  if (!classItem) {
    return notFound();
  }

  // Check if user has access to this class
  if (
    role !== "admin" &&
    !classItem.lessons.some((lesson) => lesson.teacher.id === currentUserId) &&
    classItem.supervisorId !== currentUserId
  ) {
    return notFound();
  }

  // Redirect supervisor to the supervisor view
  if (classItem.supervisorId === currentUserId) {
    redirect(`/list/attendance/${id}/supervisor`);
  }

  // Get all students in this class
  const students = await prisma.student.findMany({
    where: {
      classId: classId,
    },
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
  });

  // Get all lessons for this class
  const lessons = await prisma.lesson.findMany({
    where: {
      classId: classId,
      ...(role !== "admin"
        ? {
            OR: [
              { teacherId: currentUserId! },
              { class: { supervisorId: currentUserId! } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      class: {
        select: {
          name: true,
          supervisorId: true,
          grade: {
            select: {
              level: true
            }
          }
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
  });

  // Get all attendance records for this class
  const attendances = await prisma.attendance.findMany({
    where: {
      lesson: {
        classId: classId,
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
      date: true,
      status: true,
      studentId: true,
      lessonId: true,
      lesson: {
        select: {
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
      student: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
  });

  // Calculate stats
  const totalStudents = students.length;
  const totalLessons = lessons.length;
  const totalAttendances = attendances.filter((att) => att.status === "PRESENT").length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          className={classItem.name}
          totalStudents={totalStudents}
          totalLessons={totalLessons}
          totalAttendances={totalAttendances}
          role={role || ""}
          gradeLevel={classItem.grade.level}
        />

        {/* Main Content Section */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-800 rounded-xl">
          <CardContent className="p-0 bg-gray-100 dark:bg-slate-700 rounded-xl">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
              <AttendanceTable
                students={students}
                lessons={lessons}
                role={role}
                currentUserId={currentUserId || undefined}
                existingAttendances={attendances}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
