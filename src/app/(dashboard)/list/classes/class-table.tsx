"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Class, Teacher, Grade } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Users,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type ClassList = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
};

type ClassTableProps = {
  data: ClassList[];
  role?: string;
  allTeachers: { id: string; name: string; surname: string }[];
  allGrades: { id: number; level: number }[];
};

export function ClassTable({
  data,
  role,
  allTeachers,
  allGrades,
}: ClassTableProps) {
  const columns: ColumnDef<ClassList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold"
          >
            <GraduationCap className="mr-2 h-4 w-4 text-cyan-600" />
            Nama Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <GraduationCap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Kelas {row.original.grade?.level || row.original.name[0]}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <Users className="mr-2 h-4 w-4 text-teal-600" />
            Kapasitas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex">
          <Badge
            variant="outline"
            className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
          >
            <Users className="mr-2 h-4 w-4 text-teal-600" />
            {row.original.capacity} siswa
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "grade",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
          >
            <GraduationCap className="mr-2 h-4 w-4 text-purple-600" />
            Tingkat
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex">
          <Badge
            variant="outline"
            className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
          >
            <GraduationCap className="mr-2 h-4 w-4 text-purple-600" />
            Tingkat {row.original.grade?.level || row.original.name[0]}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
          >
            <UserCheck className="mr-2 h-4 w-4 text-orange-600" />
            Wali Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex">
          {row.original.supervisor ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {row.original.supervisor.name}{" "}
                  {row.original.supervisor.surname}
                </span>
                <Badge
                  variant="outline"
                  className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
                >
                  {" "}
                  <UserCheck className="mr-2 h-4 w-4 text-orange-600" />
                  Wali Kelas
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-gray-400" />
              </div>
              <Badge
                variant="outline"
                className="text-gray-500 border-gray-300"
              >
                Belum ditentukan
              </Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }) => {
        const classItem = row.original;
        // Prepare the data in a format that matches what the form expects
        const formData = {
          id: classItem.id,
          name: classItem.name,
          capacity: classItem.capacity,
          supervisorId: classItem.supervisor?.id,
          gradeId: classItem.grade?.id,
          // Include the full objects for reference
          supervisor: {
            id: classItem.supervisor?.id,
            name: classItem.supervisor?.name,
            surname: classItem.supervisor?.surname,
          },
          grade: {
            id: classItem.grade?.id,
            level: classItem.grade?.level,
          },
        };

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
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-9 w-9 p-0 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  >
                    <Link href={`/list/classes/${classItem.id}`}>
                      <Users className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lihat Siswa</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {role === "admin" && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="class"
                          type="update"
                          data={formData}
                          relatedData={{
                            teachers: teachersWithStatus,
                            grades: allGrades,
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Ubah Kelas</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="class"
                          type="delete"
                          id={classItem.id}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Hapus Kelas</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Always include the actions column, but the content will be different based on role
  return <DataTable columns={columns} data={data} searchKey="name" />;
}
