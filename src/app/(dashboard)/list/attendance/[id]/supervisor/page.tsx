import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Class,
  Lesson,
  Attendance,
  Student,
  Teacher,
  Grade,
} from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
} from "date-fns";
import { id } from "date-fns/locale";
import { AttendancePDFDownload } from "@/components/AttendancePDFDownload";
import { HiAcademicCap } from "react-icons/hi";

interface ClassPageProps {
  params: {
    id: string;
  };
  searchParams: {
    week?: string;
  };
}

type AttendanceWithTimestamp = Attendance & {
  updatedAt: Date;
  date: Date;
};

type ClassWithRelations = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
  students: Student[];
  lessons: (Lesson & {
    teacher: Teacher;
    attendances: AttendanceWithTimestamp[];
  })[];
};

type LessonWithAttendances = Lesson & {
  teacher: Teacher;
  attendancesByDate: Record<string, AttendanceWithTimestamp[]>;
};

// Enhanced Header component with stats
const PageHeader = ({
  className,
  gradeLevel,
  totalStudents,
  totalLessons,
  weekStart,
  weekEnd,
  role,
}: {
  className: string;
  gradeLevel: number | null;
  totalStudents: number;
  totalLessons: number;
  weekStart: Date;
  weekEnd: Date;
  role: string;
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
        <div className="p-2 bg-green-500 rounded-lg">
          <HiAcademicCap className="h-6 w-6 text-white" />
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

export default async function SupervisorAttendancePage({
  params,
  searchParams,
}: ClassPageProps) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Get current week's dates
  const today = new Date();
  const weekOffset = searchParams.week ? parseInt(searchParams.week) : 0;
  const selectedDate = addWeeks(today, weekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch class details with students and their attendances
  const classData = (await prisma.class.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      supervisor: true,
      grade: true,
      students: true,
      lessons: {
        include: {
          teacher: true,
          attendances: true,
        },
      },
    },
  })) as ClassWithRelations | null;

  if (!classData) {
    redirect("/list/attendance");
  }

  // Check if user is supervisor
  if (classData.supervisorId !== currentUserId) {
    redirect(`/list/attendance/${params.id}`);
  }

  // Group attendances by lesson and date
  const lessonsWithAttendances: LessonWithAttendances[] = classData.lessons.map(
    (lesson) => {
      // Group attendances by date
      const attendancesByDate = lesson.attendances.reduce((acc, attendance) => {
        const date = format(new Date(attendance.date), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(attendance);
        return acc;
      }, {} as Record<string, AttendanceWithTimestamp[]>);

      return {
        ...lesson,
        attendancesByDate,
      };
    }
  );

  // Calculate stats
  const totalStudents = classData.students.length;
  const totalLessons = classData.lessons.length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          className={classData.name}
          gradeLevel={classData.grade?.level || null}
          totalStudents={totalStudents}
          totalLessons={totalLessons}
          weekStart={weekStart}
          weekEnd={weekEnd}
          role={role || ""}
        />

        {/* Main Content Section */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-800 rounded-xl">
          <CardContent className="p-0 bg-gray-100 dark:bg-slate-700 rounded-xl">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
              <div className="space-y-4">
                {lessonsWithAttendances.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {lessonsWithAttendances.map((lesson) => (
                      <AccordionItem
                        key={lesson.id}
                        value={lesson.id.toString()}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {lesson.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
                                >
                                  <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
                                  {lesson.teacher.name} {lesson.teacher.surname}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 mt-4 ">
                            <AttendancePDFDownload
                              lesson={lesson}
                              students={classData.students}
                              attendancesByDate={Object.values(
                                lesson.attendancesByDate
                              ).flat()}
                            />
                            <Card className="border border-gray-200 dark:border-gray-700">
                              <CardHeader className="pb-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    Kehadiran Minggu Ini
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full"
                                      asChild
                                    >
                                      <Link
                                        href={`/list/attendance/${
                                          params.id
                                        }/supervisor?week=${weekOffset - 1}`}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                      <span className="text-sm font-medium">
                                        {format(weekStart, "d MMM", {
                                          locale: id,
                                        })}{" "}
                                        -{" "}
                                        {format(weekEnd, "d MMM yyyy", {
                                          locale: id,
                                        })}
                                      </span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full"
                                      asChild
                                    >
                                      <Link
                                        href={`/list/attendance/${
                                          params.id
                                        }/supervisor?week=${weekOffset + 1}`}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-50 dark:bg-gray-900">
                                        <TableHead className="min-w-[150px] font-semibold">
                                          Nama Siswa
                                        </TableHead>
                                        {weekDates.map((date) => (
                                          <TableHead
                                            key={format(date, "yyyy-MM-dd")}
                                            className="text-center min-w-[100px]"
                                          >
                                            <div className="flex flex-col items-center">
                                              <span className="text-xs font-semibold">
                                                {format(date, "EEE", {
                                                  locale: id,
                                                })}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {format(date, "d MMM", {
                                                  locale: id,
                                                })}
                                              </span>
                                            </div>
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {classData.students.map(
                                        (student, index) => (
                                          <TableRow
                                            key={student.id}
                                            className={
                                              index % 2 === 0
                                                ? "bg-gray-50/50 dark:bg-gray-900/50"
                                                : ""
                                            }
                                          >
                                            <TableCell className="font-medium sticky left-0 bg-background z-10">
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {student.name.charAt(0)}
                                                  </span>
                                                </div>
                                                <span className="font-medium">
                                                  {student.name}{" "}
                                                  {student.surname}
                                                </span>
                                              </div>
                                            </TableCell>
                                            {weekDates.map((date) => {
                                              let status = null;
                                              let attendanceStatus = null;
                                              // Cek kehadiran hanya untuk lesson yang sedang ditampilkan
                                              const att =
                                                lesson.attendancesByDate[
                                                  format(date, "yyyy-MM-dd")
                                                ]?.find(
                                                  (a) =>
                                                    a.studentId === student.id
                                                );
                                              if (att) {
                                                attendanceStatus = att.status;
                                              }
                                              if (attendanceStatus === "PRESENT")
                                                status = (
                                                  <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                      <CheckCircle className="h-3 w-3 inline mr-1" />
                                                      Hadir
                                                    </span>
                                                  </div>
                                                );
                                              else if (attendanceStatus === "SICK")
                                                status = (
                                                  <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                      <UserCheck className="h-3 w-3 inline mr-1" />
                                                      Sakit
                                                    </span>
                                                  </div>
                                                );
                                              else if (attendanceStatus === "PERMITTED")
                                                status = (
                                                  <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                      <Calendar className="h-3 w-3 inline mr-1" />
                                                      Izin
                                                    </span>
                                                  </div>
                                                );
                                              else if (attendanceStatus === "ABSENT")
                                                status = (
                                                  <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                      ✗ Tidak Hadir
                                                    </span>
                                                  </div>
                                                );
                                              else
                                                status = (
                                                  <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                      -
                                                    </span>
                                                  </div>
                                                );
                                              return (
                                                <TableCell
                                                  key={format(
                                                    date,
                                                    "yyyy-MM-dd"
                                                  )}
                                                  className="text-center"
                                                >
                                                  {status}
                                                </TableCell>
                                              );
                                            })}
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Belum Ada Mata Pelajaran
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            Belum ada mata pelajaran yang terdaftar untuk kelas
                            ini.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
