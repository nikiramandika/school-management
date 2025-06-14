"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Subject, Teacher } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Users,
  BookOpen,
  Edit,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HiAcademicCap, HiBookOpen, HiCollection, HiDocumentText } from "react-icons/hi";

type SubjectList = Subject & {
  teachers: Teacher[];
  lessons: {
    id: number;
    name: string;
    class: {
      id: number;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  }[];
};

type SubjectTableProps = {
  data: SubjectList[];
  role?: string;
  allTeachers: { id: string; name: string; surname: string }[];
};

export function SubjectTable({ data, role, allTeachers }: SubjectTableProps) {
  const baseColumns: ColumnDef<SubjectList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold"
          >
            <HiBookOpen className="mr-2 h-4 w-4 text-cyan-600" />
            Nama Mata Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <HiBookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
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
      accessorKey: "teachers",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
          >
            <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
            Guru
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const teachers = row.original.teachers;
        const displayTeachers = teachers.slice(0, 2);
        const remainingTeachers = teachers.length - 2;

        return (
          <div className="hidden md:table-cell">
            <div className="flex flex-wrap items-center gap-1.5">
              {displayTeachers.map((teacher) => (
                <TooltipProvider key={teacher.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 cursor-help"
                      >
                        <HiAcademicCap className="mr-1 h-3 w-3" />
                        {teacher.name} {teacher.surname}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Klik untuk melihat detail guru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {remainingTeachers > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Badge
                      variant="outline"
                      className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <HiAcademicCap className="mr-1 h-3 w-3" />+
                      {remainingTeachers} Lebih Banyak
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <HiAcademicCap className="h-5 w-5 text-orange-600" />
                        Guru untuk {row.original.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="">
                      <div className="pt-4 space-y-2">
                        {teachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary/50 transition-colors w-full"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <HiAcademicCap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="font-medium text-sm">
                                {teacher.name} {teacher.surname}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "lessons",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <HiDocumentText className="mr-2 h-4 w-4 text-teal-600" />
            Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lessons = row.original.lessons;
        const displayLessons = lessons.slice(0, 2);
        const remainingLessons = lessons.length - 2;

        return (
          <div className="hidden lg:table-cell">
            <div className="flex flex-col gap-1.5">
              {displayLessons.map((lesson) => (
                <TooltipProvider key={lesson.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 w-fit cursor-help"
                      >
                        <HiDocumentText className="mr-1 h-3 w-3" />
                        {lesson.name} - {lesson.class.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Guru: {lesson.teacher.name} {lesson.teacher.surname}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {remainingLessons > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Badge
                      variant="outline"
                      className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 w-fit cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    >
                      <HiBookOpen className="mr-1 h-3 w-3" />+{remainingLessons}{" "}
                      Lebih banyak pelajaran
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <HiDocumentText className="h-5 w-5 text-teal-600" />
                        Pelajaran untuk {row.original.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="">
                      <div className="space-y-2">
                        {lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="rounded-lg border p-3 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                <HiCollection className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              </div>
                              <div className="font-medium">{lesson.name}</div>
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                                >
                                  <HiDocumentText className="mr-1 h-3 w-3" />
                                  {lesson.class.name}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300"
                                >
                                  <HiAcademicCap className="mr-1 h-3 w-3" />
                                  {lesson.teacher.name} {lesson.teacher.surname}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const adminColumns: ColumnDef<SubjectList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal
                      table="subject"
                      type="update"
                      data={subject}
                      relatedData={{
                        teachers: allTeachers,
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ubah Mata Pelajaran</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal table="subject" type="delete" id={subject.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Hapus Mata Pelajaran</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" ? [...baseColumns, ...adminColumns] : baseColumns;

  return <DataTable columns={columns} data={data} searchKey={["name", "teachers", "lessons"]} />;
}
