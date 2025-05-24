"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Lesson, Subject, Class, Teacher } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import FormModal from "@/components/FormModal"

type LessonList = Lesson & { 
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

type LessonTableProps = {
  data: LessonList[];
  role?: string;
  relatedData: {
    subjects: { id: number; name: string; }[];
    classes: { id: number; name: string; }[];
    teachers: { id: string; name: string; surname: string; }[];
  };
};

export function LessonTable({ data, role, relatedData }: LessonTableProps) {
  const columns: ColumnDef<LessonList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Subject
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.subject.name}
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
            className="hidden md:flex"
          >
            Class
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.class.name}
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
            className="hidden md:flex"
          >
            Teacher
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.teacher.name} {row.original.teacher.surname}
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
            className="hidden md:flex"
          >
            Day
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.day}
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
            className="hidden md:flex"
          >
            Start Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {new Date(row.original.startTime).toLocaleTimeString()}
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
            className="hidden md:flex"
          >
            End Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {new Date(row.original.endTime).toLocaleTimeString()}
        </div>
      ),
    },
    {
      id: "actions",
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
            name: lesson.subject.name
          },
          class: {
            id: lesson.class.id,
            name: lesson.class.name
          },
          teacher: {
            id: lesson.teacher.id,
            name: lesson.teacher.name,
            surname: lesson.teacher.surname
          }
        };

        return (
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal 
                  table="lesson" 
                  type="update" 
                  data={formData}
                  relatedData={relatedData}
                />
                <FormModal table="lesson" type="delete" id={lesson.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" />;
} 