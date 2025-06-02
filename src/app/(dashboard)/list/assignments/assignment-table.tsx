"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Assignment } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  BookOpen,
  Edit,
  Users,
  UserCheck,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  CalendarDays,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type AssignmentList = Assignment & {
  title: string;
  lesson: {
    id: number;
    name: string;
    subject: {
      name: string;
    };
    class: {
      name: string;
    };
    teacher: {
      name: string;
      surname: string;
    };
  };
};

type AssignmentTableProps = {
  data: AssignmentList[];
  role?: string;
  allLessons?: any[];
};

export function AssignmentTable({
  data,
  role,
  allLessons,
}: AssignmentTableProps) {
  const baseColumns: ColumnDef<AssignmentList>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
          >
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Judul
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.title}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lesson.subject.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <BookOpen className="mr-2 h-4 w-4 text-teal-600" />
            Mata Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-green-200 text-teal-700 dark:border-green-700 dark:text-teal-300"
          >
            <BookOpen className="mr-1 h-3 w-3" />
            {row.original.lesson.subject.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "lesson.class.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
          >
            <GraduationCap className="mr-2 h-4 w-4 text-purple-600" />
            Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden md:flex">
            <Badge
              variant="outline"
              className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
            >
              <Users className="mr-1 h-3 w-3" />
              {row.original.lesson.class.name}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lesson.teacher",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
          >
            <UserCheck className="mr-2 h-4 w-4 text-orange-600" />
            Guru
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const teacher = row.original.lesson.teacher;
        return (
          <div className="hidden lg:flex items-center gap-3">
            <div className="hidden md:flex justify-center w-full">
              <div className="flex flex-col items-center">
                <span className="font-medium text-gray-900 dark:text-white text-sm text-center">
                  {teacher.name} {teacher.surname}
                </span>
                <Badge
                  variant="outline"
                  className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
                >
                  <UserCheck className="mr-2 h-4 w-4 text-orange-600" />
                  Pengajar
                </Badge>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden xl:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <CalendarDays className="mr-2 h-4 w-4 text-teal-600" />
            Waktu Mulai
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden xl:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
            >
              <CalendarDays className="mr-1 h-3 w-3" />
              {new Date(row.original.startDate).toLocaleString([], {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden xl:flex hover:bg-rose-50 dark:hover:bg-rose-900/20 font-semibold"
          >
            <Clock className="mr-2 h-4 w-4 text-rose-600" />
            Waktu Berakhir
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden xl:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-rose-200 text-rose-700 dark:border-rose-700 dark:text-rose-300"
            >
              <Clock className="mr-1 h-3 w-3" />
              {new Date(row.original.dueDate).toLocaleString([], {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        </div>
      ),
    },
  ];

  const adminColumns: ColumnDef<AssignmentList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }) => {
        const assignment = row.original;
        return (
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="assignment"
                          type="update"
                          data={{
                            ...assignment,
                            lessonId: assignment.lesson.id,
                          }}
                          relatedData={{
                            lessons: allLessons,
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Ubah Tugas</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="assignment"
                          type="delete"
                          id={assignment.id}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Hapus Tugas</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" || role === "teacher"
      ? [...baseColumns, ...adminColumns]
      : baseColumns;

  return <DataTable columns={columns} data={data} searchKey="title" />;
}
