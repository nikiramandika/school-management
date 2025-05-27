"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Result } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

type ResultTableProps = {
  data: ResultList[];
  role?: string;
  relatedData?: {
    classes: { id: string; name: string }[];
    students: {
      id: string;
      name: string;
      surname: string;
      className: string;
    }[];
    exams: {
      id: string;
      title: string;
      className: string;
      lesson: {
        class: { name: string };
        teacher: { name: string; surname: string };
      };
    }[];
    assignments: {
      id: string;
      title: string;
      className: string;
      lesson: {
        class: { name: string };
        teacher: { name: string; surname: string };
      };
    }[];
  };
};

export function ResultTable({ data, role, relatedData }: ResultTableProps) {
  const columns: ColumnDef<ResultList>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Judul
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.original.title}</div>,
    },
    {
      accessorKey: "student",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>{`${row.original.studentName} ${row.original.studentSurname}`}</div>
      ),
    },
    {
      accessorKey: "score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Nilai
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">{row.original.score}</div>
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
            Guru
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {`${row.original.teacherName} ${row.original.teacherSurname}`}
        </div>
      ),
    },
    {
      accessorKey: "className",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">{row.original.className}</div>
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
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {new Date(row.original.startTime).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const result = row.original;
        // Find the corresponding exam or assignment from relatedData
        const exam = relatedData?.exams.find(
          (e: any) => e.title === result.title
        );
        const assignment = relatedData?.assignments.find(
          (a: any) => a.title === result.title
        );
        const student = relatedData?.students.find(
          (s: any) =>
            `${s.name} ${s.surname}` ===
            `${result.studentName} ${result.studentSurname}`
        );

        const formData = {
          ...result,
          studentId: student?.id,
          examId: exam?.id,
          assignmentId: assignment?.id,
        };

        return (
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="result"
                          type="update"
                          data={formData}
                          relatedData={relatedData}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Edit Nilai</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="result"
                          type="delete"
                          id={result.id}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Hapus Nilai</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="title" />;
}
