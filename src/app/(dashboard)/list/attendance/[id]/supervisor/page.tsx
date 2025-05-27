import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      <div className="bg-card rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {classData.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-white">
                Tingkat {classData.grade?.level}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/list/attendance">Kembali</Link>
            </Button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-4">
            {lessonsWithAttendances.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {lessonsWithAttendances.map((lesson) => (
                  <AccordionItem key={lesson.id} value={lesson.id.toString()}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{lesson.name}</span>
                        <span className="text-sm text-muted-foreground">
                          - {lesson.teacher.name} {lesson.teacher.surname}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Kehadiran Minggu Ini
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2 md:mt-0">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full border border-gray-400 bg-background hover:bg-muted"
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
                                <span className="text-sm font-medium px-2">
                                  {format(weekStart, "d MMM", { locale: id })} -{" "}
                                  {format(weekEnd, "d MMM yyyy", {
                                    locale: id,
                                  })}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full border border-gray-400 bg-background hover:bg-muted"
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
                            <div className="overflow-x-auto mt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="min-w-[120px]">
                                      Nama Siswa
                                    </TableHead>
                                    {weekDates.map((date) => (
                                      <TableHead
                                        key={format(date, "yyyy-MM-dd")}
                                        className="text-center min-w-[90px]"
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs font-medium">
                                            {format(date, "EEE", {
                                              locale: id,
                                            })}
                                          </span>
                                          <span className="text-xs">
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
                                  {classData.students.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                                        {student.name}
                                      </TableCell>
                                      {weekDates.map((date) => {
                                        let status = null;
                                        let present = null;
                                        // Cek kehadiran di semua lesson untuk hari tsb
                                        for (const lesson of lessonsWithAttendances) {
                                          const att = lesson.attendancesByDate[
                                            format(date, "yyyy-MM-dd")
                                          ]?.find(
                                            (a) => a.studentId === student.id
                                          );
                                          if (att) {
                                            present = att.present;
                                            break;
                                          }
                                        }
                                        if (present === true)
                                          status = (
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                              Hadir
                                            </span>
                                          );
                                        else if (present === false)
                                          status = (
                                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                              Tidak Hadir
                                            </span>
                                          );
                                        else
                                          status = (
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                              Belum Ada Data
                                            </span>
                                          );
                                        return (
                                          <TableCell
                                            key={format(date, "yyyy-MM-dd")}
                                            className="text-center"
                                          >
                                            {status}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
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
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Belum ada data kehadiran yang tersedia
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
