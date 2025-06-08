"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Lesson, Subject, Class, Teacher, Grade } from "@prisma/client";
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
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HiAcademicCap, HiBookOpen, HiCollection, HiDocumentText, HiUserGroup } from "react-icons/hi";

type LessonList = Lesson & {
  subject: Subject;
  class: Class & {
    grade: Grade;
  };
  teacher: Teacher;
};

type LessonTableProps = {
  data: LessonList[];
  role?: string;
  relatedData: {
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
    teachers: { id: string; name: string; surname: string }[];
  };
};

export function LessonTable({ data, role, relatedData }: LessonTableProps) {
  const baseColumns: ColumnDef<LessonList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold"
          >
            <HiDocumentText className="mr-2 h-4 w-4 text-cyan-600" />
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <HiDocumentText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <HiBookOpen className="mr-2 h-4 w-4 text-teal-600" />
            Mata Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
          >
            <HiBookOpen className="mr-1 h-3 w-3" />
            {row.original.subject.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "class",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
          >
            <HiCollection className="mr-2 h-4 w-4 text-purple-600 dark:text-puple-500" />
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
              <HiUserGroup className="mr-1 h-3 w-3" />
              {row.original.class.grade.level === 1
                ? "X"
                : row.original.class.grade.level === 2
                ? "XI"
                : "XII"}{" "}
              {row.original.class.name}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "teacher",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
          >
            <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
            Guru
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex items-center gap-3">
          <div className="hidden md:flex justify-center w-full">
            <div className="flex flex-col items-center">
              <span className="font-medium text-gray-900 dark:text-white text-sm text-center">
                {row.original.teacher.name} {row.original.teacher.surname}
              </span>
              <Badge
                variant="outline"
                className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
              >
                <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
                Pengajar
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "day",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
          >
            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
            Hari
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden lg:flex">
            <Badge
              variant="outline"
              className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
            >
              <Calendar className="mr-1 h-3 w-3" />
              {row.original.day}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden xl:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <Clock className="mr-2 h-4 w-4 text-teal-600" />
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
              <Clock className="mr-1 h-3 w-3" />
              {new Date(row.original.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "endTime",
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
              {new Date(row.original.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        </div>
      ),
    },
  ];

  const adminColumns: ColumnDef<LessonList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }) => {
        const lesson = row.original;
        // Prepare the data in a format that matches what the form expects
        const formData = {
          id: lesson.id,
          name: lesson.name,
          day: lesson.day,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          subjectId: lesson.subject.id,
          classId: lesson.class.id,
          teacherId: lesson.teacher.id,
          // Include the full objects for reference
          subject: {
            id: lesson.subject.id,
            name: lesson.subject.name,
          },
          class: {
            id: lesson.class.id,
            name: lesson.class.name,
          },
          teacher: {
            id: lesson.teacher.id,
            name: lesson.teacher.name,
            surname: lesson.teacher.surname,
          },
        };

        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal
                      table="lesson"
                      type="update"
                      data={formData}
                      relatedData={relatedData}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ubah Pelajaran</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal table="lesson" type="delete" id={lesson.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Hapus Pelajaran</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" ? [...baseColumns, ...adminColumns] : baseColumns;

  return <DataTable columns={columns} data={data} searchKey="name" />;
}
