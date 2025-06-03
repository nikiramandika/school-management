import React, { useState } from "react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, CheckCircle, AlertCircle, XCircle, HelpCircle, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const StudentAttendancePage = async () => {
  const { userId } = await auth();
  if (!userId) notFound();

  // Get student data with attendance records
  const student = await prisma.student.findUnique({
    where: { id: userId },
    include: {
      class: true,
      attendances: {
        include: {
          lesson: {
            include: {
              teacher: true,
              class: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!student) notFound();

  // Statistik absensi
  const hadir = student.attendances.filter((a) => a.status === "PRESENT").length;
  const izin = student.attendances.filter((a) => a.status === "PERMITTED").length;
  const sakit = student.attendances.filter((a) => a.status === "SICK").length;
  const tanpaKeterangan = student.attendances.filter((a) => a.status === "ABSENT").length;

  // Group attendances by lesson
  const attendancesByLesson = student.attendances.reduce((acc, att) => {
    const lessonId = att.lesson?.id;
    if (!lessonId) return acc;
    if (!acc[lessonId]) {
      acc[lessonId] = {
        lesson: att.lesson,
        attendances: [],
      };
    }
    acc[lessonId].attendances.push(att);
    return acc;
  }, {} as Record<string, { lesson: any; attendances: any[] }>);

  const lessonIds = Object.keys(attendancesByLesson);

  // State for open collapsibles (client-side only)
  // Fallback: all closed by default
  // (If you want to open the first by default, set [lessonIds[0]] as initial value)

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Absensi Saya
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lihat dan pantau kehadiran Anda di kelas
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Hadir</h3>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{hadir}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Izin</h3>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{izin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sakit</h3>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{sakit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tanpa Keterangan</h3>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{tanpaKeterangan}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Collapsible by Lesson */}
        <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
          <CardContent className="bg-gray-100 dark:bg-transparent rounded-xl p-0">
            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
              {lessonIds.length > 0 ? (
                <div className="space-y-4">
                  {lessonIds.map((lessonId: string) => {
                    const { lesson, attendances } = attendancesByLesson[lessonId];
                    // Collapsible state per lesson (client-side only)
                    // For SSR, all closed by default
                    // You can use a client component for interactive open/close if needed
                    return (
                      <Collapsible key={lessonId}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-b border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                  {lesson.name} - {lesson.teacher.name} {lesson.teacher.surname}
                                </h3>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tanggal</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {attendances.length > 0 ? (
                                  attendances.map((att: any) => (
                                    <TableRow key={att.id}>
                                      <TableCell>{new Date(att.date).toLocaleDateString()}</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={`px-3 py-1 font-semibold ${
                                            att.status === "PRESENT"
                                              ? "border-cyan-200 text-cyan-700 bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:bg-cyan-900/20"
                                              : att.status === "PERMITTED"
                                              ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20"
                                              : att.status === "SICK"
                                              ? "border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-900/20"
                                              : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                                          }`}
                                        >
                                          {att.status === "PRESENT" ? (
                                            <>
                                              <CheckCircle className="inline mr-1 h-4 w-4" />
                                              Hadir
                                            </>
                                          ) : att.status === "PERMITTED" ? (
                                            <>
                                              <AlertCircle className="inline mr-1 h-4 w-4" />
                                              Izin
                                            </>
                                          ) : att.status === "SICK" ? (
                                            <>
                                              <HelpCircle className="inline mr-1 h-4 w-4" />
                                              Sakit
                                            </>
                                          ) : (
                                            <>
                                              <XCircle className="inline mr-1 h-4 w-4" />
                                              Tanpa Keterangan
                                            </>
                                          )}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                                      Belum ada data absensi
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Belum ada data absensi
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendancePage; 