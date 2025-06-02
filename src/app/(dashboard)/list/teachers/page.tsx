"use server"

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { TeacherTable } from "./teacher-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TeacherListPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const data = await prisma.teacher.findMany({
    include: {
      subjects: true,
      classes: true,
    },
  });

  // Calculate stats
  const totalTeachers = data.length;
  const teachersWithClasses = data.filter((teacher) => teacher.classes.length > 0).length;
  const totalSubjects = [...new Set(data.flatMap((teacher) => teacher.subjects.map((subject) => subject.id)))].length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-400 rounded-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Daftar Guru
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
                      <FormContainer table="teacher" type="create" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Data Guru</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-indigo-400 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">
                    Total Guru
                  </p>
                  <p className="text-3xl font-bold">{totalTeachers}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-400 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">
                    Guru Wali Kelas
                  </p>
                  <p className="text-3xl font-bold">{teachersWithClasses}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Teachers Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-400 rounded-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90">
              Data Guru
            </h1>
            <Badge variant="secondary" className="ml-2 bg-indigo-500/30">
              {totalTeachers} Guru
            </Badge>
          </div>

          <Card className="border-0 shadow-lg bg-white dark:bg-transparent rounded-xl">
            <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
                <TeacherTable data={data} role={role} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherListPage;