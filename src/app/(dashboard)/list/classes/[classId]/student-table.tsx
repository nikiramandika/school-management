"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Student } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, User2, Mail, BadgeInfo, Contact } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StudentTableProps = {
  data: Student[];
  role?: string;
};

export function StudentTable({ data, role }: StudentTableProps) {
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
        >
          <User2 className="mr-2 h-4 w-4 text-blue-600" />
          Nama
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
      accessorKey: "surname",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold"
        >
          <Contact className="mr-2 h-4 w-4 text-cyan-600" />
          Nama Belakang
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          {row.original.surname}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
        >
          <Mail className="mr-2 h-4 w-4 text-teal-600" />
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="hidden md:table-cell text-gray-700 dark:text-gray-300">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "nis",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 font-semibold"
        >
          <BadgeInfo className="mr-2 h-4 w-4 text-yellow-600" />
          NIS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="text-yellow-700 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700"
        >
          {row.original.username}
        </Badge>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden">
      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  );
}
