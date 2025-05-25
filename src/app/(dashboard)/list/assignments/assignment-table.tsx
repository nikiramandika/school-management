"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Assignment } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import FormModal from "@/components/FormModal"

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

export function AssignmentTable({ data, role, allLessons }: AssignmentTableProps) {
  const columns: ColumnDef<AssignmentList>[] = [
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
    },
    {
      accessorKey: "lesson.subject.name",
      header: "Subject",
    },
    {
      accessorKey: "lesson.class.name",
      header: "Class",
    },
    {
      accessorKey: "lesson.teacher",
      header: "Teacher",
      cell: ({ row }) => {
        const teacher = row.original.lesson.teacher;
        return `${teacher.name} ${teacher.surname}`;
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Time",
      cell: ({ row }) => {
        return new Date(row.original.startDate).toLocaleString();
      },
    },
    {
      accessorKey: "dueDate",
      header: "End Time",
      cell: ({ row }) => {
        return new Date(row.original.dueDate).toLocaleString();
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const assignment = row.original;
        return (
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormModal 
                  table="assignment" 
                  type="update" 
                  data={{
                    ...assignment,
                    lessonId: assignment.lesson.id
                  }}
                  relatedData={{
                    lessons: allLessons
                  }}
                />
                <FormModal table="assignment" type="delete" id={assignment.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="title" />;
} 