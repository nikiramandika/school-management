"use client";

import { Class, Teacher, Grade } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  GraduationCap,
  UserCheck,
  School,
  User,
  Crown,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ClassWithRelations = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
  students?: any[];
};

type ClassListProps = {
  classes: ClassWithRelations[];
  role?: string;
  userId?: string;
};

export default function ClassList({ classes, role, userId }: ClassListProps) {
  // Separate supervised classes from teaching classes
  const supervisedClasses = classes.filter(
    (classItem) => classItem.supervisorId === userId
  );
  const teachingClasses = classes.filter(
    (classItem) => classItem.supervisorId !== userId
  );

  const ClassCard = ({
    classItem,
    isSupervisor = false,
  }: {
    classItem: ClassWithRelations;
    isSupervisor?: boolean;
  }) => (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_-8px_25px_-5px_rgba(0,0,0,0.1),0_8px_25px_-5px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isSupervisor
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
            >
              {isSupervisor ? (
                <Crown className="h-5 w-5 text-white" />
              ) : (
                <School className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {classItem.name}
              </CardTitle>
              {isSupervisor && (
                <Badge
                  variant="secondary"
                  className="mt-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Wali Kelas
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-teal-100 dark:hover:bg-teal-900/20 hover:text-teal-600"
                    asChild
                  >
                    <Link href={`/list/attendance/${classItem.id}`}>
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kelola Absensi</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isSupervisor && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-amber-100 dark:hover:bg-amber-900/20 hover:text-amber-600"
                      asChild
                    >
                      <Link href={`/list/classes/${classItem.id}`}>
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kelola Siswa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Grade Level */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-100 dark:bg-purple-900/30 rounded-md">
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tingkat {classItem.grade?.level || "N/A"}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-100 dark:bg-orange-900/30 rounded-md">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Kapasitas:{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {classItem.capacity}
              </span>{" "}
              siswa
            </span>
          </div>

          {/* Current Students (if available) */}
          {classItem.students && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
                <UserCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Siswa aktif:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {classItem.students.length}
                </span>
              </span>
            </div>
          )}

          {/* Supervisor (for non-supervised classes) */}
          {!isSupervisor && classItem.supervisor && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                <User className="h-4 w-4 text-cyan-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Wali Kelas:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {classItem.supervisor.name} {classItem.supervisor.surname}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <Button
            className="w-full bg-gradient-to-r bg-cyan-500 hover:from-green-600 hover:to-green-700 text-white"
            asChild
          >
            <Link href={`/list/attendance/${classItem.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Buka Absensi
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Supervised Classes Section */}
      {role === "teacher" && supervisedClasses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Kelas yang Saya Bimbing
              </h2>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {supervisedClasses.length} Kelas
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supervisedClasses.map((classItem) => (
              <ClassCard
                key={`supervised-${classItem.id}`}
                classItem={classItem}
                isSupervisor={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Teaching Classes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {role === "teacher" && supervisedClasses.length > 0
                ? "Kelas yang Saya Ajar"
                : "Semua Kelas"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {role === "teacher" && supervisedClasses.length > 0 ? "" : ""}
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {teachingClasses.length} Kelas
          </Badge>
        </div>

        {teachingClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachingClasses.map((classItem) => (
              <ClassCard
                key={`teaching-${classItem.id}`}
                classItem={classItem}
                isSupervisor={false}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <School className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Tidak Ada Kelas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === "teacher"
                      ? "Anda belum memiliki kelas untuk mengajar"
                      : "Belum ada kelas yang tersedia"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
