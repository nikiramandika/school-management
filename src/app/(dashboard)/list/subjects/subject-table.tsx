"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Subject, Teacher } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import FormModal from "@/components/FormModal"

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
  const columns: ColumnDef<SubjectList>[] = [
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
      accessorKey: "teachers",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Teachers
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.teachers.map((teacher) => `${teacher.name} ${teacher.surname}`).join(", ")}
        </div>
      ),
    },
    {
      accessorKey: "lessons",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Lessons
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.lessons.map((lesson) => (
            <div key={lesson.id} className="text-sm">
              {lesson.name} - {lesson.class.name} ({lesson.teacher.name} {lesson.teacher.surname})
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal 
                  table="subject" 
                  type="update" 
                  data={subject}
                  relatedData={{
                    teachers: allTeachers
                  }}
                />
                <FormModal table="subject" type="delete" id={subject.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" />;
}
