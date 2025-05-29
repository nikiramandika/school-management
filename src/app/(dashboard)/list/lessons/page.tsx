"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { LessonTable } from "./lesson-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LessonListPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const data = await prisma.lesson.findMany({
    include: {
      subject: true,
      class: true,
      teacher: true,
    },
  });

  // Fetch all subjects, classes, and teachers for the form
  const [subjects, classes, teachers] = await prisma.$transaction([
    prisma.subject.findMany({
      select: { id: true, name: true },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
    }),
    prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
    }),
  ]);

  // Calculate stats
  const totalLessons = data.length;
  const totalSubjects = new Set(data.map(lesson => lesson.subject.id)).size;
  const totalClasses = new Set(data.map(lesson => lesson.class.id)).size;
  const totalTeachers = new Set(data.map(lesson => lesson.teacher.id)).size;

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-0 mt-0">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin */}
        {role === "admin" && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Pelajaran
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
                        table="lesson"
                        type="create"
                        relatedData={{
                          subjects,
                          classes,
                          teachers,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Pelajaran</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Pelajaran
                    </p>
                    <p className="text-3xl font-bold">{totalLessons}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Mata Pelajaran
                    </p>
                    <p className="text-3xl font-bold">{totalSubjects}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Kelas Aktif
                    </p>
                    <p className="text-3xl font-bold">{totalClasses}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      Total Pengajar
                    </p>
                    <p className="text-3xl font-bold">{totalTeachers}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Lessons Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Pelajaran
            </h1>
            <Badge variant="secondary" className="ml-2">
              {totalLessons} Pelajaran
            </Badge>
          </div>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 rounded-xl">
            <CardContent className="p-5 bg-gray-100 dark:bg-slate-700 rounded-xl">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
                <LessonTable
                  data={data}
                  role={role}
                  relatedData={{
                    subjects,
                    classes,
                    teachers,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonListPage;