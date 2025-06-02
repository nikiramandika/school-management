"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { SubjectTable } from "./subject-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SubjectListPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const data = await prisma.subject.findMany({
    include: {
      teachers: true,
      lessons: {
        include: {
          class: true,
          teacher: true,
        },
      },
    },
  });

  // Fetch all teachers for the form
  const allTeachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });

  // Calculate stats
  const totalSubjects = data.length;
  const totalTeachers = new Set(
    data.flatMap((subject) => subject.teachers.map((teacher) => teacher.id))
  ).size;
  const totalLessons = data.reduce(
    (acc, subject) => acc + subject.lessons.length,
    0
  );
  const totalClasses = new Set(
    data.flatMap((subject) => subject.lessons.map((lesson) => lesson.class.id))
  ).size;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mata Pelajaran
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center">
                      <FormContainer
                        table="subject"
                        type="create"
                        relatedData={{
                          teachers: allTeachers,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Mata Pelajaran</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">
                    Total Mata Pelajaran
                  </p>
                  <p className="text-3xl font-bold">{totalSubjects}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">
                    Total Pelajaran
                  </p>
                  <p className="text-3xl font-bold">{totalLessons}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" bg-cyan-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">
                    Total Pengajar
                  </p>
                  <p className="text-3xl font-bold">{totalTeachers}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Subjects Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Semua Mata Pelajaran
            </h1>
            <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
              {totalSubjects} Mata Pelajaran
            </Badge>
          </div>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
                <SubjectTable
                  data={data}
                  role={role}
                  allTeachers={allTeachers}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubjectListPage;
