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
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  if (role === "admin") {
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

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">Daftar Kelas</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
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
            )}
          </div>
        </div>
      </div>

      {/* Supervisor Classes Section */}
      {role === "teacher" && supervisedClasses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Kelas yang Saya Bimbing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supervisedClasses.map((classItem) => (
              <Card key={classItem.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {classItem.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/list/classes/${classItem.id}`}>
                      <Users className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Tingkat {classItem.grade?.level}</p>
                    <p>Kapasitas: {classItem.capacity} siswa</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className={role === "teacher" && supervisedClasses.length > 0 ? "mt-6" : ""}>
        <h2 className="text-lg font-semibold mb-4">
          {role === "teacher" && supervisedClasses.length > 0
            ? "Kelas yang Saya Ajar"
            : "Semua Kelas"}
        </h2>
        <ClassTable
          data={role === "teacher" ? data.filter(c => !supervisedClasses.some(sc => sc.id === c.id)) : data}
          role={role}
          allTeachers={teachersWithStatus}
          allGrades={allGrades}
        />
      </div>
    </div>
  );
};

export default ClassListPage;
