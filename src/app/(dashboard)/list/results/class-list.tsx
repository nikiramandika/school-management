"use client";

import { Class, Teacher, Grade } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, UserCheck, Crown, BarChart2 } from "lucide-react";
import Link from "next/link";
import { HiCollection, HiUserGroup, HiAcademicCap, HiClipboardCheck } from "react-icons/hi";

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
    <Card className="border-[1] border-gray-200/20 group transition-all duration-300 shadow-md hover:shadow-xl bg-white dark:bg-white/5 dark:border-gray-800/20 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isSupervisor ? "bg-cyan-500" : "bg-cyan-500"
              }`}
            >
              {isSupervisor ? (
                <Crown className="h-5 w-5 text-white" />
              ) : (
                <HiCollection className="h-5 w-5 text-white" />
              )}
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
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Grade Level */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 dark:bg-card rounded-md">
              <GraduationCap className="h-4 w-4 text-gray-900 dark:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tingkat {classItem.grade?.level || "N/A"}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 dark:bg-card rounded-md">
              <HiUserGroup className="h-4 w-4 text-gray-900 dark:text-white" />
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
              <div className="p-1.5 bg-gray-100 dark:bg-card rounded-md">
                <UserCheck className="h-4 w-4 text-gray-900 dark:text-white" />
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
              <div className="p-1.5 bg-gray-100 dark:bg-card rounded-md">
                <HiAcademicCap className="h-4 w-4 text-gray-900 dark:text-white" />
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
            className="w-full bg-gradient-to-r bg-cyan-500 hover:bg-cyan-600 text-white"
            asChild
          >
            <Link href={`/list/results/${classItem.id}`}>
              Lihat Nilai
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
            <div className="p-2 bg-cyan-500 rounded-lg">
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
                <div className="p-3 bg-gray-100 dark:bg-card rounded-full">
                  <HiCollection className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Tidak Ada Kelas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === "teacher"
                      ? "Anda belum memiliki kelas untuk mengelola nilai"
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
