import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma, Class, Teacher, Grade } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { ClassTable } from "./class-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HiCollection, HiAcademicCap } from "react-icons/hi";
import { HiUserGroup } from "react-icons/hi";
type ClassWithRelations = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
};

const ClassListPage = async () => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  let data: ClassWithRelations[] = [];
  let allTeachers: { id: string; name: string; surname: string }[] = [];
  let allGrades: { id: number; level: number }[] = [];
  let supervisedClasses: ClassWithRelations[] = [];

  if (role === "admin" || role === "kepala_sekolah") {
    // Admin sees all classes
    data = await prisma.class.findMany({
      include: {
        supervisor: true,
        grade: true,
      },
    });

    // Fetch all teachers for the form
    allTeachers = await prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
    });

    // Get all grades
    allGrades = await prisma.grade.findMany({
      select: { id: true, level: true },
    });
  } else if (role === "teacher" && userId) {
    // Teacher sees only their classes
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
    });

    if (!teacher) {
      notFound();
    }

    // Get classes where teacher is supervisor
    supervisedClasses = await prisma.class.findMany({
      where: {
        supervisorId: userId,
      },
      include: {
        supervisor: true,
        grade: true,
      },
    });

    // Get classes where teacher teaches lessons
    const teachingClasses = await prisma.class.findMany({
      where: {
        lessons: {
          some: {
            teacherId: userId,
          },
        },
      },
      include: {
        supervisor: true,
        grade: true,
      },
    });

    // Combine and remove duplicates
    data = [...supervisedClasses];
    teachingClasses.forEach((teachingClass) => {
      if (!data.some((c) => c.id === teachingClass.id)) {
        data.push(teachingClass);
      }
    });
  } else {
    notFound();
  }

  // Get all teachers who are already supervisors
  const existingSupervisors = new Set(
    data
      .map((item) => item.supervisor?.id)
      .filter((id): id is string => id !== undefined)
  );

  // Add supervisor status to all teachers
  const teachersWithStatus = allTeachers.map((teacher) => ({
    ...teacher,
    isSupervisor: existingSupervisors.has(teacher.id),
  }));

  // Calculate stats
  const totalClasses = data.length;
  const totalCapacity = data.reduce((sum, cls) => sum + cls.capacity, 0);
  const classesWithSupervisors = data.filter((cls) => cls.supervisor).length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin */}
        {role === "admin" && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <HiCollection className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Kelas
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
                        table="class"
                        type="create"
                        relatedData={{
                          teachers: teachersWithStatus,
                          grades: allGrades,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Kelas</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Total Kelas
                    </p>
                    <p className="text-3xl font-bold">{totalClasses}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiCollection className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Total Kapasitas
                    </p>
                    <p className="text-3xl font-bold">{totalCapacity}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiUserGroup className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Dengan Wali Kelas
                    </p>
                    <p className="text-3xl font-bold">
                      {classesWithSupervisors}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiAcademicCap className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Supervisor Classes Section */}
        {role === "teacher" && supervisedClasses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <HiAcademicCap className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kelas yang Saya Bimbing
              </h2>
              <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
                {supervisedClasses.length} Kelas
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {supervisedClasses.map((classItem) => (
                <Card
                  key={classItem.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white dark:bg-slate-800"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                          <HiCollection className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                            {classItem.grade?.level === 1
                              ? "X"
                              : classItem.grade?.level === 2
                              ? "XI"
                              : "XII"}{" "}
                            {classItem.name}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              Tingkat {classItem.grade?.level}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={`${
                                classItem.semester === "GANJIL"
                                  ? "border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300"
                                  : "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
                              }`}
                            >
                              {classItem.semester}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <Link href={`/list/classes/${classItem.id}`}>
                          <HiUserGroup className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Kapasitas
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {classItem.capacity}
                        </span>
                      </div>
                      <Button
                        asChild
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Link href={`/list/classes/${classItem.id}`}>
                          <HiUserGroup className="mr-2 h-4 w-4" />
                          Lihat Siswa
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Classes Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <HiCollection className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {role === "admin"
                ? "Daftar Kelas"
                : role === "teacher" && supervisedClasses.length > 0
                ? "Kelas yang Saya Ajar"
                : "Daftar Kelas"}
            </h1>
            <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
              {role === "teacher"
                ? data.filter(
                    (c) => !supervisedClasses.some((sc) => sc.id === c.id)
                  ).length
                : data.length}{" "}
              Kelas
            </Badge>
          </div>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg  border border-gray-200 dark:border-slate-900 p-4">
                <ClassTable
                  data={
                    role === "teacher"
                      ? data.filter(
                          (c) => !supervisedClasses.some((sc) => sc.id === c.id)
                        )
                      : data
                  }
                  role={role}
                  allTeachers={teachersWithStatus}
                  allGrades={allGrades}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassListPage;
