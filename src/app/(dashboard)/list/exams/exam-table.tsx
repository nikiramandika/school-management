"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Exam } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import FormModal from "@/components/FormModal"

type ExamList = Exam & {
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

type ExamTableProps = {
  data: ExamList[];
  role?: string;
  allLessons?: any[];
};

export function ExamTable({ data, role, allLessons }: ExamTableProps) {
  const columns: ColumnDef<ExamList>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.title}</div>,
    },
    {
      accessorKey: "lesson.subject.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subject
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.lesson.subject.name}</div>,
    },
    {
      accessorKey: "lesson.class.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Class
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.lesson.class.name}</div>,
    },
    {
      accessorKey: "lesson.teacher",
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
          {`${row.original.lesson.teacher.name} ${row.original.lesson.teacher.surname}`}
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
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          {new Date(row.original.startTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
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
          >
            End Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          {new Date(row.original.endTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const exam = row.original;
        return (
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormModal 
                  table="exam" 
                  type="update" 
                  data={{
                    ...exam,
                    lessonId: exam.lesson.id
                  }}
                  relatedData={{
                    lessons: allLessons
                  }}
                />
                <FormModal table="exam" type="delete" id={exam.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="title" />;
} 