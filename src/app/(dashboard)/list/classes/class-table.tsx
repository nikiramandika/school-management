"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Class, Teacher, Grade } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import FormModal from "@/components/FormModal"

type ClassList = Class & { 
  supervisor: Teacher | null;
  grade: Grade | null;
};

type ClassTableProps = {
  data: ClassList[];
  role?: string;
  allTeachers: { id: string; name: string; surname: string; }[];
  allGrades: { id: number; level: number; }[];
};

export function ClassTable({ data, role, allTeachers, allGrades }: ClassTableProps) {
  const columns: ColumnDef<ClassList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Class Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Capacity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="hidden md:table-cell">{row.original.capacity}</div>,
    },
    {
      accessorKey: "grade",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Grade
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="hidden md:table-cell">{row.original.grade?.level || row.original.name[0]}</div>,
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Supervisor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.original.supervisor ? `${row.original.supervisor.name} ${row.original.supervisor.surname}` : 'No supervisor assigned'}
        </div>
      ),
    },
    {
      id: "actions",
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
            surname: classItem.supervisor?.surname
          },
          grade: {
            id: classItem.grade?.id,
            level: classItem.grade?.level
          }
        };

        // Get all teachers who are already supervisors
        const existingSupervisors = new Set(
          data
            .map(item => item.supervisor?.id)
            .filter((id): id is string => id !== undefined)
        );

        // Add supervisor status to all teachers
        const teachersWithStatus = allTeachers.map(teacher => ({
          ...teacher,
          isSupervisor: existingSupervisors.has(teacher.id)
        }));

        return (
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal 
                  table="class" 
                  type="update" 
                  data={formData}
                  relatedData={{
                    teachers: teachersWithStatus,
                    grades: allGrades
                  }}
                />
                <FormModal table="class" type="delete" id={classItem.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" />;
} 