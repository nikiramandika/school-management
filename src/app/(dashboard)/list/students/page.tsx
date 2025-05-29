"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { StudentTable } from "./student-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StudentListPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const data = await prisma.student.findMany({
    include: {
      class: true,
    },
  });

  // Calculate stats
  const totalStudents = data.length;
  const studentsWithClasses = data.filter((student) => student.class).length;
  const totalClasses = [...new Set(data.filter((student) => student.class).map((student) => student.class?.id))].length;

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-0 mt-0">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Daftar Siswa
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
                      <FormContainer table="student" type="create" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Data Siswa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Siswa
                  </p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
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
                    Total Kelas
                  </p>
                  <p className="text-3xl font-bold">{totalClasses}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Students Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Data Siswa
            </h1>
            <Badge variant="secondary" className="ml-2">
              {totalStudents} Siswa
            </Badge>
          </div>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 rounded-xl">
            <CardContent className="p-5 bg-gray-100 dark:bg-slate-700 rounded-xl">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
                <StudentTable data={data} role={role} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentListPage;