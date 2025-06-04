"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { ExamTable } from "./exam-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HiClipboardList, HiCollection, HiDocumentText } from "react-icons/hi";


const ExamListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // ROLE CONDITIONS
  const query: Prisma.ExamWhereInput = {};
  query.lesson = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const data = await prisma.exam.findMany({
    where: query,
    include: {
      lesson: {
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } },
          teacher: { select: { name: true, surname: true } },
          class: { select: { name: true, grade: { select: { level: true } } } },
        },
      },
    },
  });

  // Fetch all lessons for the form
  const allLessons = await prisma.lesson.findMany({
    where: {
      ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: {
            select: {
              level: true,
            },
          },
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

  // Calculate stats
  const totalExams = data.length;
  const totalSubjects = new Set(data.map((exam) => exam.lesson.subject.name))
    .size;
  const totalClasses = new Set(data.map((exam) => exam.lesson.class.name)).size;
  const upcomingExams = data.filter(
    (exam) => new Date(exam.startTime) > new Date()
  ).length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin */}
        {(role === "admin" || role === "kepala_sekolah") && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <HiClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Ujian
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center">
                      <FormContainer
                        table="exam"
                        type="create"
                        relatedData={{
                          lessons: allLessons,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Ujian</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin */}
        {(role === "admin" || role === "kepala_sekolah") && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Total Ujian
                    </p>
                    <p className="text-3xl font-bold">{totalExams}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiClipboardList className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Mata Pelajaran
                    </p>
                    <p className="text-3xl font-bold">{totalSubjects}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiDocumentText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Kelas Terlibat
                    </p>
                    <p className="text-3xl font-bold">{totalClasses}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiCollection className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Ujian Mendatang
                    </p>
                    <p className="text-3xl font-bold">{upcomingExams}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Exams Table Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <HiClipboardList className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Daftar Ujian
              </h1>
              <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
                {totalExams} Ujian
              </Badge>
            </div>

            {/* Add button for teacher role */}
            {role === "teacher" && (
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormContainer
                          table="exam"
                          type="create"
                          relatedData={{
                            lessons: allLessons,
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Tambah Ujian</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
                <ExamTable data={data} role={role} allLessons={allLessons} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamListPage;
